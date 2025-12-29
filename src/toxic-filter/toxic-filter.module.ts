import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToxicFilterService } from './toxic-filter.service';
import { ToxicFilterController } from './toxic-filter.controller';
import { ToxicFilter } from './entities/toxic-filter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ToxicFilter])],
  controllers: [ToxicFilterController],
  providers: [ToxicFilterService],
  exports: [ToxicFilterService],
})
export class ToxicFilterModule {}
