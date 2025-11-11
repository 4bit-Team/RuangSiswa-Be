import { Module } from '@nestjs/common';
import { StudentCardValidationService } from './student-card-validation.service';

@Module({
  providers: [StudentCardValidationService],
  exports: [StudentCardValidationService],
})
export class StudentCardValidationModule {}
