import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  logLogin(data: any) {
    // Log ke terminal
    console.log('[FRONTEND LOGIN]', data);
    return { status: 'ok', received: data };
  }

  logLogout(data: any) {
    // Log ke terminal
    console.log('[FRONTEND LOGOUT]', data);
    return { status: 'ok', received: data };
  }
}
