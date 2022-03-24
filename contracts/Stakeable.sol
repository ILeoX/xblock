//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Stakeable { 

      constructor () {
            _stakeholders.push();
      }

      struct stakes {
            uint amount; 
            uint fromTime;
            uint claimableRewards;
      }

      struct Stake {  //Struct for entire stakes
            address staker;
            stakes[] indexStakes; //each stake from a particular staker
      }

      Stake[] internal _stakeholders; //The array of stake from different shareholders 

      mapping (address => uint) internal _stakerId; 
      uint _rewardPerHour = 2000; //Multiplier for stakes:: 2% added per hour. Integer used since solidity 
      //cannot accept decimals

      event tellId (address indexed staker, uint indexed id);
      event Staked (address staker, uint amount, uint id, uint time);

      function _newStaker (address _staker) internal returns (uint){

            _stakeholders.push();

            uint _id = _stakeholders.length - 1;
            _stakeholders[_id].staker = _staker; 
            _stakerId[_staker] = _id; 

            emit tellId (_staker, _id);
            return _id;
      }

      function _stake (uint _amount) internal { 
            require (_amount > 0, "You must stake a reasonable sum grerater than zero");

            uint _id = _stakerId[msg.sender];
            uint timeOfStake = block.timestamp;
            
            if (_id == 0) { //a new staker
                 _id = _newStaker(msg.sender);
            }

            _stakeholders[_id].indexStakes.push(stakes(_amount, timeOfStake, 0)); //each stake from a particular staker gets into an array of stakes 

            emit Staked(msg.sender, _amount, _id, timeOfStake);
      }

      //test this contract for 2% every second -- calculation seem to be incorrect 
      function _calculateStakeReward (stakes memory _oneStake) internal view returns (uint) {
            uint _totalSecs = block.timestamp - _oneStake.fromTime;
            return (((_totalSecs/3600)/_rewardPerHour)*_oneStake.amount);
      }
      
      function _withdrawStake (uint _stakeIndex) internal returns (uint){
            uint _id = _stakerId[msg.sender];
            stakes memory _oneStake = _stakeholders[_id].indexStakes[_stakeIndex];

            require(_id != 0, "You are not a registered staker");
            require(_stakeholders[_id].staker == msg.sender, "You are not allowed access to this account");
             
            uint _reward = _calculateStakeReward(_oneStake);
            _stakeholders[_id].indexStakes[_stakeIndex].claimableRewards = _reward;

            uint _totalReward = _stakeholders[_id].indexStakes[_stakeIndex].claimableRewards + _stakeholders[_id].indexStakes[_stakeIndex].amount;

            _stakeholders[_id].indexStakes[_stakeIndex].amount = 0;
            delete _stakeholders[_id].indexStakes[_stakeIndex];

            return _totalReward;
      }

}