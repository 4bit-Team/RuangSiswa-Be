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
    logger = new common_1.Logger(BimbinganService_1.name);
    constructor(categoryRepo, referralRepo, sesiRepo, catatRepo, intervensiRepo, perkembanganRepo, abilityRepo, targetRepo, statusRepo, statistikRepo) {
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
    }
    async createReferral(dto) {
        try {
            const referral = this.referralRepo.create({
                ...dto,
                referral_source: typeof dto.referral_source === 'object' ? JSON.stringify(dto.referral_source) : dto.referral_source,
                status: 'pending',
                referral_date: new Date().toISOString().split('T')[0],
            });
            const saved = await this.referralRepo.save(referral);
            const result = Array.isArray(saved) ? saved[0] : saved;
            await this.updateStatus(dto.student_id, dto.tahun);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to create referral: ${error.message}`);
            throw error;
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
            const sesi = this.sesiRepo.create({
                ...dto,
                sesi_ke: count + 1,
                status: 'scheduled',
            });
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
            const catat = this.catatRepo.create({
                ...dto,
                status: 'confidential',
            });
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
            const intervensi = this.intervensiRepo.create({
                ...dto,
                status: 'ongoing',
            });
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
            const perkembangan = this.perkembanganRepo.create({
                referral_id,
                student_id,
                student_name,
                counselor_id,
                tanggal_evaluasi: new Date().toISOString().split('T')[0],
                status_keseluruhan,
                ...evaluasi,
            });
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
            const target = this.targetRepo.create({
                ...dto,
                status: 'active',
            });
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
                    current_risk_level: 'yellow',
                });
            }
            else {
                status.status = 'referred';
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
        typeorm_2.Repository])
], BimbinganService);
//# sourceMappingURL=bimbingan.service.js.map