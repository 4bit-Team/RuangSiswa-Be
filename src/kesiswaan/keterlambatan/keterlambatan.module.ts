import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeterlambatanService } from './keterlambatan.service';
import { KeterlambatanController } from './keterlambatan.controller';
import { Keterlambatan } from './entities/keterlambatan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Keterlambatan])],
  controllers: [KeterlambatanController],
  providers: [KeterlambatanService],
  exports: [KeterlambatanService],
})
export class KeterlambatanModule {}
