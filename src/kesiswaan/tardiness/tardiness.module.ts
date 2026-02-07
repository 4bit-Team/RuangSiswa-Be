import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WalasModule } from '../../walas/walas.module';
import { TardinessService } from './tardiness.service';
import { TardinessController } from './tardiness.controller';
import {
  TardinessRecord,
  TardinessAppeal,
  TardinessSummary,
  TardinessAlert,
  TardinessPattern,
} from './entities/tardiness.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TardinessRecord,
      TardinessAppeal,
      TardinessSummary,
      TardinessAlert,
      TardinessPattern,
    ]),
    HttpModule,
    ConfigModule,
    WalasModule,
  ],
  providers: [TardinessService],
  controllers: [TardinessController],
  exports: [TardinessService],
})
export class TardinessModule {}
