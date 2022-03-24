//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Ownable.sol";
import "./Stakeable.sol";
import "hardhat/console.sol";

contract Kingex is Ownable, Stakeable{

    uint256 private _totalSupply;
    uint8 private _decimals;
    string private _symbol;
    string private _name;
    uint internal constant tokensPerEth = 1000;

    mapping(address => uint) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    event Transfer (address indexed from, address indexed to, uint value);

    event Approval (address indexed owner, address indexed spender, uint value);

    event Withdraw (uint amount, uint stakeIndex);

     event Buytoken(address buyer, uint eth, uint token);

    //Constructor is called only once. Set all necessary variables for initial deployment

    constructor (string memory _tokenName, string memory _tokenSymbol, uint _tokenTotalSupply, uint8 _tokenDecimals) {
        _name = _tokenName;
        _symbol = _tokenSymbol;
        _decimals = _tokenDecimals;
        _totalSupply = _tokenTotalSupply;

        _balances[msg.sender] = _totalSupply;
        mint(address(this), 100000000);
    }


    function decimals () external view returns (uint256) {
        return _decimals;
    }

    function symbol() external view returns (string memory){
        return _symbol;
    }

    function name() external view returns (string memory){
        console.log(msg.sender);
        return _name;
    }
    
    function totalSupply() external view returns (uint256){
        return _totalSupply;
    }
   
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function _transfer (address sender, address recipient, uint256 amount) internal { 
        require(sender != address(0), "Kingex: invalid sender address for transfer");
        require(recipient != address(0), "Kingex: invalid recipient address for transfer");
        require(_balances[sender] >= amount, "You do not have enough balance for this transaction.");
        
        _balances[sender] = _balances[sender] - amount;
        _balances[recipient] = _balances[recipient] + amount;

        emit Transfer(sender, recipient, amount);
    }

    function transfer (address recipient, uint256 amount) external returns (bool) {
        _transfer (msg.sender, recipient, amount);
        return true;
    }

    function _mint (address account, uint256 amount) internal { 
        require(account != address(0), "Invalid address provided for mint");

        _totalSupply = _totalSupply + amount;

        _balances[account] = _balances[account] + amount;
        emit Transfer (address(0), account, amount);
    }

    function mint (address account, uint256 amount) public onlyOwner returns (bool)  {
        _mint(account, amount);
        return true;
    }

    function _burn (address account, uint256 amount) internal {
        require (account != address(0), "Kingex: invalid address provided in argument");
        require (_balances[account] >= amount, "Unavailable amount provided for burn");

        _balances[account] = _balances[account] - amount;
        _totalSupply = _totalSupply - amount;
        
        emit Transfer (account, address(0), amount);
    }

    function burn (address account, uint256 amount) external returns (bool) { 
        _burn(account, amount);
        return true;
    }

    function getOwner () external view returns (address) { 
        return owner();
    }
    
    //Think of you giving rights to uniswap to use your available balance: the contract becomes msg.sender while you become spender //

    function _approve (address owner, address spender, uint256 amount) internal {
        require (owner != address(0), "Kingex :owner is an invalid address");
        require (spender != address(0), "Kingex :spender is an invalid address");

        _allowances[owner][spender] = amount;

        emit Approval (owner, spender, amount);
    }

    function approve (address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        
        return true;
    }

    function allowance (address owner, address spender) external view returns (uint) {
       return _allowances[owner][spender];
    }

    function transferFrom (address spender, address recipient, uint256 amount)  external returns (bool) {
        require(_allowances[spender][msg.sender] >= amount, "Kingex: Insufficient funds for spender. Amount greater than available");
        //Think of uniswap as msg.sender
        _approve(spender, msg.sender, _allowances[msg.sender][spender] - amount);
       _transfer(spender, recipient, amount);
        
        return true;
    }

    function increaseAllowance (address spender, uint256 amount) external returns (bool) { 
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + amount);
        return true;
    }

    function decreaseAllowance (address spender, uint256 amount) external returns (bool) { 
        _approve(msg.sender, spender, _allowances[msg.sender][spender] - amount);

        return true;
    }

    /** End of Interface Implementions */

    function stake (uint _amount) public { 
        require(_amount < _balances[msg.sender], "You can only stake the amount less than your current balance");

        _stake(_amount);
        _burn(msg.sender, _amount); //burn the amount from the caller's address
    }

    function withdrawStake (uint stakeIndex) public {

        uint amountToMint = _withdrawStake(stakeIndex);
        _mint(msg.sender, amountToMint);

        emit Withdraw(amountToMint, stakeIndex);
    }

    //Extra Contracts Functions for front End

     function returnStakes () external view returns (stakes[] memory){
            return _stakeholders[_stakerId[msg.sender]].indexStakes;
      }

      function returnTimeStamp () external view returns (uint){
            return block.timestamp;
      }

      function rewardStake (stakes memory x) external view returns (uint) {
          return _calculateStakeReward(x);
      }


      /** For Vendor Feature */

      function buyToken() external payable returns (uint tokenAmount) {
          uint eth = msg.value;

          require(eth > 0, "Enter the ETH amount to buy KGX");

          uint256 amountToBuy = eth * tokensPerEth; 
          uint256 vendorBalance = this.balanceOf(address(this));

          require(vendorBalance >= amountToBuy, "Unavailable token amount requested:reduce eth value");

          bool sent = this.transfer(msg.sender, amountToBuy);
          require(sent, "Could not transfer token to your account");

          emit Buytoken(msg.sender, eth, amountToBuy);
          return amountToBuy;
      }

      function withdraw () external onlyOwner {

          require(address(this).balance > 0, "Ether balance is zero");

          (bool sent, ) = msg.sender.call{value: address(this).balance}("");
          require(sent, "Could not withdraw ether from contract");
      }
}
