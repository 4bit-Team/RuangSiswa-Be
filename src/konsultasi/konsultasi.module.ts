import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KonsultasiController } from './konsultasi.controller';
import { KonsultasiService } from './konsultasi.service';
import { Konsultasi } from './entities/konsultasi.entity';
import { KonsultasiAnswer } from './entities/konsultasi-answer.entity';
import { KonsultasiAnswerReply } from './entities/konsultasi-answer-reply.entity';
import { KonsultasiBookmark } from './entities/konsultasi-bookmark.entity';
import { ConsultationCategory } from '../consultation-category/entities/consultation-category.entity';
import { User } from '../users/entities/user.entity';
import { ToxicFilterModule } from '../toxic-filter/toxic-filter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Konsultasi, KonsultasiAnswer, KonsultasiAnswerReply, KonsultasiBookmark, ConsultationCategory, User]),
    ToxicFilterModule,
  ],
  controllers: [KonsultasiController],
  providers: [KonsultasiService],
  exports: [KonsultasiService],
})
export class KonsultasiModule {}
