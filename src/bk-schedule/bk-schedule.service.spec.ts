import { Test, TestingModule } from '@nestjs/testing';
import { BkScheduleService } from './bk-schedule.service';

describe('BkScheduleService', () => {
  let service: BkScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BkScheduleService],
    }).compile();

    service = module.get<BkScheduleService>(BkScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
