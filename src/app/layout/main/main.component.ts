import { Component, NgZone, OnInit } from '@angular/core';
import Web3 from 'web3';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  constructor(private web3Service: Web3Service) { }

}