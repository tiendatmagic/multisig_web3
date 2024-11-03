import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'web3';
import { NotifyModalComponent } from '../components/modal/notify-modal/notify-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractService } from './contract.service';
import { abi, bytecode } from '../MultisigWallet.json';
@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: Web3 = new Web3((window as any).ethereum);
  private accountSubject = new BehaviorSubject<any>('');
  public account$ = this.accountSubject.asObservable();

  private bnbBalanceSubject = new BehaviorSubject<any>('');
  public bnbBalance$ = this.bnbBalanceSubject.asObservable();

  private isConnectWalletSubject = new BehaviorSubject<boolean>(false);
  public isConnectWallet$ = this.isConnectWalletSubject.asObservable();

  private ownerListSubject = new BehaviorSubject<any>([]);
  public ownerList$ = this.ownerListSubject.asObservable();

  private getTransactionCountSubject = new BehaviorSubject<number>(0);
  public getTransactionCount$ = this.getTransactionCountSubject.asObservable();

  private getRequiredSignaturesSubject = new BehaviorSubject<number>(0);
  public getRequiredSignatures$ = this.getRequiredSignaturesSubject.asObservable();

  private getNativeTokenBalanceSubject = new BehaviorSubject<number>(0);
  public getNativeTokenBalance$ = this.getNativeTokenBalanceSubject.asObservable();

  private getTokenAddressBalanceSubject = new BehaviorSubject<number>(0);
  public getTokenAddressBalance$ = this.getTokenAddressBalanceSubject.asObservable();

  private nativeSymbolSubject = new BehaviorSubject<string>('ETH');
  public nativeSymbol$ = this.nativeSymbolSubject.asObservable();

  private transactionDetailSubject = new BehaviorSubject<any>([]);
  public transactionDetail$ = this.transactionDetailSubject.asObservable();

  public multiSigContract: any;
  private balanceCheckInterval: any;
  contractAddress: any = '';

  constructor(private ngZone: NgZone, public dialog: MatDialog, private snackBar: MatSnackBar, private contractService: ContractService) {
    if (typeof (window as any).ethereum !== 'undefined') {
      this.web3 = new Web3((window as any).ethereum);
      this.setupAccountChangeListener();
      this.setupNetworkChangeListener();

    } else {
      this.showModal("", "MetaMask is not installed!", "error", true, true, true);
      window.open("https://metamask.io/", "_blank");
    }
  }

  get nativeSymbol(): string {
    return this.nativeSymbolSubject.value;
  }
  set nativeSymbol(value: string) {
    this.nativeSymbolSubject.next(value);
  }

  get account(): any {
    return this.accountSubject.value;
  }
  set account(value: any) {
    this.accountSubject.next(value);
  }

  get bnbBalance(): any {
    return this.bnbBalanceSubject.value;
  }
  set bnbBalance(value: any) {
    this.bnbBalanceSubject.next(value);
  }

  get isConnectWallet(): boolean {
    return this.isConnectWalletSubject.value;
  }
  set isConnectWallet(value: boolean) {
    this.isConnectWalletSubject.next(value);
  }

  get ownerList(): any {
    return this.ownerListSubject.value;
  }
  set ownerList(value: any) {
    this.ownerListSubject.next(value);
  }

  get getNativeTokenBalance(): any {
    return this.getNativeTokenBalanceSubject.value;
  }
  set getNativeTokenBalance(value: any) {
    this.getNativeTokenBalanceSubject.next(value);
  }

  get getTokenAddressBalance(): any {
    return this.getTokenAddressBalanceSubject.value;
  }
  set getTokenAddressBalance(value: any) {
    this.getTokenAddressBalanceSubject.next(value);
  }
  get getTransactionCount(): any {
    return this.getTransactionCountSubject.value;
  }
  set getTransactionCount(value: any) {
    this.getTransactionCountSubject.next(value);
  }

  get getRequiredSignatures(): any {
    return this.getRequiredSignaturesSubject.value;
  }
  set getRequiredSignatures(value: any) {
    this.getRequiredSignaturesSubject.next(value);
  }

  get transactionDetail(): any {
    return this.transactionDetailSubject.value;
  }
  set transactionDetail(value: any) {
    this.transactionDetailSubject.next(value);
  }


  async connectWallet() {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0];

      await this.getBalance();
      this.startBalanceCheck();
    } catch (error: any) {
      this.showModal("", error.message, "error", true, false);
    }
  }


  disconnectWallet(): void {
    this.account = null;
    this.bnbBalance = '0';
    this.isConnectWallet = false;
    if (this.balanceCheckInterval) {
      clearInterval(this.balanceCheckInterval);
    }
  }

  getAccount(): string {
    return this.account;
  }

  async getBalance() {
    if (!this.account) return '0';
    const balance = await this.web3.eth.getBalance(this.account);
    this.bnbBalance = this.web3.utils.fromWei(balance, 'ether');
    return this.bnbBalance;
  }

  isConnected(): boolean {
    if (!this.account) {
      this.isConnectWallet = false;
    }
    else {
      this.isConnectWallet = true;
    }
    return !!this.account;
  }

  private setupAccountChangeListener() {
    (window as any).ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length === 0) {
        this.ngZone.run(() => this.disconnectWallet());
      } else {
        this.ngZone.run(async () => {
          this.account = accounts[0];
          await this.getBalance();
        });
      }
    });
  }

  private setupNetworkChangeListener() {
    (window as any).ethereum.on('chainChanged', async (chainId: string) => {
      this.ngZone.run(() => this.disconnectWallet());
      this.ngZone.run(() => this.connectWallet());
    });
  }

  private startBalanceCheck() {
    clearInterval(this.balanceCheckInterval);
    if (this.isConnected()) {
      this.ngZone.run(async () => {
        await this.getBalance();
      });
    }
    this.balanceCheckInterval = setInterval(async () => {
      if (this.isConnected()) {
        await this.ngZone.run(async () => {
          await this.getBalance();
        });
      }
    }, 10000); // Check balances every 10 seconds
  }

  async init() {
    this.multiSigContract = new this.web3.eth.Contract(abi, this.contractAddress);
  }

  async getInfo(address: string = '0x0000000000000000000000000000000000000000') {
    this.contractAddress = address;
    await this.init();
    const getTransactionCount = await this.multiSigContract.methods.getTransactionCount().call();
    const getRequiredSignatures = await this.multiSigContract.methods.requiredSignatures().call();
    const getOwners = await this.multiSigContract.methods.getOwners().call();
    const getNativeTokenBalance = await this.multiSigContract.methods.getNativeTokenBalance().call();
    this.ownerList = getOwners;
    this.getTransactionCount = getTransactionCount;
    this.getRequiredSignatures = getRequiredSignatures;
    this.getNativeTokenBalance = this.web3.utils.fromWei(getNativeTokenBalance, 'ether')
  }

  async submitTransaction(address: string, amount: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.submitTransaction(address, this.web3.utils.toWei(amount, 'ether')
    ).send({
      from: this.account,
      gasPrice,
    });

    const txIndexTransaction = result.events.SubmitTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async submitTokenTransaction(address: string, tokenAddress: string, amount: number, decimals: number = 1) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.submitTokenTransaction(address, tokenAddress, amount * 10 ** decimals
    ).send({
      from: this.account,
      gasPrice,
    });

    const txIndexTransaction = result.events.SubmitTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async submitAddOwner(address: string) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.submitAddOwner(address).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.SubmitTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async submitRemoveOwner(address: string) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.submitRemoveOwner(address).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.SubmitTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async submitSetRequiredSignatures(signatures: number = 1) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.submitSetRequiredSignatures(signatures
    ).send({
      from: this.account,
      gasPrice,
    });
    console.log(result);
    const txIndexTransaction = result.events.SubmitTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async confirmTransaction(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.confirmTransaction(txIndex).send({
      from: this.account,
      gasPrice,
    });
    console.log(result);
    const txIndexTransaction = result.events.ConfirmTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async confirmSetRequiredSignatures(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.confirmSetRequiredSignatures(txIndex).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.ConfirmTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async confirmAddOwner(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.confirmAddOwner(txIndex).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.ConfirmTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }
  async confirmRemoveOwner(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.confirmRemoveOwner(txIndex).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.ConfirmTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
  }

  async executeTransaction(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.executeTransaction(txIndex).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.ExecuteTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
    await this.getInfo(this.contractAddress);
  }

  async executeAddOwner(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.executeAddOwner(txIndex).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.ExecuteTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
    await this.getInfo(this.contractAddress);
  }
  async executeRemoveOwner(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.executeRemoveOwner(txIndex).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.ExecuteTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
    await this.getInfo(this.contractAddress);
  }

  async executeSetRequiredSignatures(txIndex: number) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const result = await this.multiSigContract.methods.executeSetRequiredSignatures(txIndex).send({
      from: this.account,
      gasPrice,
    });
    const txIndexTransaction = result.events.ExecuteTransaction.returnValues.txIndex.toString();
    this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      duration: 5000
    });
    await this.getBalance();
    await this.getInfo(this.contractAddress);
  }

  async getTokenAddress(tokenAddress: string) {
    try {
      const getERC20TokenBalance = await this.multiSigContract.methods.getERC20TokenBalance(tokenAddress).call();
      this.getTokenAddressBalance = this.web3.utils.fromWei(getERC20TokenBalance, 'ether')
    } catch (e) {

    }
  }

  async getTransaction(txIndex: number) {
    try {
      const getTransaction = await this.multiSigContract.methods.getTransaction(txIndex).call();
      this.transactionDetail = {
        to: getTransaction.to,
        value: getTransaction.value.toString(),
        executed: getTransaction.executed,
        confirmations: getTransaction.confirmations.toString(),
        createdAt: getTransaction.createdAt.toString(),
        isTokenTransaction: getTransaction.isTokenTransaction,
        tokenAddress: getTransaction.tokenAddress
      }
    } catch (e) {
      this.transactionDetail = {

      }
    }
  }

  showModal(title: string, message: string, status: string, showCloseBtn: boolean = true, disableClose: boolean = true, installMetamask: boolean = false) {
    this.dialog.closeAll();
    this.dialog.open(NotifyModalComponent, {
      disableClose: disableClose,
      width: '90%',
      maxWidth: '400px',
      data: {
        title: title,
        message: message,
        status: status,
        showCloseBtn: showCloseBtn,
        installMetamask: installMetamask
      }
    });
  }

}
