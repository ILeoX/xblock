//SPDX-License-Identifier: MIT


pragma solidity ^0.8.0;

contract Ownable{ 
      address private _owner; 

      event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

      modifier onlyOwner () {
            require (_owner == msg.sender, "Ownable: only owner can call this function");
            _;
      }

      constructor () {
            _owner = msg.sender;
      }

      function owner () public view returns (address) { 
            return _owner;
      }

      function renounceOwnership () public onlyOwner {
            emit OwnershipTransferred(_owner, address(0));
            _owner = address(0);
      }

      function trasnferOwnership (address newOwner) internal {
            require(_owner != address(0), "Ownable: invalid address detected");
            emit OwnershipTransferred(_owner, newOwner);
            _owner = newOwner;
      }
}