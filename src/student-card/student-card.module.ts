import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCardService } from './student-card.service';
import { StudentCardController } from './student-card.controller';
import { StudentCard } from './entities/student-card.entity';
import { UsersModule } from '../users/users.module';
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentCard]),
    UsersModule,
  ],
  controllers: [StudentCardController],
  providers: [StudentCardService, StudentCardValidationService],
  exports: [StudentCardService],
})
export class StudentCardModule {}
