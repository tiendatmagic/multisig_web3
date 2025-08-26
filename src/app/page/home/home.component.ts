import { Component, ViewChild } from '@angular/core';
import { ContractDeployService } from '../../services/contract-deploy.service';
import { abi, bytecode } from '../../MultisigWallet.json';
import { abiAdv, bytecodeAdv } from '../../MultisigWalletAdvanced.json';
import { abiV2, bytecodeV2 } from '../../MultisigWalletV2.json';
import { abiAdvV2, bytecodeAdvV2 } from '../../MultisigWalletAdvancedV2.json';
import { Web3Service } from '../../services/web3.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getAddress } from 'ethers';
import { FixMeLater } from 'angularx-qrcode';
import html2canvas from 'html2canvas';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isConnected: boolean = false;
  isShowDeployContract: boolean = false;
  isShowImportContract: boolean = false;
  isAdvancedContract: boolean = false;
  contractAddress: any = '';
  multisigAddress: any;
  submitTransactionAddress: any;
  submitTransactionAmount: any;
  submitTokenTransactionAddress: any;
  submitTokenTransactionTokenAddress: any;
  submitTokenTransactionAmount: any;

  newRequiredSignatures: any;
  newOwnerAddress: any;
  removeOwnerAddress: any;
  txIndexScan: any;
  confirmTransactionTxIndex: any;
  confirmSetRequiredSignaturesTxIndex: any;
  confirmAddOwnerTxIndex: any;
  confirmRemoveOwnerTxIndex: any;
  payableAmount: any;
  executeTransactionTxIndex: any;
  executeSetRequiredSignaturesTxIndex: any;
  executeAddOwnerTxIndex: any;
  executeRemoveOwnerTxIndex: any;
  ownerList: any = [];
  transactionCount: number = 0;
  requiredSignatures: number = 0;
  numbersArray: number[] = [];
  ownerListLength = 1;
  ownerAddresses: any;
  nrRequiredSignatures: any = 1;
  transactionDetail: any = [];
  tokenAddressBalanceScan: any = '';
  balanceAddress: any = 0;
  tokenAddressBalance: any = 0;
  amountTokenNative: any = 0;
  version: number = 2;
  @ViewChild('qrCode') qrCodeElement!: any;
  tokenDecimals: number | null = null;
  tokenSymbol: string | null = null;

  // New properties for v2
  submitERC721Address: any;
  submitERC721TokenAddress: any;
  submitERC721TokenId: any;
  submitERC1155Address: any;
  submitERC1155TokenAddress: any;
  submitERC1155TokenId: any;
  submitERC1155Amount: any;
  revokeConfirmationTxIndex: any;
  cancelTransactionTxIndex: any;


  constructor(private web3Service: Web3Service, private deployService: ContractDeployService, private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) {
    this.web3Service.isConnectWallet$.subscribe((value) => {
      this.isConnected = value;
    });
    this.web3Service.ownerList$.subscribe((value) => {
      this.ownerList = value;
    });

    this.web3Service.getTransactionCount$.subscribe((value) => {
      this.transactionCount = value;
    });
    this.web3Service.getRequiredSignatures$.subscribe((value) => {
      this.requiredSignatures = value;
    });
    this.web3Service.getNativeTokenBalance$.subscribe((value: any) => {
      this.balanceAddress = parseFloat(value);
    });
    this.web3Service.getTokenAddressBalance$.subscribe((value) => {
      this.tokenAddressBalance = value;
    });
    this.web3Service.tokenSymbol$.subscribe((value) => {
      this.tokenSymbol = value;
    });
    this.web3Service.transactionDetail$.subscribe((value) => {
      this.transactionDetail = value;
    });
  }

  ngOnInit() {
    const getAddressContract = this.route.snapshot.paramMap.get('addresscontract');
    if (getAddressContract && getAddressContract !== '0x0000000000000000000000000000000000000000') {
      this.contractAddress = getAddressContract;
      this.web3Service.getInfo(this.contractAddress);
    }
    else {
      this.isShowDeployContract = true;
      this.isShowImportContract = false;
    }
    this.numbersArray = Array.from({ length: this.ownerListLength }).map((_, index) => index + 1);
    this.ownerAddresses = new Array(this.ownerListLength).fill('');
  }

  async onTokenAddressChange() {
    if (this.submitTokenTransactionTokenAddress && this.web3Service.isAddress(this.submitTokenTransactionTokenAddress)) {
      this.tokenDecimals = await this.web3Service.getTokenDecimals(this.submitTokenTransactionTokenAddress);
    } else {
      this.tokenDecimals = null;
    }
  }

  trackByIndex(index: number, item: any): number {
    return item;
  }

  updateNumbersArray() {
    this.numbersArray = Array.from({ length: this.ownerListLength }, (_, index) => index + 1);
  }

  addOwner() {
    this.ownerListLength++;
    this.updateNumbersArray();
  }

  removeOwner(indexToRemove: number) {
    this.numbersArray = this.numbersArray.filter(value => value !== indexToRemove);
    this.ownerAddresses[indexToRemove - 1] = '';
    this.ownerListLength--;
  }

  async deployContract(ownerList: any = [], requiredSignatures: number = 1) {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    try {
      const owners = ownerList;
      const contract = await this.deployService.deployContract(
        this.version === 2 ? (this.isAdvancedContract ? abiAdvV2 : abiV2) : (this.isAdvancedContract ? abiAdv : abi),
        this.version === 2 ? (this.isAdvancedContract ? bytecodeAdvV2 : bytecodeV2) : (this.isAdvancedContract ? bytecodeAdv : bytecode),
        owners,
        requiredSignatures
      );
      this.contractAddress = contract.options.address;
      console.log('Contract deployed at:', contract.options.address);
      this.isShowDeployContract = false;
      this.isShowImportContract = false;
      this.web3Service.getInfo(this.contractAddress);
      this.router.navigate(['/address/' + this.contractAddress]);
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  }
  onDeloyContract() {
    const filteredArray = this.ownerAddresses.filter((item: any) => item !== '');
    if (filteredArray.length === 0) {
      this.web3Service.showModal("", "You must add at least one owner", "error", true, false);
      return;
    }

    if (filteredArray.length < this.nrRequiredSignatures) {
      this.web3Service.showModal("", "You must add at least " + filteredArray.length + " owners", "error", true, false);
    }

    this.nrRequiredSignatures = filteredArray.length;
    this.deployContract(filteredArray, this.nrRequiredSignatures);
  }

  chooseDeployContract() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    this.router.navigate(['/address/' + '0x0000000000000000000000000000000000000000']);
    this.isShowDeployContract = true;
    this.isShowImportContract = false;
    this.contractAddress = '0x0000000000000000000000000000000000000000';
  }

  chooseImportContract() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    this.isShowDeployContract = false;
    this.isShowImportContract = !this.isShowImportContract;
  }

  chooseAdvancedContract() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    this.isAdvancedContract = !this.isAdvancedContract;
    this.web3Service.isAdvancedContract = this.isAdvancedContract;
    this.web3Service.getInfo(this.contractAddress);

  }

  onImportContract() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.multisigAddress) {
      this.web3Service.showModal("", "Please enter contract address", "error", true, false);
      return;
    }

    this.contractAddress = this.multisigAddress;
    this.isShowImportContract = false;
    this.router.navigate(['/address/' + this.contractAddress]);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitTransaction() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.submitTransactionAddress) {
      this.web3Service.showModal("", "Please enter transaction address", "error", true, false);
      return;
    }
    if (!this.submitTransactionAmount) {
      this.web3Service.showModal("", "Please enter transaction amount", "error", true, false);
      return;
    }
    this.web3Service.submitTransaction(this.submitTransactionAddress, this.submitTransactionAmount);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitTokenTransaction() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.submitTokenTransactionAddress) {
      this.web3Service.showModal("", "Please enter transaction address", "error", true, false);
      return;
    }
    if (!this.submitTokenTransactionTokenAddress) {
      this.web3Service.showModal("", "Please enter transaction token address", "error", true, false);
      return;
    }
    if (!this.submitTokenTransactionAmount) {
      this.web3Service.showModal("", "Please enter transaction amount", "error", true, false);
      return;
    }

    this.web3Service.submitTokenTransaction(this.submitTokenTransactionAddress, this.submitTokenTransactionTokenAddress, this.submitTokenTransactionAmount);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitSetRequiredSignatures() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.newRequiredSignatures) {
      this.web3Service.showModal("", "Please enter new required signatures", "error", true, false);
      return;
    }
    this.web3Service.submitSetRequiredSignatures(this.newRequiredSignatures);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitAddOwner() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.newOwnerAddress) {
      this.web3Service.showModal("", "Please enter new owner address", "error", true, false);
      return;
    }
    this.web3Service.submitAddOwner(this.newOwnerAddress);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitRemoveOwner() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.removeOwnerAddress) {
      this.web3Service.showModal("", "Please enter remove owner address", "error", true, false);
      return;
    }
    this.web3Service.submitRemoveOwner(this.removeOwnerAddress);
    this.web3Service.getInfo(this.contractAddress);
  }

  onConfirmTransactionTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.confirmTransactionTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.confirmTransaction(this.confirmTransactionTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }
  onConfirmSetRequiredSignaturesTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.confirmSetRequiredSignaturesTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.confirmSetRequiredSignatures(this.confirmSetRequiredSignaturesTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }
  onConfirmAddOwnerTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.confirmAddOwnerTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.confirmAddOwner(this.confirmAddOwnerTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }
  onConfirmRemoveOwnerTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.confirmRemoveOwnerTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.confirmRemoveOwner(this.confirmRemoveOwnerTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }
  //
  onExecuteTransactionTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.executeTransactionTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    if (this.isAdvancedContract) {
      this.web3Service.executeTransaction(this.executeTransactionTxIndex, this.payableAmount);
    }
    else {
      this.web3Service.executeTransaction(this.executeTransactionTxIndex);
    }
    this.web3Service.getInfo(this.contractAddress);
  }
  onExecuteSetRequiredSignaturesTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.executeSetRequiredSignaturesTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.executeSetRequiredSignatures(this.executeSetRequiredSignaturesTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }
  onExecuteAddOwnerTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.executeAddOwnerTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.executeAddOwner(this.executeAddOwnerTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }
  onExecuteRemoveOwnerTxIndex() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.executeRemoveOwnerTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.executeRemoveOwner(this.executeRemoveOwnerTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }

  depositWallet() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }

    if (!this.amountTokenNative) {
      this.web3Service.showModal("", "Please enter amount", "error", true, false);
      return;
    }

    this.web3Service.depositETH(this.amountTokenNative);
    this.web3Service.getInfo(this.contractAddress);
  }

  copyToClipboard(address: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(address).then(() => {
        this.snackBar.open('Address copied to clipboard', 'OK', {
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          duration: 3000
        });

      }).catch(function (error) {
        console.error('Failed to copy address: ', error);
      });
    } else {
      let textArea = document.createElement("textarea");
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (error) {
        console.error('Failed to copy address: ', error);
      }
      document.body.removeChild(textArea);
    }
  }

  saveAsImage() {
    html2canvas(this.qrCodeElement.nativeElement).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = this.contractAddress + '.png'; // Tên tệp khi tải về
      link.click();
    });
  }

  onGetTransaction() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.txIndexScan) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.getTransaction(this.txIndexScan);
  }

  async onGetTokenBalance() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.tokenAddressBalanceScan) {
      this.web3Service.showModal("", "Please enter token address", "error", true, false);
      return;
    }

    if (this.tokenAddressBalanceScan && this.web3Service.isAddress(this.tokenAddressBalanceScan)) {
      await this.web3Service.getTokenAddress(this.tokenAddressBalanceScan);
      this.tokenAddressBalance = this.web3Service.getTokenAddressBalance;
    } else {
      this.web3Service.showModal("", "Please enter valid token address", "error", true, false);
    }
    this.web3Service.getTokenAddress(this.tokenAddressBalanceScan);
  }

  // New methods for v2
  onSubmitWithdrawNativeToken() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.submitTransactionAddress) {
      this.web3Service.showModal("", "Please enter receiving address", "error", true, false);
      return;
    }
    if (!this.submitTransactionAmount) {
      this.web3Service.showModal("", "Please enter transaction amount", "error", true, false);
      return;
    }
    this.web3Service.submitWithdrawNativeToken(this.submitTransactionAddress, this.submitTransactionAmount);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitWithdrawERC20() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.submitTokenTransactionAddress) {
      this.web3Service.showModal("", "Please enter receiving address", "error", true, false);
      return;
    }
    if (!this.submitTokenTransactionTokenAddress) {
      this.web3Service.showModal("", "Please enter token address", "error", true, false);
      return;
    }
    if (!this.submitTokenTransactionAmount) {
      this.web3Service.showModal("", "Please enter amount", "error", true, false);
      return;
    }
    this.web3Service.submitWithdrawERC20(this.submitTokenTransactionAddress, this.submitTokenTransactionTokenAddress, this.submitTokenTransactionAmount);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitWithdrawERC721() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.submitERC721Address) {
      this.web3Service.showModal("", "Please enter receiving address", "error", true, false);
      return;
    }
    if (!this.submitERC721TokenAddress) {
      this.web3Service.showModal("", "Please enter token address", "error", true, false);
      return;
    }
    if (!this.submitERC721TokenId) {
      this.web3Service.showModal("", "Please enter token ID", "error", true, false);
      return;
    }
    this.web3Service.submitWithdrawERC721(this.submitERC721Address, this.submitERC721TokenAddress, this.submitERC721TokenId);
    this.web3Service.getInfo(this.contractAddress);
  }

  onSubmitWithdrawERC1155() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.submitERC1155Address) {
      this.web3Service.showModal("", "Please enter receiving address", "error", true, false);
      return;
    }
    if (!this.submitERC1155TokenAddress) {
      this.web3Service.showModal("", "Please enter token address", "error", true, false);
      return;
    }
    if (!this.submitERC1155TokenId) {
      this.web3Service.showModal("", "Please enter token ID", "error", true, false);
      return;
    }
    if (!this.submitERC1155Amount) {
      this.web3Service.showModal("", "Please enter amount", "error", true, false);
      return;
    }
    this.web3Service.submitWithdrawERC1155(this.submitERC1155Address, this.submitERC1155TokenAddress, this.submitERC1155TokenId, this.submitERC1155Amount);
    this.web3Service.getInfo(this.contractAddress);
  }

  onProposeAddOwner() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.newOwnerAddress) {
      this.web3Service.showModal("", "Please enter new owner address", "error", true, false);
      return;
    }
    this.web3Service.proposeAddOwner(this.newOwnerAddress);
    this.web3Service.getInfo(this.contractAddress);
  }

  onProposeRemoveOwner() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.removeOwnerAddress) {
      this.web3Service.showModal("", "Please enter owner address to remove", "error", true, false);
      return;
    }
    this.web3Service.proposeRemoveOwner(this.removeOwnerAddress);
    this.web3Service.getInfo(this.contractAddress);
  }

  onProposeChangeRequiredSignatures() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.newRequiredSignatures) {
      this.web3Service.showModal("", "Please enter new required signatures", "error", true, false);
      return;
    }
    this.web3Service.proposeChangeRequiredSignatures(this.newRequiredSignatures);
    this.web3Service.getInfo(this.contractAddress);
  }

  onRevokeConfirmation() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.revokeConfirmationTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.revokeConfirmation(this.revokeConfirmationTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }

  onCancelTransaction() {
    if (!this.isConnected) {
      this.web3Service.showModal("", "Please connect wallet first", "error", true, false);
      return;
    }
    if (!this.cancelTransactionTxIndex) {
      this.web3Service.showModal("", "Please enter transaction index", "error", true, false);
      return;
    }
    this.web3Service.cancelTransaction(this.cancelTransactionTxIndex);
    this.web3Service.getInfo(this.contractAddress);
  }
}
