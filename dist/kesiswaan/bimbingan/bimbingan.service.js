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
var BimbinganService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BimbinganService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const walas_api_client_1 = require("../../walas/walas-api.client");
const bimbingan_entity_1 = require("./entities/bimbingan.entity");
let BimbinganService = BimbinganService_1 = class BimbinganService {
    categoryRepo;
    referralRepo;
    sesiRepo;
    catatRepo;
    intervensiRepo;
    perkembanganRepo;
    abilityRepo;
    targetRepo;
    statusRepo;
    statistikRepo;
    walasApiClient;
    logger = new common_1.Logger(BimbinganService_1.name);
    constructor(categoryRepo, referralRepo, sesiRepo, catatRepo, intervensiRepo, perkembanganRepo, abilityRepo, targetRepo, statusRepo, statistikRepo, walasApiClient) {
        this.categoryRepo = categoryRepo;
        this.referralRepo = referralRepo;
        this.sesiRepo = sesiRepo;
        this.catatRepo = catatRepo;
        this.intervensiRepo = intervensiRepo;
        this.perkembanganRepo = perkembanganRepo;
        this.abilityRepo = abilityRepo;
        this.targetRepo = targetRepo;
        this.statusRepo = statusRepo;
        this.statistikRepo = statistikRepo;
        this.walasApiClient = walasApiClient;
    }
    async createReferral(dto) {
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
                status: 'pending',
                referral_status: 'pending',
                referral_date: new Date(),
                guidance_case_id: this.generateUUID(),
            };
            const referral = this.referralRepo.create(referralData);
            const saved = await this.referralRepo.save(referral);
            await this.updateStatus(dto.student_id, dto.tahun);
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to create referral: ${error.message}`);
            throw error;
        }
    }
    async syncGuidanceFromWalas(startDate, endDate, forceSync = false) {
        try {
            this.logger.log(`Syncing guidance from Walas (${this.formatDate(startDate)} to ${this.formatDate(endDate)})`);
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
            const errors = [];
            const notes = Array.isArray(caseNotesData.data)
                ? caseNotesData.data
                : (caseNotesData.data?.data || []);
            this.logger.log(`[SYNC DEBUG] Total case notes from Walas API: ${notes.length}`);
            for (const note of notes) {
                try {
                    if (!this.isReferralNeeded(note)) {
                        this.logger.log(`[SYNC DEBUG] Note id=${note.id} filtered out. Note data: 
              student_id=${note.student_id}, 
              memerlukan_tindakan=${note.memerlukan_tindakan}, 
              isi_catat=${note.isi_catat?.substring(0, 50)}`);
                        continue;
                    }
                    this.logger.log(`[SYNC DEBUG] Processing note id=${note.id} for student ${note.student_id}`);
                    const existing = await this.referralRepo.findOne({
                        where: {
                            student_id: note.student_id,
                        },
                    });
                    if (existing && !forceSync) {
                        this.logger.log(`[SYNC DEBUG] Referral already exists for student ${note.student_id}, skipping (use forceSync to override)`);
                        continue;
                    }
                    const riskLevel = this.determineRiskLevel(note);
                    const referralData = {
                        student_id: note.student_id,
                        student_name: note.student_name || 'Unknown',
                        class_id: 0,
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
                    try {
                        const catatContent = note.kasus
                            ? `Kasus: ${note.kasus}\nTindak Lanjut: ${note.tindak_lanjut || '-'}\nKeterangan: ${note.keterangan || '-'}`
                            : (note.isi_catat || 'Case note dari Walas');
                        const determineNoteType = (kasus) => {
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
                            return 'observation';
                        };
                        let createdByName = 'Walas';
                        let createdById;
                        if (note.walas_id) {
                            createdById = `00000000-0000-0000-0000-${String(note.walas_id).padStart(12, '0')}`;
                            try {
                                const walasInfo = await this.walasApiClient.getWalasById(note.walas_id);
                                if (walasInfo && walasInfo.name) {
                                    createdByName = walasInfo.name;
                                }
                            }
                            catch (walasError) {
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
                    }
                    catch (catatError) {
                        this.logger.warn(`Failed to create catat for referral ${referral.id}: ${catatError.message}`);
                    }
                }
                catch (error) {
                    failedCount++;
                    errors.push({
                        note_id: note.id,
                        student_id: note.student_id,
                        error: error.message,
                    });
                    this.logger.error(`Failed to sync guidance for student ${note.student_id}: ${error.message}`);
                }
            }
            this.logger.log(`Guidance sync completed: ${syncedCount} synced, ${failedCount} failed`);
            return {
                success: true,
                synced_referrals: syncedCount,
                failed: failedCount,
                errors: errors,
            };
        }
        catch (error) {
            this.logger.error(`Guidance sync failed: ${error.message}`);
            return {
                success: false,
                synced_referrals: 0,
                failed: 0,
                errors: [{ error: error.message }],
            };
        }
    }
    async getReferrals(filters) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get referrals: ${error.message}`);
            throw error;
        }
    }
    async assignCounselor(referral_id, counselor_id, counselor_name) {
        try {
            await this.referralRepo.update({ id: referral_id }, {
                counselor_id,
                counselor_name,
                status: 'assigned',
                assigned_date: new Date().toISOString().split('T')[0],
            });
            return this.referralRepo.findOne({ where: { id: referral_id } });
        }
        catch (error) {
            this.logger.error(`Failed to assign counselor: ${error.message}`);
            throw error;
        }
    }
    async createSesi(dto) {
        try {
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
                status: 'scheduled',
                session_type: 'individual',
                guidance_case_id: this.generateUUID(),
                duration_minutes: 30,
                student_attended: false,
                siswa_hadir: false,
            };
            const sesi = this.sesiRepo.create(sesiData);
            const saved = await this.sesiRepo.save(sesi);
            await this.referralRepo.update({ id: dto.referral_id }, { status: 'in_progress' });
            return saved;
        }
        catch (error) {
            this.logger.error(`Failed to create session: ${error.message}`);
            throw error;
        }
    }
    async completeSesi(sesi_id, siswa_hadir, orang_tua_hadir, hasil_akhir, follow_up_status, follow_up_date) {
        try {
            await this.sesiRepo.update({ id: sesi_id }, {
                status: 'completed',
                siswa_hadir,
                orang_tua_hadir,
                hasil_akhir,
                follow_up_status: follow_up_status || 'none',
                follow_up_date,
            });
            return this.sesiRepo.findOne({ where: { id: sesi_id } });
        }
        catch (error) {
            this.logger.error(`Failed to complete session: ${error.message}`);
            throw error;
        }
    }
    async getSesi(filters) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get sessions: ${error.message}`);
            throw error;
        }
    }
    async addCatat(dto) {
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
        }
        catch (error) {
            this.logger.error(`Failed to add case note: ${error.message}`);
            throw error;
        }
    }
    async getCatat(filters) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get case notes: ${error.message}`);
            throw error;
        }
    }
    async createIntervensi(dto) {
        try {
            const interventionData = {
                student_id: dto.student_id,
                intervention_name: dto.jenis_intervensi,
                intervention_description: dto.deskripsi_intervensi,
                intervention_type: 'counseling',
                responsible_party_id: dto.counselor_id,
                responsible_party_name: dto.counselor_name,
                start_date: dto.tanggal_intervensi,
                status: 'in_progress',
                guidance_case_id: this.generateUUID(),
            };
            const intervensi = this.intervensiRepo.create(interventionData);
            return this.intervensiRepo.save(intervensi);
        }
        catch (error) {
            this.logger.error(`Failed to create intervention: ${error.message}`);
            throw error;
        }
    }
    async evaluateIntervensi(intervensi_id, hasil_intervensi, efektivitas) {
        try {
            await this.intervensiRepo.update({ id: intervensi_id }, {
                status: 'completed',
                hasil_intervensi,
                efektivitas: parseInt(efektivitas, 10),
                tanggal_evaluasi: new Date().toISOString().split('T')[0],
            });
            return this.intervensiRepo.findOne({ where: { id: intervensi_id } });
        }
        catch (error) {
            this.logger.error(`Failed to evaluate intervention: ${error.message}`);
            throw error;
        }
    }
    async getIntervensi(filters) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get interventions: ${error.message}`);
            throw error;
        }
    }
    async recordPerkembangan(referral_id, student_id, student_name, counselor_id, evaluasi) {
        try {
            const scores = [
                evaluasi.perilaku_skor,
                evaluasi.akademik_skor,
                evaluasi.emosi_skor,
                evaluasi.kehadiran_skor,
            ].filter((s) => s !== undefined);
            const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
            const status_keseluruhan = avgScore >= 4 ? 'improving' : avgScore >= 2.5 ? 'stable' : 'declining';
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
        }
        catch (error) {
            this.logger.error(`Failed to record progress: ${error.message}`);
            throw error;
        }
    }
    async getPerkembangan(filters) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get progress records: ${error.message}`);
            throw error;
        }
    }
    async createTarget(dto) {
        try {
            const targetData = {
                target_description: `${dto.area_target}: ${dto.target_spesifik}`,
                target_date: new Date(dto.tanggal_target),
                status: 'pending',
                guidance_case_id: this.generateUUID(),
                progress_percentage: 0,
            };
            const target = this.targetRepo.create(targetData);
            return this.targetRepo.save(target);
        }
        catch (error) {
            this.logger.error(`Failed to create target: ${error.message}`);
            throw error;
        }
    }
    async getTarget(filters) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get targets: ${error.message}`);
            throw error;
        }
    }
    async getStudentStatus(student_id, tahun) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get student status: ${error.message}`);
            throw error;
        }
    }
    async getAllStatuses(filters) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get all statuses: ${error.message}`);
            throw error;
        }
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    async updateStatus(student_id, tahun) {
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
            }
            else {
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
        }
        catch (error) {
            this.logger.error(`Failed to update status: ${error.message}`);
        }
    }
    isReferralNeeded(note) {
        if (note.memerlukan_tindakan === true)
            return true;
        if (note.id && note.student_id && (note.isi_catat || note.keterangan)) {
            return true;
        }
        return false;
    }
    determineRiskLevel(note) {
        const content = (note.isi_catat || '').toLowerCase();
        if (content.includes('kritik') ||
            content.includes('putus sekolah') ||
            content.includes('kekerasan') ||
            note.jenis_catat === 'risiko_putus_sekolah') {
            return 'critical';
        }
        if (content.includes('masalah') ||
            content.includes('kesulitan') ||
            note.jenis_catat === 'masalah_sosial') {
            return 'high';
        }
        if (content.includes('perlu diskusi') ||
            content.includes('follow-up') ||
            note.jenis_catat === 'observasi_umum') {
            return 'medium';
        }
        return 'low';
    }
    formatDate(date) {
        if (typeof date === 'string') {
            return date.split('T')[0];
        }
        return date.toISOString().split('T')[0];
    }
};
exports.BimbinganService = BimbinganService;
exports.BimbinganService = BimbinganService = BimbinganService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganReferral)),
    __param(2, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganSesi)),
    __param(3, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganCatat)),
    __param(4, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganIntervensi)),
    __param(5, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganPerkembangan)),
    __param(6, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganAbility)),
    __param(7, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganTarget)),
    __param(8, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganStatus)),
    __param(9, (0, typeorm_1.InjectRepository)(bimbingan_entity_1.BimbinganStatistik)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        walas_api_client_1.WalasApiClient])
], BimbinganService);
//# sourceMappingURL=bimbingan.service.js.map