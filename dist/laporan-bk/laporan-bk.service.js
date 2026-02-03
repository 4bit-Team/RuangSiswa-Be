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
exports.LaporanBkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const laporan_bk_entity_1 = require("./entities/laporan-bk.entity");
const laporan_bk_excel_service_1 = require("./laporan-bk-excel.service");
const path = __importStar(require("path"));
let LaporanBkService = class LaporanBkService {
    laporanBkRepo;
    excelService;
    constructor(laporanBkRepo, excelService) {
        this.laporanBkRepo = laporanBkRepo;
        this.excelService = excelService;
    }
    async create(createLaporanBkDto) {
        const laporanBk = this.laporanBkRepo.create(createLaporanBkDto);
        if (createLaporanBkDto.jurusanId) {
            laporanBk.jurusan = { id: createLaporanBkDto.jurusanId };
        }
        if (createLaporanBkDto.kelasId) {
            laporanBk.kelas = { id: createLaporanBkDto.kelasId };
        }
        if (createLaporanBkDto.guruBkYangMenanganiId) {
            laporanBk.guruBkYangMenanganis = { id: createLaporanBkDto.guruBkYangMenanganiId };
        }
        return this.laporanBkRepo.save(laporanBk);
    }
    async findAll() {
        return this.laporanBkRepo.find({
            relations: ['jurusan', 'kelas', 'guruBkYangMenanganis'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const laporanBk = await this.laporanBkRepo.findOne({
            where: { id },
            relations: ['jurusan', 'kelas', 'guruBkYangMenanganis'],
        });
        if (!laporanBk) {
            throw new common_1.NotFoundException(`Laporan BK dengan ID ${id} tidak ditemukan`);
        }
        return laporanBk;
    }
    async update(id, updateLaporanBkDto) {
        const laporanBk = await this.findOne(id);
        if (updateLaporanBkDto.jurusanId) {
            laporanBk.jurusan = { id: updateLaporanBkDto.jurusanId };
        }
        if (updateLaporanBkDto.kelasId) {
            laporanBk.kelas = { id: updateLaporanBkDto.kelasId };
        }
        if (updateLaporanBkDto.guruBkYangMenanganiId) {
            laporanBk.guruBkYangMenanganis = { id: updateLaporanBkDto.guruBkYangMenanganiId };
        }
        Object.assign(laporanBk, updateLaporanBkDto);
        return this.laporanBkRepo.save(laporanBk);
    }
    async remove(id) {
        const laporanBk = await this.findOne(id);
        return this.laporanBkRepo.remove(laporanBk);
    }
    async exportToExcel() {
        const data = await this.findAll();
        if (data.length === 0) {
            throw new common_1.BadRequestException('Tidak ada data untuk di-export');
        }
        const filePath = await this.excelService.exportToExcel(data);
        const fileName = path.basename(filePath);
        return { filePath, fileName };
    }
    async generateTemplate() {
        const filePath = await this.excelService.createTemplateFile();
        const fileName = path.basename(filePath);
        return { filePath, fileName };
    }
    async importFromExcel(filePath) {
        try {
            const data = await this.excelService.importFromExcel(filePath);
            if (!data || data.length === 0) {
                throw new common_1.BadRequestException('File Excel tidak memiliki data');
            }
            let success = 0;
            let failed = 0;
            const errors = [];
            for (let i = 0; i < data.length; i++) {
                try {
                    const row = data[i];
                    if (!row.namaKonseling) {
                        continue;
                    }
                    await this.create(row);
                    success++;
                }
                catch (error) {
                    failed++;
                    errors.push({
                        row: i + 2,
                        error: error.message,
                    });
                }
            }
            return { success, failed, errors };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error importing Excel: ${error.message}`);
        }
    }
};
exports.LaporanBkService = LaporanBkService;
exports.LaporanBkService = LaporanBkService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(laporan_bk_entity_1.LaporanBk)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        laporan_bk_excel_service_1.LaporanBkExcelService])
], LaporanBkService);
//# sourceMappingURL=laporan-bk.service.js.map