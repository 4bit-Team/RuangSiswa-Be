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
var ViolationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViolationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const violations_service_1 = require("./violations.service");
const sp_pdf_service_1 = require("./sp-pdf.service");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const violation_entity_1 = require("./entities/violation.entity");
let ViolationsController = ViolationsController_1 = class ViolationsController {
    violationService;
    spPdfService;
    spLetterRepo;
    logger = new common_1.Logger(ViolationsController_1.name);
    constructor(violationService, spPdfService, spLetterRepo) {
        this.violationService = violationService;
        this.spPdfService = spPdfService;
        this.spLetterRepo = spLetterRepo;
    }
    async reportViolation(dto, user) {
        try {
            const violation = await this.violationService.reportViolation({
                ...dto,
                created_by: user.username || user.email,
            });
            const riskLevel = await this.violationService.getStudentRiskLevel(dto.student_id);
            return {
                success: true,
                message: 'Violation reported successfully',
                data: {
                    violation,
                    riskLevel,
                    spTriggered: riskLevel.sp_level > 0,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error reporting violation: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to report violation',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async syncViolationsFromWalas(body) {
        try {
            const result = await this.violationService.syncViolationsFromWalas(new Date(body.start_date), new Date(body.end_date), body.force_sync || false);
            return {
                success: result.success,
                message: result.success
                    ? 'Violations sync completed successfully'
                    : 'Violations sync completed with errors',
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Error during sync: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to sync violations',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getViolations(student_id, class_id, category_id, processed, date_from, date_to, page, limit) {
        try {
            const result = await this.violationService.getViolations({
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                class_id: class_id ? parseInt(class_id.toString()) : undefined,
                category_id,
                processed: processed ? processed === 'true' : undefined,
                date_from,
                date_to,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Violations retrieved successfully',
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
            this.logger.error(`Error getting violations: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get violations',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getStudentViolations(studentId, page, limit) {
        try {
            const result = await this.violationService.getViolations({
                student_id: studentId,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Student violations retrieved',
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
            this.logger.error(`Error getting student violations: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get student violations',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSpLetters(student_id, sp_level, tahun, status, page, limit) {
        try {
            const result = await this.violationService.getSpLetters({
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                sp_level: sp_level ? parseInt(sp_level.toString()) : undefined,
                tahun: tahun ? parseInt(tahun.toString()) : undefined,
                status,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'SP letters retrieved successfully',
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
            this.logger.error(`Error getting SP letters: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get SP letters',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSpProgression(studentId, tahun) {
        try {
            const progression = await this.violationService.getSpProgression(studentId, tahun ? parseInt(tahun.toString()) : undefined);
            const spLetters = await this.violationService.getSpLetters({
                student_id: studentId,
                tahun: tahun ? parseInt(tahun.toString()) : undefined,
            });
            return {
                success: true,
                message: 'SP progression retrieved',
                data: {
                    progression,
                    spLetters: spLetters.data,
                    timeline: this.buildProgressionTimeline(spLetters.data),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error getting SP progression: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get SP progression',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async submitExcuse(violationId, dto, user) {
        try {
            const excuse = await this.violationService.submitExcuse({
                violation_id: violationId,
                excuse_text: dto.excuse_text,
                bukti_excuse: dto.bukti_excuse,
            });
            return {
                success: true,
                message: 'Excuse submitted and pending BK review',
                data: excuse,
            };
        }
        catch (error) {
            this.logger.error(`Error submitting excuse: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to submit excuse',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getExcuses(student_id, status, is_resolved, page, limit) {
        try {
            const result = await this.violationService.getExcuses({
                student_id: student_id ? parseInt(student_id.toString()) : undefined,
                status: status || 'pending',
                is_resolved: is_resolved ? is_resolved === 'true' : false,
                page: page ? parseInt(page.toString()) : 1,
                limit: limit ? parseInt(limit.toString()) : 20,
            });
            return {
                success: true,
                message: 'Excuses retrieved',
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
            this.logger.error(`Error getting excuses: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get excuses',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async reviewExcuse(excuseId, dto, user) {
        try {
            const excuse = await this.violationService.reviewExcuse({
                excuse_id: excuseId,
                status: dto.status,
                catatan_bk: dto.catatan_bk,
                resolved_by: user.username || user.email,
            });
            return {
                success: true,
                message: `Excuse ${dto.status}`,
                data: excuse,
            };
        }
        catch (error) {
            this.logger.error(`Error reviewing excuse: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to review excuse',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getStudentRiskLevel(studentId, tahun) {
        try {
            const riskLevel = await this.violationService.getStudentRiskLevel(studentId, tahun ? parseInt(tahun.toString()) : undefined);
            return {
                success: true,
                message: 'Risk level assessed',
                data: riskLevel,
            };
        }
        catch (error) {
            this.logger.error(`Error getting risk level: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get risk level',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async exportReport(studentId, tahun) {
        try {
            const report = await this.violationService.exportReport(studentId, tahun ? parseInt(tahun.toString()) : undefined);
            return {
                success: true,
                message: 'Report exported',
                data: report,
            };
        }
        catch (error) {
            this.logger.error(`Error exporting report: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to export report',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async signSpLetter(spLetterId, dto, user) {
        try {
            const spLetter = await this.violationService.signSpLetter(spLetterId, dto.signed_by_parent || user.name);
            return {
                success: true,
                message: 'SP letter signed successfully',
                data: spLetter,
            };
        }
        catch (error) {
            this.logger.error(`Error signing SP letter: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to sign SP letter',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async exportSpPdf(spLetterId, res) {
        try {
            const spLetter = await this.spLetterRepo.findOne({
                where: { id: spLetterId },
            });
            if (!spLetter) {
                throw new common_1.HttpException('SP Letter not found', common_1.HttpStatus.NOT_FOUND);
            }
            const pdfBuffer = await this.spPdfService.generateSpPdfBuffer(spLetter);
            res.contentType('application/pdf');
            res.header('Content-Disposition', `attachment; filename="${spLetter.sp_number.replace(/\//g, '-')}.pdf"`);
            res.send(pdfBuffer);
        }
        catch (error) {
            this.logger.error(`Error exporting PDF: ${error.message}`);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to export PDF',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    buildProgressionTimeline(spLetters) {
        return spLetters
            .sort((a, b) => new Date(a.tanggal_sp).getTime() - new Date(b.tanggal_sp).getTime())
            .map((sp) => ({
            sp_level: sp.sp_level,
            sp_number: sp.sp_number,
            tanggal_sp: sp.tanggal_sp,
            status: sp.status,
            is_signed: sp.is_signed,
            consequences: sp.consequences,
        }));
    }
};
exports.ViolationsController = ViolationsController;
__decorate([
    (0, common_1.Post)('violations'),
    (0, swagger_1.ApiOperation)({ summary: 'Report new violation (by teacher/staff)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Violation reported successfully. SP auto-generated if threshold reached.',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "reportViolation", null);
__decorate([
    (0, common_1.Post)('violations/sync'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Sync violations from Walas (auto-trigger SP & referral)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "syncViolationsFromWalas", null);
__decorate([
    (0, common_1.Get)('violations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get violations list with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Violations retrieved successfully' }),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('class_id')),
    __param(2, (0, common_1.Query)('category_id')),
    __param(3, (0, common_1.Query)('processed')),
    __param(4, (0, common_1.Query)('date_from')),
    __param(5, (0, common_1.Query)('date_to')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "getViolations", null);
__decorate([
    (0, common_1.Get)('violations/student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific student violation history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student violations retrieved' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "getStudentViolations", null);
__decorate([
    (0, common_1.Get)('sp-letters'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all SP letters with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SP letters retrieved successfully' }),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('sp_level')),
    __param(2, (0, common_1.Query)('tahun')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "getSpLetters", null);
__decorate([
    (0, common_1.Get)('sp-letters/progression/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get SP progression status for student' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Progression: SP1/SP2/SP3/Expulsion',
    }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('tahun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "getSpProgression", null);
__decorate([
    (0, common_1.Post)('violations/:violationId/excuse'),
    (0, swagger_1.ApiOperation)({
        summary: 'Student submit excuse/appeal for violation',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Excuse submitted for review',
    }),
    __param(0, (0, common_1.Param)('violationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "submitExcuse", null);
__decorate([
    (0, common_1.Get)('violations/excuses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get excuses pending review (BK Staff view)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excuses retrieved' }),
    __param(0, (0, common_1.Query)('student_id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('is_resolved')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "getExcuses", null);
__decorate([
    (0, common_1.Patch)('violations/excuses/:excuseId/review'),
    (0, swagger_1.ApiOperation)({ summary: 'BK staff review and decide on excuse' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excuse reviewed' }),
    __param(0, (0, common_1.Param)('excuseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "reviewExcuse", null);
__decorate([
    (0, common_1.Get)('violations/risk/:studentId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get student risk level (green/yellow/orange/red)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Risk assessment retrieved' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('tahun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "getStudentRiskLevel", null);
__decorate([
    (0, common_1.Get)('violations/report/:studentId/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export student violation report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report exported' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('tahun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "exportReport", null);
__decorate([
    (0, common_1.Patch)('sp-letters/:spLetterId/sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign SP letter (parent/guardian)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SP letter signed' }),
    __param(0, (0, common_1.Param)('spLetterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.currentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "signSpLetter", null);
__decorate([
    (0, common_1.Post)('sp-letters/:spLetterId/export-pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and export SP letter as PDF' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF generated and returned',
    }),
    __param(0, (0, common_1.Param)('spLetterId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ViolationsController.prototype, "exportSpPdf", null);
exports.ViolationsController = ViolationsController = ViolationsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Kesiswaan - Violations & SP Letters'),
    (0, common_1.Controller)('v1/kesiswaan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(2, (0, typeorm_1.InjectRepository)(violation_entity_1.SpLetter)),
    __metadata("design:paramtypes", [violations_service_1.ViolationService,
        sp_pdf_service_1.SpPdfService,
        typeorm_2.Repository])
], ViolationsController);
//# sourceMappingURL=violations.controller.js.map