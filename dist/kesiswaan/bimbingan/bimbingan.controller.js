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
var BimbinganController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BimbinganController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bimbingan_service_1 = require("./bimbingan.service");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let BimbinganController = BimbinganController_1 = class BimbinganController {
    bimbinganService;
    logger = new common_1.Logger(BimbinganController_1.name);
    constructor(bimbinganService) {
        this.bimbinganService = bimbinganService;
    }
    async createReferral(dto, user) {
        try {
            const referral = await this.bimbinganService.createReferral({
                student_id: dto.student_id,
                student_name: dto.student_name,
                class_id: dto.class_id,
                tahun: dto.tahun || new Date().getFullYear(),
                referral_reason: dto.referral_reason,
                risk_level: dto.risk_level || 'yellow',
                referral_source: dto.referral_source,
                notes: dto.notes,
            });
            return {
                success: true,
                message: 'Referral created successfully',
                data: referral,
            };
        }
        catch (error) {
            this.logger.error(`Error creating referral: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to create referral',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getReferrals(student_id, counselor_id, status, risk_level, tahun, page, limit) {
        try {
            const result = await this.bimbinganService.getReferrals({
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                counselor_id,
                status,
                risk_level,
                tahun: tahun ? parseInt(tahun.toString()) : undefined,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Referrals retrieved',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    pages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting referrals: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get referrals',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async assignCounselor(referralId, dto, user) {
        try {
            const referral = await this.bimbinganService.assignCounselor(referralId, dto.counselor_id || user.id, dto.counselor_name || user.name);
            return {
                success: true,
                message: 'Counselor assigned successfully',
                data: referral,
            };
        }
        catch (error) {
            this.logger.error(`Error assigning counselor: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to assign counselor',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async syncGuidanceFromWalas(body) {
        try {
            const result = await this.bimbinganService.syncGuidanceFromWalas(new Date(body.start_date), new Date(body.end_date), body.force_sync || false);
            return {
                success: result.success,
                message: result.success
                    ? 'Guidance sync completed successfully'
                    : 'Guidance sync completed with errors',
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Error during sync: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to sync guidance',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createSesi(dto, user) {
        try {
            const sesi = await this.bimbinganService.createSesi({
                referral_id: dto.referral_id,
                student_id: dto.student_id,
                student_name: dto.student_name,
                counselor_id: dto.counselor_id || user.id,
                counselor_name: dto.counselor_name || user.name,
                tanggal_sesi: dto.tanggal_sesi,
                jam_sesi: dto.jam_sesi,
                topik_pembahasan: dto.topik_pembahasan,
                lokasi: dto.lokasi,
            });
            return {
                success: true,
                message: 'Session scheduled successfully',
                data: sesi,
            };
        }
        catch (error) {
            this.logger.error(`Error creating session: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to create session',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSesi(referral_id, student_id, counselor_id, status, page, limit) {
        try {
            const result = await this.bimbinganService.getSesi({
                referral_id,
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                counselor_id,
                status,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Sessions retrieved',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    pages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting sessions: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get sessions',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async completeSesi(sesiId, dto) {
        try {
            const sesi = await this.bimbinganService.completeSesi(sesiId, dto.siswa_hadir || false, dto.orang_tua_hadir || false, dto.hasil_akhir, dto.follow_up_status, dto.follow_up_date);
            return {
                success: true,
                message: 'Session marked as completed',
                data: sesi,
            };
        }
        catch (error) {
            this.logger.error(`Error completing session: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to complete session',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async addCatat(dto, user) {
        try {
            const catat = await this.bimbinganService.addCatat({
                referral_id: dto.referral_id,
                student_id: dto.student_id,
                student_name: dto.student_name,
                counselor_id: dto.counselor_id || user.id,
                counselor_name: dto.counselor_name || user.name,
                jenis_catat: dto.jenis_catat,
                isi_catat: dto.isi_catat,
                tanggal_catat: dto.tanggal_catat || new Date().toISOString().split('T')[0],
                memerlukan_tindakan: dto.memerlukan_tindakan,
                tindakan_lanjutan: dto.tindakan_lanjutan,
            });
            return {
                success: true,
                message: 'Case note added',
                data: catat,
            };
        }
        catch (error) {
            this.logger.error(`Error adding case note: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to add case note',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getCatat(referral_id, student_id, counselor_id, page, limit) {
        try {
            const result = await this.bimbinganService.getCatat({
                referral_id,
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                counselor_id,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Case notes retrieved',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    pages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting case notes: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get case notes',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createIntervensi(dto, user) {
        try {
            const intervensi = await this.bimbinganService.createIntervensi({
                referral_id: dto.referral_id,
                student_id: dto.student_id,
                student_name: dto.student_name,
                counselor_id: dto.counselor_id || user.id,
                counselor_name: dto.counselor_name || user.name,
                jenis_intervensi: dto.jenis_intervensi,
                deskripsi_intervensi: dto.deskripsi_intervensi,
                tanggal_intervensi: dto.tanggal_intervensi || new Date().toISOString().split('T')[0],
            });
            return {
                success: true,
                message: 'Intervention created',
                data: intervensi,
            };
        }
        catch (error) {
            this.logger.error(`Error creating intervention: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to create intervention',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getIntervensi(referral_id, student_id, status, page, limit) {
        try {
            const result = await this.bimbinganService.getIntervensi({
                referral_id,
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                status,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Interventions retrieved',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    pages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting interventions: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get interventions',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async evaluateIntervensi(intervensiId, dto) {
        try {
            const intervensi = await this.bimbinganService.evaluateIntervensi(intervensiId, dto.hasil_intervensi, dto.efektivitas);
            return {
                success: true,
                message: 'Intervention evaluated',
                data: intervensi,
            };
        }
        catch (error) {
            this.logger.error(`Error evaluating intervention: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to evaluate intervention',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async recordPerkembangan(dto, user) {
        try {
            const perkembangan = await this.bimbinganService.recordPerkembangan(dto.referral_id, dto.student_id, dto.student_name, dto.counselor_id || user.id, {
                perilaku_skor: dto.perilaku_skor,
                perilaku_catatan: dto.perilaku_catatan,
                akademik_skor: dto.akademik_skor,
                akademik_catatan: dto.akademik_catatan,
                emosi_skor: dto.emosi_skor,
                emosi_catatan: dto.emosi_catatan,
                kehadiran_skor: dto.kehadiran_skor,
                kehadiran_catatan: dto.kehadiran_catatan,
                sesi_total_dijalankan: dto.sesi_total_dijalankan,
            });
            return {
                success: true,
                message: 'Progress recorded',
                data: perkembangan,
            };
        }
        catch (error) {
            this.logger.error(`Error recording progress: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to record progress',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getPerkembangan(referral_id, student_id, page, limit) {
        try {
            const result = await this.bimbinganService.getPerkembangan({
                referral_id,
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Progress records retrieved',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    pages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting progress records: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get progress records',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createTarget(dto, user) {
        try {
            const target = await this.bimbinganService.createTarget({
                referral_id: dto.referral_id,
                student_id: dto.student_id,
                student_name: dto.student_name,
                counselor_id: dto.counselor_id || user.id,
                area_target: dto.area_target,
                target_spesifik: dto.target_spesifik,
                tanggal_mulai: dto.tanggal_mulai || new Date().toISOString().split('T')[0],
                tanggal_target: dto.tanggal_target,
                strategi_pencapaian: dto.strategi_pencapaian,
            });
            return {
                success: true,
                message: 'Target created',
                data: target,
            };
        }
        catch (error) {
            this.logger.error(`Error creating target: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to create target',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getTarget(referral_id, student_id, status, page, limit) {
        try {
            const result = await this.bimbinganService.getTarget({
                referral_id,
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                status,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Targets retrieved',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    pages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting targets: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get targets',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getStudentStatus(studentId, tahun) {
        try {
            const status = await this.bimbinganService.getStudentStatus(studentId, tahun ? parseInt(tahun.toString()) : undefined);
            return {
                success: true,
                message: 'Status retrieved',
                data: status,
            };
        }
        catch (error) {
            this.logger.error(`Error getting student status: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get student status',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAllStatuses(tahun, risk_level, status, page, limit) {
        try {
            const result = await this.bimbinganService.getAllStatuses({
                tahun: tahun ? parseInt(tahun.toString()) : undefined,
                risk_level,
                status,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Statuses retrieved',
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting statuses: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get statuses',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.BimbinganController = BimbinganController;
__decorate([
    (0, common_1.Post)('referrals'),
    (0, swagger_1.ApiOperation)({ summary: 'Create guidance referral (auto or manual)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Referral created. Can be auto-triggered from violations/attendance or manual.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "createReferral", null);
__decorate([
    (0, common_1.Get)('referrals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get referrals list with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referrals retrieved' }),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('counselor_id')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('risk_level')),
    __param(4, (0, common_1.Query)('tahun')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getReferrals", null);
__decorate([
    (0, common_1.Patch)('referrals/:referralId/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign BK counselor to referral' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Counselor assigned' }),
    __param(0, (0, common_1.Param)('referralId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "assignCounselor", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Sync guidance data from Walas (case notes, etc)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "syncGuidanceFromWalas", null);
__decorate([
    (0, common_1.Post)('sesi'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule new guidance session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session scheduled' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "createSesi", null);
__decorate([
    (0, common_1.Get)('sesi'),
    (0, swagger_1.ApiOperation)({ summary: 'Get guidance sessions list' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sessions retrieved' }),
    __param(0, (0, common_1.Query)('referral_id')),
    __param(1, (0, common_1.Query)('student_id')),
    __param(2, (0, common_1.Query)('counselor_id')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getSesi", null);
__decorate([
    (0, common_1.Patch)('sesi/:sesiId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark session as completed' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session completed' }),
    __param(0, (0, common_1.Param)('sesiId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "completeSesi", null);
__decorate([
    (0, common_1.Post)('catat'),
    (0, swagger_1.ApiOperation)({ summary: 'Add case note/observation' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Case note added' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "addCatat", null);
__decorate([
    (0, common_1.Get)('catat'),
    (0, swagger_1.ApiOperation)({ summary: 'Get case notes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Case notes retrieved' }),
    __param(0, (0, common_1.Query)('referral_id')),
    __param(1, (0, common_1.Query)('student_id')),
    __param(2, (0, common_1.Query)('counselor_id')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getCatat", null);
__decorate([
    (0, common_1.Post)('intervensi'),
    (0, swagger_1.ApiOperation)({ summary: 'Create/log intervention' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Intervention created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "createIntervensi", null);
__decorate([
    (0, common_1.Get)('intervensi'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interventions list' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interventions retrieved' }),
    __param(0, (0, common_1.Query)('referral_id')),
    __param(1, (0, common_1.Query)('student_id')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getIntervensi", null);
__decorate([
    (0, common_1.Patch)('intervensi/:intervensiId/evaluate'),
    (0, swagger_1.ApiOperation)({ summary: 'Evaluate intervention effectiveness' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Intervention evaluated' }),
    __param(0, (0, common_1.Param)('intervensiId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "evaluateIntervensi", null);
__decorate([
    (0, common_1.Post)('perkembangan'),
    (0, swagger_1.ApiOperation)({ summary: 'Record student progress/development' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Progress recorded' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "recordPerkembangan", null);
__decorate([
    (0, common_1.Get)('perkembangan'),
    (0, swagger_1.ApiOperation)({ summary: 'Get progress records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Progress records retrieved' }),
    __param(0, (0, common_1.Query)('referral_id')),
    __param(1, (0, common_1.Query)('student_id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getPerkembangan", null);
__decorate([
    (0, common_1.Post)('target'),
    (0, swagger_1.ApiOperation)({ summary: 'Set guidance goal/target' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Target created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "createTarget", null);
__decorate([
    (0, common_1.Get)('target'),
    (0, swagger_1.ApiOperation)({ summary: 'Get guidance targets/goals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Targets retrieved' }),
    __param(0, (0, common_1.Query)('referral_id')),
    __param(1, (0, common_1.Query)('student_id')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getTarget", null);
__decorate([
    (0, common_1.Get)('status/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student guidance status summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status retrieved' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('tahun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getStudentStatus", null);
__decorate([
    (0, common_1.Get)('statuses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all guidance statuses with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statuses retrieved' }),
    __param(0, (0, common_1.Query)('tahun')),
    __param(1, (0, common_1.Query)('risk_level')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], BimbinganController.prototype, "getAllStatuses", null);
exports.BimbinganController = BimbinganController = BimbinganController_1 = __decorate([
    (0, swagger_1.ApiTags)('Kesiswaan - Bimbingan/Guidance'),
    (0, common_1.Controller)('v1/kesiswaan/bimbingan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [bimbingan_service_1.BimbinganService])
], BimbinganController);
//# sourceMappingURL=bimbingan.controller.js.map