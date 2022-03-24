import 'bootstrap/dist/css/bootstrap.min.css';
import { PureComponent } from 'react';
import './App.css'

function App (props) { 

      return (

            <div className='bg-dim border-curved py-3'> 

                  <div className="title txt-white font-large"> 
                  <h4> Swap Tokens</h4>
                  </div>

                  <div className='input-control border-curved p-3'> 
                  <input onChange={props.tokenIn} type="number" placeholder='0.00' className='input-box txt-white borderless border-curved bg-dark font-large p-4 mx-2'/> 
                  <span>
                        <select className='font-large txt-white bg-dark borderless border-curved p-3'>
                              <option> ETH</option>

                        </select>
                  </span>
                  
                  <p id='balance' className='font-normal txt-white'>Balance: </p>
                  </div>

                  <div className='input-control border-curved p-3'> 
                  <input type="number" value={props.tokenWorth} placeholder='0.00' className='input-box txt-white borderless border-curved bg-dark font-large p-4 mx-2'/> 
                  <span>
                        <select className='font-large txt-white bg-dark borderless border-curved p-3'>
                              
                              <option>KGX </option> 
                        </select>
                  </span>

                  <p id='balance' className='font-normal txt-white'>Balance: {props.accountBal}</p>
                  </div>

                  <div className='info'>
                        <p id='info'></p>
                  </div>

                  <button onClick={props.swapBtn} className='bttn txt-white borderless border-curved font-large p-2'> Swap Tokens</button>

            </div>
      )
}

export default App;