"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanBkController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const laporan_bk_service_1 = require("./laporan-bk.service");
const create_laporan_bk_dto_1 = require("./dto/create-laporan-bk.dto");
const update_laporan_bk_dto_1 = require("./dto/update-laporan-bk.dto");
let LaporanBkController = class LaporanBkController {
    laporanBkService;
    constructor(laporanBkService) {
        this.laporanBkService = laporanBkService;
    }
    create(createLaporanBkDto) {
        return this.laporanBkService.create(createLaporanBkDto);
    }
    findAll() {
        return this.laporanBkService.findAll();
    }
    findOne(id) {
        return this.laporanBkService.findOne(+id);
    }
    update(id, updateLaporanBkDto) {
        return this.laporanBkService.update(+id, updateLaporanBkDto);
    }
    remove(id) {
        return this.laporanBkService.remove(+id);
    }
    async exportExcel(res) {
        try {
            const { filePath, fileName } = await this.laporanBkService.exportToExcel();
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr)
                        console.error('Error deleting temp file:', unlinkErr);
                });
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async downloadTemplate(res) {
        try {
            const { filePath, fileName } = await this.laporanBkService.generateTemplate();
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr)
                        console.error('Error deleting temp file:', unlinkErr);
                });
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async importExcel(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        try {
            const result = await this.laporanBkService.importFromExcel(file.path);
            fs.unlink(file.path, (err) => {
                if (err)
                    console.error('Error deleting temp file:', err);
            });
            return result;
        }
        catch (error) {
            fs.unlink(file.path, (err) => {
                if (err)
                    console.error('Error deleting temp file:', err);
            });
            throw error;
        }
    }
};
exports.LaporanBkController = LaporanBkController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_laporan_bk_dto_1.CreateLaporanBkDto]),
    __metadata("design:returntype", void 0)
], LaporanBkController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LaporanBkController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaporanBkController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_laporan_bk_dto_1.UpdateLaporanBkDto]),
    __metadata("design:returntype", void 0)
], LaporanBkController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaporanBkController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('export/excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('template/download'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Post)('import/excel'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = path.join(process.cwd(), 'src', '..', 'uploads', 'laporan');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + '-' + file.originalname);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/application\/(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$/)) {
                cb(new common_1.BadRequestException('Only Excel files are allowed!'), false);
            }
            else {
                cb(null, true);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LaporanBkController.prototype, "importExcel", null);
exports.LaporanBkController = LaporanBkController = __decorate([
    (0, common_1.Controller)('laporan-bk'),
    __metadata("design:paramtypes", [laporan_bk_service_1.LaporanBkService])
], LaporanBkController);
//# sourceMappingURL=laporan-bk.controller.js.map