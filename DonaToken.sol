// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract BlackDona {
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
        uint256 fans_count;
        uint256 holderReward;
        uint256 referReward;
        string refCode;
        string nickname;
        string description;
        string imgUrl;
        string url;
        uint256 lastClaimedAD;
        bool disDN;
        bool disRef;
    }
    mapping(address => Holder) public holders;        
    uint256 public adCount = 0;
    uint256 public adStartTime;
    uint256 public adDuration = 24 hours;
    //Percentage of each type
    uint256 public holderPercent = 300; // *100
    uint256 public refPercent = 100; // *100
    uint256 public ownerPercent = 100; // *100
    uint256 public cost_Edit = 10 * 10**18;
    uint256 public cost_ntf = 10 * 10**18;
    uint256 public minRefAmount = 10 * 10**18;
    bool public adEnabled = false;
    mapping(string => address) public refCodeOwners;
    mapping(address => address[]) public myfans;
    struct donaInfo {
        uint256 subAmt; // Total shares of this event of RE
        uint256 claimedAmt; // Shares of Already claimed
        uint256 maxClaims; // Maximum Times could be claimed
        uint256 claimCount; // Times of already claimed
        address creator; // Who initiate the RE event
        uint8 eligiType; // Who is eligible to claim the RE
        string desc;
        string imgUrl;
        string redirect;
        uint256 startTime;
        bool isActive; // Still active
    }
    mapping(uint256 => donaInfo) public blkDona;
    // Whoever Claimed which Dona
    // Stores the ID set of currently valid Dina
    mapping(uint256 => mapping(address => bool)) public whoClaimed;
    uint256[] public activeDNs;
    mapping(uint256 => uint8) public limitedDN;
    mapping(address => uint256[]) public myDona;
    mapping(address => uint256) public myDonaCount;
    uint256 public minShareBox = 10 * 10**18;
    uint256 public minShareTime = 20 * 10**18;
    uint256 public donaID = 0;
    //Events for establishing recommended relationships
    event refSet(address indexed holder, address indexed referer);
    event Mint(address indexed minter, uint256 amount);

    // Someone made a transfer
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Donation(
        address indexed dona,
        address indexed recipient,
        uint256 amount
    );
    event Burn(address indexed burner, uint256 amount);

    // Owner initiate a AirDrop event
    event ADStarted(uint256 indexed adCount);
    // Some holder claimed a airdrop
    event ADClaimed(
        address indexed holder,
        address indexed receiver,
        uint256 reward
    );
    //Someone created a red envelope event
    event donaCreated(
        uint256 indexed id,
        address indexed creator,
        uint8 eligiType,
        uint256 subAmt,
        uint256 maxClaims
    );
    //Someone claimed a red envelope
    event donaClaimed(
        uint256 indexed id,
        address indexed claimer,
        uint256 amount,
        address indexed creator
    );
    event Notification(
        address indexed sender,
        string notice_type,
        string message,
        uint256 timestamp
    );

    constructor() {
        _owner = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY);
        name = "BLKDONA";
        symbol = "DONA";
        decimals = 18;
    }

    function notification(string memory notice_type, string memory message)
        public
    {
        if (msg.sender != _owner) {
            _burn(msg.sender, cost_ntf);
        }
        emit Notification(msg.sender, notice_type, message, block.timestamp);
    }

    // Set or edit referral code
    function setMyRefCode(string memory refCode) external {
        require(bytes(refCode).length > 0, "invalid code");
        if (
            // "Insufficient SHARE"
            balanceOf[msg.sender] < cost_Edit
        ) {
            return;
        } else if (
            // "Invalid format"
            !isValidRefCode(refCode)
        ) {
            return;
        }

        // Delete old mapping ofrefCode (if exists)
        string memory oldrefCode = holders[msg.sender].refCode;
        if (
            bytes(oldrefCode).length > 0 &&
            refCodeOwners[toLower(oldrefCode)] == msg.sender
        ) {
            delete refCodeOwners[toLower(oldrefCode)];
        }

        // Convert the referral code to lowercase
        // avoid duplication of uppercase and lowercase letters
        //string memory lowerRefCode = toLower(refCode);
        if (
            // "Referral code already used by another holder"
            refCodeOwners[toLower(refCode)] != address(0)
        ) {
            return;
        }
        // Deduct the fee for setting the referral code
        _burn(msg.sender, cost_Edit);
        // Set a new referral code. The referral code can be case sensitive.
        holders[msg.sender].refCode = refCode;
        //Always store referral codes in lowercase in the refCodeOwners map to avoid confusion.
        refCodeOwners[toLower(refCode)] = msg.sender;
        //return ;
    }

    // Convert the referral code to lowercase
    function toLower(string memory str) internal pure returns (string memory) {
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
    function isValidRefCode(string memory refCode)
        internal
        pure
        returns (bool)
    {
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

    function setDisabled(
        address account,
        bool _disabled,
        bool isRef
    ) external onlyOwner {
        if (isRef) {
            holders[account].disDN = _disabled;
        } else {
            holders[account].disRef = _disabled;
        }
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        toClaimAirdrop(recipient);
        bool result = _transfer(msg.sender, recipient, amount);
        // Establishing automatic recommendation logic
        if (
            amount >= minRefAmount &&
            result &&
            holders[recipient].referrer == address(0) &&
            // Make sure the Sender is not a contract address
            !isContract(msg.sender) &&
            !holders[msg.sender].disRef
        ) {
            holders[recipient].referrer = msg.sender;
            holders[msg.sender].fans_count++;
            myfans[msg.sender].push(recipient);
            emit refSet(recipient, msg.sender);
        }
        return result;
    }

    // Manually set referrer
    function setReferrer(string memory refCode) external {
        require(bytes(refCode).length > 0, "Invalid string");
        address referrer = refCodeOwners[toLower(refCode)];
        if (
            //"Referrer already set"
            holders[msg.sender].referrer != address(0)
        ) {
            return;
        } else if (
            // referrer is not Disabled
            holders[referrer].disRef
        ) {
            return;
        } else if (
            //referrer != address(0)
            referrer == address(0)
        ) {
            return;
        } else if (
            //"Can not refer yourself"
            referrer == msg.sender
        ) {
            return;
        }
        // Set referral
        holders[msg.sender].referrer = referrer;
        holders[referrer].fans_count++;
        myfans[referrer].push(msg.sender);
        emit refSet(msg.sender, referrer);
        //return 0;
    }

    //Owner set a new round of airdrop
    function startAirdrop() external onlyOwner {
        require(!adEnabled, "Airdrop enabled");
        uint256 ownerReward = (totalSupply * ownerPercent) / 10000;
        _mint(_owner, ownerReward);
        adCount++;
        adStartTime = block.timestamp;
        adEnabled = true;
        emit ADStarted(adCount);
    }

    function toClaimAirdrop(address addr) internal {
        if (
            //Airdrop not enabled
            !adEnabled
        ) {
            return;
        } else if (
            //Airdrop expired
            block.timestamp > adStartTime + adDuration
        ) {
            adEnabled = false;
            //return ; who close the door can still get the last airdrop.
        } else if (
            //addr Already claimed airdrop
            holders[addr].lastClaimedAD > adStartTime
        ) {
            return;
        }
        // initial 3% of holder's balance
        uint256 holderReward = (balanceOf[addr] * holderPercent) / 10000;
        // initial 1% to referrer
        uint256 referReward = (balanceOf[addr] * refPercent) / 10000;
        _mint(msg.sender, holderReward);
        //Update the total number of airdrops received
        holders[addr].holderReward += holderReward;
        //Update last claimAirdrop time
        holders[addr].lastClaimedAD = block.timestamp;
        //addr is holder,Reward is for holder
        emit ADClaimed(addr, addr, holderReward);
        //Holder's referrer will have refferrerReward
        address referrer = holders[addr].referrer;
        if (referrer != address(0)) {
            _mint(referrer, referReward);
            emit ADClaimed(addr, referrer, referReward);
            holders[referrer].referReward += referReward;
        }
    }

    // Claim airdrop,holder no need to keyin address for security consideration
    function claimAirdrop() external {
        toClaimAirdrop(msg.sender);
    }

    //Owner setup holderPercent
    function setHolderReward(uint256 _percentage) external onlyOwner {
        require(_percentage > 1 && _percentage < 500, "Invalid percentge");
        holderPercent = _percentage;
    }

    //Owner setup refPercent
    function setReferalReward(uint256 _percentage) external onlyOwner {
        require(_percentage > 1 && _percentage < 500, "Invalid percentge");
        refPercent = _percentage;
    }

    //Owner setup refPercent
    function setOwnerReward(uint256 _percentage) external onlyOwner {
        require(_percentage > 1 && _percentage < 500, "Invalid percentge");
        ownerPercent = _percentage;
    }

    function setMinRefAmount(uint256 _amount) external onlyOwner {
        require(_amount > 0, "amount must >0");
        minRefAmount = _amount;
    }

    function setMinShareTime(uint256 _amount) external onlyOwner {
        require(_amount > 0, "amount must >0");
        minShareTime = _amount;
    }

    function setMinShareBox(uint256 _amount) external onlyOwner {
        require(_amount > 0, "amount must >0");
        minShareBox = _amount;
    }

    function setCost_Edit(uint256 _amount) external onlyOwner {
        require(_amount > 0, "amount must >0");
        cost_Edit = _amount;
    }

    function setCost_Notification(uint256 _amount) external onlyOwner {
        require(_amount > 0, "amount must >0");
        cost_ntf = _amount;
    }

    function setAdDuration(uint256 _duration) external onlyOwner {
        require(_duration >= 3600, "Duration at least 1 hour");
        adDuration = _duration;
    }
    //When a donut really doesn't work, make it invalid,
    //and in serious cases, make its creator invalid as well.
    //when reason=0,means Dona is OK to access
    function limitDona(uint256 id, uint8 reason,bool discreator) external onlyOwner {
        donaInfo storage dona = blkDona[id];
        limitedDN[id] = reason;
        if (discreator) {
            holders[dona.creator].disDN = true;
        }
    }
    // initiating a red envelope event
    function setDona(
        uint256 totalShare,
        uint256 countDN,
        uint8 eligiType,
        string memory _desc,
        string memory _url,
        string memory _redirect
    ) external {
        uint256 sum = countDN * minShareBox;
        uint256 minShare = minShareTime > sum ? minShareTime : sum;
        require(bytes(_desc).length < 1024,"Desc. is too long");
        if (
            totalShare < minShare || //"At least SHARE each");
            eligiType > 2 ||
            eligiType < 0 || //"Invalid eligible type");
            balanceOf[msg.sender] < totalShare || //"Insufficient balance");
            holders[msg.sender].disDN
        ) {
            return;
        }
        // Transfer the total share of the red envelope to the contract address
        _transfer(msg.sender, address(this), totalShare);
        // Initialize a red envelope event
        donaID++;
        blkDona[donaID] = donaInfo({
            subAmt: totalShare,
            claimedAmt: 0,
            maxClaims: countDN,
            claimCount: 0,
            creator: msg.sender,
            eligiType: eligiType,
            desc: _desc,
            imgUrl: _url,
            redirect: _redirect,
            startTime: block.timestamp,
            isActive: true
        });
        myDona[msg.sender].push(donaID);
        myDonaCount[msg.sender]++;
        activeDNs.push(donaID);
        emit donaCreated(donaID, msg.sender, eligiType, totalShare, countDN);
    }

    //
    // Set or edit my profile description and picture
    function updateMyDona(
        uint256 id,
        string memory desc,
        string memory url
    ) external {
        require(bytes(desc).length < 1024,"Desc. is too long");
        donaInfo storage dona = blkDona[id];
        if (dona.creator == msg.sender) {
            if (bytes(desc).length > 0) {
                dona.desc = desc;
            }
            if (bytes(url).length > 0) {
                dona.imgUrl = url;
            }
        }
    }


    // Claim a blkDonaelope
    function claimDona(string memory linkcode, uint256 id) external {
        donaInfo storage dona = blkDona[id];
        if (
            !dona.isActive ||
            dona.claimCount >= dona.maxClaims ||
            !checkEligible(linkcode, id)
        ) {
            return;
        }
        // Set a random amount (get a random share of the red envelope)
        uint256 remainsAmt = dona.subAmt - dona.claimedAmt;
        uint256 remainClaims = dona.maxClaims - dona.claimCount;
        uint256 claimAmount = remainClaims == 1
            ? remainsAmt
            : randomAmt(remainsAmt, remainClaims);
        // Update red envelope status
        dona.claimedAmt += claimAmount;
        dona.claimCount++;
        if (dona.claimedAmt >= dona.subAmt || dona.claimCount >= dona.maxClaims) {
            dona.isActive = false;
            _removeActiveDN(id);
        }
        address referrer;
        // Set the referrer: If there is a link code, the referrer is the link code owner.
        // If there is no link code, the referrer is the one who sends the red envelope.
        if (holders[msg.sender].referrer == address(0)) {
            if (bytes(linkcode).length == 0) {
                referrer = dona.creator;
            } else {
                address rcOwner = refCodeOwners[toLower(linkcode)];
                if (rcOwner != address(0)) {
                    referrer = rcOwner;
                } else {
                    referrer = dona.creator;
                }
            }
            holders[msg.sender].referrer = referrer;
            myfans[referrer].push(msg.sender);
            holders[referrer].fans_count++;
            emit refSet(msg.sender, referrer);
        }
        // Send blkDona amount
        _transfer(address(this), msg.sender, claimAmount);
        whoClaimed[id][msg.sender] = true;

        // Send blkDona event notification
        emit donaClaimed(id, msg.sender, claimAmount, dona.creator);
        //return true;
    }

    // Check eligibility for receiving red envelopes
    function checkEligible(string memory linkcode, uint256 id)
        public
        view
        returns (bool)
    {
        donaInfo storage dona = blkDona[id];
        address linkcodeOwner = refCodeOwners[toLower(linkcode)];
        address referrer = holders[msg.sender].referrer;
        // If it has been received, or it is a red envelope sent by yourself, return false
        if (whoClaimed[id][msg.sender] || 
            dona.creator == msg.sender ||
            limitedDN[id] > 0 ) {
            return false;
        }
        if (
            // When the creator of the red envelope is set to 0,
            // it means that the holder of the recipient of the red envelope is already a fan of the sender,
            // or has no referral yet, and has no link to the referral code
            // or the owner of the referral code is the sender of the red envelope.
            (dona.eligiType == 0 &&
                (referrer == dona.creator ||
                    (referrer == address(0) &&
                        (bytes(linkcode).length == 0 ||
                            linkcodeOwner == dona.creator)))) ||
            // When the sender is set to 1,
            //it means that the holder who can receive the red envelope
            // must not have a referral yet, and there is no link to the referral code
            //or the referral code owner is the sender of the red envelope
            (dona.eligiType == 1 &&
                (referrer == address(0) &&
                    (bytes(linkcode).length == 0 ||
                        linkcodeOwner == dona.creator))) ||
            // Any subscriber could claim the blkDonaelope
            dona.eligiType == 2
        ) {
            return true;
        }
        return false;
    }

    // Remove expired blkDonaelopes
    function _removeActiveDN(uint256 id) private {
        for (uint256 i = 0; i < activeDNs.length; i++) {
            if (activeDNs[i] == id) {
                activeDNs[i] = activeDNs[activeDNs.length - 1]; // 用最後一個元素覆蓋
                activeDNs.pop(); // 刪除最後一個元素
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

    //Holder edit personal profile
    function editMyProfile(
        string memory _nickname,
        string memory _desc,
        string memory _imgurl,
        string memory _url
    ) external  {
        require(balanceOf[msg.sender] >= cost_Edit, "Insufficient tokens");
        require(bytes(_nickname).length <= 32, "Nickname too long");
        require(bytes(_desc).length <= 256, "Desc. too long");

        // Burn tokens
        _burn(msg.sender, cost_Edit);
        // Update holder data
        Holder storage holder = holders[msg.sender];
        holder.nickname = _nickname;
        holder.description = _desc;
        holder.imgUrl = _imgurl;
        holder.url = _url;
    }

    // Token Authorization Function
    function approve(address spender, uint256 value)
        external
        returns (bool success)
    {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    // Token transfer function (for transfer after authorization)
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool success) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Allowance exceeded");
        allowance[from][msg.sender] -= value;
        _transfer(from, to, value);
        return true;
    }

    function _mint(address to, uint256 amount) internal {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Mint(to, amount);
    }

    function _burn(address from, uint256 amount)
        internal
        returns (bool success)
    {
        if (balanceOf[from] > amount) {
            balanceOf[from] -= amount;
            totalSupply -= amount;
            emit Burn(from, amount);
            return true;
        } else {
            return false;
        }
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (bool success) {
        if (balanceOf[sender] >= amount) {
            balanceOf[sender] -= amount;
            balanceOf[recipient] += amount;
            emit Transfer(sender, recipient, amount);
            return true;
        } else {
            return false;
        }
    }

    function donation(address recipient, uint256 amount)
        external
        returns (bool success)
    {
        emit Donation(msg.sender, recipient, amount);
        return _transfer(msg.sender, recipient, amount);
    }

    function donateToBlackhole(uint256 amount) external returns (bool success) {
        return _burn(msg.sender, amount);
    }

    function mintTo(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
