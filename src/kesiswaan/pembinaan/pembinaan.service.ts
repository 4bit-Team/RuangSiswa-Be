import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Pembinaan } from './entities/pembinaan.entity';
import { PointPelanggaran } from '../point-pelanggaran/entities/point-pelanggaran.entity';
import { SyncPembinaanDto } from './dto/sync-pembinaan.dto';
import { UpdatePembinaanDto } from './dto/update-pembinaan.dto';
import { WalasApiClient } from '../../walas/walas-api.client';
import { NotificationService } from '../../notifications/notification.service';

// Type for pelanggaran data from WALASU API
interface WalasPelanggaran {
  id: number;
  walas_id: number;
  walas_name?: string;
  siswas_id: number;
  siswas_name?: string;
  kasus: string;
  tindak_lanjut?: string;
  keterangan?: string;
  tanggal_pembinaan?: string;
  class_id?: number;
  class_name?: string;
}

@Injectable()
export class PembinaanService {
  private readonly logger = new Logger(PembinaanService.name);

  constructor(
    @InjectRepository(Pembinaan)
    private pembinaanRepository: Repository<Pembinaan>,

    @InjectRepository(PointPelanggaran)
    private pointPelanggaranRepository: Repository<PointPelanggaran>,

    private walasApiClient: WalasApiClient,
    @Optional()
    @Inject(forwardRef(() => NotificationService))
    private notificationService?: NotificationService,
  ) {}

  /**
   * Fetch pembinaan data from WALASU and sync to local database
   * Uses WalasApiClient to centralize all WALAS API calls
   * Pulls violation data and auto-matches with point pelanggaran
   */
  async fetchAndSyncFromWalas(filters?: {
    student_id?: number;
    class_id?: number;
    walas_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{ synced: number; skipped: number; errors: { pelanggaran_id?: number; siswas_id?: number; error: string }[] }> {
    try {
      const result: { synced: number; skipped: number; errors: { pelanggaran_id?: number; siswas_id?: number; error: string }[] } = { synced: 0, skipped: 0, errors: [] };

      // Fetch pembinaan/pelanggaran list dari WALASU menggunakan centralized client
      const response = await this.walasApiClient.getPelanggaranList({
        student_id: filters?.student_id,
        class_id: filters?.class_id,
        walas_id: filters?.walas_id,
        start_date: filters?.start_date,
        end_date: filters?.end_date,
        limit: 100,
      });

      if (!response) {
        this.logger.warn('No response received from WALASU pelanggaran endpoint');
        return result;
      }

      // Handle nested response structure from Walas API
      // Response format: { success, message, data: { data: [...], pagination: {...} } }
      let pelanggaranList: WalasPelanggaran[] = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Nested structure: response.data.data contains the array
        pelanggaranList = response.data.data;
        this.logger.debug(`Found ${pelanggaranList.length} pelanggaran in nested response.data.data`);
      } else if (Array.isArray(response.data)) {
        // Direct array structure: response.data is the array
        pelanggaranList = response.data;
        this.logger.debug(`Found ${pelanggaranList.length} pelanggaran in response.data (array)`);
      } else {
        this.logger.warn(`Unexpected response structure from Walas API: ${JSON.stringify(response)}`);
        return result;
      }

      if (pelanggaranList.length === 0) {
        this.logger.log('No pelanggaran records to sync');
        return result;
      }

      // Process setiap pelanggaran
      for (const pelanggaran of pelanggaranList) {
        try {
          this.logger.debug(`Processing pelanggaran ID ${pelanggaran.id} for student ${pelanggaran.siswas_id}`);
          
          // Validasi data critical
          if (!pelanggaran.walas_id) {
            this.logger.warn(`Pelanggaran ID ${pelanggaran.id} missing walas_id`);
            result.errors.push({
              pelanggaran_id: pelanggaran.id,
              siswas_id: pelanggaran.siswas_id,
              error: 'Missing walas_id - cannot sync',
            });
            continue;
          }

          if (!pelanggaran.kasus) {
            this.logger.warn(`Pelanggaran ID ${pelanggaran.id} missing kasus for student ${pelanggaran.siswas_id}`);
            result.errors.push({
              pelanggaran_id: pelanggaran.id,
              siswas_id: pelanggaran.siswas_id,
              error: 'Missing kasus - cannot sync',
            });
            continue;
          }

          // Transform WALASU data to SyncPembinaanDto format
          const syncDto: SyncPembinaanDto = {
            walas_id: pelanggaran.walas_id,
            walas_name: pelanggaran.walas_name || 'Unknown',
            siswas_id: pelanggaran.siswas_id,
            siswas_name: pelanggaran.siswas_name || 'Unknown',
            kasus: pelanggaran.kasus.trim(),
            tindak_lanjut: pelanggaran.tindak_lanjut || '',
            keterangan: pelanggaran.keterangan || '',
            tanggal_pembinaan: pelanggaran.tanggal_pembinaan || new Date().toISOString().split('T')[0],
            class_id: pelanggaran.class_id,
            class_name: pelanggaran.class_name,
          };

          this.logger.debug(`Checking if pembinaan already exists: walas=${syncDto.walas_id}, siswa=${syncDto.siswas_id}, kasus=${syncDto.kasus}, tanggal=${syncDto.tanggal_pembinaan}`);

          // Check if already exists
          const existing = await this.pembinaanRepository.findOne({
            where: {
              walas_id: syncDto.walas_id,
              siswas_id: syncDto.siswas_id,
              kasus: syncDto.kasus,
              tanggal_pembinaan: syncDto.tanggal_pembinaan,
            },
          });

          if (existing) {
            this.logger.debug(
              `Pembinaan already exists for student ${syncDto.siswas_id} on ${syncDto.tanggal_pembinaan}, skipping`,
            );
            result.skipped++;
            continue;
          }

          // Sync using existing syncFromWalas logic
          this.logger.debug(`Syncing new pembinaan for student ${syncDto.siswas_id}`);
          await this.syncFromWalas(syncDto);
          result.synced++;
          this.logger.log(`✅ Pembinaan synced successfully for student ${syncDto.siswas_id}`);
        } catch (itemError) {
          this.logger.error(`Error syncing pelanggaran ID ${pelanggaran.id}: ${itemError.message}`);
          result.errors.push({
            pelanggaran_id: pelanggaran.id,
            siswas_id: pelanggaran.siswas_id,
            error: itemError.message,
          });
        }
      }

      this.logger.log(
        `Fetch-and-sync complete: Synced=${result.synced}, Skipped=${result.skipped}, Errors=${result.errors.length}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error in fetchAndSyncFromWalas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync pembinaan data from WALASU
   * Perform automatic matching with point pelanggaran
   */
  async syncFromWalas(dto: SyncPembinaanDto): Promise<Pembinaan> {
    try {
      // Validate critical fields
      if (!dto.walas_id || !dto.siswas_id || !dto.kasus) {
        throw new Error(
          `Invalid DTO: walas_id=${dto.walas_id}, siswas_id=${dto.siswas_id}, kasus=${dto.kasus}`,
        );
      }

      // Check if pembinaan already exists (avoid duplicates)
      const existing = await this.pembinaanRepository.findOne({
        where: {
          walas_id: dto.walas_id,
          siswas_id: dto.siswas_id,
          kasus: dto.kasus,
          tanggal_pembinaan: dto.tanggal_pembinaan,
        },
      });

      if (existing) {
        this.logger.warn(
          `Pembinaan already exists for student ${dto.siswas_id} on ${dto.tanggal_pembinaan}`,
        );
        return existing;
      }

      // Try to match dengan point pelanggaran
      let matchResult: { id: number | null; type: string; confidence: number; explanation: string } = { id: null, type: 'none', confidence: 0, explanation: '' };

      if (dto.point_pelanggaran_id) {
        // If point_pelanggaran_id provided, verify it exists
        const point = await this.pointPelanggaranRepository.findOne({
          where: { id: dto.point_pelanggaran_id },
        });

        if (point) {
          matchResult = {
            id: point.id,
            type: 'manual',
            confidence: 100,
            explanation: `Manual assignment: ${point.nama_pelanggaran}`,
          };
        }
      } else {
        // Auto-match berdasarkan kasus
        matchResult = await this.matchPointPelanggaran(dto.kasus);
      }

      // Create pembinaan record
      const pembinaan = this.pembinaanRepository.create({
        walas_id: dto.walas_id,
        walas_name: dto.walas_name,
        siswas_id: dto.siswas_id,
        siswas_name: dto.siswas_name,
        point_pelanggaran_id: matchResult.id ?? undefined,
        kasus: dto.kasus,
        tindak_lanjut: dto.tindak_lanjut,
        keterangan: dto.keterangan,
        tanggal_pembinaan: dto.tanggal_pembinaan,
        status: 'pending',
        match_type: matchResult.type,
        match_confidence: matchResult.confidence,
        match_explanation: matchResult.explanation,
        class_id: dto.class_id,
        class_name: dto.class_name,
      });

      const saved = await this.pembinaanRepository.save(pembinaan);

      this.logger.log(
        `Pembinaan synced for student ${dto.siswas_id}: Match=${matchResult.type} (${matchResult.confidence}%)`,
      );

      // TODO: Send notification to Kesiswaan staff
      // NOTE: Recipient ID mapping from WALAS class_id to RuangSiswa kesiswaan user
      // This should be implemented when user mapping system is ready
      // For now, we're logging the sync completion
      // await this.notificationService.create({
      //   recipient_id: kesiswaanUserId, // Need to implement mapping
      //   type: 'pelanggaran_baru',
      //   title: 'Pelanggaran Siswa Terdeteksi',
      //   message: `Siswa ${dto.siswas_name} dari kelas ${dto.class_name} memiliki pelanggaran baru: ${dto.kasus}`,
      //   related_id: saved.id,
      //   related_type: 'pembinaan',
      //   status: 'unread',
      //   metadata: {
      //     student_id: dto.siswas_id,
      //     student_name: dto.siswas_name,
      //     class_name: dto.class_name,
      //     violation_type: matchResult.type,
      //     violation_confidence: matchResult.confidence,
      //   },
      // });

      return saved;
    } catch (error) {
      this.logger.error(`Error syncing pembinaan: ${error.message}`);
      throw error;
    }
  }

  /**
   * Match kasus dengan point pelanggaran
   * Strategy: keyword matching + similarity scoring
   */
  private async matchPointPelanggaran(
    kasus: string,
  ): Promise<{ id: number | null; type: string; confidence: number; explanation: string }> {
    try {
      // Validate kasus is not empty
      if (!kasus || typeof kasus !== 'string') {
        this.logger.warn(`Invalid kasus for matching: ${kasus}`);
        return {
          id: null,
          type: 'none',
          confidence: 0,
          explanation: 'Invalid or empty kasus',
        };
      }

      const kasusLower = kasus.trim().toLowerCase();
      const words = kasusLower.split(/\s+/).filter((w) => w.length > 2);

      // Get all active point pelanggaran
      const points = await this.pointPelanggaranRepository.find({
        order: { bobot: 'DESC' },
      });

      if (points.length === 0) {
        return {
          id: null,
          type: 'none',
          confidence: 0,
          explanation: 'No point pelanggaran available for matching',
        };
      }

      // Try exact match first
      for (const point of points) {
        const namaLower = point.nama_pelanggaran.toLowerCase();
        if (kasusLower.includes(namaLower) || namaLower.includes(kasusLower)) {
          return {
            id: point.id,
            type: 'exact',
            confidence: 100,
            explanation: `Exact match: ${point.nama_pelanggaran}`,
          };
        }
      }

      // Try keyword matching
      for (const point of points) {
        const namaWords = point.nama_pelanggaran.toLowerCase().split(/\s+/);
        const matchCount = words.filter((w) => namaWords.some((nw) => nw.includes(w))).length;
        const matchScore = Math.round((matchCount / Math.max(words.length, 1)) * 100);

        if (matchScore >= 50) {
          return {
            id: point.id,
            type: 'keyword',
            confidence: matchScore,
            explanation: `Keyword match (${matchScore}%): ${point.nama_pelanggaran}`,
          };
        }
      }

      // Fallback: kategori matching
      for (const point of points) {
        const kasusWords = kasus.split(/\s+/).map((w) => w.toLowerCase());

        // Map common violations to categories
        const categoryMatches = this.getCategoryMatches(kasusWords);

        if (categoryMatches.includes(point.category_point)) {
          return {
            id: point.id,
            type: 'category',
            confidence: 60,
            explanation: `Category match: ${point.category_point} - ${point.nama_pelanggaran}`,
          };
        }
      }

      // No match found
      return {
        id: null,
        type: 'none',
        confidence: 0,
        explanation: 'No matching point pelanggaran found',
      };
    } catch (error) {
      this.logger.error(`Error matching point pelanggaran: ${error.message}`);
      return {
        id: null,
        type: 'error',
        confidence: 0,
        explanation: `Matching error: ${error.message}`,
      };
    }
  }

  /**
   * Helper: Get category matches from kasus keywords
   */
  private getCategoryMatches(words: string[]): string[] {
    const categoryMap = {
      kehadiran: ['terlambat', 'bolos', 'absen', 'tidak', 'hadir', 'tidak masuk'],
      pakaian: ['pakaian', 'seragam', 'rapi', 'tidak', 'panjang', 'pendek', 'sopan'],
      kepribadian: ['berkelakuan', 'sopan', 'santun', 'hormat', 'budaya', 'perilaku', 'moral'],
      ketertiban: ['ramai', 'mengganggu', 'tertib', 'disiplin', 'aturan', 'tata', 'suara'],
      kesehatan: ['merokok', 'narkoba', 'alkohol', 'kesehatan', 'sehat', 'kebersihan'],
    };

    const matches: string[] = [];

    for (const [category, keywords] of Object.entries(categoryMap)) {
      const matched = words.some((w) => keywords.includes(w));
      if (matched) {
        matches.push(category);
      }
    }

    return matches;
  }

  /**
   * Get all pembinaan
   */
  async findAll(filters?: { status?: string; siswas_id?: number; walas_id?: number }): Promise<
    Pembinaan[]
  > {
    this.logger.log(`📥 findAll called with filters: ${JSON.stringify(filters)}`);

    try {
      this.logger.debug('🔍 Creating query builder...');
      const query = this.pembinaanRepository.createQueryBuilder('p').leftJoinAndSelect('p.pointPelanggaran', 'pp');

      if (filters?.status) {
        this.logger.debug(`📋 Adding status filter: ${filters.status}`);
        query.where('p.status = :status', { status: filters.status });
      }

      if (filters?.siswas_id) {
        this.logger.debug(`👤 Adding siswas_id filter: ${filters.siswas_id}`);
        query.andWhere('p.siswas_id = :siswas_id', { siswas_id: filters.siswas_id });
      }

      if (filters?.walas_id) {
        this.logger.debug(`👨‍🏫 Adding walas_id filter: ${filters.walas_id}`);
        query.andWhere('p.walas_id = :walas_id', { walas_id: filters.walas_id });
      }

      this.logger.debug('🔨 Executing query...');
      const result = await query.orderBy('p.tanggal_pembinaan', 'DESC').getMany();

      this.logger.log(`✅ Query successful, returned ${result.length} records`);
      if (result.length > 0) {
        this.logger.debug(`📊 Sample data: ${JSON.stringify(result[0])}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Error in findAll: ${error.message}`, error.stack);
      this.logger.error(`💾 Database connection status: ${this.pembinaanRepository.manager.connection.isInitialized}`);
      throw error;
    }
  }

  /**
   * Get pembinaan by ID
   */
  async findById(id: number): Promise<Pembinaan> {
    const pembinaan = await this.pembinaanRepository.findOne({
      where: { id },
      relations: ['pointPelanggaran'],
    });

    if (!pembinaan) {
      throw new NotFoundException(`Pembinaan dengan ID ${id} tidak ditemukan`);
    }

    return pembinaan;
  }

  /**
   * Get pembinaan by student
   */
  async findByStudent(siswas_id: number): Promise<Pembinaan[]> {
    return this.pembinaanRepository.find({
      where: { siswas_id },
      relations: ['pointPelanggaran'],
      order: { tanggal_pembinaan: 'DESC' },
    });
  }

  /**
   * Get pembinaan by walas
   */
  async findByWalas(walas_id: number): Promise<Pembinaan[]> {
    return this.pembinaanRepository.find({
      where: { walas_id },
      relations: ['pointPelanggaran'],
      order: { tanggal_pembinaan: 'DESC' },
    });
  }

  /**
   * Update pembinaan
   */
  async update(id: number, dto: UpdatePembinaanDto): Promise<Pembinaan> {
    try {
      const pembinaan = await this.findById(id);

      // If point_pelanggaran_id is being updated, verify it exists
      if (dto.point_pelanggaran_id) {
        const point = await this.pointPelanggaranRepository.findOne({
          where: { id: dto.point_pelanggaran_id },
        });

        if (!point) {
          throw new BadRequestException(
            `Point pelanggaran dengan ID ${dto.point_pelanggaran_id} tidak ditemukan`,
          );
        }
      }

      Object.assign(pembinaan, dto);
      return await this.pembinaanRepository.save(pembinaan);
    } catch (error) {
      this.logger.error(`Error updating pembinaan: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete pembinaan
   */
  async delete(id: number): Promise<void> {
    const pembinaan = await this.findById(id);
    await this.pembinaanRepository.delete(id);
  }

  /**
   * Get pembinaan statistics
   */
  async getStatistics(filters?: {
    startDate?: string;
    endDate?: string;
    siswas_id?: number;
    walas_id?: number;
  }): Promise<any> {
    let query = this.pembinaanRepository.createQueryBuilder('p');

    if (filters?.startDate) {
      query.andWhere('p.tanggal_pembinaan >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('p.tanggal_pembinaan <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.siswas_id) {
      query.andWhere('p.siswas_id = :siswas_id', { siswas_id: filters.siswas_id });
    }

    if (filters?.walas_id) {
      query.andWhere('p.walas_id = :walas_id', { walas_id: filters.walas_id });
    }

    const total = await query.getCount();

    const byStatus = await this.pembinaanRepository
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.status')
      .getRawMany();

    const byMatchType = await this.pembinaanRepository
      .createQueryBuilder('p')
      .select('p.match_type', 'match_type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(p.match_confidence)', 'avg_confidence')
      .groupBy('p.match_type')
      .getRawMany();

    const averageConfidence = await this.pembinaanRepository
      .createQueryBuilder('p')
      .select('AVG(p.match_confidence)', 'avg')
      .getRawOne();

    return {
      total,
      by_status: Object.fromEntries(byStatus.map((s) => [s.status, parseInt(s.count)])),
      by_match_type: byMatchType.map((m) => ({
        match_type: m.match_type,
        count: parseInt(m.count),
        avg_confidence: Math.round(parseFloat(m.avg_confidence) || 0),
      })),
      average_confidence: Math.round(parseFloat(averageConfidence.avg) || 0),
    };
  }

  /**
   * Get unmatched pembinaan (match_type = 'none')
   * These need manual review/assignment
   */
  async getUnmatched(): Promise<Pembinaan[]> {
    return this.pembinaanRepository.find({
      where: { match_type: 'none' },
      relations: ['pointPelanggaran'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pembinaan statistics from WALASU via centralized WalasApiClient
   * Useful for cross-system monitoring and dashboard
   */
  async getWalasStatistics(filters?: {
    class_id?: number;
    walas_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    try {
      const stats = await this.walasApiClient.getPelanggaranStats({
        class_id: filters?.class_id,
        walas_id: filters?.walas_id,
        start_date: filters?.start_date,
        end_date: filters?.end_date,
      });

      return stats || { message: 'No statistics available' };
    } catch (error) {
      this.logger.error(`Error fetching WALAS statistics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch update status
   */
  async updateStatus(ids: number[], status: string): Promise<void> {
    await this.pembinaanRepository.update({ id: ids[0] }, { status });

    for (const id of ids) {
      await this.pembinaanRepository.update({ id }, { status });
    }
  }

  /**
   * Search pembinaan by kasus
   */
  async search(query: string): Promise<Pembinaan[]> {
    return this.pembinaanRepository
      .createQueryBuilder('p')
      .where('p.kasus ILIKE :query', { query: `%${query}%` })
      .orWhere('p.keterangan ILIKE :query', { query: `%${query}%` })
      .orWhere('p.siswas_name ILIKE :query', { query: `%${query}%` })
      .orderBy('p.tanggal_pembinaan', 'DESC')
      .getMany();
  }
}
