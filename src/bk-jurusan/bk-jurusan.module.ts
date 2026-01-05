import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BkJurusanController } from './bk-jurusan.controller';
import { BkJurusanService } from './bk-jurusan.service';
import { BkJurusan } from './entities/bk-jurusan.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BkJurusan, User])],
  controllers: [BkJurusanController],
  providers: [BkJurusanService],
  exports: [BkJurusanService],
})
export class BkJurusanModule {}
