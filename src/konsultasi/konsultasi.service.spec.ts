import { Test, TestingModule } from '@nestjs/testing';
import { KonsultasiService } from './konsultasi.service';

describe('KonsultasiService', () => {
  let service: KonsultasiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KonsultasiService],
    }).compile();

    service = module.get<KonsultasiService>(KonsultasiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
