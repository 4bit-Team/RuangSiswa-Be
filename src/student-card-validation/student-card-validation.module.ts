import { Module } from '@nestjs/common';
import { StudentCardValidationService } from './student-card-validation.service';
import { StudentCardModule } from '../student-card/student-card.module';

@Module({
  imports: [StudentCardModule], // jika service ini pakai StudentCardService
  providers: [StudentCardValidationService],
  exports: [StudentCardValidationService],
})
export class StudentCardValidationModule {}
