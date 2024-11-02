import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils'; // Nhập AbiItem nếu cần

@Injectable({
  providedIn: 'root',
})
export class ContractDeployService {
  private web3: Web3;

  constructor() {
    // Initialize Web3 with the provider (MetaMask or other provider)
    this.web3 = new Web3((window as any).ethereum);
  }

  async deployContract(abi: AbiItem[], bytecode: string, owners: string[], requiredSignatures: number): Promise<any> {
    const accounts = await this.web3.eth.getAccounts();
    const contract = new this.web3.eth.Contract(abi);
    const gasPrice = await this.web3.eth.getGasPrice();

    // Estimate the gas
    const gasEstimate = await contract.deploy({
      data: bytecode,
      arguments: [owners, requiredSignatures],
    }).estimateGas({ from: accounts[0] });

    return contract.deploy({
      data: bytecode,
      arguments: [owners, requiredSignatures],
    }).send({
      from: accounts[0],
      gas: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
    });
  }

}
