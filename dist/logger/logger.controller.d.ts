import { LoggerService } from './logger.service';
export declare class LoggerController {
    private readonly loggerService;
    constructor(loggerService: LoggerService);
    logLogin(body: any): {
        status: string;
        received: any;
    };
    logLogout(body: any): {
        status: string;
        received: any;
    };
}
