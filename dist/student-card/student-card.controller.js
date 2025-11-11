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
exports.StudentCardController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const student_card_service_1 = require("./student-card.service");
const create_student_card_dto_1 = require("./dto/create-student-card.dto");
const update_student_card_dto_1 = require("./dto/update-student-card.dto");
const users_service_1 = require("../users/users.service");
const kelas_service_1 = require("../kelas/kelas.service");
const jurusan_service_1 = require("../jurusan/jurusan.service");
const student_card_validation_service_1 = require("../student-card-validation/student-card-validation.service");
let StudentCardController = class StudentCardController {
    cardService;
    cardValidator;
    usersService;
    kelasService;
    jurusanService;
    constructor(cardService, cardValidator, usersService, kelasService, jurusanService) {
        this.cardService = cardService;
        this.cardValidator = cardValidator;
        this.usersService = usersService;
        this.kelasService = kelasService;
        this.jurusanService = jurusanService;
    }
    async uploadCard(file, userId, kelasId, jurusanId) {
        if (!file)
            throw new common_1.BadRequestException('File kartu pelajar wajib diunggah');
        if (!userId)
            throw new common_1.BadRequestException('userId wajib dikirim');
        if (!kelasId)
            throw new common_1.BadRequestException('kelas wajib dikirim');
        if (!jurusanId)
            throw new common_1.BadRequestException('jurusan wajib dikirim');
        const kelasData = await this.kelasService.findOne(kelasId);
        const jurusanData = await this.jurusanService.findOne(jurusanId);
        if (!kelasData || !jurusanData) {
            throw new common_1.BadRequestException('Kelas atau jurusan tidak ditemukan di database');
        }
        const extractedData = await this.cardValidator.validate(file.path, kelasData.nama, jurusanData.kode);
        if (!extractedData.validasi?.kelas || !extractedData.validasi?.jurusan) {
            return {
                message: '❌ Kelas/jurusan pada kartu pelajar tidak sesuai dengan data registrasi. Mohon upload ulang.',
                file: file.filename,
                extractedData,
                card: null,
            };
        }
        const card = await this.cardService.create({
            userId,
            file_path: file.path,
            extracted_data: extractedData,
        });
        await this.usersService.updateStatus(userId, 'aktif');
        return {
            message: 'Kartu pelajar berhasil diunggah dan diproses',
            file: file.filename,
            extractedData,
            card,
        };
    }
    create(createDto) {
        return this.cardService.create(createDto);
    }
    findAll() {
        return this.cardService.findAll();
    }
    findOne(id) {
        return this.cardService.findOne(+id);
    }
    update(id, updateDto) {
        return this.cardService.update(+id, updateDto);
    }
    remove(id) {
        return this.cardService.remove(+id);
    }
};
exports.StudentCardController = StudentCardController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('kartu_pelajar', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/student-cards',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, unique + (0, path_1.extname)(file.originalname));
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                cb(new common_1.BadRequestException('Hanya file gambar yang diizinkan!'), false);
            }
            else
                cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('kelas')),
    __param(3, (0, common_1.Body)('jurusan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], StudentCardController.prototype, "uploadCard", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_card_dto_1.CreateStudentCardDto]),
    __metadata("design:returntype", void 0)
], StudentCardController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentCardController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentCardController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_card_dto_1.UpdateStudentCardDto]),
    __metadata("design:returntype", void 0)
], StudentCardController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentCardController.prototype, "remove", null);
exports.StudentCardController = StudentCardController = __decorate([
    (0, common_1.Controller)('student-card'),
    __metadata("design:paramtypes", [student_card_service_1.StudentCardService,
        student_card_validation_service_1.StudentCardValidationService,
        users_service_1.UsersService,
        kelas_service_1.KelasService,
        jurusan_service_1.JurusanService])
], StudentCardController);
//# sourceMappingURL=student-card.controller.js.map