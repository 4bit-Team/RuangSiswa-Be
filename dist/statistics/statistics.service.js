"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservasi_entity_1 = require("../reservasi/entities/reservasi.entity");
const feedback_entity_1 = require("../reservasi/entities/feedback.entity");
const laporan_bk_entity_1 = require("../laporan-bk/entities/laporan-bk.entity");
const user_entity_1 = require("../users/entities/user.entity");
let StatisticsService = class StatisticsService {
    reservasiRepository;
    feedbackRepository;
    laporanBkRepository;
    userRepository;
    constructor(reservasiRepository, feedbackRepository, laporanBkRepository, userRepository) {
        this.reservasiRepository = reservasiRepository;
        this.feedbackRepository = feedbackRepository;
        this.laporanBkRepository = laporanBkRepository;
        this.userRepository = userRepository;
    }
    async getDashboardStatistics() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const avgKonselingPerMonth = await this.getAvgKonselingPerMonth();
        const siswaAktif = await this.getActiveSiswa();
        const laporanDibuat = await this.getTotalLaporan();
        const trendKonselingBulanan = await this.getMonthlyKonselingTrend();
        const trendKepuasanBulanan = await this.getMonthlyKepuasanTrend();
        const distribusiPerKelas = await this.getDistributionPerKelas();
        const metrikPerforma = await this.getPerformanceMetrics();
        return {
            keyMetrics: {
                avgKonselingPerMonth: avgKonselingPerMonth,
                siswaAktif: siswaAktif,
                laporanDibuat: laporanDibuat,
            },
            trends: {
                konselingBulanan: trendKonselingBulanan,
                kepuasanBulanan: trendKepuasanBulanan,
            },
            distribution: {
                perKelas: distribusiPerKelas,
            },
            performance: metrikPerforma,
        };
    }
    async getAvgKonselingPerMonth() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const firstDayCurrentMonth = new Date(currentYear, now.getMonth(), 1);
        const lastDayCurrentMonth = new Date(currentYear, now.getMonth() + 1, 0);
        const currentMonthCount = await this.reservasiRepository.count({
            where: {
                status: 'completed',
                completedAt: (0, typeorm_2.Between)(firstDayCurrentMonth, lastDayCurrentMonth),
            },
        });
        const firstDayPrevMonth = new Date(currentYear, now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(currentYear, now.getMonth(), 0);
        const prevMonthCount = await this.reservasiRepository.count({
            where: {
                status: 'completed',
                completedAt: (0, typeorm_2.Between)(firstDayPrevMonth, lastDayPrevMonth),
            },
        });
        const trend = prevMonthCount !== 0
            ? Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100)
            : 0;
        return {
            value: currentMonthCount,
            trend: `${trend > 0 ? '+' : ''}${trend}% dari bulan lalu`,
            trendUp: trend >= 0,
        };
    }
    async getActiveSiswa() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const totalSiswa = await this.userRepository.count({
            where: {
                role: 'siswa',
                status: 'aktif',
            },
        });
        const firstDayCurrentMonth = new Date(currentYear, now.getMonth(), 1);
        const lastDayCurrentMonth = new Date(currentYear, now.getMonth() + 1, 0);
        const siswaCurrentMonth = await this.reservasiRepository
            .createQueryBuilder('r')
            .select('COUNT(DISTINCT r.studentId)', 'count')
            .where('r.createdAt >= :startDate', { startDate: firstDayCurrentMonth })
            .andWhere('r.createdAt <= :endDate', { endDate: lastDayCurrentMonth })
            .getRawOne();
        const firstDayPrevMonth = new Date(currentYear, now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(currentYear, now.getMonth(), 0);
        const siswaPrevMonth = await this.reservasiRepository
            .createQueryBuilder('r')
            .select('COUNT(DISTINCT r.studentId)', 'count')
            .where('r.createdAt >= :startDate', { startDate: firstDayPrevMonth })
            .andWhere('r.createdAt <= :endDate', { endDate: lastDayPrevMonth })
            .getRawOne();
        const currentCount = parseInt(siswaCurrentMonth?.count || 0);
        const prevCount = parseInt(siswaPrevMonth?.count || 0);
        const trend = prevCount !== 0
            ? Math.round(((currentCount - prevCount) / prevCount) * 100)
            : 0;
        return {
            value: totalSiswa,
            trend: `${trend > 0 ? '+' : ''}${trend}% dari bulan lalu`,
            trendUp: trend >= 0,
        };
    }
    async getTotalLaporan() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const firstDayCurrentMonth = new Date(currentYear, now.getMonth(), 1);
        const lastDayCurrentMonth = new Date(currentYear, now.getMonth() + 1, 0);
        const currentMonthCount = await this.laporanBkRepository.count({
            where: {
                created_at: (0, typeorm_2.Between)(firstDayCurrentMonth, lastDayCurrentMonth),
            },
        });
        const firstDayPrevMonth = new Date(currentYear, now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(currentYear, now.getMonth(), 0);
        const prevMonthCount = await this.laporanBkRepository.count({
            where: {
                created_at: (0, typeorm_2.Between)(firstDayPrevMonth, lastDayPrevMonth),
            },
        });
        const trend = prevMonthCount !== 0
            ? Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100)
            : 0;
        return {
            value: currentMonthCount,
            trend: `${trend > 0 ? '+' : ''}${trend}% dari bulan lalu`,
            trendUp: trend >= 0,
        };
    }
    async getMonthlyKonselingTrend() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const now = new Date();
        const currentYear = now.getFullYear();
        const result = [];
        for (let i = 0; i < 12; i++) {
            const startDate = new Date(currentYear, i, 1);
            const endDate = new Date(currentYear, i + 1, 0);
            const count = await this.reservasiRepository.count({
                where: {
                    status: 'completed',
                    completedAt: (0, typeorm_2.Between)(startDate, endDate),
                },
            });
            result.push({
                month: months[i],
                value: count,
            });
        }
        return result;
    }
    async getMonthlyKepuasanTrend() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const now = new Date();
        const currentYear = now.getFullYear();
        const result = [];
        for (let i = 0; i < 12; i++) {
            const startDate = new Date(currentYear, i, 1);
            const endDate = new Date(currentYear, i + 1, 0);
            const avgRating = await this.feedbackRepository
                .createQueryBuilder('f')
                .select('AVG(f.rating)', 'avgRating')
                .where('f.createdAt >= :startDate', { startDate })
                .andWhere('f.createdAt <= :endDate', { endDate })
                .getRawOne();
            const percentage = avgRating?.avgRating
                ? Math.round((parseInt(avgRating.avgRating) / 5) * 100)
                : 0;
            result.push({
                month: months[i],
                value: percentage,
            });
        }
        return result;
    }
    async getDistributionPerKelas() {
        const kelasNames = ['X', 'XI', 'XII'];
        const result = [];
        for (const kelasName of kelasNames) {
            const total = await this.userRepository.count({
                where: {
                    role: 'siswa',
                    status: 'aktif',
                },
            });
            const active = await this.reservasiRepository
                .createQueryBuilder('r')
                .select('COUNT(DISTINCT r.studentId)', 'count')
                .where('r.status = :status', { status: 'completed' })
                .getRawOne();
            result.push({
                class: kelasName,
                active: active?.count ? parseInt(active.count) : 0,
                total: total,
            });
        }
        return result;
    }
    async getPerformanceMetrics() {
        const totalCompleted = await this.reservasiRepository.count({
            where: { status: 'completed' },
        });
        const totalReservasi = await this.reservasiRepository.count();
        const responseTime = totalReservasi > 0
            ? Math.round((totalCompleted / totalReservasi) * 100)
            : 0;
        const avgFeedback = await this.feedbackRepository
            .createQueryBuilder('f')
            .select('AVG(f.rating)', 'avgRating')
            .getRawOne();
        const satisfaction = avgFeedback?.avgRating
            ? Math.round((parseInt(avgFeedback.avgRating) / 5) * 100)
            : 0;
        const completion = totalReservasi > 0
            ? Math.round((totalCompleted / totalReservasi) * 100)
            : 0;
        const followUp = 85;
        return [
            { label: 'Response Time', value: responseTime, color: 'bg-indigo-600' },
            { label: 'Satisfaction', value: satisfaction, color: 'bg-purple-600' },
            { label: 'Completion', value: completion, color: 'bg-pink-600' },
            { label: 'Follow-up', value: followUp, color: 'bg-blue-600' },
        ];
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservasi_entity_1.Reservasi)),
    __param(1, (0, typeorm_1.InjectRepository)(feedback_entity_1.Feedback)),
    __param(2, (0, typeorm_1.InjectRepository)(laporan_bk_entity_1.LaporanBk)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map