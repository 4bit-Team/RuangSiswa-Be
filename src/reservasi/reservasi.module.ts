import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasiService } from './reservasi.service';
import { ReservasiController } from './reservasi.controller';
import { Reservasi } from './entities/reservasi.entity';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservasi]),
    ChatModule,
    UsersModule,
  ],
  providers: [ReservasiService],
  controllers: [ReservasiController],
  exports: [ReservasiService],
})
export class ReservasiModule {}
