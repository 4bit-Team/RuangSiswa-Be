import { Module } from '@nestjs/common';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { DiagnosticsController } from './diagnostics.controller';

@Module({
  controllers: [LoggerController, DiagnosticsController],
  providers: [LoggerService],
})
export class LoggerModule {}
