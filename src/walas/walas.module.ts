import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WalasApiClient } from './walas-api.client';

/**
 * WalasModule
 * Modul untuk integrasi dengan Walas API (Laravel)
 * Menyediakan WalasApiClient untuk di-inject ke service lain
 */
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [WalasApiClient],
  exports: [WalasApiClient],
})
export class WalasModule {}
