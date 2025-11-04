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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCardValidationService = void 0;
const common_1 = require("@nestjs/common");
const Tesseract = __importStar(require("tesseract.js"));
const fs = __importStar(require("fs"));
let StudentCardValidationService = class StudentCardValidationService {
    async validate(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new common_1.BadRequestException('❌ File kartu pelajar tidak ditemukan di server.');
        }
        try {
            console.log(`🔍 [OCR] Memulai pembacaan file: ${filePath}`);
            const { data: { text }, } = await Tesseract.recognize(filePath, 'ind+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        process.stdout.write(`🧠 OCR Progress: ${(m.progress * 100).toFixed(0)}%\r`);
                    }
                },
            });
            console.log('\n🧾 [OCR Result Raw Text]:\n', text);
            const expectedHeadline = 'SEKOLAH MENENGAH KEJURUAN NEGERI 1 CIBINONG';
            if (!text.toUpperCase().includes(expectedHeadline)) {
                throw new common_1.BadRequestException('⚠️ Gagal validasi: Kartu pelajar bukan dari SMKN 1 Cibinong.');
            }
            const namaMatch = text.match(/NAMA\s*[:\-]?\s*([A-Za-z\s]+)/i);
            const nisMatch = text.match(/NIS(?:\/NISN)?\s*[:\-]?\s*([\d\/\s]+)/i);
            const ttlMatch = text.match(/T\.?T\.?L\s*[:\-]?\s*([A-Za-z\s,0-9]+)/i);
            const genderMatch = text.match(/L\s*\/\s*P\s*[:\-]?\s*(L|P)/i);
            const kelasMatch = text.match(/KELAS\s*[:\-]?\s*([A-Za-z0-9\s]+)/i);
            if (!namaMatch || !nisMatch || !ttlMatch || !genderMatch || !kelasMatch) {
                console.error('⚠️ [OCR] Regex gagal menangkap semua field');
                throw new common_1.BadRequestException('⚠️ Data kartu pelajar tidak lengkap atau teks sulit dibaca. Coba unggah ulang dengan gambar lebih jelas.');
            }
            const result = {
                nama: namaMatch[1].trim(),
                nis: nisMatch[1].trim().replace(/\s+/g, ' '),
                ttl: ttlMatch[1].trim(),
                gender: genderMatch[1].trim().toUpperCase(),
                kelas: kelasMatch[1].trim(),
            };
            console.log('✅ [OCR Extracted Data]:', result);
            return result;
        }
        catch (error) {
            console.error('❌ [OCR Error]:', error.message || error);
            throw new common_1.BadRequestException('❌ Gagal membaca data dari kartu pelajar. Pastikan gambar tajam dan teks terlihat jelas.');
        }
    }
};
exports.StudentCardValidationService = StudentCardValidationService;
exports.StudentCardValidationService = StudentCardValidationService = __decorate([
    (0, common_1.Injectable)()
], StudentCardValidationService);
//# sourceMappingURL=student-card-validation.service.js.map