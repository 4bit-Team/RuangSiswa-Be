import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalasApiClient } from '../../walas/walas-api.client';
import {
  BimbinganCategory,
  BimbinganReferral,
  BimbinganSesi,
  BimbinganCatat,
  BimbinganIntervensi,
  BimbinganPerkembangan,
  BimbinganAbility,
  BimbinganTarget,
  BimbinganStatus,
  BimbinganStatistik,
} from './entities/bimbingan.entity';

interface CreateReferralDto {
  student_id: number;
  student_name: string;
  class_id: number;
  tahun: number;
  referral_reason: string;
  risk_level: string;
  referral_source?: {
    source: string; // attendance, tardiness, violations, academic
    source_id: string;
    details: string;
  };
  notes?: string;
}

interface CreateSesiDto {
  referral_id: string;
  student_id: number;
  student_name: string;
  counselor_id: string;
  counselor_name: string;
  tanggal_sesi: string;
  jam_sesi?: string;
  topik_pembahasan: string;
  lokasi?: string;
}

interface CreateCatatDto {
  referral_id: string;
  student_id: number;
  student_name: string;
  counselor_id: string;
  counselor_name: string;
  jenis_catat: string;
  isi_catat: string;
  tanggal_catat: string;
  memerlukan_tindakan?: boolean;
  tindakan_lanjutan?: string;
}

interface CreateIntervensiDto {
  referral_id: string;
  student_id: number;
  student_name: string;
  counselor_id: string;
  counselor_name: string;
  jenis_intervensi: string;
  deskripsi_intervensi: string;
  tanggal_intervensi: string;
}

interface CreateTargetDto {
  referral_id: string;
  student_id: number;
  student_name: string;
  counselor_id: string;
  area_target: string;
  target_spesifik: string;
  tanggal_mulai: string;
  tanggal_target: string;
  strategi_pencapaian?: string;
}

@Injectable()
export class BimbinganService {
  private readonly logger = new Logger(BimbinganService.name);

  constructor(
    @InjectRepository(BimbinganCategory)
    private categoryRepo: Repository<BimbinganCategory>,

    @InjectRepository(BimbinganReferral)
    private referralRepo: Repository<BimbinganReferral>,

    @InjectRepository(BimbinganSesi)
    private sesiRepo: Repository<BimbinganSesi>,

    @InjectRepository(BimbinganCatat)
    private catatRepo: Repository<BimbinganCatat>,

    @InjectRepository(BimbinganIntervensi)
    private intervensiRepo: Repository<BimbinganIntervensi>,

    @InjectRepository(BimbinganPerkembangan)
    private perkembanganRepo: Repository<BimbinganPerkembangan>,

    @InjectRepository(BimbinganAbility)
    private abilityRepo: Repository<BimbinganAbility>,

    @InjectRepository(BimbinganTarget)
    private targetRepo: Repository<BimbinganTarget>,

    @InjectRepository(BimbinganStatus)
    private statusRepo: Repository<BimbinganStatus>,

    @InjectRepository(BimbinganStatistik)
    private statistikRepo: Repository<BimbinganStatistik>,

    private walasApiClient: WalasApiClient,
  ) {}

  /**
   * Create referral (auto-triggered from other modules or manual)
   */
  async createReferral(dto: CreateReferralDto): Promise<BimbinganReferral> {
    try {
      const referralData = {
        student_id: dto.student_id,
        student_name: dto.student_name,
        class_id: dto.class_id,
        tahun: dto.tahun,
        referral_reason: dto.referral_reason,
        risk_level: dto.risk_level,
        referral_source: dto.referral_source,
        notes: dto.notes,
        status: 'pending' as const,
        referral_status: 'pending' as const,
        referral_date: new Date(),
        guidance_case_id: this.generateUUID(),
      };

      const referral = this.referralRepo.create(referralData);
      const saved = await this.referralRepo.save(referral);

      // Update or create status record
      await this.updateStatus(dto.student_id, dto.tahun);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create referral: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync guidance data dari Walas (case notes)
   * Auto-create referrals jika ditemukan case notes yang memerlukan referral
   */
  async syncGuidanceFromWalas(
    startDate: Date,
    endDate: Date,
    forceSync: boolean = false,
  ): Promise<{
    success: boolean;
    synced_referrals: number;
    failed: number;
    errors: any[];
  }> {
    try {
      this.logger.log(`Syncing guidance from Walas (${this.formatDate(startDate)} to ${this.formatDate(endDate)})`);

      // Fetch case notes dari Walas API
      const caseNotesData = await this.walasApiClient.getAllCaseNotes({
        start_date: this.formatDate(startDate),
        end_date: this.formatDate(endDate),
        limit: 500,
      });

      if (!caseNotesData || !caseNotesData.data) {
        this.logger.log('No case notes found to process');
        return {
          success: true,
          synced_referrals: 0,
          failed: 0,
          errors: [],
        };
      }

      let syncedCount = 0;
      let failedCount = 0;
      const errors: any[] = [];

      // Get actual notes array (handle both paginated and direct response)
      const notes = Array.isArray(caseNotesData.data) 
        ? caseNotesData.data 
        : (caseNotesData.data?.data || []);

      this.logger.log(`[SYNC DEBUG] Total case notes from Walas API: ${notes.length}`);

      // Process setiap case note
      for (const note of notes) {
        try {
          // Filter: Check apakah case note memerlukan referral
          if (!this.isReferralNeeded(note)) {
            this.logger.log(`[SYNC DEBUG] Note id=${note.id} filtered out. Note data: 
              student_id=${note.student_id}, 
              memerlukan_tindakan=${note.memerlukan_tindakan}, 
              isi_catat=${note.isi_catat?.substring(0, 50)}`);
            continue;
          }
          
          this.logger.log(`[SYNC DEBUG] Processing note id=${note.id} for student ${note.student_id}`);

          // Check apakah referral sudah exist
          const existing = await this.referralRepo.findOne({
            where: {
              student_id: note.student_id,
            },
          });

          if (existing && !forceSync) {
            this.logger.log(`[SYNC DEBUG] Referral already exists for student ${note.student_id}, skipping (use forceSync to override)`);
            continue;
          }

          // Determine risk level dari nature of case note
          const riskLevel = this.determineRiskLevel(note);

          // Create referral dari case note
          const referralData = {
            student_id: note.student_id,
            student_name: note.student_name || 'Unknown',
            class_id: 0, // Akan di-update dari data lain jika diperlukan
            tahun: new Date().getFullYear(),
            referral_reason: note.keterangan || 'Referral dari Walas case notes',
            risk_level: riskLevel,
            referral_source: {
              source: 'walas_case_notes',
              source_id: note.id,
              details: note.tindakan || 'Case note',
            },
            notes: `Auto-referred from Walas on ${new Date().toISOString()}`,
          };

          const referral = await this.createReferral(referralData);
          syncedCount++;
          this.logger.log(`Created referral for student ${note.student_id} from case note`);

          // Also create catat (case notes) from Walas case notes
          try {
            const catatContent = note.kasus 
              ? `Kasus: ${note.kasus}\nTindak Lanjut: ${note.tindak_lanjut || '-'}\nKeterangan: ${note.keterangan || '-'}`
              : (note.isi_catat || 'Case note dari Walas');

            // Determine note type based on kasus
            const determineNoteType = (kasus: string): string => {
              const caseText = (kasus || '').toLowerCase();
              if (caseText.includes('bolos') || caseText.includes('absen') || caseText.includes('tidak hadir')) {
                return 'observation';
              }
              if (caseText.includes('terlambat') || caseText.includes('telat')) {
                return 'observation';
              }
              if (caseText.includes('pelanggaran') || caseText.includes('melanggar')) {
                return 'incident';
              }
              return 'observation'; // default
            };

            // Get walas info from Walas API if available
            let createdByName = 'Walas';
            let createdById: string;
            
            if (note.walas_id) {
              // Convert numeric walas_id to UUID format (deterministic)
              createdById = `00000000-0000-0000-0000-${String(note.walas_id).padStart(12, '0')}`;
              
              try {
                const walasInfo = await this.walasApiClient.getWalasById(note.walas_id);
                if (walasInfo && walasInfo.name) {
                  createdByName = walasInfo.name;
                }
              } catch (walasError) {
                this.logger.warn(`Could not fetch walas info for id ${note.walas_id}: ${walasError.message}`);
              }

              const catatData = {
                guidance_case_id: referral.guidance_case_id,
                student_id: note.student_id,
                note_content: catatContent,
                note_type: determineNoteType(note.kasus),
                created_by: createdById,
                created_by_name: createdByName,
                created_by_role: 'Walas',
                status: 'confidential',
              };

              const catat = this.catatRepo.create(catatData);
              await this.catatRepo.save(catat);
              this.logger.log(`Created catat for student ${note.student_id} by ${createdByName}`);
            }
          } catch (catatError) {
            this.logger.warn(`Failed to create catat for referral ${referral.id}: ${catatError.message}`);
          }
        } catch (error) {
          failedCount++;
          errors.push({
            note_id: note.id,
            student_id: note.student_id,
            error: error.message,
          });
          this.logger.error(
            `Failed to sync guidance for student ${note.student_id}: ${error.message}`
          );
        }
      }

      this.logger.log(`Guidance sync completed: ${syncedCount} synced, ${failedCount} failed`);

      return {
        success: true,
        synced_referrals: syncedCount,
        failed: failedCount,
        errors: errors,
      };
    } catch (error) {
      this.logger.error(`Guidance sync failed: ${error.message}`);
      return {
        success: false,
        synced_referrals: 0,
        failed: 0,
        errors: [{ error: error.message }],
      };
    }
  }

  /**
   * Get all referrals with filters
   */
  async getReferrals(filters: {
    student_id?: number;
    counselor_id?: string;
    status?: string;
    risk_level?: string;
    tahun?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: BimbinganReferral[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      let query = this.referralRepo.createQueryBuilder('r');

      if (filters.student_id) {
        query = query.where('r.student_id = :student_id', {
          student_id: filters.student_id,
        });
      }

      if (filters.counselor_id) {
        query = query.andWhere('r.counselor_id = :counselor_id', {
          counselor_id: filters.counselor_id,
        });
      }

      if (filters.status) {
        query = query.andWhere('r.status = :status', {
          status: filters.status,
        });
      }

      if (filters.risk_level) {
        query = query.andWhere('r.risk_level = :risk_level', {
          risk_level: filters.risk_level,
        });
      }

      if (filters.tahun) {
        query = query.andWhere('r.tahun = :tahun', {
          tahun: filters.tahun,
        });
      }

      const total = await query.getCount();
      const data = await query.orderBy('r.referral_date', 'DESC').skip(skip).take(limit).getMany();

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to get referrals: ${error.message}`);
      throw error;
    }
  }

  /**
   * Assign counselor to referral
   */
  async assignCounselor(
    referral_id: string,
    counselor_id: string,
    counselor_name: string,
  ): Promise<BimbinganReferral | null> {
    try {
      await this.referralRepo.update(
        { id: referral_id },
        {
          counselor_id,
          counselor_name,
          status: 'assigned',
          assigned_date: new Date().toISOString().split('T')[0],
        },
      );

      return this.referralRepo.findOne({ where: { id: referral_id } });
    } catch (error) {
      this.logger.error(`Failed to assign counselor: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create guidance session
   */
  async createSesi(dto: CreateSesiDto): Promise<BimbinganSesi> {
    try {
      // Count sessions for this referral
      const count = await this.sesiRepo.count({
        where: { referral_id: dto.referral_id },
      });

      const sesiData = {
        referral_id: dto.referral_id,
        student_id: dto.student_id,
        bk_staff_id: dto.counselor_id,
        bk_staff_name: dto.counselor_name,
        tanggal_sesi: new Date(dto.tanggal_sesi),
        session_date: `${dto.tanggal_sesi} ${dto.jam_sesi || '08:00'}`,
        location: dto.lokasi || 'BK Office',
        agenda: dto.topik_pembahasan,
        notes: dto.topik_pembahasan,
        sesi_ke: count + 1,
        status: 'scheduled' as const,
        session_type: 'individual',
        guidance_case_id: this.generateUUID(),
        duration_minutes: 30,
        student_attended: false,
        siswa_hadir: false,
      };

      const sesi = this.sesiRepo.create(sesiData);
      const saved = await this.sesiRepo.save(sesi);

      // Update referral status
      await this.referralRepo.update(
        { id: dto.referral_id },
        { status: 'in_progress' },
      );

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Complete session
   */
  async completeSesi(
    sesi_id: string,
    siswa_hadir: boolean,
    orang_tua_hadir: boolean,
    hasil_akhir: string,
    follow_up_status?: string,
    follow_up_date?: string,
  ): Promise<BimbinganSesi | null> {
    try {
      await this.sesiRepo.update(
        { id: sesi_id },
        {
          status: 'completed',
          siswa_hadir,
          orang_tua_hadir,
          hasil_akhir,
          follow_up_status: follow_up_status || 'none',
          follow_up_date,
        },
      );

      return this.sesiRepo.findOne({ where: { id: sesi_id } });
    } catch (error) {
      this.logger.error(`Failed to complete session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sessions for referral
   */
  async getSesi(filters: {
    referral_id?: string;
    student_id?: number;
    counselor_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BimbinganSesi[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      let query = this.sesiRepo.createQueryBuilder('s');

      if (filters.referral_id) {
        query = query.where('s.referral_id = :referral_id', {
          referral_id: filters.referral_id,
        });
      }

      if (filters.student_id) {
        query = query.andWhere('s.student_id = :student_id', {
          student_id: filters.student_id,
        });
      }

      if (filters.counselor_id) {
        query = query.andWhere('s.counselor_id = :counselor_id', {
          counselor_id: filters.counselor_id,
        });
      }

      if (filters.status) {
        query = query.andWhere('s.status = :status', {
          status: filters.status,
        });
      }

      const total = await query.getCount();
      const data = await query.orderBy('s.tanggal_sesi', 'DESC').skip(skip).take(limit).getMany();

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to get sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add case notes
   */
  async addCatat(dto: CreateCatatDto): Promise<BimbinganCatat> {
    try {
      const catatData = {
        student_id: dto.student_id,
        note_content: dto.isi_catat,
        note_type: dto.jenis_catat || 'observation',
        created_by: dto.counselor_id,
        created_by_name: dto.counselor_name,
        created_by_role: 'BK',
        guidance_case_id: this.generateUUID(),
        status: 'confidential',
      };

      const catat = this.catatRepo.create(catatData);
      return this.catatRepo.save(catat);
    } catch (error) {
      this.logger.error(`Failed to add case note: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get case notes
   */
  async getCatat(filters: {
    referral_id?: string;
    student_id?: number;
    counselor_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BimbinganCatat[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      let query = this.catatRepo.createQueryBuilder('c');

      if (filters.referral_id) {
        query = query.where('c.referral_id = :referral_id', {
          referral_id: filters.referral_id,
        });
      }

      if (filters.student_id) {
        query = query.andWhere('c.student_id = :student_id', {
          student_id: filters.student_id,
        });
      }

      if (filters.counselor_id) {
        query = query.andWhere('c.counselor_id = :counselor_id', {
          counselor_id: filters.counselor_id,
        });
      }

      const total = await query.getCount();
      const data = await query.orderBy('c.tanggal_catat', 'DESC').skip(skip).take(limit).getMany();

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to get case notes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create intervention
   */
  async createIntervensi(dto: CreateIntervensiDto): Promise<BimbinganIntervensi> {
    try {
      const interventionData = {
        student_id: dto.student_id,
        intervention_name: dto.jenis_intervensi,
        intervention_description: dto.deskripsi_intervensi,
        intervention_type: 'counseling' as const,
        responsible_party_id: dto.counselor_id,
        responsible_party_name: dto.counselor_name,
        start_date: dto.tanggal_intervensi,
        status: 'in_progress' as const,
        guidance_case_id: this.generateUUID(),
      };

      const intervensi = this.intervensiRepo.create(interventionData);
      return this.intervensiRepo.save(intervensi);
    } catch (error) {
      this.logger.error(`Failed to create intervention: ${error.message}`);
      throw error;
    }
  }

  /**
   * Evaluate intervention
   */
  async evaluateIntervensi(
    intervensi_id: string,
    hasil_intervensi: string,
    efektivitas: string,
  ): Promise<BimbinganIntervensi | null> {
    try {
      await this.intervensiRepo.update(
        { id: intervensi_id },
        {
          status: 'completed',
          hasil_intervensi,
          efektivitas: parseInt(efektivitas, 10),
          tanggal_evaluasi: new Date().toISOString().split('T')[0],
        },
      );

      return this.intervensiRepo.findOne({ where: { id: intervensi_id } });
    } catch (error) {
      this.logger.error(`Failed to evaluate intervention: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get interventions
   */
  async getIntervensi(filters: {
    referral_id?: string;
    student_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BimbinganIntervensi[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      let query = this.intervensiRepo.createQueryBuilder('i');

      if (filters.referral_id) {
        query = query.where('i.referral_id = :referral_id', {
          referral_id: filters.referral_id,
        });
      }

      if (filters.student_id) {
        query = query.andWhere('i.student_id = :student_id', {
          student_id: filters.student_id,
        });
      }

      if (filters.status) {
        query = query.andWhere('i.status = :status', {
          status: filters.status,
        });
      }

      const total = await query.getCount();
      const data = await query.orderBy('i.tanggal_intervensi', 'DESC').skip(skip).take(limit).getMany();

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to get interventions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record progress evaluation
   */
  async recordPerkembangan(
    referral_id: string,
    student_id: number,
    student_name: string,
    counselor_id: string,
    evaluasi: {
      perilaku_skor?: number;
      perilaku_catatan?: string;
      akademik_skor?: number;
      akademik_catatan?: string;
      emosi_skor?: number;
      emosi_catatan?: string;
      kehadiran_skor?: number;
      kehadiran_catatan?: string;
      sesi_total_dijalankan?: number;
    },
  ): Promise<BimbinganPerkembangan> {
    try {
      // Calculate overall status
      const scores = [
        evaluasi.perilaku_skor,
        evaluasi.akademik_skor,
        evaluasi.emosi_skor,
        evaluasi.kehadiran_skor,
      ].filter((s) => s !== undefined);

      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
      const status_keseluruhan =
        avgScore >= 4 ? 'improving' : avgScore >= 2.5 ? 'stable' : 'declining';

      const perkembanganData = {
        referral_id,
        student_id,
        student_name,
        counselor_id,
        assessment_date: new Date().toISOString().split('T')[0],
        tanggal_evaluasi: new Date().toISOString().split('T')[0],
        status_keseluruhan,
        guidance_case_id: this.generateUUID(),
        assessed_by: counselor_id,
        behavioral_observations: evaluasi.perilaku_catatan,
        assessment_comments: evaluasi.akademik_catatan,
      };

      const perkembangan = this.perkembanganRepo.create(perkembanganData);
      return this.perkembanganRepo.save(perkembangan);
    } catch (error) {
      this.logger.error(`Failed to record progress: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get progress records
   */
  async getPerkembangan(filters: {
    referral_id?: string;
    student_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: BimbinganPerkembangan[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      let query = this.perkembanganRepo.createQueryBuilder('p');

      if (filters.referral_id) {
        query = query.where('p.referral_id = :referral_id', {
          referral_id: filters.referral_id,
        });
      }

      if (filters.student_id) {
        query = query.andWhere('p.student_id = :student_id', {
          student_id: filters.student_id,
        });
      }

      const total = await query.getCount();
      const data = await query.orderBy('p.tanggal_evaluasi', 'DESC').skip(skip).take(limit).getMany();

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to get progress records: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create guidance goal/target
   */
  async createTarget(dto: CreateTargetDto): Promise<BimbinganTarget> {
    try {
      const targetData = {
        target_description: `${dto.area_target}: ${dto.target_spesifik}`,
        target_date: new Date(dto.tanggal_target),
        status: 'pending' as const,
        guidance_case_id: this.generateUUID(),
        progress_percentage: 0,
      };

      const target = this.targetRepo.create(targetData);
      return this.targetRepo.save(target);
    } catch (error) {
      this.logger.error(`Failed to create target: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get targets
   */
  async getTarget(filters: {
    referral_id?: string;
    student_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BimbinganTarget[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      let query = this.targetRepo.createQueryBuilder('t');

      if (filters.referral_id) {
        query = query.where('t.referral_id = :referral_id', {
          referral_id: filters.referral_id,
        });
      }

      if (filters.student_id) {
        query = query.andWhere('t.student_id = :student_id', {
          student_id: filters.student_id,
        });
      }

      if (filters.status) {
        query = query.andWhere('t.status = :status', {
          status: filters.status,
        });
      }

      const total = await query.getCount();
      const data = await query.orderBy('t.tanggal_mulai', 'DESC').skip(skip).take(limit).getMany();

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to get targets: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get student guidance status
   */
  async getStudentStatus(student_id: number, tahun?: number): Promise<BimbinganStatus | null> {
    try {
      const year = tahun || new Date().getFullYear();

      let status = await this.statusRepo.findOne({
        where: { student_id, tahun: year },
      });

      if (!status) {
        status = this.statusRepo.create({
          student_id,
          tahun: year,
          status: 'no_guidance',
          current_risk_level: 'green',
        });
        await this.statusRepo.save(status);
      }

      return status;
    } catch (error) {
      this.logger.error(`Failed to get student status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all guidance statuses with pagination
   */
  async getAllStatuses(filters?: {
    tahun?: number;
    page?: number;
    limit?: number;
    risk_level?: string;
    status?: string;
  }): Promise<{ data: BimbinganStatus[]; total: number; page: number; limit: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const year = filters?.tahun || new Date().getFullYear();

      let query = this.statusRepo.createQueryBuilder('s')
        .where('s.tahun = :tahun', { tahun: year });

      if (filters?.risk_level) {
        query = query.andWhere('s.current_risk_level = :risk_level', {
          risk_level: filters.risk_level,
        });
      }

      if (filters?.status) {
        query = query.andWhere('s.status = :status', {
          status: filters.status,
        });
      }

      const total = await query.getCount();
      const data = await query
        .orderBy('s.student_id', 'ASC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to get all statuses: ${error.message}`);
      throw error;
    }
  }

  /**
   * ===== PRIVATE HELPER METHODS =====
   */

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private async updateStatus(student_id: number, tahun: number): Promise<void> {
    try {
      let status = await this.statusRepo.findOne({
        where: { student_id, tahun },
      });

      if (!status) {
        status = this.statusRepo.create({
          student_id,
          tahun,
          status: 'referred',
          status_type: 'open',
          current_risk_level: 'yellow',
        });
      } else {
        status.status = 'referred';
        status.status_type = 'open';
        status.current_risk_level = 'yellow';
      }

      const referrals = await this.referralRepo.count({
        where: { student_id, tahun },
      });

      const sessions = await this.sesiRepo.count({
        where: { student_id },
      });

      const interventions = await this.intervensiRepo.count({
        where: { student_id },
      });

      status.total_referrals = referrals;
      status.total_sessions = sessions;
      status.total_interventions = interventions;

      const latestReferral = await this.referralRepo.findOne({
        where: { student_id, tahun },
        order: { referral_date: 'DESC' },
      });

      if (latestReferral) {
        status.first_referral_date = latestReferral.referral_date;
        status.latest_referral_id = latestReferral.id;
      }

      const latestSesi = await this.sesiRepo.findOne({
        where: { student_id },
        order: { tanggal_sesi: 'DESC' },
      });

      if (latestSesi) {
        status.last_session_date = latestSesi.tanggal_sesi;
        status.next_session_date = latestSesi.follow_up_date;
      }

      await this.statusRepo.save(status);
    } catch (error) {
      this.logger.error(`Failed to update status: ${error.message}`);
    }
  }

  /**
   * Helper: Check apakah case note memerlukan referral
   */
  private isReferralNeeded(note: any): boolean {
    // Jika ada flag memerlukan tindakan
    if (note.memerlukan_tindakan === true) return true;

    // Jika jenis catat atau keterangan ada, sync semuanya
    // (relax filter agar semua case notes bisa di-sync)
    if (note.id && note.student_id && (note.isi_catat || note.keterangan)) {
      return true;
    }

    return false;
  }

  /**
   * Helper: Determine risk level dari nature of case note
   */
  private determineRiskLevel(note: any): string {
    const content = (note.isi_catat || '').toLowerCase();

    if (
      content.includes('kritik') ||
      content.includes('putus sekolah') ||
      content.includes('kekerasan') ||
      note.jenis_catat === 'risiko_putus_sekolah'
    ) {
      return 'critical';
    }

    if (
      content.includes('masalah') ||
      content.includes('kesulitan') ||
      note.jenis_catat === 'masalah_sosial'
    ) {
      return 'high';
    }

    if (
      content.includes('perlu diskusi') ||
      content.includes('follow-up') ||
      note.jenis_catat === 'observasi_umum'
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Helper: Format date to YYYY-MM-DD
   */
  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }

}
