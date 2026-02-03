import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getBlockedUsers(): Promise<{
        status: string;
        data: {
            userId: number;
            reason: string;
            blockedUntil: number;
            remainingMs: number;
        }[];
        total: number;
    }>;
    getSuspiciousUsers(): Promise<{
        status: string;
        data: {
            userId: number;
            candidateCount: number;
        }[];
        total: number;
    }>;
    unblockUser(userId: number): Promise<{
        status: string;
        message: string;
        unblocked: boolean;
    }>;
}
