import { Test, TestingModule } from '@nestjs/testing';
import { LaporanBkService } from './laporan-bk.service';

describe('LaporanBkService', () => {
  let service: LaporanBkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaporanBkService],
    }).compile();

    service = module.get<LaporanBkService>(LaporanBkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
