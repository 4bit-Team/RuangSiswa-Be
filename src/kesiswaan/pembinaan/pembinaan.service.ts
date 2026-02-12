import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Pembinaan } from './entities/pembinaan.entity';
import { PointPelanggaran } from '../point-pelanggaran/entities/point-pelanggaran.entity';
import { User } from '../../users/entities/user.entity';
import { SyncPembinaanDto } from './dto/sync-pembinaan.dto';
import { UpdatePembinaanDto } from './dto/update-pembinaan.dto';
import { WalasApiClient } from '../../walas/walas-api.client';
import { NotificationService } from '../../notifications/notification.service';
import { UsersService } from '../../users/users.service';
import { KelasService } from '../../kelas/kelas.service';
import { JurusanService } from '../../jurusan/jurusan.service';
import * as bcrypt from 'bcrypt';

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
  parent_data?: {
    ayah?: {
      nama_ayah?: string;
      no_wa_ayah?: string;
      siswas_id: number;
    };
    ibu?: {
      nama_ibu?: string;
      no_wa_ibu?: string;
      siswas_id: number;
    };
  };
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
    private usersService: UsersService,
    private kelasService: KelasService,
    private jurusanService: JurusanService,
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
          const pembinaan = await this.syncFromWalas(syncDto);
          result.synced++;
          this.logger.log(`✅ Pembinaan synced successfully for student ${syncDto.siswas_id}`);

          // Auto-create user for siswa if not exists
          let studentUserId: number | undefined;
          try {
            const siswasName = syncDto.siswas_name || `Siswa ${syncDto.siswas_id}`;
            const className = syncDto.class_name || '';
            const studentUser = await this.createOrUpdateStudentUser(syncDto.siswas_id, siswasName, className);
            studentUserId = studentUser?.id;
            this.logger.log(`✅ Student user created/found with ID: ${studentUserId}`);

            // Update pembinaan record dengan student_user_id untuk query parent users nanti
            if (studentUserId) {
              await this.pembinaanRepository.update(
                { id: pembinaan.id },
                { student_user_id: studentUserId }
              );
              this.logger.log(`✅ Updated pembinaan ${pembinaan.id} with student_user_id: ${studentUserId}`);
            }
          } catch (userError) {
            this.logger.warn(`❌ Could not create/update user for student ${syncDto.siswas_id}: ${userError.message}`);
            // Don't fail sync if user creation fails
          }

          // Auto-create parent (orang_tua) users if parent data exists
          // Jika parent_data tidak ada di response, fetch dari WALASU siswa endpoint
          let parentData = pelanggaran.parent_data;
          
          if (!parentData && studentUserId) {
            this.logger.log(`🔄 parent_data tidak ada di pelanggaran, fetch dari WALASU...`);
            try {
              const biodata = await this.walasApiClient.getStudentParentData(pelanggaran.siswas_id);
              if (biodata) {
                // Normalize biodata ke parent_data format
                parentData = {
                  ayah: biodata.ayah || {
                    nama_ayah: biodata.nama_ayah,
                    no_wa_ayah: biodata.no_wa_ayah,
                  },
                  ibu: biodata.ibu || {
                    nama_ibu: biodata.nama_ibu,
                    no_wa_ibu: biodata.no_wa_ibu,
                  },
                };
                this.logger.log(`✅ Parent data fetched from WALASU: ${JSON.stringify(parentData)}`);
              }
            } catch (bioError) {
              this.logger.warn(`Could not fetch parent data from WALASU: ${bioError.message}`);
            }
          }
          
          this.logger.log(`📋 Final parent data check: ${JSON.stringify(parentData)}`);
          this.logger.log(`📋 Has ayah: ${!!parentData?.ayah?.nama_ayah}, Has ibu: ${!!parentData?.ibu?.nama_ibu}`);
          this.logger.log(`📋 StudentUserId: ${studentUserId}`);
          
          if (studentUserId && (parentData?.ayah?.nama_ayah || parentData?.ibu?.nama_ibu)) {
            try {
              const parentDataFormatted = {
                nama_ayah: parentData?.ayah?.nama_ayah,
                no_wa_ayah: parentData?.ayah?.no_wa_ayah,
                nama_ibu: parentData?.ibu?.nama_ibu,
                no_wa_ibu: parentData?.ibu?.no_wa_ibu,
              };
              this.logger.log(`🔧 Creating parent users with data: ${JSON.stringify(parentDataFormatted)}`);
              const parentResult = await this.createOrUpdateParentUsers(studentUserId, syncDto.siswas_id, syncDto.siswas_name || 'Unknown', parentDataFormatted);
              this.logger.log(`✅ Parent users created: Ayah=${parentResult.ayahUserId}, Ibu=${parentResult.ibuUserId}`);
            } catch (parentError) {
              this.logger.error(`❌ Could not create/update parent users for student ${syncDto.siswas_id}: ${parentError.message}`);
              // Don't fail sync if parent user creation fails
            }
          } else {
            this.logger.log(`⚠️ Skipping parent user creation: studentUserId=${studentUserId}, hasAyah=${!!parentData?.ayah?.nama_ayah}, hasIbu=${!!parentData?.ibu?.nama_ibu}`);
          }
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
   * Create or update student user automatically
   * Called during sync to ensure every student has a user account
   * Parses class_name to extract kelas and jurusan information
   */
  private async createOrUpdateStudentUser(
    siswasId: number,
    siswasName: string,
    className: string,
  ): Promise<User | undefined> {
    try {
      // Generate username from siswas_name and email
      const username = siswasName.replace(/\s+/g, '_').toLowerCase();
      const email = `siswa.${siswasId}@ruangsiswa`;

      // Check if user already exists by email or username
      const existingUser = await this.usersService.findOneByEmail(email);

      if (existingUser) {
        this.logger.debug(`User already exists for student ${siswasId}, skipping creation`);
        return existingUser;
      }

      // Parse className to extract kelas and jurusan
      // Format: "X SIJA 1" -> kelas: "X", jurusan: "SIJA"
      const { kelasNama, jurusanKode } = this.parseClassName(className);

      let kelasId: number | undefined;
      let jurusanId: number | undefined;

      // Lookup kelas_id
      if (kelasNama) {
        const kelas = await this.kelasService.findByNama(kelasNama);
        if (kelas) {
          kelasId = kelas.id;
          this.logger.debug(`Found kelas: ${kelasNama} (ID: ${kelasId})`);
        } else {
          this.logger.warn(`Kelas not found for nama: ${kelasNama}`);
        }
      }

      // Lookup jurusan_id
      if (jurusanKode) {
        const jurusan = await this.jurusanService.findByKode(jurusanKode);
        if (jurusan) {
          jurusanId = jurusan.id;
          this.logger.debug(`Found jurusan: ${jurusanKode} (ID: ${jurusanId})`);
        } else {
          this.logger.warn(`Jurusan not found for kode: ${jurusanKode}`);
        }
      }

      // Hash the default password
      const defaultPassword = 'ruangsiswa123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create new user for siswa
      const newUser = await this.usersService.create({
        username,
        email,
        password: hashedPassword,
        fullName: siswasName,
        role: 'siswa',
        status: 'aktif',
        kelas_lengkap: className, // Full class name from WALAS (e.g., "X SIJA 1")
        kelas_id: kelasId,
        jurusan_id: jurusanId,
      });

      this.logger.log(
        `✅ User created successfully for student ${siswasId} (${siswasName}) | ` +
          `Kelas: ${kelasId || 'N/A'} | Jurusan: ${jurusanId || 'N/A'}`,
      );

      return newUser;
    } catch (error) {
      this.logger.error(`Error creating user for student ${siswasId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse className to extract kelas name and jurusan kode
   * Input format: "X SIJA 1" or "XI SIJA 2" or "XII AKL 1"
   * Returns: { kelasNama: "X", jurusanKode: "SIJA" }
   */
  private parseClassName(className: string): { kelasNama: string | null; jurusanKode: string | null } {
    if (!className || typeof className !== 'string') {
      return { kelasNama: null, jurusanKode: null };
    }

    const parts = className.trim().split(/\s+/);

    // First part should be kelas (X, XI, XII)
    const kelasNama = parts[0] || null;

    // Second part should be jurusan kode (SIJA, AKL, BKP, etc)
    const jurusanKode = parts[1] || null;

    return {
      kelasNama: kelasNama === 'X' || kelasNama === 'XI' || kelasNama === 'XII' ? kelasNama : null,
      jurusanKode,
    };
  }

  /**
   * eturn this.pembinaanRepository.find({
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

  /**
   * Create or update parent (orang_tua) users for a student
   * Automatically creates Ayah (Father) and Ibu (Mother) users with role orang_tua
   * Used during pembinaan sync from WALASU
   */
  async createOrUpdateParentUsers(
    studentUserId: number,
    siswasId: number,
    siswasName: string,
    parentData: {
      nama_ayah?: string;
      no_wa_ayah?: string;
      nama_ibu?: string;
      no_wa_ibu?: string;
    },
  ): Promise<{ ayahUserId?: number; ibuUserId?: number }> {
    try {
      const result = {} as { ayahUserId?: number; ibuUserId?: number };

      // Hash the default password for parents
      const defaultPassword = 'ruangsiswa123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create Ayah (Father) user
      if (parentData.nama_ayah) {
        try {
          const ayahUsername = parentData.nama_ayah.replace(/\s+/g, '_').toLowerCase();
          const ayahEmail = `${siswasId}-ayah@ruangsiswa`;

          const existingAyah = await this.usersService.findOneByEmail(ayahEmail);

          if (!existingAyah) {
            const ayahUser = await this.usersService.create({
              username: ayahUsername,
              email: ayahEmail,
              password: hashedPassword,
              fullName: parentData.nama_ayah,
              role: 'orang_tua',
              status: 'aktif',
              phone_number: parentData.no_wa_ayah || undefined,
              student_id: studentUserId,
            });

            result.ayahUserId = ayahUser.id;
            this.logger.log(
              `✅ Ayah user created for student ${siswasId}: ${parentData.nama_ayah} (ID: ${ayahUser.id})`
            );
          } else {
            result.ayahUserId = existingAyah.id;
            this.logger.debug(`Ayah user already exists for student ${siswasId}: ${ayahEmail}`);
          }
        } catch (error) {
          this.logger.warn(`Could not create Ayah user for student ${siswasId}: ${error.message}`);
          // Continue with Ibu creation even if Ayah fails
        }
      }

      // Create Ibu (Mother) user
      if (parentData.nama_ibu) {
        try {
          const ibuUsername = parentData.nama_ibu.replace(/\s+/g, '_').toLowerCase();
          const ibuEmail = `${siswasId}-ibu@ruangsiswa`;

          const existingIbu = await this.usersService.findOneByEmail(ibuEmail);

          if (!existingIbu) {
            const ibuUser = await this.usersService.create({
              username: ibuUsername,
              email: ibuEmail,
              password: hashedPassword,
              fullName: parentData.nama_ibu,
              role: 'orang_tua',
              status: 'aktif',
              phone_number: parentData.no_wa_ibu || undefined,
              student_id: studentUserId,
            });

            result.ibuUserId = ibuUser.id;
            this.logger.log(
              `✅ Ibu user created for student ${siswasId}: ${parentData.nama_ibu} (ID: ${ibuUser.id})`
            );
          } else {
            result.ibuUserId = existingIbu.id;
            this.logger.debug(`Ibu user already exists for student ${siswasId}: ${ibuEmail}`);
          }
        } catch (error) {
          this.logger.warn(`Could not create Ibu user for student ${siswasId}: ${error.message}`);
          // Continue even if Ibu creation fails
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Error creating parent users for student ${siswasId}: ${error.message}`);
      throw error;
    }
  }
}

