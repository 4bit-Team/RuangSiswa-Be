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
exports.KeterlambatanController = void 0;
const common_1 = require("@nestjs/common");
const keterlambatan_service_1 = require("./keterlambatan.service");
const keterlambatan_dto_1 = require("./dto/keterlambatan.dto");
let KeterlambatanController = class KeterlambatanController {
    keterlambatanService;
    constructor(keterlambatanService) {
        this.keterlambatanService = keterlambatanService;
    }
    async syncFromWalas(startDate, endDate) {
        return await this.keterlambatanService.syncFromWalas(startDate, endDate);
    }
    async findAll(startDate, endDate, studentId, className, status, page, limit) {
        const filterDto = {
            startDate,
            endDate,
            studentId,
            className,
            status,
            page: page || 1,
            limit: limit || 50,
        };
        return await this.keterlambatanService.findAll(filterDto);
    }
    async findByStudent(studentId, startDate, endDate, status, page, limit) {
        const filterDto = {
            startDate,
            endDate,
            status,
            page: page || 1,
            limit: limit || 50,
        };
        return await this.keterlambatanService.findByStudent(studentId, filterDto);
    }
    async findByClass(className, startDate, endDate, status, page, limit) {
        const filterDto = {
            startDate,
            endDate,
            status,
            page: page || 1,
            limit: limit || 50,
        };
        return await this.keterlambatanService.findByClass(className, filterDto);
    }
    async getStatistics(startDate, endDate, studentId, className) {
        const filterDto = {
            startDate,
            endDate,
            studentId,
            className,
        };
        return await this.keterlambatanService.getStatistics(filterDto);
    }
    async findOne(id) {
        return await this.keterlambatanService.findOne(id);
    }
    async create(createKeterlambatanDto) {
        return await this.keterlambatanService.create(createKeterlambatanDto);
    }
    async update(id, updateKeterlambatanDto) {
        return await this.keterlambatanService.update(id, updateKeterlambatanDto);
    }
    async delete(id) {
        await this.keterlambatanService.delete(id);
    }
};
exports.KeterlambatanController = KeterlambatanController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "syncFromWalas", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('student_id', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('class_name')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(6, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('class/:className'),
    __param(0, (0, common_1.Param)('className')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "findByClass", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('student_id', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('class_name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keterlambatan_dto_1.CreateKeterlambatanDto]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, keterlambatan_dto_1.UpdateKeterlambatanDto]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], KeterlambatanController.prototype, "delete", null);
exports.KeterlambatanController = KeterlambatanController = __decorate([
    (0, common_1.Controller)('keterlambatan'),
    __metadata("design:paramtypes", [keterlambatan_service_1.KeterlambatanService])
], KeterlambatanController);
//# sourceMappingURL=keterlambatan.controller.js.map