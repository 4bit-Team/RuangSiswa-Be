import { OnModuleInit } from '@nestjs/common';
export declare class AppService implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
    getHello(): string;
}
