// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
contract BurgerToken {   
    address public _owner;
    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner");
        _;
    }
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 private constant INITIAL_SUPPLY = 100_000 * 10**18;
    struct Holder {
        address referrer;
        uint256 holderReward;
        uint256 referReward;
        string refCode;
        string nickname;
        string description;
        string imgUrl;
        uint256 lastClaimedAD;
        bool isDistoStartRE;
        bool isDistoRef;
    }
    mapping(address => Holder) public holders;
    uint256 public adCount = 0;
    uint256 public adStartTime;
    uint256 public adDuration = 72 hours;
    uint256 public holderPercent = 3;
    uint256 public refPercent = 1;
    uint256 public ownerPercent = 1;
    uint256 public cost_Edit = 200 * 10**18;
    uint256 public minRefAmount = 100 * 10**18;
    bool public adEnabled = false;
    mapping(string => address) public refCodeOwners;
    mapping(address => address[]) public myfans;
    struct reInfo {
        uint256 subAmt; // Total shares of this event of RE 
        uint256 claimedAmt; // Shares of Already claimed 
        uint256 maxClaims; // Maximum Times could be claimed
        uint256 claimCount; // Times of already claimed
        address creator; // Who initiate the RE event
        uint8 eligiType; // Who is eligible to claim the RE
        string desc;
        string imgUrl;
        uint256 startTime; 
        bool isActive; // Still active
    }
    mapping(uint256 => reInfo) public redEnv;
    // Stores the ID set of currently valid red envelopes
    uint256[] private activeREs; 
    mapping(address => uint256[]) public myRE;
    uint256 public MinSharePerRE = 100 * 10**18;
    uint256 public MinREshare = 200 * 10**18;
    uint256 public reID = 0;
    //Events for establishing recommended relationships
    event refSet(address indexed holder, address indexed referer);
    // Someone made a transfer
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    // Owner initiate a AirDrop event
    event ADStarted(uint256 indexed adCount);
    // Some holder claimed a airdrop
    event ADClaimed(
        address indexed holder,
        address indexed receiver,
        uint256 reward
    );
    //Someone created a red envelope event
    event reCreated(
        uint256 indexed id,
        address indexed creator,
        uint256 subAmt,
        uint256 maxClaims
    );
    //Someone claimed a red envelope
    event reClaimed(
        uint256 indexed id,
        address indexed claimer,
        uint256 amount,
        address indexed creator
    );

    constructor() {    
        _owner = msg.sender;    
        _mint(msg.sender, INITIAL_SUPPLY);
       name = "BURGER";
       symbol = "BURGER";
       decimals = 18;
    }

    //Check holder's existing referral code
    function getMyRefCode() public view returns (string memory) {
        return holders[msg.sender].refCode;
    }

    // Set or edit referral code
    function setMyRefCode(string memory refCode) external returns (uint8) {
        if (
            // "Insufficient SHARE"
            balanceOf[msg.sender] > cost_Edit
        ) {
            return 1;
        } else if (
            // "Invalid format"
            !isValidRefCode(refCode)
        ) {
            return 2;
        }

        // Delete old mapping ofrefCode (if exists)
        string memory oldrefCode = holders[msg.sender].refCode;
        if (refCodeOwners[oldrefCode] != address(0)) {
            delete refCodeOwners[oldrefCode];
        }

        // Convert the referral code to lowercase 
        // avoid duplication of uppercase and lowercase letters
        string memory lowerRefCode = toLower(refCode);
        if (
            // "Referral code already used by another holder"
            refCodeOwners[lowerRefCode] != address(0)
        ) {
            return 3;
        }
        // Deduct the fee for setting the referral code
        _burn(msg.sender, cost_Edit);
        // Set a new referral code. The referral code can be case sensitive.
        holders[msg.sender].refCode = refCode;
        //Always store referral codes in lowercase in the refCodeOwners map to avoid confusion.
        refCodeOwners[lowerRefCode] = msg.sender;
        return 0;
    }

    // Convert the referral code to lowercase 
    function toLower(string memory str) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] >= 0x41 && strBytes[i] <= 0x5A) {                
                strBytes[i] = bytes1(uint8(strBytes[i]) + 32);
            }
        }
        return string(strBytes);
    }

    // Verify whether the referral code format is valid 
    // (only a~z, 0~9,-_@ combinations are allowed)
    function isValidRefCode(string memory refCode) public pure returns (bool) {
        bytes memory codeBytes = bytes(refCode);
        for (uint256 i = 0; i < codeBytes.length; i++) {
            bytes1 char = codeBytes[i];
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

    //Exclude liquidity contract address from becoming an introducer
    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function setDisabled(address account, bool _disabled, bool isRef)
     external onlyOwner {
        if(isRef){
        holders[account].isDistoStartRE = _disabled;
        }else{
            holders[account].isDistoRef = _disabled;
        }

    }

    function transfer(address recipient, uint256 amount)
        public returns (bool)
    {
        toClaimAirdrop(recipient);
        bool result = _transfer(msg.sender, recipient, amount);
        // Establishing automatic recommendation logic
        if (
            amount >= minRefAmount &&
            result &&
            holders[recipient].referrer == address(0) &&
            // Make sure the Sender is not a contract address
            !isContract(msg.sender) && !holders[msg.sender].isDistoRef
        ) {
            
            holders[recipient].referrer = msg.sender;
            myfans[msg.sender].push(recipient);
            emit refSet(recipient, msg.sender);
        }
        return result;
    }

    // Manually set referrer
    function setReferrer(string memory refCode) public returns (uint8) {
        address referrer = refCodeOwners[refCode];
        if (
            //"Referrer already set"
            holders[msg.sender].referrer != address(0)
        ) {
            return 1;
        } else if (
            // Invalid code or referrer is Disabled
            bytes(refCode).length == 0 || holders[referrer].isDistoRef
        ) {
            return 2;
        } else if (
            //referrer != address(0)
            referrer == address(0)
        ) {
            return 3;
        } else if (
            //"Can not refer yourself"
            referrer == msg.sender
        ) {
            return 4;
        }
        // Set referral
        holders[msg.sender].referrer = referrer;
        myfans[referrer].push(msg.sender);
        emit refSet(msg.sender, referrer);
        return 0;
    }

    //Owner set a new round of airdrop
    function startAirdrop() public onlyOwner {
        require(!adEnabled, "Airdrop enabled");
        uint256 ownerReward = totalSupply * ownerPercent /100;
        _mint(_owner, ownerReward);
        adCount++;
        adStartTime = block.timestamp;
        adEnabled = true;
        emit ADStarted(adCount);
    }

    //get datas of latest airdrop
    function getAirDropInfo()
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (adCount, adStartTime, adDuration);
    }

    function toClaimAirdrop(address addr) internal returns (uint8) {
        if (
            //Airdrop not enabled
            !adEnabled
        ) {
            return 1;
        } else if (
            //Airdrop expired
            block.timestamp > adStartTime + adDuration
        ) {
            adEnabled = false;
            return 2;
        } else if (
            //addr Already claimed airdrop
            holders[addr].lastClaimedAD > adStartTime
        ) {
            return 3;
        }
        uint256 holderReward = balanceOf[addr] * holderPercent /100; // 3% of holder's balance
        uint256 referReward = balanceOf[addr] * refPercent /100; // 1% to referrer
        _mint(msg.sender, holderReward);
        //Update the total number of airdrops received
        holders[addr].holderReward += holderReward ;
        //Update last claimAirdrop time
        holders[addr].lastClaimedAD = block.timestamp;
        //addr is holder,Reward is for holder
        emit ADClaimed(addr, addr, holderReward);
        //Holder's referrer will have refferrerReward
        address referrer = holders[addr].referrer;
        if (referrer != address(0)) {
            _mint(referrer, referReward);
            emit ADClaimed(addr, referrer, referReward);
            holders[referrer].referReward += referReward ;
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
    function setRewardPercentage(uint256 _type, uint8 _percentage)
        external
        onlyOwner
        returns (bool)
    {
        if (_percentage < 1 || _percentage > 4 || adEnabled) {
            return false;
        }
        if (_type == 1) {
            holderPercent = _percentage;
        } else if (_type == 2) {
            refPercent = _percentage;
        } else if (_type == 3) {
            ownerPercent = _percentage;
        } else {
            return false;
        }
        return true;
    }

    //Owner setup Parameters
    function setParameter(uint8 _type, uint256 _amount)
        external
        onlyOwner
        returns (bool)
    {
        if (_amount <= 0) {
            return false;
        }
        //
        else if (_type == 1) {
            // Set a minimum recommended transfer amount,100
            minRefAmount = _amount;
        } else if (_type == 2) {
            // Set the minimum share that each red envelope should contain,100
            MinSharePerRE = _amount;
        } else if (_type == 3) {
            // Set the minimum number of shares that should be included 
            // when initiating a red envelope event
            MinREshare = _amount;
        } else if (_type == 4) {
            // Set the number of shares required to edit data
            cost_Edit = _amount;
        } else if (_type == 5 && !adEnabled && _amount >= 86400) {
            // Set airdrop duration
            adDuration = _amount;
        } else {
            return false;
        }
        return true;
    }

    //how many shares I have rewarded via airdrop as a holder
    function getReward(bool isref) public view returns (uint256) {
        if (isref) {
            return holders[msg.sender].referReward;
        }
        return holders[msg.sender].holderReward;
    }

    // initiating a red envelope event
    function setRE(
        uint256 totalShare,
        uint256 countRE,
        uint8 eligiType,
        string memory _desc,
        string memory _url
    ) external returns (bool) {
        uint256 sum = countRE * MinSharePerRE;
        uint256 minShare = MinREshare > sum ? MinREshare : sum;
        if (
            totalShare < minShare || //"At least SHARE each");
            eligiType > 2 ||
            eligiType < 0 || //"Invalid eligible type");
            balanceOf[msg.sender] < totalShare || //"Insufficient balance");
            holders[msg.sender].isDistoStartRE

        ) {
            return false;
        }
        // Transfer the total share of the red envelope to the contract address
        _transfer(msg.sender, address(this), totalShare);
        // Initialize a red envelope event
        reID++;
        redEnv[reID] = reInfo({
            subAmt: totalShare,
            claimedAmt: 0,
            maxClaims: countRE,
            claimCount: 0,
            creator: msg.sender,
            eligiType: eligiType,
            desc: _desc,
            imgUrl: _url,
            startTime: block.timestamp,
            isActive: true
        });
        myRE[msg.sender].push(reID);
        activeREs.push(reID);
        emit reCreated(reID, msg.sender, totalShare, countRE);
        return true;
    }

    //
    // Set or edit my profile description and picture
    function updateMyRE(
        uint256 id,
        bool isdesc,
        string memory data
    ) external returns (bool) {
        reInfo storage re = redEnv[id];
        if (re.creator == msg.sender && bytes(data).length > 0) {
            if (isdesc) {
                re.desc = data;
                return true;
            } else {
                re.imgUrl = data;
                return true;
            }
        }
        return false;
    }

    // Claim a redenvelope
    function claimRE(string memory linkcode, uint256 id)
        external
        returns (bool)
    {
        reInfo storage re = redEnv[id];
        if (
            !re.isActive ||
            re.claimCount >= re.maxClaims ||
            !checkEligible(linkcode, re)
        ) {
            return false;
        }
        // Set a random amount (get a random share of the red envelope)
        uint256 remainsAmt = re.subAmt - re.claimedAmt;
        uint256 remainClaims = re.maxClaims - re.claimCount;
        uint256 claimAmount = remainClaims == 1
            ? remainsAmt
            : randomAmt(remainsAmt, remainClaims);
        // Update red envelope status
        re.claimedAmt += claimAmount;
        re.claimCount++;
        if (re.claimedAmt >= re.subAmt || re.claimCount >= re.maxClaims) {
            re.isActive = false;
            _removeActiveRE(id);
        }
        address referrer;
        // Set the referrer: If there is a link code, the referrer is the link code owner. 
        // If there is no link code, the referrer is the one who sends the red envelope.
        if (holders[msg.sender].referrer == address(0)) {
            if (bytes(linkcode).length == 0 ) {
                referrer = re.creator;
            } else {
                address rcOwner = refCodeOwners[toLower(linkcode)];
                if (rcOwner != address(0)) {
                    referrer = rcOwner;
                } else {
                    referrer = re.creator;
                }
            }
            holders[msg.sender].referrer = referrer;
            myfans[referrer].push(msg.sender);
            emit refSet(msg.sender, referrer);
        }
        // Send red envelope amount
        _transfer(address(this), msg.sender, claimAmount);
        // Send red envelope collection event notification
        emit reClaimed(id, msg.sender, claimAmount, re.creator);
        return true;
    }

    // Check eligibility for receiving red envelopes
    function checkEligible(string memory linkcode, reInfo memory re)
        internal
        view
        returns (bool)
    {
        //string memory refcode = holders[msg.sender].refCode;
        address linkcodeOwner = refCodeOwners[toLower(linkcode)];
        address referrer = holders[msg.sender].referrer;
        if (                            
            // When the creator of the red envelope is set to 0, 
            // it means that the holder of the recipient of the red envelope is already a fan of the sender, 
            // or has no referral yet, and has no link to the referral code 
            // or the owner of the referral code is the sender of the red envelope.
            (re.eligiType == 0 &&
                (referrer == re.creator ||
                    (referrer == address(0) &&
                        (bytes(linkcode).length == 0 ||
                            linkcodeOwner == re.creator)))) || 
            // When the sender is set to 1, 
            //it means that the holder who can receive the red envelope 
            // must not have a referral yet, and there is no link to the referral code 
            //or the referral code owner is the sender of the red envelope             
            (re.eligiType == 1 &&             
                (referrer == address(0) &&
                    (bytes(linkcode).length == 0 ||
                        linkcodeOwner == re.creator))) ||
            // Any subscriber could claim the redenvelope
            re.eligiType == 2 
        ) {
            return true;
        }
        return false;
    }

    // Remove expired redenvelopes
    function _removeActiveRE(uint256 id) private {
        for (uint256 i = 0; i < activeREs.length; i++) {
            if (activeREs[i] == id) {
                activeREs[i] = activeREs[activeREs.length - 1]; // 用最後一個元素覆蓋
                activeREs.pop(); // 刪除最後一個元素
                break;
            }
        }
    }

    // Set random bonus amount
    function randomAmt(uint256 remainsAmt, uint256 remainClaims)
        private
        view
        returns (uint256)
    {
        uint256 maxAmt = (remainsAmt / remainClaims) * 2; 
        return
            (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) %
                maxAmt) + 1;
    }

    // Holder Check My RE
    function getMyRE() public view returns (reInfo[] memory) {
        uint256[] memory myIds = myRE[msg.sender];
        reInfo[] memory result;
        for (uint256 i = 0; i < myIds.length; i++) {
            uint256 id = myIds[i];
            result[i] = redEnv[id];
        }
        return result;
    }

    // Holder Check available RE
    function getAvailableRE(string memory linkcode)
        public
        view
        returns (reInfo[] memory)
    {
        reInfo[] memory result;
        uint256 count = 0;
        for (uint256 i = 0; i < activeREs.length; i++) {
            uint256 id = activeREs[i];
            reInfo storage redE = redEnv[id];

            if (
                // Check whether you can receive the red envelope 
                // based on the Holder's qualifications
                checkEligible(linkcode, redE)
            ) {
                result[count] = redE;
                count++;
            }
        }
        return result;
    }

    //Holder edit personal profile
    function editMyProfile(uint8 _type, string memory data)
        public
        returns (bool)
    {
        // Check if the user holds enough tokens
        if (balanceOf[msg.sender] < cost_Edit) {
            return false;
        }
        // Burning Tokens
        _burn(msg.sender, cost_Edit);
        // 更新用戶資料
        Holder storage holder = holders[msg.sender];
        if (_type == 1) {
            holder.nickname = data;
        } else if (_type == 2) {
            holder.description = data;
        } else if (_type == 3) {
            holder.imgUrl = data;
        } else {
            return false;
        }
        return true;
    }

    //get specific holder's profile
    function getSpecificHolder(address _holder)
        public
        view
        returns (Holder memory holder)
    {
        return (holders[_holder]);
    }

    //get all address I have referred
    function getMyfansAddr() public view returns (address[] memory) {
        return myfans[msg.sender];
    }

    function getMyFansCount() external view returns (uint256) {
        return myfans[msg.sender].length;
    }
    function getReCount() external view returns (uint256) {
        return reID;
    }

    //get specific holder's profile
    function getSpecificRE(uint256 reid)
        public
        view
        returns (reInfo memory re)
    {
        return (redEnv[reid]);
    }
    
    // Token Authorization Function
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    // Token transfer function (for transfer after authorization)
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Allowance exceeded");
        allowance[from][msg.sender] -= value;
        _transfer(from, to, value);
        return true;
    }
    
    function _mint(address to, uint256 amount) internal {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal returns (bool) {
        if (balanceOf[from] > amount) {
            balanceOf[from] -= amount;
            totalSupply -= amount;
            emit Transfer(from, address(0), amount);
            return true;
        } else {
            return false;
        }
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (bool) {
        if (balanceOf[sender] >= amount) {
            balanceOf[sender] -= amount;
            balanceOf[recipient] += amount;
            emit Transfer(sender, recipient, amount);
            return true;
        } else {
            return false;
        }
    }
}
