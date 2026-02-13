import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KehadiranService } from './kehadiran.service';
import { KehadiranController } from './kehadiran.controller';
import { Kehadiran } from './entities/kehadiran.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kehadiran])],
  controllers: [KehadiranController],
  providers: [KehadiranService],
  exports: [KehadiranService],
})
export class KehadiranModule {}
