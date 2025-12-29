import { Test, TestingModule } from '@nestjs/testing';
import { ToxicFilterService } from './toxic-filter.service';

describe('ToxicFilterService', () => {
  let service: ToxicFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToxicFilterService],
    }).compile();

    service = module.get<ToxicFilterService>(ToxicFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
