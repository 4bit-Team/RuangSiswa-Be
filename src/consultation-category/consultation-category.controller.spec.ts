import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationCategoryController } from './consultation-category.controller';
import { ConsultationCategoryService } from './consultation-category.service';

describe('ConsultationCategoryController', () => {
  let controller: ConsultationCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationCategoryController],
      providers: [ConsultationCategoryService],
    }).compile();

    controller = module.get<ConsultationCategoryController>(ConsultationCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
