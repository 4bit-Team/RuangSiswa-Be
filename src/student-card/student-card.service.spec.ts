import { Test, TestingModule } from '@nestjs/testing';
import { StudentCardService } from './student-card.service';

describe('StudentCardService', () => {
  let service: StudentCardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentCardService],
    }).compile();

    service = module.get<StudentCardService>(StudentCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
