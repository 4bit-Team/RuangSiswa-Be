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
    await pdfParser.load();
    console.log('PDF loaded successfully');
    const textResult = await pdfParser.getText();
    console.log('Text result type:', typeof textResult);
    console.log('Text result is object?', typeof textResult === 'object');
    const text = textResult?.text || '';
    console.log('Text extracted, length:', text?.length || 0);
    console.log('First 200 chars:', typeof text === 'string' ? text.substring(0, 200) : 'N/A');
    const info = await pdfParser.getInfo();
    console.log('PDF info total:', info?.total);
    const result = {
        text,
        numpages: info?.total || 0,
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
            const pointsData = this.extractPointsData(text);
            const points = pointsData.points;
            const pointsPerPage = pointsData.pointsPerPage;
            if (points.length === 0) {
                throw new common_1.BadRequestException('Tidak ada data poin pelanggaran yang berhasil diekstrak dari halaman manapun');
            }
            this.logger.log(`Extracted ${points.length} points`);
            return {
                tahun_point,
                points,
                validation: headerValidation,
                debugLog: {
                    pointsPerPage,
                    totalExtracted: points.length,
                },
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
        let pointsPerPage = {};
        try {
            const lines = text.split('\n').map((line) => line.trim());
            console.log('=== EXTRACTING POINTS DATA ===');
            console.log(`Total lines to process: ${lines.length}`);
            const categoryMap = {
                'A': 'Keterlambatan',
                'B': 'Kehadiran',
                'C': 'Pakaian',
                'D': 'Kepribadian',
                'E': 'Ketertiban',
                'F': 'Merokok',
                'G': 'Pornografi',
                'H': 'Senjata Tajam',
                'I': 'Narkoba',
                'J': 'Berkelahi',
                'K': 'Intimidasi',
            };
            let currentCategory = 'Umum';
            let currentPage = 1;
            let lastCategoryChangeAt = 0;
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                if (!line || line.length < 2)
                    continue;
                if (line.includes('DAFTAR KREDIT POIN PELANGGARAN') && lineIndex > 100) {
                    currentPage++;
                    console.log(`\n📄 Detected new page: Page ${currentPage}`);
                    continue;
                }
                const categoryHeaderMatch = line.match(/^([A-K])\.\s*([A-Z\/\-\s]+)$/);
                if (categoryHeaderMatch) {
                    const catKey = categoryHeaderMatch[1];
                    currentCategory = categoryMap[catKey] || 'Umum';
                    lastCategoryChangeAt = lineIndex;
                    console.log(`✓ Page ${currentPage} | Found category: ${categoryHeaderMatch[0]} => ${currentCategory}`);
                    continue;
                }
                const hasCategoryCode = /[A-K]\.\d+(?:\.\d+)*/g.test(line);
                if (hasCategoryCode) {
                    const codeMatch = line.match(/([A-K]\.\d+(?:\.\d+)*)/);
                    if (!codeMatch)
                        continue;
                    const kode = codeMatch[1];
                    const bobotMatch = line.match(/\s([\d]+)(?:\s*\+\s*([a-z&\s()]+))?(?:\s*\([^)]*\))?$/i);
                    if (!bobotMatch) {
                        continue;
                    }
                    const bobotStr = (bobotMatch[1] ?? '0');
                    const flagStr = line.substring(bobotMatch.index ?? 0).toLowerCase();
                    const bobot = parseInt(bobotStr, 10);
                    let jenis = line;
                    jenis = jenis.replace(/^(?:\d+(?:\.\d+)*\.?\s+)/, '');
                    jenis = jenis.replace(/\s+[A-K]\.\d+(?:\.\d+)*.*$/, '');
                    jenis = jenis.trim();
                    if (jenis && bobot > 0) {
                        const isSanksi = flagStr.includes('sanksi');
                        const isDo = flagStr.includes('do');
                        let sanksiValue = undefined;
                        if (isDo) {
                            sanksiValue = 'DO';
                        }
                        else if (isSanksi) {
                            sanksiValue = 'Sanksi';
                        }
                        points.push({
                            kode,
                            jenis_pelanggaran: jenis,
                            category_point: currentCategory,
                            bobot,
                            sanksi: sanksiValue,
                            deskripsi: `${currentCategory}: ${jenis}`,
                        });
                        if (!pointsPerPage[currentPage]) {
                            pointsPerPage[currentPage] = 0;
                        }
                        pointsPerPage[currentPage]++;
                        const flagInfo = sanksiValue ? `| sanksi=${sanksiValue}` : '';
                        console.log(`✅ Page ${currentPage} | Extracted: ${kode} | ${jenis} | ${bobot} ${flagInfo} (${currentCategory})`);
                        this.logger.debug(`Page ${currentPage} | Extracted: ${kode} | ${jenis} | ${bobot} (${currentCategory})`);
                    }
                }
            }
            console.log('\n=== EXTRACTION SUMMARY ===');
            console.log(`Total points extracted: ${points.length}`);
            console.log('Points per page:');
            Object.keys(pointsPerPage).forEach((page) => {
                console.log(`  Page ${page}: ${pointsPerPage[parseInt(page)]} points`);
            });
            return { points, pointsPerPage };
        }
        catch (error) {
            this.logger.error(`Error extracting points data: ${error.message}`);
            return { points, pointsPerPage };
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
};
exports.PointPelanggaranPdfService = PointPelanggaranPdfService;
exports.PointPelanggaranPdfService = PointPelanggaranPdfService = PointPelanggaranPdfService_1 = __decorate([
    (0, common_1.Injectable)()
], PointPelanggaranPdfService);
//# sourceMappingURL=point-pelanggaran-pdf.service.js.map