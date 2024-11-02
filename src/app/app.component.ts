import { Component, NgZone, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import Web3 from 'web3';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'multisig-web3';
  private web3: Web3 = new Web3((window as any).ethereum);
  constructor(private ngZone: NgZone, private dialog: MatDialog) { }
  ngOnInit(): void {
    initFlowbite();
  }
}
