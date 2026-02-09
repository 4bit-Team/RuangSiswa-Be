import { CallService } from './call.service';
import { CreateCallDto } from './dto/call.dto';
export declare class CallController {
    private callService;
    constructor(callService: CallService);
    initiateCall(req: any, dto: CreateCallDto): Promise<{
        status: string;
        call: import("./entities/call.entity").Call;
    }>;
    getCall(callId: number): Promise<{
        status: string;
        call: import("./entities/call.entity").Call;
    }>;
    getCallHistory(req: any, otherUserId: number, limit?: number): Promise<{
        status: string;
        calls: import("./entities/call.entity").Call[];
        total: number;
    }>;
    getMissedCalls(req: any): Promise<{
        status: string;
        missedCalls: import("./entities/call.entity").Call[];
        count: number;
    }>;
    getCallStats(req: any): Promise<{
        status: string;
        stats: {
            totalCalls: number;
            totalDuration: number;
            averageDuration: number;
            missedCalls: number;
        };
    }>;
    markAsMissed(callId: number): Promise<{
        status: string;
        call: import("./entities/call.entity").Call;
    }>;
    cleanupStaleRingingCalls(): Promise<{
        status: string;
        message: string;
    }>;
}
