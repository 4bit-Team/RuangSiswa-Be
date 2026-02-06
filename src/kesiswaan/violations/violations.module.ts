import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViolationsService } from './violations.service';
import { ViolationsController } from './violations.controller';
import { SpPdfService } from './sp-pdf.service';
import {
  Violation,
  ViolationCategory,
  SpLetter,
  SpProgression,
  ViolationExcuse,
  ViolationStatistics,
} from './entities/violation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Violation,
      ViolationCategory,
      SpLetter,
      SpProgression,
      ViolationExcuse,
      ViolationStatistics,
    ]),
  ],
  controllers: [ViolationsController],
  providers: [ViolationsService, SpPdfService],
  exports: [ViolationsService, SpPdfService],
})
export class ViolationsModule {}
