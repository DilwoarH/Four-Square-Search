import { TestBed, inject } from '@angular/core/testing';

import { FourSquareService } from './four-square.service';

describe('FourSquareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FourSquareService]
    });
  });

  it('should ...', inject([FourSquareService], (service: FourSquareService) => {
    expect(service).toBeTruthy();
  }));
});
