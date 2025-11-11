import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jurusan } from './entities/jurusan.entity';
import { JurusanController } from './jurusan.controller';
import { JurusanService } from './jurusan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Jurusan])],
  controllers: [JurusanController],
  providers: [JurusanService],
  exports: [JurusanService],
})
export class JurusanModule {}