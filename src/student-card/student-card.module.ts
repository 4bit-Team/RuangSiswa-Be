import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCardService } from './student-card.service';
import { StudentCardController } from './student-card.controller';
import { StudentCard } from './entities/student-card.entity';
import { UsersModule } from '../users/users.module';
import { KelasModule } from '../kelas/kelas.module'; 
import { JurusanModule } from '../jurusan/jurusan.module'; 
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';
import { StudentCardValidationModule } from '../student-card-validation/student-card-validation.module'; // ✅ tambahkan


@Module({
  imports: [
    TypeOrmModule.forFeature([StudentCard]),
    UsersModule,
    KelasModule,
    JurusanModule,
    StudentCardValidationModule, 
  ],
  controllers: [StudentCardController],
  providers: [StudentCardService],
  exports: [StudentCardService],
})
export class StudentCardModule {}
