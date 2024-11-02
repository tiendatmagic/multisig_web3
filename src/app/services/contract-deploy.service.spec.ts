import { TestBed } from '@angular/core/testing';

import { ContractDeployService } from './contract-deploy.service';

describe('ContractDeployService', () => {
  let service: ContractDeployService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractDeployService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
