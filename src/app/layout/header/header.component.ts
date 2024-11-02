import { Component, NgZone, OnInit } from '@angular/core';
import Web3 from 'web3';
import { MatDialog } from '@angular/material/dialog';
import { Web3Service } from '../../services/web3.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  account: string = '';
  balance: any = 0;

  isConnected: boolean = false;
  network: string = 'BNB Chain Testnet';
  nativeSymbol: string = "BNB"
  constructor(private web3Service: Web3Service, private snackBar: MatSnackBar) {
    this.web3Service.isConnectWallet$.subscribe((value) => {
      this.isConnected = value;
    });

    this.web3Service.account$.subscribe((value) => {
      this.account = value;
    })

    this.web3Service.bnbBalance$.subscribe((value) => {
      this.balance = value;
    })

    this.web3Service.nativeSymbol$.subscribe((value) => {
      this.nativeSymbol = value;
    })
  }

  ngOnInit(): void {
    this.connectWallet();
    if (this.web3Service.isConnected()) {
      this.account = this.web3Service.getAccount();
      this.loadBalance();
      this.web3Service.isConnectWallet = true;
    }
  }

  async connectWallet() {
    await this.web3Service.connectWallet();

    this.account = this.web3Service.getAccount();
    await this.loadBalance();
    // this.web3Service.isConnectWallet = true;
  }

  async disconnectWallet(): Promise<void> {
    this.web3Service.disconnectWallet();
    this.account = this.web3Service.getAccount();
    await this.loadBalance();
    this.web3Service.isConnectWallet = false;
  }
  async loadBalance(): Promise<void> {
    this.balance = await this.web3Service.getBalance();
  }

  copyAddress(address: string): void {

    if (navigator.clipboard) {
      navigator.clipboard.writeText(address).then(() => {
        console.log('Address copied to clipboard');
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

}