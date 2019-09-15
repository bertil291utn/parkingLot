import { TestBed } from '@angular/core/testing';

import { ApirestserviceService } from './apirestservice.service';

describe('ApirestserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApirestserviceService = TestBed.get(ApirestserviceService);
    expect(service).toBeTruthy();
  });
});
