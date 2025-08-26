import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'web3';
import { NotifyModalComponent } from '../components/modal/notify-modal/notify-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractService } from './contract.service';
import { abi, bytecode } from '../MultisigWallet.json';
import { abiAdv, bytecodeAdv } from '../MultisigWalletAdvanced.json';
import { abiV2, bytecodeV2 } from '../MultisigWalletV2.json';
import { abiAdvV2, bytecodeAdvV2 } from '../MultisigWalletAdvancedV2.json';

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

  private tokenSymbolSubject = new BehaviorSubject<string>('');
  public tokenSymbol$ = this.tokenSymbolSubject.asObservable();

  private nativeSymbolSubject = new BehaviorSubject<string>('ETH');
  public nativeSymbol$ = this.nativeSymbolSubject.asObservable();

  private transactionDetailSubject = new BehaviorSubject<any>([]);
  public transactionDetail$ = this.transactionDetailSubject.asObservable();

  public multiSigContract: any;
  private balanceCheckInterval: any;

  private isAdvancedContractSubject = new BehaviorSubject<boolean>(false);
  public isAdvancedContract$ = this.isAdvancedContractSubject.asObservable();

  public versionSubject = new BehaviorSubject<number>(2);
  public version$ = this.versionSubject.asObservable();
  public tokenSymbol: any = 'Token';
  contractAddress: any = '';

  constructor(private ngZone: NgZone, public dialog: MatDialog, private snackBar: MatSnackBar, private contractService: ContractService) {
    try {
      const accounts = (window as any).ethereum.request({ method: 'eth_requestAccounts' });

    } catch (error: any) {
      this.showModal("", "MetaMask is not installed!", "error", true, true, true);
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

  get isAdvancedContract(): boolean {
    return this.isAdvancedContractSubject.value;
  }
  set isAdvancedContract(value: boolean) {
    this.isAdvancedContractSubject.next(value);
  }


  async connectWallet() {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0];
      await this.getBalance();
      this.startBalanceCheck();
    } catch (error: any) {
      try {
        if (error.code && error.message && error) {
          this.showModal("", error.message, "error", true, false);
        }
      }
      catch {
        this.showModal("", "MetaMask is not installed!", "error", true, true, true);
      }
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

  public isAddress(address: string): boolean {
    return this.web3.utils.isAddress(address);
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

  async getTokenDecimals(tokenAddress: string): Promise<number> {
    try {
      const erc20Abi = [
        {
          constant: true,
          inputs: [],
          name: "decimals",
          outputs: [{ name: "", type: "uint8" }],
          type: "function",
        },
      ];
      const tokenContract = new this.web3.eth.Contract(erc20Abi, tokenAddress);
      const decimals = await tokenContract.methods['decimals']().call();
      console.log('decimals:', decimals);
      return Number(decimals);
    } catch (e: any) {
      console.error('Error fetching decimals:', e.message);
      this.showModal("", `Error fetching decimals: ${e.message}`, "error", true, false);
      return 18;
    }
  }

  ngOnInit() {
    if (typeof (window as any).ethereum !== 'undefined') {
      this.web3 = new Web3((window as any).ethereum);
      this.setupAccountChangeListener();
      this.setupNetworkChangeListener();
    } else {
      this.showModal("", "MetaMask is not installed!", "error", true, true, true);
      window.open("https://metamask.io/", "_blank");
    }
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
    }, 10000);
  }

  async init() {
    const version = this.versionSubject.value;
    if (version === 2) {
      this.multiSigContract = new this.web3.eth.Contract(
        this.isAdvancedContract ? abiAdvV2 : abiV2,
        this.contractAddress
      );
    } else {
      this.multiSigContract = new this.web3.eth.Contract(
        this.isAdvancedContract ? abiAdv : abi,
        this.contractAddress
      );
    }
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

  async depositETH(amountTokenNative: string) {
    try {
      if (!this.web3) throw new Error('Web3 provider is not initialized');
      if (!this.contractAddress) throw new Error('Contract address is not set');
      if (!this.isConnected()) throw new Error('Wallet is not connected');

      const code = await this.web3.eth.getCode(this.contractAddress);
      if (code === '0x') throw new Error('Address is not a contract');

      const amount = amountTokenNative;
      const value = this.web3.utils.toWei(amount, 'ether');

      if (!value || isNaN(Number(value))) throw new Error('Invalid value for transaction');

      let gas;
      try {
        gas = Number(await this.web3.eth.estimateGas({
          from: this.account,
          to: this.contractAddress,
          value
        }));
      } catch (e: any) {
        console.error('Gas estimation failed:', JSON.stringify(e, null, 2));
        throw new Error(`Failed to estimate gas: ${e.message || 'Unknown error'}`);
      }
      const gasLimit = Math.ceil(gas * 1.2);

      const txParams: any = {
        from: this.account,
        to: this.contractAddress,
        value,
        gas: gasLimit
      };

      const block = await this.web3.eth.getBlock('latest');
      if (block.baseFeePerGas) {
        const baseFeePerGas = Number(block.baseFeePerGas);
        const priorityFeePerGas = Number(this.web3.utils.toWei('2', 'gwei'));
        const maxFeePerGas = Math.ceil(baseFeePerGas * 1 + priorityFeePerGas);

        txParams.maxFeePerGas = maxFeePerGas;
        txParams.maxPriorityFeePerGas = priorityFeePerGas;
      } else {
        const gasPrice = Number(await this.web3.eth.getGasPrice());
        const bufferedGasPrice = Math.ceil(gasPrice);

        txParams.gasPrice = bufferedGasPrice;
      }

      const tx = await this.web3.eth.sendTransaction(txParams);

      this.snackBar.open('Successfully deposited ' + amount + ' ETH', 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });

      await this.getBalance();
      await this.getInfo(this.contractAddress);

      return tx;
    } catch (e: any) {
      console.error('Deposit error:', JSON.stringify(e, null, 2));
      const errorMessage = e.data?.reason || e.message || 'Failed to deposit ETH';
      this.showModal('', errorMessage, 'error', true, false);
      throw e;
    }
  }

  async submitTransaction(address: string, amount: number) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async submitTokenTransaction(address: string, tokenAddress: string, amount: number) {
    try {
      const decimals = await this.getTokenDecimals(tokenAddress);
      const adjustedAmount = BigInt(Math.round(amount * Math.pow(10, decimals)));
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.submitTokenTransaction(address, tokenAddress, adjustedAmount).send({
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async submitAddOwner(address: string) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async submitRemoveOwner(address: string) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async submitSetRequiredSignatures(signatures: number = 1) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.submitSetRequiredSignatures(signatures
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async confirmTransaction(txIndex: number) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.confirmTransaction(txIndex).send({
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async confirmSetRequiredSignatures(txIndex: number) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async confirmAddOwner(txIndex: number) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async confirmRemoveOwner(txIndex: number) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async executeTransaction(txIndex: number, payableAmount: any = null) {
    try {
      const gasPrice = (await this.web3.eth.getGasPrice()).toString();
      var result;
      if (this.isAdvancedContract) {
        result = await this.multiSigContract.methods.executeTransaction(txIndex).send({
          from: this.account,
          value: this.web3.utils.toWei(payableAmount, 'ether'),
          gasPrice,
        });
      }
      else {
        result = await this.multiSigContract.methods.executeTransaction(txIndex).send({
          from: this.account,
          gasPrice,
        });
      }

      const txIndexTransaction = result.events.ExecuteTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
      await this.getInfo(this.contractAddress);
    }
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async executeAddOwner(txIndex: number) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async executeRemoveOwner(txIndex: number) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async executeSetRequiredSignatures(txIndex: number) {
    try {
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
    catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }


  async getTokenAddress(tokenAddress: string) {
    try {
      const decimals = await this.getTokenDecimals(tokenAddress);
      // const symbol = await this.getTokenSymbol(tokenAddress);
      const symbol = 'Token';
      const getERC20TokenBalance = await this.multiSigContract.methods.getERC20TokenBalance(tokenAddress).call();
      this.getTokenAddressBalance = Number(getERC20TokenBalance) / Math.pow(10, decimals);
      this.tokenSymbol = symbol;

    } catch (e: any) {
      console.error('Error fetching token balance:', e.message);
      this.getTokenAddressBalance = 0;
      this.tokenSymbol = 'Token';
      this.showModal("", `Không thể lấy số dư token: ${e.message}`, "error", true, false);
    }
  }

  getWeiUnit(decimals: number): string {
    const units: { [key: number]: string } = {
      6: 'mwei',
      9: 'gwei',
      12: 'szabo',
      15: 'finney',
      18: 'ether',
    };
    return units[decimals] || 'ether';
  }

  async submitWithdrawNativeToken(address: string, amount: number) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.submitWithdrawNativeToken(address, this.web3.utils.toWei(amount.toString(), 'ether')).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.ProposeTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async submitWithdrawERC20(address: string, tokenAddress: string, amount: number) {
    try {
      const decimals = await this.getTokenDecimals(tokenAddress);
      const adjustedAmount = BigInt(Math.round(amount * Math.pow(10, decimals)));
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.submitWithdrawERC20(address, tokenAddress, adjustedAmount).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.ProposeTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async submitWithdrawERC721(address: string, tokenAddress: string, tokenId: number) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.submitWithdrawERC721(address, tokenAddress, tokenId).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.ProposeTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async submitWithdrawERC1155(address: string, tokenAddress: string, tokenId: number, amount: number) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.submitWithdrawERC1155(address, tokenAddress, tokenId, amount).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.ProposeTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async proposeAddOwner(address: string) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.proposeAddOwner(address).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.ProposeTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async proposeRemoveOwner(address: string) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.proposeRemoveOwner(address).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.ProposeTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async proposeChangeRequiredSignatures(signatures: number) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.proposeChangeRequiredSignatures(signatures).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.ProposeTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async revokeConfirmation(txIndex: number) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.revokeConfirmation(txIndex).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.RevokeConfirmation.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
    }
  }

  async cancelTransaction(txIndex: number) {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const result = await this.multiSigContract.methods.cancelTransaction(txIndex).send({
        from: this.account,
        gasPrice,
      });
      const txIndexTransaction = result.events.CancelTransaction.returnValues.txIndex.toString();
      this.snackBar.open('Tx index: ' + txIndexTransaction, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 5000
      });
      await this.getBalance();
    } catch (e: any) {
      if (e.message) {
        this.showModal("", e.message, "error", true, false);
      }
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
        createdAt: new Date(getTransaction.createdAt.toString() * 1000).toLocaleString(),
        tokenAddress: getTransaction.tokenAddress,
        txRequiredSignatures: getTransaction.txRequiredSignatures.toString(),
        txType: this.getTransactionTypeName(getTransaction.txType),
        data: getTransaction.data.toString()
      };
    } catch (e) {
      this.transactionDetail = {};
    }
  }

  private getTransactionTypeName(txType: number): string {
    const types = [
      'WithdrawNativeToken',
      'WithdrawERC20',
      'AddOwner',
      'RemoveOwner',
      'ChangeRequiredSignatures',
      'WithdrawERC721',
      'WithdrawERC1155'
    ];
    return types[txType] || 'Unknown';
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