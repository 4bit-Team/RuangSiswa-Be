import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from './entities/kelas.entity';
import { KelasService } from './kelas.service';
import { KelasController } from './kelas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas])],
  controllers: [KelasController],
  providers: [KelasService],
  exports: [KelasService], 
})
export class KelasModule {}
