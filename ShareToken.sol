// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
//import "@openzeppelin/contracts/utils/Strings.sol";

contract ShareToken is ERC20, Ownable {
    using SafeMath for uint256;
    //using Strings for string;
    uint256 private constant INITIAL_SUPPLY = 100_000 * 10**18;
    struct Holder {
        address referrer;
        uint256 holderReward;
        uint256 referrerReward;
        string refCode;
        string nickname;
        string description;
        string imgUrl;
        uint256 lastClaimedAirdrop;
        bool isDisabled;
    }
    mapping(address => Holder) public holders;
    uint256 public adCount = 0;
    uint256 public adStartTime;
    uint256 public adDuration = 72 hours;
    uint256 public holderPercent = 3;
    uint256 public referrerPercent = 1;
    uint256 public ownerPercent = 1;
    uint256 public cost_Edit = 200 * 10**18;
    uint256 public minRefAmount = 100 * 10**18;
    bool public adEnabled = false;
    mapping(string => address) public refCodeOwners;
    mapping(address => address[]) public myfans;
    struct reInfo {
        uint256 totalAmount;      // 紅包總share
        uint256 claimedAmount;    // 已領取share
        uint256 maxClaims;        // 最大領取次數
        uint256 claimCount;       // 已被領取次數
        address creator;          // 紅包發起人
        uint8 eligiType;       // 領取資格 0~2
        string desc;
        string imgUrl;  
        uint256 startTime;        // 發起紅包的時間
        bool isActive ;            // 是否啟用
    }
    mapping(uint256 => reInfo) public redEnv;
    uint256[] private activeREs; // 存放目前有效紅包的 ID 集合
    mapping(address => uint256[]) public myRE;
    uint256 public MinSharePerRE = 100 * 10 ** 18;
    uint256 public MinREshare = 200 * 10 ** 18;    
    uint256 public reID=0;   
    //推薦關係建立的事件 
    event refSet(address indexed holder, address indexed referer);
    //空投開始的事件
    event AirdropStarted(uint256 indexed adCount);
    //領取空投的事件
    event AirdropClaimed(
        address indexed holder,        
        address indexed receiver,
        uint256 reward
    );
    //有人創造了一個紅包發起事件
    event reCreated(uint256 indexed id, address indexed creator, uint256 totalAmount, uint256 maxClaims);
    //有人領走一個紅包
    event reClaimed(uint256 indexed id, address indexed claimer, uint256 amount, address indexed creator);
    constructor() ERC20("ShareToken", "SHARE") Ownable(msg.sender) {
        //_owner = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY); 
    }
    // 定義 decimals 函數
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
    //檢視自己現有的推薦碼
    function getMyRefCode() public view returns (string memory) {
        return holders[msg.sender].refCode;
    }
    // 設定或編輯推薦碼
    function setMyRefCode(string memory refCode) external returns(uint8){
        if(  // "Insufficient SHARE"
             balanceOf(msg.sender) < cost_Edit )
        {
                   return 1;
        }else if(  // "Invalid format"
                   !isValidRefCode(refCode))
        {
                    return 2;
        }
        // 刪除舊的 refCode 的映射 (如果存在)
        string memory oldrefCode = holders[msg.sender].refCode;
        if(refCodeOwners[oldrefCode] != address(0)){
            delete refCodeOwners[oldrefCode];
        }    
        // 轉換推薦碼為小寫，避免大小寫重複
        string memory lowerRefCode = toLower(refCode);
        if(  // "Referral code already used by another holder" 
             refCodeOwners[lowerRefCode] != address(0))             
        {
             return 3;             
        }                    
        // 扣除設定推薦碼的費用
        _burn(msg.sender, cost_Edit);
        // 設定新的推薦碼，推薦碼允許大小寫存在
        holders[msg.sender].refCode = refCode;
        //在refCodeOwners 映射裏一律儲存推薦碼的小寫，這樣才好比對不致混淆
        refCodeOwners[lowerRefCode] = msg.sender;
        return 0;
    }
    /// dev 將推薦碼轉換為小寫
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
            // 检查字符是否为合法字符
            if (
                !(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x41 && char <= 0x5A) && // A-Z
                !(char >= 0x61 && char <= 0x7A) && // a-z
                !(char == 0x2D || char == 0x5F || char == 0x40) // -, _, @
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

    function setDisabled(address account, bool isDisabled)
        external
        onlyOwner
    {
        holders[account].isDisabled = isDisabled;
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
            amount >= minRefAmount &&
            result &&
            holders[recipient].referrer == address(0)
        ) {
            address sender = _msgSender();
            // 確保 Sender 非合約地址
            if (
                !isContract(sender) 
            ) {
                holders[recipient].referrer = sender;
                myfans[sender].push(recipient);
                emit refSet(recipient, sender);
            }
        }
        return result;
    }

    // 手動設定介紹人
    function setReferrer(string memory refCode) public returns (uint8){
        address referrer = refCodeOwners[refCode];
        if( //"Referrer already set"
              holders[msg.sender].referrer != address(0)
        ){
              return 1;
        }else if( //"Invalid code"
              bytes(refCode).length == 0
        ){
              return 2;
        }else if( //referrer != address(0)
              referrer == address(0)
        ){
              return 3;
        }else if( //"Can not refer yourself"
              referrer == msg.sender
        ){
              return 4;
        }       
        // 設定介紹人
        holders[msg.sender].referrer = referrer;
        myfans[referrer].push(msg.sender);
        emit refSet(msg.sender, referrer);
        return 0;
    }
    //Owner set a new round of airdrop
    function startAirdrop() public onlyOwner {
        require(!adEnabled, "Airdrop enabled");
        uint256 ownerReward = totalSupply().mul(ownerPercent).div(100);
        _mint(owner(),ownerReward );
        adCount++;
        adStartTime = block.timestamp;
        adEnabled = true;
        emit AirdropStarted(adCount);
    }
    //get datas of latest airdrop
    function getAirDropInfo() public view returns (uint256,uint256,uint256) {
        return (adCount,adStartTime,adDuration);
    }

    function toClaimAirdrop(address addr) internal returns  (uint8) {
        if (  //not enabled
            !adEnabled) 
        {
            return 1;
        }else if (  //Airdrop expired
                    block.timestamp > adStartTime + adDuration) 
        {
                    adEnabled = false;
                    return 2;
        }else if (  //Already claimed airdrop
                    holders[addr].lastClaimedAirdrop > adStartTime) 
        {
                    return 3; 
        }
        uint256 holderReward = balanceOf(addr).mul(holderPercent).div(100); // 3% of holder's balance
        uint256 referrerReward = balanceOf(addr).mul(referrerPercent).div(100); // 1% to referrer
        _mint(msg.sender, holderReward);
        //更新累加領過的空投總數
        holders[addr].holderReward = holders[addr].holderReward.add(holderReward);
        //更新上次領取時間
        holders[addr].lastClaimedAirdrop = block.timestamp; 
        //addr is holder,Reward is for holder
        emit AirdropClaimed(addr, addr, holderReward);
        //holder's referrer will have refferrerReward
        address referrer = holders[addr].referrer;
        if (  
              referrer != address(0)) {
              _mint(referrer, referrerReward);            
              emit AirdropClaimed(addr, referrer, referrerReward);
              holders[referrer].referrerReward = holders[referrer].referrerReward.add(referrerReward);
        }
        //Succeed to claim the airDrop"
        return 4;
    }

    // Claim airdrop,holder no need to keyin address for security consideration
    function claimAirdrop() public returns (uint8) {
        uint8 result = toClaimAirdrop(msg.sender);
        return result;
    }
    //Owner setup holderPercent
    function setRewardPercentage(uint256 _type , uint8 _percentage ) external onlyOwner returns(bool) {
         if(_percentage < 1 || _percentage >4 || adEnabled ){
            return false;
         }
         if( _type == 1 ){
            holderPercent = _percentage;
         } else if( _type == 2 ){
            referrerPercent = _percentage;
         } else if( _type == 3 ){
            ownerPercent = _percentage;
         }else{
            return false;
         }
         return true;
    }
   
    //Owner setup minRefAmount
    function setParameter(uint8 _type,uint256 _amount) external onlyOwner returns(bool){
         if( _amount <= 0){
              return false;
         }       
         if(_type == 1){
            minRefAmount = _amount;
         }else if(_type == 2){
            MinSharePerRE = _amount;
         }else if(_type == 3){
            MinREshare = _amount;
         }else if(_type == 4){
            cost_Edit = _amount;
         }else if(_type == 5 && !adEnabled && _amount >=86400){
            adDuration = _amount;
         }else{
            return false;
         }
         return true;
    }
    //how many shares I have rewarded via airdrop as a holder
    function getReward(bool isref) public view returns (uint256) {
        if(isref){
            return holders[msg.sender].referrerReward;
        }
        return holders[msg.sender].holderReward;
    }   
    
// 發起紅包
    function setRedredE(uint256 totalShare, uint256 countRE, uint8 eligiType, string memory _desc, string memory _url) external returns(bool) {
        uint sum = countRE * MinSharePerRE ;
        uint256 minShare= MinREshare > sum ? MinREshare : sum;
        if(totalShare < minShare ||             //"At least SHARE each");
        eligiType > 2 || eligiType < 0 || //"Invalid eligible type");
        balanceOf(msg.sender) < totalShare ||   //"Insufficient balance");
        holders[msg.sender].isDisabled )
        { return false;}
        // 扣除紅包金額
        _transfer(msg.sender, address(this), totalShare);
        // 記錄紅包信息
        reID++;
        redEnv[reID] = reInfo({
            totalAmount: totalShare,
            claimedAmount: 0,
            maxClaims: countRE,
            claimCount: 0,
            creator: msg.sender,
            eligiType: eligiType,
            desc:_desc,
            imgUrl:_url,
            startTime: block.timestamp,
            isActive: true
        });
        myRE[msg.sender].push(reID);
        activeREs.push(reID);    
        emit reCreated(reID, msg.sender, totalShare, countRE);
        return true;
    }
    //
     // 設定或編輯推薦碼
    function updateMyRE (uint256 id,bool isdesc,string memory data) external returns(bool){
        reInfo storage re = redEnv[id];
        if(re.creator == msg.sender  && bytes(data).length>0){
            if(isdesc){
                re.desc=data;
                return true;
            }else {
                re.imgUrl=data;
                return true;
            }         
        }
        return false;
    }
    // 領取紅包
    function claimRedredE(string memory linkcode,uint256 id) external returns (bool){
        reInfo storage re = redEnv[id];
        if(
            !re.isActive || re.claimCount >= re.maxClaims || !checkEligible(linkcode,re)
        ){
            return false;
        }
        // 設定隨機金額（紅包隨機分配）
        uint256 remainsAmt = re.totalAmount.sub(re.claimedAmount);
        uint256 remainClaims = re.maxClaims.sub(re.claimCount);
        uint256 claimAmount = remainClaims == 1 ? remainsAmt : randomAmt(remainsAmt, remainClaims);
        // 更新紅包狀態
        re.claimedAmount += claimAmount;
        re.claimCount++;
        if (re.claimedAmount >= re.totalAmount ||
            re.claimCount >= re.maxClaims
            ) {
            re.isActive = false;
            _removeActiveRE (id);            
        }
        address referrer;
        // 設定介紹人：有連結碼時，推薦人為連結碼所有人，沒有連結碼，則推薦人為發紅包者
        if (holders[msg.sender].referrer == address(0) )  {
            if(bytes(linkcode).length == 0) {            
                referrer = re.creator;
            } else{
                address rcOwner = refCodeOwners[toLower(linkcode)];
                if(rcOwner != address(0)){                      
                      referrer = rcOwner;
                }else{
                    referrer = re.creator;
                }
            }        
            holders[msg.sender].referrer = referrer; 
            myfans[referrer].push(msg.sender); 
            emit refSet(msg.sender, referrer);
        }
        // 發送紅包金額
        _transfer(address(this), msg.sender, claimAmount);
        // 發送紅包領取的事件通知
        emit reClaimed(id, msg.sender, claimAmount, re.creator);
        return true;
    }
    // 檢查紅包領取資格
    function checkEligible(string memory linkcode,reInfo memory re) internal view returns(bool){
        //string memory refcode = holders[msg.sender].refCode;
        address linkcodeOwner = refCodeOwners[toLower(linkcode)];
        address referrer = holders[msg.sender].referrer ;
        if (        re.eligiType == 0 && // 自己現有粉絲，加上無推薦人並且是無推薦碼或是發紅包者的推薦碼
                    ( referrer == re.creator ||
                      ( referrer == address(0) &&
                        (bytes(linkcode).length == 0 || linkcodeOwner == re.creator )
                      )
                    )
                     ||
                    (re.eligiType == 1 && // 無推薦人，並且是無推薦碼或是發紅包者的推薦碼
                     ( referrer == address(0) &&
                       (bytes(linkcode).length == 0 || linkcodeOwner == re.creator )
                     )
                    )
                     ||
                    re.eligiType == 2  // Any subscriber                        
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
    function randomAmt(uint256 remainsAmt, uint256 remainClaims) private view returns (uint256) {
        uint256 maxAmt = remainsAmt.div(remainClaims).mul(2); // 最大分配金額（可調整）
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % maxAmt + 1;
    }
    //Holder Check My RE
    function getMyRE() public view returns (reInfo[] memory) {
        uint256[] memory myIds = myRE[msg.sender];
        reInfo[] memory result;  
        for (uint256 i = 0; i < myIds.length; i++) {
            uint256 id = myIds[i];            
            result[i] = redEnv[id];
        }
        return result;
    }
    //Holder Check available RE
    function getAvailableRE(string memory linkcode) public view returns (reInfo[] memory) {
        reInfo[] memory result;  
        uint256 count=0;
        for (uint256 i = 0; i < activeREs.length; i++) {
            uint256 id = activeREs[i];
            reInfo storage redE = redEnv[id];
           
            if ( // 根據資格類型檢查
                 checkEligible(linkcode,redE)
            ) {
                    result[count]=redE;
                    count++;
            }          
        }
        return result;
    }
    //Holder edit personal profile
    function editMyProfile(uint8 _type,string memory data) public returns (bool) {
        // 檢查用戶是否持有足夠的代幣
        if(balanceOf(msg.sender) < cost_Edit)
        {
            return false;
        }
        // 燃燒代幣
        _burn(msg.sender, cost_Edit);
        // 更新用戶資料
        Holder storage holder=holders[msg.sender];
        if(_type==1){
            holder.nickname = data;
        }else if(_type==2){
            holder.description = data;
        }else if(_type==3){
            holder.imgUrl = data;
        }
        return true;       
        
    }
    //get specific holder's profile
    function getSpecificHolder(address _holder) public view returns(Holder memory holder){
        return (holders[_holder]);
    }
    //get all address I have referred
    function getMyfansAdd() public view returns(address[] memory){
        return myfans[msg.sender];        
    }
    //function getMyFansCount() external view returns (uint256) {
    //    return myfans[msg.sender].length;
    //}
    function getReCount() external view returns (uint256) {
        return reID;
    }
    //get specific holder's profile
    function getSpecificRE(uint256 reid) public view returns(reInfo memory re){
        return (redEnv[reid]);
    }
}
