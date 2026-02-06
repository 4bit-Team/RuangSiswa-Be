import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BimbinganService } from './bimbingan.service';
import { BimbinganController } from './bimbingan.controller';
import { AutoReferralService } from './auto-referral.service';
import {
  BimbinganCategory,
  BimbinganReferral,
  BimbinganSesi,
  BimbinganCatat,
  BimbinganIntervensi,
  BimbinganPerkembangan,
  BimbinganAbility,
  BimbinganTarget,
  BimbinganStatus,
  BimbinganStatistik,
} from './entities/bimbingan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BimbinganCategory,
      BimbinganReferral,
      BimbinganSesi,
      BimbinganCatat,
      BimbinganIntervensi,
      BimbinganPerkembangan,
      BimbinganAbility,
      BimbinganTarget,
      BimbinganStatus,
      BimbinganStatistik,
    ]),
  ],
  controllers: [BimbinganController],
  providers: [BimbinganService, AutoReferralService],
  exports: [BimbinganService, AutoReferralService],
})
export class BimbinganModule {}
