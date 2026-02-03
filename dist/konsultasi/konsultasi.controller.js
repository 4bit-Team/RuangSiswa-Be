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
exports.KonsultasiController = void 0;
const common_1 = require("@nestjs/common");
const konsultasi_service_1 = require("./konsultasi.service");
const create_konsultasi_dto_1 = require("./dto/create-konsultasi.dto");
const update_konsultasi_dto_1 = require("./dto/update-konsultasi.dto");
const create_answer_dto_1 = require("./dto/create-answer.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
let KonsultasiController = class KonsultasiController {
    konsultasiService;
    constructor(konsultasiService) {
        this.konsultasiService = konsultasiService;
    }
    async getStatistics() {
        return this.konsultasiService.getStatistics();
    }
    async getQuestionBySlug(slug) {
        return this.konsultasiService.findOneBySlug(slug);
    }
    async getAllQuestions(category, sort = 'trending', page = 1, limit = 20, search) {
        return this.konsultasiService.findAll({
            category,
            sort,
            page,
            limit,
            search,
        });
    }
    async getQuestionDetail(id) {
        return this.konsultasiService.findOneWithAnswers(id);
    }
    async createQuestion(createKonsultasiDto, req) {
        return this.konsultasiService.create(createKonsultasiDto, req.user.id);
    }
    async updateQuestion(id, updateKonsultasiDto, req) {
        return this.konsultasiService.update(id, updateKonsultasiDto, req.user.id);
    }
    async deleteQuestion(id, req) {
        return this.konsultasiService.delete(id, req.user.id);
    }
    async voteQuestion(id, { vote }, req) {
        return this.konsultasiService.voteQuestion(id, req.user.id, vote);
    }
    async addAnswer(questionId, createAnswerDto, req) {
        return this.konsultasiService.addAnswer(questionId, createAnswerDto, req.user.id);
    }
    async voteAnswer(questionId, answerId, { vote }, req) {
        return this.konsultasiService.voteAnswer(questionId, answerId, req.user.id, vote);
    }
    async verifyAnswer(questionId, answerId, req) {
        return this.konsultasiService.verifyAnswer(questionId, answerId, req.user.id);
    }
    async filterToxic(id) {
        return this.konsultasiService.applyToxicFilter(id);
    }
    async bookmarkQuestion(questionId, req) {
        return this.konsultasiService.bookmarkQuestion(questionId, req.user.id);
    }
    async removeBookmark(questionId, req) {
        return this.konsultasiService.removeBookmark(questionId, req.user.id);
    }
    async getUserBookmarks(req) {
        return this.konsultasiService.getUserBookmarks(req.user.id);
    }
    async isBookmarked(questionId, req) {
        return this.konsultasiService.isBookmarked(questionId, req.user.id);
    }
};
exports.KonsultasiController = KonsultasiController;
__decorate([
    (0, common_1.Get)('statistics/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "getQuestionBySlug", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('sort')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "getAllQuestions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "getQuestionDetail", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('siswa', 'bk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_konsultasi_dto_1.CreateKonsultasiDto, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('siswa', 'bk', 'admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_konsultasi_dto_1.UpdateKonsultasiDto, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('siswa', 'bk', 'admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Post)(':id/vote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "voteQuestion", null);
__decorate([
    (0, common_1.Post)(':id/answers'),
    (0, roles_decorator_1.Roles)('siswa', 'bk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_answer_dto_1.CreateAnswerDto, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "addAnswer", null);
__decorate([
    (0, common_1.Post)(':questionId/answers/:answerId/vote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('questionId')),
    __param(1, (0, common_1.Param)('answerId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "voteAnswer", null);
__decorate([
    (0, common_1.Put)(':questionId/answers/:answerId/verify'),
    (0, roles_decorator_1.Roles)('bk', 'admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('questionId')),
    __param(1, (0, common_1.Param)('answerId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "verifyAnswer", null);
__decorate([
    (0, common_1.Post)(':id/filter-toxic'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "filterToxic", null);
__decorate([
    (0, common_1.Post)(':id/bookmark'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "bookmarkQuestion", null);
__decorate([
    (0, common_1.Delete)(':id/bookmark'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "removeBookmark", null);
__decorate([
    (0, common_1.Get)('user/bookmarks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "getUserBookmarks", null);
__decorate([
    (0, common_1.Get)(':id/is-bookmarked'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KonsultasiController.prototype, "isBookmarked", null);
exports.KonsultasiController = KonsultasiController = __decorate([
    (0, common_1.Controller)('v1/konsultasi'),
    __metadata("design:paramtypes", [konsultasi_service_1.KonsultasiService])
], KonsultasiController);
//# sourceMappingURL=konsultasi.controller.js.map