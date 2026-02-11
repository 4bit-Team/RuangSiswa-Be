export declare class DiagnosticsController {
    private readonly logger;
    getRoutes(): Promise<{
        message: string;
        timestamp: string;
        currentTime: Date;
        availableEndpoints: {
            pembinaan: {
                path: string;
                methods: string[];
                description: string;
            };
            pembinaan_stats: {
                path: string;
                methods: string[];
                description: string;
            };
            pembinaan_sync: {
                path: string;
                methods: string[];
                description: string;
            };
        };
    }>;
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        environment: string;
        port: string | number;
        database: {
            host: string;
            port: string | number;
            database: string;
        };
    }>;
    getPembinaanStatus(): Promise<{
        module: string;
        status: string;
        controller: string;
        service: string;
        baseRoute: string;
        methods: {
            findAll: {
                method: string;
                path: string;
                description: string;
            };
            findById: {
                method: string;
                path: string;
                description: string;
            };
            sync: {
                method: string;
                path: string;
                description: string;
            };
        };
    }>;
}
