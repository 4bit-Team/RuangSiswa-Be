import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  onModuleInit() {
    this.logger.log('✅ AppService initialized');
    this.logger.log('🔥 PembinaanModule should be loaded');
    this.logger.log('📊 All modules initialized successfully');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
