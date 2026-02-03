import { Test, TestingModule } from '@nestjs/testing';
import { BkScheduleController } from './bk-schedule.controller';
import { BkScheduleService } from './bk-schedule.service';

describe('BkScheduleController', () => {
  let controller: BkScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BkScheduleController],
      providers: [BkScheduleService],
    }).compile();

    controller = module.get<BkScheduleController>(BkScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
