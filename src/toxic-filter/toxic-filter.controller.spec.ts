import { Test, TestingModule } from '@nestjs/testing';
import { ToxicFilterController } from './toxic-filter.controller';
import { ToxicFilterService } from './toxic-filter.service';

describe('ToxicFilterController', () => {
  let controller: ToxicFilterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToxicFilterController],
      providers: [ToxicFilterService],
    }).compile();

    controller = module.get<ToxicFilterController>(ToxicFilterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
