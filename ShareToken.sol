// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ShareToken is ERC20, Ownable {
    using SafeMath for uint256;
    using Strings for string;
    address private _owner;
    uint256 private constant INITIAL_SUPPLY = 100_000 * 10**8;
    struct Holder {
        address referrer;
        uint256 holderReward;
        uint256 referrerReward;
        string refCode;
        string nickname;
        string description;
        uint256 lastClaimedAirdrop;
        bool isExcludedFromReferrer;
    }
    mapping(address => Holder) public holders;
    uint256 public airDropCount = 0;
    uint256 public airDropStartTime;
    uint256 public airDropDuration = 72 hours;
    uint256 public holderPercentage = 3;
    uint256 public referrerPercentage = 1;
    uint256 public ownerPercentage = 1;
    uint256 public costToEdit = 200 * 10**8;
    uint256 public minReferralAmount = 100 * 10**8;
    bool public airdropEnabled = false;
    mapping(string => address) public refCodeOwners;
    mapping(address => address[]) public referrals;
    struct reInfo {
        uint256 totalAmount;      // 紅包總share
        uint256 claimedAmount;    // 已領取share
        uint256 maxClaims;        // 最大領取次數
        uint256 claimCount;       // 已被領取次數
        address creator;          // 紅包發起人
        uint8 eligibleType;    // 領取資格 (0: 自己粉絲, 1: 無介紹人, 2: 粉絲+無介紹人, 3: 所有人)
        uint256 startTime;        // 發起紅包的時間
        bool isActive;            // 是否啟用
    }
    mapping(uint256 => reInfo) public redEnvelopes;
    uint256[] private activeREs; // 存放目前有效紅包的 ID 集合
    mapping(address => uint256[]) public myRE;
    uint256 public constant MinSharePerRE = 100 * 10 ** 8;
    uint256 public constant reDURATION = 24 hours;
    uint256 public reID;    
    event refSet(address indexed holder, address indexed referer);
    event AirdropStarted(uint256 indexed airDropCount);
    event AirdropClaimed(
        address indexed holder,        
        address indexed receiver,
        uint256 reward
    );
    event reCreated(uint256 indexed id, address indexed creator, uint256 totalAmount, uint256 maxClaims);
    event reClaimed(uint256 indexed id, address indexed claimer, uint256 amount, address indexed referrer);
    constructor() ERC20("ShareToken", "SHARE") Ownable(msg.sender) {
        _owner = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    //檢視自己現有的推薦碼
    function getMyRefCode() public view returns (string memory) {
        return holders[msg.sender].refCode;
    }
    // 設定或編輯推薦碼
    function setMyRefCode(string memory refCode) external {
        // 確認推薦碼格式合法
        require(isValidRefCode(refCode), "Invalid format");
        // 轉換推薦碼為小寫，避免大小寫重複
        string memory lowerRefCode = toLower(refCode);
        // 確認推薦碼是否已存在
        require(
            refCodeOwners[lowerRefCode] == address(0),
            "Referral code already exists"
        );
        // 確認使用者有足夠的 SHARE 代幣
        require(
            balanceOf(msg.sender) >= costToEdit,
            "Insufficient SHARE"
        );        
        // 扣除設定推薦碼的費用
        _burn(msg.sender, costToEdit);
        // 設定新的推薦碼
        holders[msg.sender].refCode = lowerRefCode;
    }
    /// @dev 將推薦碼轉換為小寫
    function toLower(string memory str) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] >= 0x41 && strBytes[i] <= 0x5A) {
                // 將大寫字元轉換為小寫
                strBytes[i] = bytes1(uint8(strBytes[i]) + 32);
            }
        }
        return string(strBytes);
    }
    //驗證推薦碼格式是否有效 (僅允許 a~z, 0~9,-_@組合)
    function isValidRefCode(string memory refCode)
        public
        pure
        returns (bool)
    {
        bytes memory codeBytes = bytes(refCode);
        for (uint256 i = 0; i < codeBytes.length; i++) {
            bytes1 char = codeBytes[i];
            if (
                (char < 0x30 || char > 0x39) && // 不是 '0'-'9'
                (char < 0x41 || (char > 0x5A && char < 0x61) || char > 0x7A) &&
                // 不是 'A'-'Z' 或 'a'-'z'
                (char != 0x5F) && // 不是 '_'
                (char != 0x2D) && // 不是 '-'
                (char != 0x40) // 不是 '@'
            ) {
                return false;
            }
        }
        return true;
    }
    //排除流動性合約地址成為介紹人
    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function excludeFromReferral(address account, bool excluded)
        external
        onlyOwner
    {
        holders[account].isExcludedFromReferrer = excluded;
    }
    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        toClaimAirdrop(recipient);
        bool result = super.transfer(recipient, amount);
        // 建立自動推薦邏輯
        if (
            amount >= minReferralAmount &&
            result &&
            holders[recipient].referrer == address(0)
        ) {
            address sender = _msgSender();
            // 確保 Sender 非合約地址且未被排除
            if (
                !isContract(sender) && !holders[sender].isExcludedFromReferrer
            ) {
                holders[recipient].referrer = sender;
                referrals[sender].push(recipient);
                emit refSet(recipient, sender);
            }
        }
        return result;
    }

    // 手動設定介紹人
    function setReferrer(string memory refCode) public {
        require(
            balanceOf(msg.sender) >= minReferralAmount,
            "Insufficient balance"
        );
        require(
            holders[msg.sender].referrer == address(0),
            "Referrer already set"
        );
        require(bytes(refCode).length > 0, "Invalid code");
        address referrer = refCodeOwners[refCode];
        require(referrer != address(0), "Referral code not exist");
        require(referrer != msg.sender, "Can not refer yourself");
        // 設定介紹人
        holders[msg.sender].referrer = referrer;
        referrals[referrer].push(msg.sender);
        emit refSet(msg.sender, referrer);
    }
    //Owner set a new round of airdrop
    function startAirdrop() public onlyOwner {
        require(!airdropEnabled, "Airdrop enabled");
        uint256 ownerReward = totalSupply().mul(ownerPercentage).div(100);
        _mint(owner(),ownerReward );
        airDropCount++;
        airDropStartTime = block.timestamp;
        airdropEnabled = true;
    }
    //get datas of latest airdrop
    function getAirDrop() public view returns (uint256 adc,uint256 adst) {
        return (airDropCount,airDropStartTime);
    }

    function toClaimAirdrop(address addr) internal returns  (bool eligible, uint reason) {
        if (!airdropEnabled) {
            return (false,1);//not enabled
        }
        if (block.timestamp > airDropStartTime + airDropDuration) {
            airdropEnabled = false;
            return (false,2);//Airdrop expired
        }
        if (holders[addr].lastClaimedAirdrop > airDropStartTime) {
            return (false,3); //Already claimed airdrop
        }
        uint256 holderReward = balanceOf(addr).mul(holderPercentage).div(100); // 3% of holder's balance
        uint256 referrerReward = balanceOf(addr).mul(referrerPercentage).div(100); // 1% to referrer
        _mint(msg.sender, holderReward);
        holders[addr].holderReward.add(holderReward);
        holders[addr].lastClaimedAirdrop = block.timestamp; //更新上次領取時間
        //holder is receiver,Reward is for holder
        emit AirdropClaimed(msg.sender, msg.sender, holderReward);
        address referrer = holders[addr].referrer;
        if (referrer != address(0)) {
            _mint(referrer, referrerReward);
            //holder is not receiver,Receiver is for Referrer
            emit AirdropClaimed(addr, referrer, referrerReward);
            holders[addr].referrerReward.add(referrerReward);
        }
        return (true, 4);//"Eligible to claim"
    }

    // Claim airdrop
    function claimAirdrop() public returns (bool eligible, uint reason) {
        (bool result,uint _reason) = toClaimAirdrop(msg.sender);
        return (result, _reason);
    }
    //Owner setup AirDrop Duration
    function setAirDropDuration(uint256 _duration) external onlyOwner {
         require(_duration > 86400, "must greater than 86400");
         require(!airdropEnabled,"Airdrop still going.");
         airDropDuration=_duration;
    }
    //Owner setup holderPercentage
    function setRewardPercentage(uint256 _type , uint256 _percentage ) external onlyOwner returns(bool) {
         if(_percentage < 1 || _percentage >4 || airdropEnabled ){
            return false;
         }
         if( _type == 1 ){
            holderPercentage = _percentage;
         } else if( _type == 2 ){
            referrerPercentage = _percentage;
         } else if( _type == 3 ){
            ownerPercentage = _percentage;
         }else{
            return false;
         }
         return true;
    }
   
    //Owner setup minReferralAmount
    function setMinReferralAmount(uint256 _amount) external onlyOwner {
         require( _amount > 10 , "Should greater than zero.");        
         minReferralAmount = _amount;
    }
    //Owner setup costToEdit
    function setCostToEdit(uint256 _amount) external onlyOwner {
         require( _amount > 10 , "Should greater than zero.");        
         costToEdit = _amount;
    }
    //Holders can check how many wallets I have referred
    function getReferralCount() public view returns (uint256) {
        return referrals[msg.sender].length;
    }
    //how many shares I have rewarded via airdrop as a holder
    function getHolderRward() public view returns (uint256) {
        return holders[msg.sender].holderReward;
    }
    //how many shares I have rewarded via airdrop as a referrer
    function getReferrerRward() public view returns (uint256) {
        return holders[msg.sender].referrerReward;
    }
// 發起紅包
    function setRedEnvelope(uint256 totalShare, uint256 countRE, uint8 eligibleType) external {
        require(totalShare >= countRE * MinSharePerRE, "At least 100 SHARE each");
        require(eligibleType <= 3, "Invalid eligible type");
        require(balanceOf(msg.sender) >= totalShare, "Insufficient balance");
        // 扣除紅包金額
        _transfer(msg.sender, address(this), totalShare);
        // 記錄紅包信息
        reID++;
        redEnvelopes[reID] = reInfo({
            totalAmount: totalShare,
            claimedAmount: 0,
            maxClaims: countRE,
            claimCount: 0,
            creator: msg.sender,
            eligibleType: eligibleType,
            startTime: block.timestamp,
            isActive: true
        });
        myRE[msg.sender].push(reID);
        activeREs.push(reID);    
        emit reCreated(reID, msg.sender, totalShare, countRE);
    }
    // 領取紅包
    function claimRedEnvelope(string memory linkcode,uint256 id) external returns (bool){
        reInfo storage re = redEnvelopes[id];
        if(
            re.isActive || re.claimCount >= re.maxClaims || !checkEligibility(linkcode,re)
        ){
            return false;
        }
        // 設定隨機金額（紅包隨機分配）
        uint256 remainingAmount = re.totalAmount.sub(re.claimedAmount);
        uint256 remainingClaims = re.maxClaims.sub(re.claimCount);
        uint256 claimAmount = remainingClaims == 1 ? remainingAmount : randomAmount(remainingAmount, remainingClaims);
        // 更新紅包狀態
        re.claimedAmount += claimAmount;
        re.claimCount++;
        if (re.claimedAmount >= re.totalAmount ||
            re.claimCount >= re.maxClaims
            ) {
            re.isActive = false;
            _removeActiveRE (id);            
        }
        address NewReferrer = address(0);
        // 設定介紹人
        if (holders[msg.sender].referrer == address(0) )  {
            if(bytes(linkcode).length == 0) {
            holders[msg.sender].referrer = re.creator;
            NewReferrer = re.creator;
            } else{
                address rcOwner = refCodeOwners[linkcode];
                if(rcOwner != address(0)){
                      holders[msg.sender].referrer = rcOwner;
                      NewReferrer = rcOwner;
                }
            }            
        }
        // 發送紅包金額
        _transfer(address(this), msg.sender, claimAmount);
        // 必須是新增的推薦人 NewReferrer 才不會是 address(0)
        emit reClaimed(id, msg.sender, claimAmount, NewReferrer);
        return true;
    }
    // 檢查紅包領取資格
    function checkEligibility(string memory linkcode,reInfo memory re) internal view returns(bool){
        string memory refcode = holders[msg.sender].refCode;
        address referrer = holders[msg.sender].referrer ;
        if (        re.eligibleType == 0 && // 自己現有粉絲，加上無推薦人並且是無推薦碼或是發紅包者的推薦碼
                    ( referrer == re.creator ||
                      ( referrer == address(0) &&
                        (bytes(linkcode).length == 0 || keccak256(bytes(linkcode)) == keccak256(bytes(refcode)))
                      )
                    )
                     ||
                    (re.eligibleType == 1 && // 無推薦人，並且是無推薦碼或是發紅包者的推薦碼
                     ( referrer == address(0) &&
                       (bytes(linkcode).length == 0 || keccak256(bytes(linkcode)) == keccak256(bytes(refcode)))
                     )
                    )
                     ||
                    re.eligibleType == 2  // Any subscriber                        
            ) {
                  return true;
            }  
        return false;
    }  
    // 移除失效紅包
    function _removeActiveRE (uint256 id) private {
        for (uint256 i = 0; i < activeREs.length; i++) {
            if (activeREs[i] == id) {
                activeREs[i] = activeREs[activeREs.length - 1]; // 用最後一個元素覆蓋
                activeREs.pop(); // 刪除最後一個元素
                break;
            }
        }
    }
    // 設定隨機紅包金額
    function randomAmount(uint256 remainingAmount, uint256 remainingClaims) private view returns (uint256) {
        uint256 maxAmount = remainingAmount.div(remainingClaims).mul(2); // 最大分配金額（可調整）
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % maxAmount + 1;
    }
    //Holder Check My RE
    function getMyRE() public view returns (reInfo[] memory) {
        uint256[] memory myIds = myRE[msg.sender];
        reInfo[] memory result;  
        for (uint256 i = 0; i < myIds.length; i++) {
            uint256 id = myIds[i];
            reInfo storage envelope = redEnvelopes[id];
            result[i]=envelope;
        }
        return result;
    }
    //Holder Check available RE
    function getAvailableRE(string memory linkcode) public view returns (reInfo[] memory) {
        reInfo[] memory result;  
        for (uint256 i = 0; i < activeREs.length; i++) {
            uint256 id = activeREs[i];
            reInfo storage envelope = redEnvelopes[id];
            // 根據資格類型檢查
            if (checkEligibility(linkcode,envelope)
            ) {
                    result[i]=envelope;
            }          
        }
        return result;
    }
    //Holder edit personal profile
    function editMyProfile(string memory _nickname, string memory _description) public {
        // 檢查用戶是否持有足夠的代幣
        require(balanceOf(msg.sender) >= costToEdit, "Insufficient balance");
        // 燃燒代幣
        _burn(msg.sender, costToEdit);
        // 更新用戶資料
        holders[msg.sender].nickname = _nickname;
        holders[msg.sender].description = _description;
    }
    //get specific holder's profile
    function getSpecificHolder(address _holder) public view returns(Holder memory holder){
        return (holders[_holder]);
    }
    //get all address I have referred
    function getMyfans() public view returns(Holder[] memory){
    address[] memory myFans = referrals[msg.sender];
        Holder[] memory result;  
        for (uint256 i = 0; i < myFans.length; i++) {
            address addr = myFans[i];
            Holder storage _holder = holders[addr];
            result[i] = _holder;
            }
        return (result);
    }
}
