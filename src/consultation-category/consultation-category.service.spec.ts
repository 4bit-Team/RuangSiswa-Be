import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationCategoryService } from './consultation-category.service';

describe('ConsultationCategoryService', () => {
  let service: ConsultationCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsultationCategoryService],
    }).compile();

    service = module.get<ConsultationCategoryService>(ConsultationCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
