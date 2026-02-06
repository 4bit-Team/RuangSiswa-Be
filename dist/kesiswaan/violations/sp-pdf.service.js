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
var SpPdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpPdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = __importStar(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SpPdfService = SpPdfService_1 = class SpPdfService {
    logger = new common_1.Logger(SpPdfService_1.name);
    pdfStoragePath = path.join(process.cwd(), 'storage', 'sp-letters');
    constructor() {
        if (!fs.existsSync(this.pdfStoragePath)) {
            fs.mkdirSync(this.pdfStoragePath, { recursive: true });
        }
    }
    async generateSpPdf(spLetter) {
        try {
            const filename = `${spLetter.sp_number.replace(/\//g, '-')}.pdf`;
            const filepath = path.join(this.pdfStoragePath, filename);
            const doc = new PDFDocument({
                size: 'A4',
                margin: 30,
                bufferPages: true,
            });
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);
            this.drawHeader(doc, spLetter);
            this.drawStudentDetails(doc, spLetter);
            doc.moveDown(0.3);
            this.drawViolationSummary(doc, spLetter);
            doc.moveDown(0.3);
            this.drawViolationChecklist(doc, spLetter);
            doc.moveDown(0.5);
            this.drawConsequences(doc, spLetter);
            doc.moveDown(0.5);
            this.drawSignatureSection(doc, spLetter);
            this.drawFooter(doc, spLetter);
            doc.end();
            return new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    this.logger.log(`SP PDF generated: ${filename}`);
                    resolve(filename);
                });
                writeStream.on('error', (error) => {
                    this.logger.error(`Error generating SP PDF: ${error.message}`);
                    reject(error);
                });
            });
        }
        catch (error) {
            this.logger.error(`Failed to generate SP PDF: ${error.message}`);
            throw error;
        }
    }
    async generateSpPdfBuffer(spLetter) {
        try {
            return new Promise((resolve, reject) => {
                const buffers = [];
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 30,
                    bufferPages: true,
                });
                doc.on('data', (chunk) => {
                    buffers.push(chunk);
                });
                doc.on('end', () => {
                    resolve(Buffer.concat(buffers));
                });
                doc.on('error', (error) => {
                    reject(error);
                });
                this.drawHeader(doc, spLetter);
                this.drawStudentDetails(doc, spLetter);
                doc.moveDown(0.3);
                this.drawViolationSummary(doc, spLetter);
                doc.moveDown(0.3);
                this.drawViolationChecklist(doc, spLetter);
                doc.moveDown(0.5);
                this.drawConsequences(doc, spLetter);
                doc.moveDown(0.5);
                this.drawSignatureSection(doc, spLetter);
                this.drawFooter(doc, spLetter);
                doc.end();
            });
        }
        catch (error) {
            this.logger.error(`Failed to generate SP PDF buffer: ${error.message}`);
            throw error;
        }
    }
    drawHeader(doc, spLetter) {
        doc.fontSize(12).font('Helvetica-Bold').text('SEKOLAH MENENGAH KEJURUAN NEGERI 1 CIBINONG', {
            align: 'center',
            underline: true,
        });
        doc.fontSize(9).font('Helvetica').text('Jl. Industri No. 25 Cibinong, Bogor 16912', {
            align: 'center',
        });
        doc.text('Telp. (021) XXXX-XXXX | Website: smkn1cibinong.sch.id', {
            align: 'center',
        });
        doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica-Bold').text('SURAT PERJANJIAN MURID', {
            align: 'center',
        });
        const spLevelText = {
            1: 'SP 1 (Peringatan Pertama)',
            2: 'SP 2 (Peringatan Kedua)',
            3: 'SP 3 (Peringatan Ketiga/Akhir)',
        };
        doc.fontSize(11).font('Helvetica-Bold').text(spLevelText[spLetter.sp_level] || '', {
            align: 'center',
        });
        doc.fontSize(9).font('Helvetica').text(`Nomor: ${spLetter.sp_number} | Tanggal: ${spLetter.tanggal_sp}`, {
            align: 'center',
        });
        doc.moveDown(0.5);
    }
    drawStudentDetails(doc, spLetter) {
        doc.fontSize(9).font('Helvetica-Bold').text('DATA DIRI SISWA:', {
            underline: true,
        });
        const leftMargin = 45;
        const dataWidth = 200;
        doc.fontSize(8).font('Helvetica');
        const startY = doc.y;
        doc.text('Nama Siswa', leftMargin, startY);
        doc.text('NIS/NISN', leftMargin, startY + 20);
        doc.text('Kelas', leftMargin, startY + 40);
        doc.text('Kompetensi Keahlian', leftMargin, startY + 60);
        doc.text('Alamat', leftMargin, startY + 80);
        const valuesX = leftMargin + 140;
        doc.text(`: ${spLetter.student_name}`, valuesX, startY);
        doc.text(`: ${spLetter.nis || 'N/A'}`, valuesX, startY + 20);
        doc.text(`: ${spLetter.class_id || 'N/A'}`, valuesX, startY + 40);
        doc.text(`: ${spLetter.kompetensi_keahlian || 'N/A'}`, valuesX, startY + 60);
        doc.fontSize(7);
        const alamatText = spLetter.alamat_siswa || 'N/A';
        doc.text(`: `, valuesX, startY + 80);
        doc.fontSize(8);
        doc.text(alamatText, valuesX + 15, startY + 80, {
            width: 200,
            height: 40,
        });
        doc.moveDown(5);
    }
    drawViolationSummary(doc, spLetter) {
        doc.fontSize(9).font('Helvetica-Bold').text('KASUS/PELANGGARAN:', {
            underline: true,
        });
        doc.fontSize(8).font('Helvetica');
        doc.text(spLetter.violations_text, {
            width: 515,
            align: 'justify',
        });
    }
    drawViolationChecklist(doc, spLetter) {
        doc.fontSize(9).font('Helvetica-Bold').text('DAFTAR PELANGGARAN TATA TERTIB SEKOLAH:', {
            underline: true,
        });
        const violations = [
            'Terlambat kesekolah',
            'Membolos/tidak masuk sekolah tanpa keterangan',
            'Merokok di lingkungan sekolah',
            'Pakaian tidak sesuai ketentuan sekolah',
            'Rambut tidak sesuai ketentuan sekolah',
            'Tidak mengerjakan tugas/PR',
            'Tidur di kelas',
            'Berbicara/mengganggu pada saat pelajaran',
            'Mempermainkan diri terhadap guru/pegawai sekolah',
        ];
        doc.fontSize(8).font('Helvetica');
        const checkboxSize = 4;
        const boxOffset = 5;
        violations.forEach((violation, index) => {
            const y = doc.y;
            doc.rect(45, y + 1, checkboxSize, checkboxSize).stroke();
            doc.text(`${index + 1}. ${violation}`, 55, y, { width: 460 });
        });
        doc.moveDown(0.5);
    }
    drawConsequences(doc, spLetter) {
        doc.fontSize(9).font('Helvetica-Bold').text('AKIBAT/KONSEKUENSI DAN PERSETUJUAN:', {
            underline: true,
        });
        doc.fontSize(8).font('Helvetica');
        const consequencesMap = {
            1: [
                'Menerima peringatan lisan dari Guru BK/Wali Kelas',
                'Menandatangani surat perjanjian ini',
                'Berkomitmen untuk tidak mengulangi pelanggaran',
                'Orang tua dipelukan untuk memberikan persetujuan',
            ],
            2: [
                'Menerima peringatan tertulis dari sekolah',
                'Pembatasan kegiatan (ekstrakurikuler, acara sekolah)',
                'Orang tua dan siswa diminta hadir di sekolah',
                'Menandatangani surat perjanjian yang lebih ketat',
                'Berkomitmen perbaikan dalam waktu 1 bulan',
            ],
            3: [
                'Rujukan ke Guru Bimbingan Konseling untuk bimbingan intensif',
                'Ancaman pemulangan jika tidak ada perbaikan',
                'Rapat dengan orang tua dan pihak sekolah',
                'Membuat kontrak belajar dengan BK',
                'Pengawasan ketat selama 2 bulan kedepan',
            ],
        };
        const myConsequences = consequencesMap[spLetter.sp_level] || consequencesMap[1];
        myConsequences.forEach((consequence, index) => {
            doc.text(`${String.fromCharCode(97 + index)}. ${consequence}`, {
                width: 500,
                indent: 10,
            });
        });
    }
    drawSignatureSection(doc, spLetter) {
        doc.moveDown(1);
        const signatures = [
            { label: 'Orang Tua Murid', name: spLetter.signed_by_parent || '_____________' },
            { label: 'Siswa', name: spLetter.student_name },
            { label: 'BP/BK/Satuan Tugas', name: spLetter.signed_by_bp_bk || '_____________' },
            { label: 'Wali Kelas', name: spLetter.signed_by_wali_kelas || '_____________' },
        ];
        const signatureWidth = 220;
        const signatureHeight = 80;
        const leftX = 45;
        const rightX = leftX + signatureWidth + 20;
        doc.fontSize(8).font('Helvetica');
        this.drawSignatureBox(doc, leftX, doc.y, signatureWidth, signatureHeight, signatures[0]);
        this.drawSignatureBox(doc, rightX, doc.y - (signatureHeight + 10), signatureWidth, signatureHeight, signatures[1]);
        doc.moveDown(signatureHeight + 20);
        this.drawSignatureBox(doc, leftX, doc.y, signatureWidth, signatureHeight, signatures[2]);
        this.drawSignatureBox(doc, rightX, doc.y - (signatureHeight + 10), signatureWidth, signatureHeight, signatures[3]);
    }
    drawSignatureBox(doc, x, y, width, height, signatureData) {
        doc.fontSize(8).font('Helvetica').text(signatureData.label, x, y, { width });
        doc.text('', x, y + 20);
        doc.moveTo(x, y + 50).lineTo(x + width, y + 50).stroke();
        doc.fontSize(7).text(`(${signatureData.name})`, x, y + 52, { width, align: 'center' });
    }
    drawFooter(doc, spLetter) {
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica');
        doc.text(`Biaya Kertas/Print: Rp. ${spLetter.material_cost?.toLocaleString('id-ID') || '10.000'}`, {
            align: 'center',
        });
        doc.moveDown(0.3);
        doc.text('Mengetahui,', 400, doc.y);
        doc.moveDown(1);
        doc.text('Wakasek Bid. Kesiswaan', 400, doc.y, { width: 100, align: 'center' });
        doc.moveDown(0.5);
        doc.text('_____________________________', 400, doc.y, { width: 100, align: 'center' });
        doc.moveDown(1);
        doc.fontSize(7).text(`Generated on: ${new Date().toLocaleString('id-ID')}`, {
            align: 'center',
        });
        doc.text(`Document Status: ${spLetter.status}`, {
            align: 'center',
        });
        if (spLetter.is_signed) {
            doc.text(`Signed on: ${spLetter.signed_date}`, {
                align: 'center',
            });
        }
    }
    getPdfStream(filename) {
        const filepath = path.join(this.pdfStoragePath, filename);
        if (!fs.existsSync(filepath)) {
            throw new Error(`PDF file not found: ${filename}`);
        }
        return fs.createReadStream(filepath);
    }
    deletePdf(filename) {
        const filepath = path.join(this.pdfStoragePath, filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            this.logger.log(`SP PDF deleted: ${filename}`);
        }
    }
};
exports.SpPdfService = SpPdfService;
exports.SpPdfService = SpPdfService = SpPdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SpPdfService);
//# sourceMappingURL=sp-pdf.service.js.map