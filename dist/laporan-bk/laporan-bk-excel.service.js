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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanBkExcelService = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = require("exceljs");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let LaporanBkExcelService = class LaporanBkExcelService {
    templateDir = path.join(process.cwd(), 'src', '..', 'uploads', 'data');
    constructor() {
        this.ensureTemplateDir();
    }
    ensureTemplateDir() {
        if (!fs.existsSync(this.templateDir)) {
            fs.mkdirSync(this.templateDir, { recursive: true });
        }
    }
    async createTemplateFile() {
        const workbook = new exceljs_1.Workbook();
        const worksheet = workbook.addWorksheet('Laporan BK');
        this.setColumnWidths(worksheet);
        this.addHeaders(worksheet);
        this.addSampleRow(worksheet);
        const fileName = `template-laporan-bk-${Date.now()}.xlsx`;
        const filePath = path.join(this.templateDir, fileName);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
    async exportToExcel(data) {
        const workbook = new exceljs_1.Workbook();
        const worksheet = workbook.addWorksheet('Laporan BK');
        this.setColumnWidths(worksheet);
        this.addHeaders(worksheet);
        data.forEach((item, index) => {
            this.addDataRow(worksheet, item, index + 2);
        });
        const fileName = `laporan-bk-export-${Date.now()}.xlsx`;
        const filePath = path.join(this.templateDir, fileName);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
    async importFromExcel(filePath) {
        const workbook = new exceljs_1.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet('Laporan BK');
        const data = [];
        if (!worksheet) {
            throw new Error('Worksheet not found');
        }
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            const rowData = {
                namaKonseling: row.getCell(1).value?.toString() || '',
                jurusanId: this.parseNumber(row.getCell(2).value),
                kelasId: this.parseNumber(row.getCell(3).value),
                tanggalDiprosesAiBk: new Date(row.getCell(4).value),
                deskripsiKasusMasalah: row.getCell(5).value?.toString() || '',
                bentukPenanganganSebelumnya: row.getCell(6).value?.toString() || '',
                riwayatSpDanKasus: row.getCell(7).value?.toString() || '',
                layananBk: row.getCell(8).value?.toString() || '',
                followUpTindakanBk: row.getCell(9).value?.toString() || '',
                penahanganGuruBkKonselingProsesPembinaan: row.getCell(10).value?.toString() || '',
                pertemuanKe1: row.getCell(11).value?.toString() || '',
                pertemuanKe2: row.getCell(12).value?.toString() || '',
                pertemuanKe3: row.getCell(13).value?.toString() || '',
                hasilPemantauanKeterangan: row.getCell(14).value?.toString() || '',
                guruBkYangMenanganiId: this.parseNumber(row.getCell(15).value),
                statusPerkembanganPesertaDidik: row.getCell(16).value?.toString() || '',
                keteranganKetersedianDokumen: row.getCell(17).value?.toString() || '',
            };
            data.push(rowData);
        });
        return data;
    }
    setColumnWidths(worksheet) {
        const columnWidths = [30, 12, 12, 15, 25, 25, 25, 20, 25, 30, 25, 25, 25, 25, 12, 20, 25];
        columnWidths.forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });
    }
    addHeaders(worksheet) {
        const headers = [
            'Nama Konseling',
            'Jurusan ID',
            'Kelas ID',
            'Tanggal Diproses BK',
            'Deskripsi Kasus/Masalah',
            'Bentuk Penanganan Sebelumnya',
            'Riwayat SP + Kasus',
            'Layanan BK',
            'Follow Up/Tindakan BK',
            'Penanganan Guru BK/Konseling/Proses Pembinaan',
            'Pertemuan Ke-1',
            'Pertemuan Ke-2',
            'Pertemuan Ke-3',
            'Hasil Pemantauan/Keterangan',
            'Guru BK ID',
            'Status Perkembangan',
            'Keterangan Ketersediaan Dokumen',
        ];
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
    addSampleRow(worksheet) {
        const sampleData = [
            'Contoh Konseling',
            1,
            1,
            new Date().toISOString().split('T')[0],
            'Deskripsi contoh kasus',
            'Penanganan contoh',
            'Riwayat contoh',
            'Layanan contoh',
            'Follow up contoh',
            'Penanganan contoh',
            'Pertemuan 1 contoh',
            'Pertemuan 2 contoh',
            'Pertemuan 3 contoh',
            'Hasil contoh',
            1,
            'Membaik',
            'Dokumen lengkap',
        ];
        const row = worksheet.addRow(sampleData);
        row.alignment = { vertical: 'top', wrapText: true };
    }
    addDataRow(worksheet, item, rowNumber) {
        const row = worksheet.getRow(rowNumber);
        row.values = [
            `Laporan ${item.id}`,
            '-',
            '-',
            item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '',
            item.session_topic || '-',
            '-',
            '-',
            '-',
            item.recommendations || '-',
            '-',
            item.session_date ? new Date(item.session_date).toLocaleDateString('id-ID') : '',
            '-',
            '-',
            item.follow_up_status || '-',
            item.bk_id || '-',
            item.status || '-',
            item.parent_notified ? 'Ya' : 'Tidak',
        ];
        row.alignment = { vertical: 'top', wrapText: true };
    }
    parseNumber(value) {
        if (value === null || value === undefined)
            return null;
        const parsed = parseInt(value.toString(), 10);
        return isNaN(parsed) ? null : parsed;
    }
};
exports.LaporanBkExcelService = LaporanBkExcelService;
exports.LaporanBkExcelService = LaporanBkExcelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LaporanBkExcelService);
//# sourceMappingURL=laporan-bk-excel.service.js.map