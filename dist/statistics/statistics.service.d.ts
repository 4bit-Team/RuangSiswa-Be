import { Repository } from 'typeorm';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { Feedback } from '../reservasi/entities/feedback.entity';
import { LaporanBk } from '../laporan-bk/entities/laporan-bk.entity';
import { User } from '../users/entities/user.entity';
export declare class StatisticsService {
    private reservasiRepository;
    private feedbackRepository;
    private laporanBkRepository;
    private userRepository;
    constructor(reservasiRepository: Repository<Reservasi>, feedbackRepository: Repository<Feedback>, laporanBkRepository: Repository<LaporanBk>, userRepository: Repository<User>);
    getDashboardStatistics(): Promise<{
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
    private getAvgKonselingPerMonth;
    private getActiveSiswa;
    private getTotalLaporan;
    private getMonthlyKonselingTrend;
    private getMonthlyKepuasanTrend;
    private getDistributionPerKelas;
    private getPerformanceMetrics;
}
