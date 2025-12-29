import { Test, TestingModule } from '@nestjs/testing';
import { KonsultasiController } from './konsultasi.controller';
import { KonsultasiService } from './konsultasi.service';

describe('KonsultasiController', () => {
  let controller: KonsultasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KonsultasiController],
      providers: [KonsultasiService],
    }).compile();

    controller = module.get<KonsultasiController>(KonsultasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
