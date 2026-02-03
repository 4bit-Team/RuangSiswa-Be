import { Test, TestingModule } from '@nestjs/testing';
import { CounselingCategoryService } from './counseling-category.service';

describe('CounselingCategoryService', () => {
  let service: CounselingCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CounselingCategoryService],
    }).compile();

    service = module.get<CounselingCategoryService>(CounselingCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
