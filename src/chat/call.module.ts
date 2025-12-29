import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Call } from './entities/call.entity'; 
import { CallService } from './call.service';
import { CallGateway } from './call.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Call])],
  providers: [CallService, CallGateway, JwtService],
  exports: [CallGateway],
})
export class CallModule {}