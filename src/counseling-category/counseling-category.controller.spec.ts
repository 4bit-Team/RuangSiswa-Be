import { Test, TestingModule } from '@nestjs/testing';
import { CounselingCategoryController } from './counseling-category.controller';
import { CounselingCategoryService } from './counseling-category.service';

describe('CounselingCategoryController', () => {
  let controller: CounselingCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CounselingCategoryController],
      providers: [CounselingCategoryService],
    }).compile();

    controller = module.get<CounselingCategoryController>(CounselingCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
