import { useEffect, useState} from 'react'
import {ethers}  from 'ethers'
import Stake from './Stake'
import Transfer from './Transfer'
import Stakesview from './Stakesview'
import Swapview from './Swapper'
import Kingex from './artifacts/contracts/Kingex.sol/Kingex.json'
import './App.css'
import {Button, Container, Navbar} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {

  const [accounts, setAccounts] = useState("--");
  const [accountBal, setAccountBal] = useState("--");
  const [tokenWorth, setTokenWorth] = useState("");
  const [recipient, setRecipient] = useState();
  const [amount, setAmount] = useState();
  const [btnText, setBtnText] = useState('Connect to Metamask')
  const [balance, setBalance] = useState("--");
  const [stakesView, setStakesView] = useState(false);
  const [stakesData, setStakesData] = useState([]);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [showStake, setShowStake] = useState(false);
  const [showTransfer, setShowTransfer] = useState(true);
  const [viewStateBtn, setViewStateBtn] = useState("Click to Stake");

  //XYZ

  const [swapTokenIn, setSwapTokenIn] = useState()
  const [swapTokenOut, setSwapTokenOut] = useState()

//remmeber to record final scenes when deploying to testnet when you add 
//the max supply feature with the requireent line in solidity 
  const kingexAddress = '0x0FcE0229E11502f63B8bfEfc5234222f173B7cec';
  
  const provider = () => {
    return new ethers.providers.Web3Provider(window.ethereum)
  };

  const signer = () => {
    return provider().getSigner();
  };

  const contract = () => {
    return new ethers.Contract(kingexAddress, Kingex.abi, signer());
  };
  

  //Request Account Function
  const requestAccountAccess = async () => {
    if (await window.ethereum._metamask.isUnlocked()) {

    
        if(typeof window.ethereum !== 'undefined'){

          try {
            const account = await window.ethereum.request({method: 'eth_requestAccounts'}) //request connection from metamask (implement this with the click of a button)
            setAccounts(account[0]);
            getBalance(account[0]);
            let accbal = await provider().getBalance(account[0]);
            accbal = accbal.toNumber();
            
            
            account !== undefined && setBtnText('Connected')

            seeStakes();
            setAccountBal(accbal);

            let chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log("Connected to chain " + chainId);

            // String, hex code of the chainId of the Rinkebey test network
            const ropstenChainId = "0x3";

            if (chainId !== ropstenChainId) {
            alert("You are not connected to the Ropsten Test Network. Please switch to Ropsten test net to use the DApp!");
            }
          }
          
          catch (error) { 
            if (error.message.includes("User rejected the request")) alert("You rejected the connection request. You must connect your wallet to use this DApp");
          } 
        } else {
          alert("Please install the Metamask extension to use this DApp")
        }

  } else{ 
    alert("Unlock Wallet, and connect again. ")
  }
  };
  

  /** More contract related calls begin From Here */
  
  const getBalance = async account => {
    try { 
      let balance = await contract().balanceOf(account)
      balance = balance.toNumber().toLocaleString("en-us")
      setBalance(balance)
    } 
    catch (error) {
     // if (error.message.includes("User rejected the request")) alert("You rejected the connection request. You must connect your wallet to use this DApp");
    }
  };


  /** Transfer Tokens */
  const transferTokens = async e => {
    e.preventDefault();

    try { 
      requestAccountAccess();
      await contract().transfer(recipient, amount);
    }
    catch (error) {
      //if (error.message.includes("User rejected the request")) console.log("You rejected the connection request. You must connect your wallet to use this DApp");
    }

    contract().on("Transfer", (from, to, value) => {
        alert(value + " KGX successfully transferred from " + from + " to " + to);
        requestAccountAccess()
      });

      setRecipient("")
      setAmount("")
  };

  
  /** Staking Functions */
  const stakeTokens = async e => {
    e.preventDefault();
    try{ 
      requestAccountAccess();
      await contract().stake(stakeAmount)
    }

    catch (error) {
      console.log(error.message)
      //if (error.message.includes("User rejected the request")) alert("You rejected the connection request. You must connect your wallet to use this DApp");
    }

    contract().on("Staked", (staker, amount, id, time) => {
      console.log("You just staked", amount.toNumber().toLocaleString("en-us"), " with id ", id.toNumber())
      requestAccountAccess()
    });
  }

  /** WIthdraw Functions*/
  const withdrawStakes = async (e) => {
    const stakeIndex = e.target.id;
    
    try { 
      await contract().withdrawStake(stakeIndex);
      contract().on("Withdraw", (amount, stakeIndex) => {
        console.log("You just withdrew from stake number ", stakeIndex.toNumber(), "containing ", amount.toNumber().toLocaleString("en-us"))
        requestAccountAccess()
      });
    } 
    catch (error) {
      //if (error.message.includes("User rejected the request")) alert("You rejected the connection request. You must connect your wallet to use this DApp");
    }
    
    
  }


  /** Format Function for converting seoncds to days, hours, ... */

  const format = (seconds) => {
    seconds = Number(seconds);
    let d = ~~(seconds / (3600*24));
    let h = ~~(seconds % (3600*24) / 3600);
    let m = ~~(seconds % 3600 / 60);
    let s = ~~(seconds % 60);
    
    let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days ") : "";
    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

    return dDisplay + hDisplay + mDisplay + sDisplay;
  }
  //End of Format Function

  const setViewState = () => {
    if(showTransfer == true) {
      setShowTransfer(false)
      setShowStake(true)
      setViewStateBtn("Click to Transfer")
    } 
    else if (showStake == true) {
      setShowStake(false);
      setShowTransfer(true);
      setViewStateBtn("Click to Stake")
    }
  };


  window.ethereum.on('accountsChanged', function (accounts) {
    requestAccountAccess();
  });

  window.ethereum.on('chainChanged', (chainId) => {
    window.location.reload();
  });


  const seeStakes = async () => {
    const stakes = await contract().returnStakes();
    const currentBlockTime = await contract().returnTimeStamp();
    let stakesViewArray = [];

    if(stakes.length > 0) {
      

      for (let i of stakes) {
        let index = stakes.indexOf(i);
        let amount = i[0].toNumber();
        let timeOfStake = i[1];
        let rewards = await contract().rewardStake(i);
        let timeElapsed = format(currentBlockTime.toNumber()-timeOfStake.toNumber());

        if (amount == 0) continue;
        let x = {
          index: index,
          amount:amount,
          timeElapsed:timeElapsed,
          rewards:rewards.toNumber() 
        }

        stakesViewArray[x.index] = x;
      }
      setStakesData(stakesViewArray);
      setStakesView(true);
    };
  }

  //- 32603

  /** Swapping Functions */
  const tokenInput = async (e) => {
    requestAccountAccess();

    let amt = e.target.value;
    setSwapTokenIn(amt);

    console.log(amt)

    let outputAmt = e * 1000;

    setTokenWorth(outputAmt);

    console.log(amt)
  }


  return (
    <div className="App">
      
      <h6>Your Address: <code> {accounts} </code></h6>
      <h6>Balance: <code> {balance} </code> KGX </h6>
      <Button onClick={ setViewState } style={{backgroundColor: '#22242A', fontSize:"90%"}}> {viewStateBtn} </Button>
      <div> {} </div>

      <hr/>
      <Navbar bg='light' className='btn-circle'>
            <Container>
                  <Navbar.Brand className='mx-5'> <h4> KINGEX </h4>  </Navbar.Brand> 
                  <Navbar.Collapse className="justify-content-end mt-3">
                  <Button 
                  onClick = {requestAccountAccess}
                  style={{backgroundColor: '#2534A1', fontSize:"90%", borderRadius:'15px'}}> {btnText} </Button>
                  </Navbar.Collapse>
            </Container>
            </Navbar>

        {showStake && <Stake stake={stakeTokens} change={ e => setStakeAmount(e.target.value)}/>}
        {showTransfer && <Transfer transfer={transferTokens} changeRec={ e => setRecipient(e.target.value)} changeVal={e => setAmount(e.target.value)}/>}
        {stakesView && <Stakesview array={stakesData} withdraw={withdrawStakes}/>}
        <Swapview swapBtn={tokenInput} tokenIn={tokenInput} accountBal={accountBal} tokenWorth-={tokenWorth}/>
    </div>
  );
}

export default App;
