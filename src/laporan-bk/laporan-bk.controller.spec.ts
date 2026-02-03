import { Test, TestingModule } from '@nestjs/testing';
import { LaporanBkController } from './laporan-bk.controller';
import { LaporanBkService } from './laporan-bk.service';

describe('LaporanBkController', () => {
  let controller: LaporanBkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaporanBkController],
      providers: [LaporanBkService],
    }).compile();

    controller = module.get<LaporanBkController>(LaporanBkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
