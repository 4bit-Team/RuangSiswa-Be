import type { Request } from 'express';
import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getDashboardStatistics(req: Request): Promise<{
        keyMetrics: {
            avgKonselingPerMonth: {
                value: number;
                trend: string;
                trendUp: boolean;
            };
            siswaAktif: {
                value: number;
                trend: string;
                trendUp: boolean;
            };
            laporanDibuat: {
                value: number;
                trend: string;
                trendUp: boolean;
            };
        };
        trends: {
            konselingBulanan: {
                month: string;
                value: number;
            }[];
            kepuasanBulanan: {
                month: string;
                value: number;
            }[];
        };
        distribution: {
            perKelas: {
                class: string;
                active: number;
                total: number;
            }[];
        };
        performance: {
            label: string;
            value: number;
            color: string;
        }[];
    }>;
}
