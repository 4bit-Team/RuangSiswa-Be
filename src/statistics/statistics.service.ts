import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import { Reservasi } from '../reservasi/entities/reservasi.entity';
import { Feedback } from '../reservasi/entities/feedback.entity';
import { LaporanBk } from '../laporan-bk/entities/laporan-bk.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Reservasi)
    private reservasiRepository: Repository<Reservasi>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(LaporanBk)
    private laporanBkRepository: Repository<LaporanBk>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get dashboard statistics for BK
   */
  async getDashboardStatistics() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Get average konseling per month
    const avgKonselingPerMonth = await this.getAvgKonselingPerMonth();

    // Get active students
    const siswaAktif = await this.getActiveSiswa();

    // Get total laporan dibuat
    const laporanDibuat = await this.getTotalLaporan();

    // Get monthly trends
    const trendKonselingBulanan = await this.getMonthlyKonselingTrend();
    const trendKepuasanBulanan = await this.getMonthlyKepuasanTrend();

    // Get distribution per class
    const distribusiPerKelas = await this.getDistributionPerKelas();

    // Get performance metrics
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

  /**
   * Get average konseling per month (dari reservasi)
   */
  private async getAvgKonselingPerMonth(): Promise<{
    value: number;
    trend: string;
    trendUp: boolean;
  }> {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Count completed reservations for current month
    const firstDayCurrentMonth = new Date(currentYear, now.getMonth(), 1);
    const lastDayCurrentMonth = new Date(currentYear, now.getMonth() + 1, 0);

    const currentMonthCount = await this.reservasiRepository.count({
      where: {
        status: 'completed',
        completedAt: Between(firstDayCurrentMonth, lastDayCurrentMonth),
      },
    });

    // Count for previous month
    const firstDayPrevMonth = new Date(currentYear, now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(currentYear, now.getMonth(), 0);

    const prevMonthCount = await this.reservasiRepository.count({
      where: {
        status: 'completed',
        completedAt: Between(firstDayPrevMonth, lastDayPrevMonth),
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

  /**
   * Get count of active siswa (user dengan role siswa)
   */
  private async getActiveSiswa(): Promise<{
    value: number;
    trend: string;
    trendUp: boolean;
  }> {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Count all active students
    const totalSiswa = await this.userRepository.count({
      where: {
        role: 'siswa',
        status: 'aktif',
      },
    });

    // Count students with reservasi this month (untuk trending)
    const firstDayCurrentMonth = new Date(currentYear, now.getMonth(), 1);
    const lastDayCurrentMonth = new Date(currentYear, now.getMonth() + 1, 0);

    const siswaCurrentMonth = await this.reservasiRepository
      .createQueryBuilder('r')
      .select('COUNT(DISTINCT r.studentId)', 'count')
      .where('r.createdAt >= :startDate', { startDate: firstDayCurrentMonth })
      .andWhere('r.createdAt <= :endDate', { endDate: lastDayCurrentMonth })
      .getRawOne();

    // Count for previous month
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

  /**
   * Get total laporan BK dibuat
   */
  private async getTotalLaporan(): Promise<{
    value: number;
    trend: string;
    trendUp: boolean;
  }> {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Count laporan for current month
    const firstDayCurrentMonth = new Date(currentYear, now.getMonth(), 1);
    const lastDayCurrentMonth = new Date(currentYear, now.getMonth() + 1, 0);

    const currentMonthCount = await this.laporanBkRepository.count({
      where: {
        createdAt: Between(firstDayCurrentMonth, lastDayCurrentMonth),
      },
    });

    // Count for previous month
    const firstDayPrevMonth = new Date(currentYear, now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(currentYear, now.getMonth(), 0);

    const prevMonthCount = await this.laporanBkRepository.count({
      where: {
        createdAt: Between(firstDayPrevMonth, lastDayPrevMonth),
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

  /**
   * Get monthly konseling trend (dari reservasi)
   */
  private async getMonthlyKonselingTrend(): Promise<Array<{ month: string; value: number }>> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const currentYear = now.getFullYear();
    const result: Array<{ month: string; value: number }> = [];

    for (let i = 0; i < 12; i++) {
      const startDate = new Date(currentYear, i, 1);
      const endDate = new Date(currentYear, i + 1, 0);

      const count = await this.reservasiRepository.count({
        where: {
          status: 'completed',
          completedAt: Between(startDate, endDate),
        },
      });

      result.push({
        month: months[i],
        value: count,
      });
    }

    return result;
  }

  /**
   * Get monthly kepuasan (satisfaction) trend (dari feedback rating)
   */
  private async getMonthlyKepuasanTrend(): Promise<Array<{ month: string; value: number }>> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const currentYear = now.getFullYear();
    const result: Array<{ month: string; value: number }> = [];

    for (let i = 0; i < 12; i++) {
      const startDate = new Date(currentYear, i, 1);
      const endDate = new Date(currentYear, i + 1, 0);

      const avgRating = await this.feedbackRepository
        .createQueryBuilder('f')
        .select('AVG(f.rating)', 'avgRating')
        .where('f.createdAt >= :startDate', { startDate })
        .andWhere('f.createdAt <= :endDate', { endDate })
        .getRawOne();

      // Convert rating (1-5) to percentage (0-100)
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

  /**
   * Get distribution per kelas
   */
  private async getDistributionPerKelas(): Promise<
    Array<{ class: string; active: number; total: number }>
  > {
    const kelasNames = ['X', 'XI', 'XII'];
    const result: Array<{ class: string; active: number; total: number }> = [];

    for (const kelasName of kelasNames) {
      // Total students in kelas
      const total = await this.userRepository.count({
        where: {
          role: 'siswa',
          status: 'aktif',
          // NOTE: You may need to adjust this based on your actual Kelas relation
        },
      });

      // Students in kelas with at least one completed reservasi
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

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(): Promise<
    Array<{ label: string; value: number; color: string }>
  > {
    // Response Time - percentage of reservasi completed on time (simplified: all completed = 100%)
    const totalCompleted = await this.reservasiRepository.count({
      where: { status: 'completed' },
    });

    const totalReservasi = await this.reservasiRepository.count();
    const responseTime = totalReservasi > 0 
      ? Math.round((totalCompleted / totalReservasi) * 100)
      : 0;

    // Satisfaction - average feedback rating as percentage
    const avgFeedback = await this.feedbackRepository
      .createQueryBuilder('f')
      .select('AVG(f.rating)', 'avgRating')
      .getRawOne();

    const satisfaction = avgFeedback?.avgRating 
      ? Math.round((parseInt(avgFeedback.avgRating) / 5) * 100)
      : 0;

    // Completion - percentage of completed reservasi
    const completion = totalReservasi > 0
      ? Math.round((totalCompleted / totalReservasi) * 100)
      : 0;

    // Follow-up - this needs tracking, setting placeholder
    const followUp = 85;

    return [
      { label: 'Response Time', value: responseTime, color: 'bg-indigo-600' },
      { label: 'Satisfaction', value: satisfaction, color: 'bg-purple-600' },
      { label: 'Completion', value: completion, color: 'bg-pink-600' },
      { label: 'Follow-up', value: followUp, color: 'bg-blue-600' },
    ];
  }
}
