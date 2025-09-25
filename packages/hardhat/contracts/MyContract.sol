//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that manages user profiles and allows users to store and retrieve their data
 * It also includes a simple token-like functionality with balances
 * @author BuidlGuidl
 */
contract MyContract {
    // State Variables
    address public immutable owner;
    uint256 public totalUsers = 0;
    uint256 public totalTokens = 0;
    
    // User profile structure
    struct UserProfile {
        string name;
        string email;
        uint256 joinDate;
        bool isActive;
    }
    
    // Mappings
    mapping(address => UserProfile) public userProfiles;
    mapping(address => uint256) public userBalances;
    mapping(address => bool) public registeredUsers;
    
    // Events
    event UserRegistered(address indexed user, string name, string email, uint256 joinDate);
    event ProfileUpdated(address indexed user, string name, string email);
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);

    // Constructor
    constructor(address _owner) {
        owner = _owner;
        console.log("MyContract deployed by:", _owner);
    }

    // Modifier: only registered users
    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    // Modifier: only owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Register a new user with their profile information
     * @param _name User's name
     * @param _email User's email
     */
    function registerUser(string memory _name, string memory _email) public {
        require(!registeredUsers[msg.sender], "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        userProfiles[msg.sender] = UserProfile({
            name: _name,
            email: _email,
            joinDate: block.timestamp,
            isActive: true
        });
        
        registeredUsers[msg.sender] = true;
        totalUsers += 1;
        
        // Give new users 100 tokens as welcome bonus
        userBalances[msg.sender] = 100;
        totalTokens += 100;
        
        console.log("User registered:", _name);
        console.log("User address:", msg.sender);
        emit UserRegistered(msg.sender, _name, _email, block.timestamp);
        emit TokensMinted(msg.sender, 100);
    }

    /**
     * Update user profile information
     * @param _name New name
     * @param _email New email
     */
    function updateProfile(string memory _name, string memory _email) public onlyRegisteredUser {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        userProfiles[msg.sender].name = _name;
        userProfiles[msg.sender].email = _email;
        
        console.log("Profile updated for user");
        emit ProfileUpdated(msg.sender, _name, _email);
    }

    /**
     * Transfer tokens to another registered user
     * @param _to Recipient address
     * @param _amount Amount to transfer
     */
    function transferTokens(address _to, uint256 _amount) public onlyRegisteredUser {
        require(registeredUsers[_to], "Recipient not registered");
        require(userBalances[msg.sender] >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount must be greater than 0");
        
        userBalances[msg.sender] -= _amount;
        userBalances[_to] += _amount;
        
        console.log("Tokens transferred:", _amount);
        console.log("From:", msg.sender);
        console.log("To:", _to);
        emit TokensTransferred(msg.sender, _to, _amount);
    }

    /**
     * Mint new tokens (only owner can do this)
     * @param _to Recipient address
     * @param _amount Amount to mint
     */
    function mintTokens(address _to, uint256 _amount) public onlyOwner {
        require(registeredUsers[_to], "Recipient not registered");
        require(_amount > 0, "Amount must be greater than 0");
        
        userBalances[_to] += _amount;
        totalTokens += _amount;
        
        console.log("Tokens minted:", _amount);
        console.log("To address:", _to);
        emit TokensMinted(_to, _amount);
    }

    /**
     * Get user profile information
     * @param _user User address
     */
    function getUserProfile(address _user) public view returns (UserProfile memory) {
        require(registeredUsers[_user], "User not registered");
        return userProfiles[_user];
    }

    /**
     * Get user balance
     * @param _user User address
     */
    function getUserBalance(address _user) public view returns (uint256) {
        return userBalances[_user];
    }

    /**
     * Check if user is registered
     * @param _user User address
     */
    function isUserRegistered(address _user) public view returns (bool) {
        return registeredUsers[_user];
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
