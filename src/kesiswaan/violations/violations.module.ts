import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViolationService } from './violations.service';
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
  providers: [ViolationService, SpPdfService],
  exports: [ViolationService, SpPdfService],
})
export class ViolationsModule {}
