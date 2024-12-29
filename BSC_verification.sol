
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/access/Ownable.sol";
//import "@openzeppelin/contracts/utils/math/SafeMath.sol";
//import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

//import "./ERC20Basic.sol";



pragma solidity ^0.8.20;

//import {IERC20} from "./IERC20.sol";
/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}
//import {IERC20Metadata} from "./extensions/IERC20Metadata.sol";

/**
 * @dev Interface for the optional metadata functions from the ERC-20 standard.
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}


//import {Context} from "../../utils/Context.sol";

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

//import {IERC20Errors} from "../../interfaces/draft-IERC6093.sol";
/**
 * @dev Standard ERC-20 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-20 tokens.
 */
interface IERC20Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     * @param allowance Amount of tokens a `spender` is allowed to operate with.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC20InvalidSpender(address spender);
}

/**
 * @dev Standard ERC-721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in ERC-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Standard ERC-1155 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-1155 tokens.
 */
interface IERC1155Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     * @param tokenId Identifier number of a token.
     */
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC1155InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC1155InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param owner Address of the current owner of a token.
     */
    error ERC1155MissingApprovalForAll(address operator, address owner);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC1155InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC1155InvalidOperator(address operator);

    /**
     * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
     * Used in batch transfers.
     * @param idsLength Length of the array of token identifiers
     * @param valuesLength Length of the array of token amounts
     */
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}
/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * The default value of {decimals} is 18. To change this, you should override
 * this function so it returns a different value.
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC-20
 * applications.
 */
abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    mapping(address account => uint256) private _balances;

    mapping(address account => mapping(address spender => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the default value returned by this function, unless
     * it's overridden.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `value`.
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `value` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Skips emitting an {Approval} event indicating an allowance update. This is not
     * required by the ERC. See {xref-ERC20-_approve-address-address-uint256-bool-}[_approve].
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `value`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `value`.
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    /**
     * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
     * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
     * this function.
     *
     * Emits a {Transfer} event.
     */
    function _update(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            // Overflow check required: The rest of the code assumes that totalSupply never overflows
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                // Overflow not possible: value <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            unchecked {
                // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
                _totalSupply -= value;
            }
        } else {
            unchecked {
                // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
                _balances[to] += value;
            }
        }

        emit Transfer(from, to, value);
    }

    /**
     * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
     * Relies on the `_update` mechanism
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    /**
     * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
     * Relies on the `_update` mechanism.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead
     */
    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    /**
     * @dev Sets `value` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    /**
     * @dev Variant of {_approve} with an optional flag to enable or disable the {Approval} event.
     *
     * By default (when calling {_approve}) the flag is set to true. On the other hand, approval changes made by
     * `_spendAllowance` during the `transferFrom` operation set the flag to false. This saves gas by not emitting any
     * `Approval` event during `transferFrom` operations.
     *
     * Anyone who wishes to continue emitting `Approval` events on the`transferFrom` operation can force the flag to
     * true using the following override:
     *
     * ```solidity
     * function _approve(address owner, address spender, uint256 value, bool) internal virtual override {
     *     super._approve(owner, spender, value, true);
     * }
     * ```
     *
     * Requirements are the same as {_approve}.
     */
    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `value`.
     *
     * Does not update the allowance value in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Does not emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance < type(uint256).max) {
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }   

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

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
