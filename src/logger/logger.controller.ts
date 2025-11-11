import { Controller, Post, Body } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Controller('log')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Post('login')
  logLogin(@Body() body: any) {
    return this.loggerService.logLogin(body);
  }

  @Post('logout')
  logLogout(@Body() body: any) {
    return this.loggerService.logLogout(body);
  }
}
