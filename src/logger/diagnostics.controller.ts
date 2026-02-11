import { Controller, Get, Logger } from '@nestjs/common';

@Controller('diagnostics')
export class DiagnosticsController {
  private readonly logger = new Logger(DiagnosticsController.name);

  @Get('routes')
  async getRoutes() {
    this.logger.log('📊 Diagnostic - Routes information requested');
    return {
      message: '✅ API is working',
      timestamp: new Date().toISOString(),
      currentTime: new Date(),
      availableEndpoints: {
        pembinaan: {
          path: '/api/v1/pembinaan',
          methods: ['GET', 'POST', 'PATCH', 'DELETE'],
          description: 'Pembinaan management endpoints',
        },
        pembinaan_stats: {
          path: '/api/v1/pembinaan/stats',
          methods: ['GET'],
          description: 'Get pembinaan statistics',
        },
        pembinaan_sync: {
          path: '/api/v1/pembinaan/sync',
          methods: ['POST'],
          description: 'Sync pembinaan from WALASU',
        },
      },
    };
  }

  @Get('health')
  async getHealth() {
    this.logger.log('❤️ Health check requested');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      database: {
        host: process.env.DB_HOST || 'unknown',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'unknown',
      },
    };
  }

  @Get('pembinaan-status')
  async getPembinaanStatus() {
    this.logger.log('🔍 Pembinaan module status check');
    return {
      module: 'PembinaanModule',
      status: 'loaded',
      controller: 'PembinaanController',
      service: 'PembinaanService',
      baseRoute: '/api/v1/pembinaan',
      methods: {
        findAll: {
          method: 'GET',
          path: '/api/v1/pembinaan',
          description: 'Get all pembinaan records',
        },
        findById: {
          method: 'GET',
          path: '/api/v1/pembinaan/:id',
          description: 'Get single pembinaan record',
        },
        sync: {
          method: 'POST',
          path: '/api/v1/pembinaan/sync',
          description: 'Sync from WALASU',
        },
      },
    };
  }
}
