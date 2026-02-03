import { Test, TestingModule } from '@nestjs/testing';
import { StudentCardController } from './student-card.controller';
import { StudentCardService } from './student-card.service';

describe('StudentCardController', () => {
  let controller: StudentCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentCardController],
      providers: [StudentCardService],
    }).compile();

    controller = module.get<StudentCardController>(StudentCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
