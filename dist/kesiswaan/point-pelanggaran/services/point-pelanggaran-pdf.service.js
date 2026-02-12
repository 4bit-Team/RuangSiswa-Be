"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PointPelanggaranPdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointPelanggaranPdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse;
const pdfParse = async (buffer) => {
    const uint8Array = new Uint8Array(buffer);
    const pdfParser = new PDFParse(uint8Array);
    console.log('=== PDF-PARSE DEBUG ===');
    console.log('PDFParse instance created');
    console.log('PDFParse methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(pdfParser)));
    await pdfParser.load();
    console.log('PDF loaded successfully');
    const text = await pdfParser.getText();
    console.log('Text extracted, length:', text?.length || 0);
    console.log('Text type:', typeof text);
    console.log('Text is array?', Array.isArray(text));
    console.log('Text content sample:', JSON.stringify(text));
    console.log('First 200 chars:', typeof text === 'string' ? text.substring(0, 200) : 'N/A (not a string)');
    const info = await pdfParser.getInfo();
    console.log('PDF info:', info);
    console.log('Number of pages:', info?.pages || 0);
    const result = {
        text,
        numpages: info?.pages || 0,
        info,
    };
    console.log('Returning result:', { numpages: result.numpages, textLength: result.text?.length });
    return result;
};
let PointPelanggaranPdfService = PointPelanggaranPdfService_1 = class PointPelanggaranPdfService {
    logger = new common_1.Logger(PointPelanggaranPdfService_1.name);
    async extractPointsFromPdf(fileBuffer) {
        try {
            this.logger.log('Starting PDF extraction...');
            const pdfData = await pdfParse(fileBuffer);
            const text = pdfData.text;
            this.logger.debug(`PDF extracted with ${pdfData.numpages} pages`);
            const headerValidation = this.validatePdfHeader(text);
            if (!headerValidation.isValid) {
                throw new common_1.BadRequestException(`PDF validation failed: ${headerValidation.errors.join(', ')}`);
            }
            const tahun_point = this.extractYearFromPdf(text);
            if (!tahun_point) {
                throw new common_1.BadRequestException('Tidak dapat menemukan tahun ajaran di halaman 1. Format yang diharapkan: "SMKN 1 Cbn-CabDin.Wil 1/2023"');
            }
            this.logger.log(`Extracted tahun_point: ${tahun_point}`);
            const points = this.extractPointsData(text);
            if (points.length === 0) {
                throw new common_1.BadRequestException('Tidak ada data poin pelanggaran yang berhasil diekstrak dari halaman 4-5');
            }
            this.logger.log(`Extracted ${points.length} points`);
            return {
                tahun_point,
                points,
                validation: headerValidation,
            };
        }
        catch (error) {
            this.logger.error(`Error extracting PDF: ${error.message}`);
            throw error;
        }
    }
    validatePdfHeader(text) {
        const errors = [];
        let header_found = false;
        if (text.includes('DAFTAR KREDIT POIN PELANGGARAN SISWA') &&
            text.includes('CIBINONG')) {
            header_found = true;
        }
        else {
            errors.push('Header tidak ditemukan. Pastikan PDF berisi "DAFTAR KREDIT POIN PELANGGARAN SISWA SMK NEGERI 1 CIBINONG"');
        }
        return {
            isValid: header_found,
            header_found,
            errors,
        };
    }
    extractYearFromPdf(text) {
        try {
            const yearMatch = text.match(/(\d{1,2})\/(\d{4})/);
            if (yearMatch && yearMatch[2]) {
                const year = parseInt(yearMatch[2]);
                if (year >= 2020 && year <= 2099) {
                    return year;
                }
            }
            const fallbackMatch = text.match(/\b(20\d{2})\b/);
            if (fallbackMatch && fallbackMatch[1]) {
                return parseInt(fallbackMatch[1]);
            }
            return null;
        }
        catch (error) {
            this.logger.warn(`Error extracting year: ${error.message}`);
            return null;
        }
    }
    extractPointsData(text) {
        const points = [];
        try {
            const lines = text.split('\n').map((line) => line.trim());
            const categories = {
                keterlambatan: 'Keterlambatan',
                kehadiran: 'Kehadiran',
                pakaian: 'Pakaian',
                kepribadian: 'Kepribadian',
                ketertiban: 'Ketertiban',
                kesehatan: 'Kesehatan',
                keterampilan: 'Keterampilan',
            };
            let currentCategory = 'Umum';
            let lineIndex = 0;
            const codeMap = new Map();
            let nextCodeNumber = 1;
            for (lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                if (!line || line.length < 2)
                    continue;
                for (const [key, value] of Object.entries(categories)) {
                    if (line.toUpperCase().includes(key.toUpperCase())) {
                        currentCategory = value;
                        break;
                    }
                }
                const codePattern = /^[A-Z](\.\d+)*/i;
                const bobotPattern = /\d+(\+sanksi|\+do)?/i;
                if (codePattern.test(line.split(/\s+/)[0] || '')) {
                    try {
                        const parts = line.split(/\s+\|\s+|\t+/);
                        if (parts.length >= 2) {
                            const kode = parts[0]?.trim();
                            const jenis = parts[1]?.trim();
                            const bobotStr = parts[2]?.trim();
                            if (kode && jenis && bobotStr) {
                                const bobot = this.parseBobotValue(bobotStr);
                                const isSanksi = bobotStr.toLowerCase().includes('sanksi');
                                const isDo = bobotStr.toLowerCase().includes('do');
                                if (bobot > 0) {
                                    const kodeNumber = this.convertKodeToNumber(kode, codeMap, nextCodeNumber);
                                    nextCodeNumber = kodeNumber + 1;
                                    points.push({
                                        kode,
                                        jenis_pelanggaran: jenis,
                                        category_point: currentCategory,
                                        bobot,
                                        sanksi: isSanksi ? 'Ya' : undefined,
                                        deskripsi: `Pelanggaran: ${jenis}`,
                                    });
                                    this.logger.debug(`Extracted: ${kode} | ${jenis} | ${bobot} (${currentCategory})`);
                                }
                            }
                        }
                    }
                    catch (e) {
                        this.logger.warn(`Error parsing line: ${line}`);
                    }
                }
            }
            return points;
        }
        catch (error) {
            this.logger.error(`Error extracting points data: ${error.message}`);
            return [];
        }
    }
    parseBobotValue(bobotStr) {
        try {
            const match = bobotStr.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }
        catch (error) {
            return 0;
        }
    }
    convertKodeToNumber(kode, codeMap, nextNumber) {
        if (!codeMap.has(kode)) {
            codeMap.set(kode, nextNumber);
        }
        return codeMap.get(kode) || nextNumber;
    }
};
exports.PointPelanggaranPdfService = PointPelanggaranPdfService;
exports.PointPelanggaranPdfService = PointPelanggaranPdfService = PointPelanggaranPdfService_1 = __decorate([
    (0, common_1.Injectable)()
], PointPelanggaranPdfService);
//# sourceMappingURL=point-pelanggaran-pdf.service.js.map