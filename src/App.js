import logo from './logo.svg';
import './App.css';
import web3 from './web3.js';
import React, {Component} from 'react';
import bank from './bank';

class App extends Component {
  state = {
    manager : '',
    players : [],
    balance : '',
    value : '',
    message : '',
    deposite : '',
    withraw : '',
    transfer : '',
    recipient : '',
    loanDescription : '',
    loanValue : '',
    numLoans : '',
    bankBalance : ''
  };

  loanRequests = [];

  async componentDidMount(){
    const account = await web3.eth.getAccounts();
    const manager = await bank.methods.manager().call();
    const balance = await bank.methods.approvers(account[0]).call();
    const numLoans  = await bank.methods.numLoans().call();
    const approverCount  = await bank.methods.approversCount().call();
    const bankBalance = await web3.eth.getBalance(bank.options.address);

    if(account[0]==manager){
      for(var i=0;i<numLoans;i++){
        const loanRequest = await bank.methods.loans(i).call();
        if(!loanRequest.complete) this.loanRequests.push(
          <div >
          Description : {loanRequest.description}<br />
          Value : {web3.utils.fromWei(loanRequest.value,'ether')}<br />
          Recipient : {loanRequest.recipient}<br />
          Approvals : {loanRequest.approvalCount}/{approverCount}<br />
          <button onClick={this.approveLoan} id={i}>Approve</button>
          <br />
          <br />

          </div>
        )
      }
    }
    else{
      for(var i=0;i<numLoans;i++){
        const loanRequest = await bank.methods.loans(i).call();
        if(!loanRequest.complete) this.loanRequests.push(
          <div >
          Description : {loanRequest.description}<br />
          Value : {web3.utils.fromWei(loanRequest.value,'ether')}<br />
          Recipient : {loanRequest.recipient}<br />
          <button onClick={this.approveLoan} id={i}>Approve</button>
          <br />
          <br />

          </div>
        )
      }
    }

    this.setState({manager:1,balance:balance,numLoans:numLoans});
    if(account[0]==manager) this.setState({manager:2,balance:balance,bankBalance:bankBalance});
  }

  approveLoan = async(event)=>{
    event.preventDefault();
    // console.log(event.target.id);
    const accounts = await web3.eth.getAccounts();
    this.setState({message:"Approving Request"});
    if(this.state.manager===2){
      try{
        await bank.methods.finalizeLoan(event.target.id).send({from:accounts[0]});
        this.setState({message:"Approved Loan!!!"});
      }catch(err){
        this.setState({message:"Cannot Approve Loan Yet"});
      }
    }
    else{
      try{
        await bank.methods.approveLoan(event.target.id).send({from:accounts[0]});
        this.setState({message:"Approved Request!!!"});
      }catch(err){
        this.setState({message:"Cannot Approve Request"});
      }
    }

  }
  onDeposite = async(event)=>{
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({message:"Waiting for transaction to complete...."});
    await bank.methods.deposite()
      .send({
        from:accounts[0],
        value:web3.utils.toWei(this.state.deposite,'ether')
      });
    
    this.setState({message:"Transaction completed! Your ethers are safely deposited in bank"});
  }
  onWithraw = async(event)=>{
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({message:"Waiting for transaction to complete...."});
    await bank.methods.withraw(web3.utils.toWei(this.state.withraw,'ether'))
      .send({
        from:accounts[0]
      });
    
    this.setState({message:"Transaction completed! Your ethers are safely withrawed from bank"});
  }
  onTransfer = async(event)=>{
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({message:"Waiting for transaction to complete...."});
    // console.log(this.state.transfer,this.state.recipient)
    await bank.methods.transferMoney(this.state.recipient,web3.utils.toWei(this.state.transfer,'ether'))
      .send({
        from:accounts[0],
      });
    
    this.setState({message:"Transaction completed! Ethers transfered successfully"});
  }
  createLoan = async(event)=>{
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({message:"Waiting for transaction to complete...."});
    // console.log(this.state.transfer,this.state.recipient)
    await bank.methods.createLoan(this.state.loanDescription,web3.utils.toWei(this.state.loanValue,'ether'))
      .send({
        from:accounts[0],
      });
    
    this.setState({message:"Transaction completed! Loan Request Created successfully"});
  }
  render(){
    if(this.state.manager===2){
      return (
        <div>
          <h1>Manager</h1>
          <h3>Bank Balance : {web3.utils.fromWei(this.state.bankBalance,'ether')}</h3>
          <h3>Approve Loan Request</h3>
            <div>{this.loanRequests}</div>
            <hr/>
            <h2>{this.state.message}</h2>
        </div>
      )
    }
    else if(this.state.manager===1){
        return(
          <div>
            <h1>Welcome to Defi Bank</h1>
            <div>Your balance is {web3.utils.fromWei(this.state.balance,'ether')}</div>
            <hr />

            <h3>Deposite</h3>
            <form onSubmit={this.onDeposite}>
              <label>Enter the amount of ether </label>
              <input 
                value = {this.state.deposite}
                onChange = {event => this.setState({deposite : event.target.value})}
              />
              <button>Deposite</button>
            </form>
            <hr />

            <h3>Withraw</h3>
            <form onSubmit={this.onWithraw}>
              <label>Enter the amount of ether </label>
              <input 
                value = {this.state.withraw}
                onChange = {event => this.setState({withraw : event.target.value})}
              />
              <button>Withraw</button>
            </form>

            <hr />

            <h3>Transfer</h3>
            <form onSubmit={this.onTransfer}>
              <label>Enter the address of recipient </label>
              <input 
                value = {this.state.recipient}
                onChange = {event => this.setState({recipient : event.target.value})}
              />
              <br />
              <br />
              <label>Enter the amount of ethers </label>
              <input 
                value = {this.state.transfer}
                onChange = {event => this.setState({transfer : event.target.value})}
              />
              <button>Transfer</button>
            </form>

            <hr />
            <h3>Create Loan Request</h3>
            <form onSubmit={this.createLoan}>
              <label>Enter description for loan </label>
              <input 
                value = {this.state.loanDescription}
                onChange = {event => this.setState({loanDescription : event.target.value})}
              />
              <br />
              <br />
              <label>Enter the amount of ethers </label>
              <input 
                value = {this.state.loanValue}
                onChange = {event => this.setState({loanValue : event.target.value})}
              />
              <button>Create Loan</button>
            </form>

            <hr />
            <h3>Approve Loan Request</h3>
            <div>{this.loanRequests}</div>
            <hr/>
            <h2>{this.state.message}</h2>
          </div>
        )
    }else{
      return (
        <div><h1>Loading...</h1></div>
      );
    }
  }

}

export default App;
