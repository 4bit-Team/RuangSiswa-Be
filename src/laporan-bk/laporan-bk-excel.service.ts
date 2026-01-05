import { Injectable } from '@nestjs/common';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { LaporanBk } from './entities/laporan-bk.entity';

@Injectable()
export class LaporanBkExcelService {
  private readonly templateDir = path.join(process.cwd(), 'src', '..', 'uploads', 'data');

  constructor() {
    this.ensureTemplateDir();
  }

  private ensureTemplateDir() {
    if (!fs.existsSync(this.templateDir)) {
      fs.mkdirSync(this.templateDir, { recursive: true });
    }
  }

  async createTemplateFile(): Promise<string> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Laporan BK');

    // Set column widths
    this.setColumnWidths(worksheet);

    // Add headers
    this.addHeaders(worksheet);

    // Add sample row
    this.addSampleRow(worksheet);

    const fileName = `template-laporan-bk-${Date.now()}.xlsx`;
    const filePath = path.join(this.templateDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  async exportToExcel(data: LaporanBk[]): Promise<string> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Laporan BK');

    // Set column widths
    this.setColumnWidths(worksheet);

    // Add headers
    this.addHeaders(worksheet);

    // Add data rows
    data.forEach((item, index) => {
      this.addDataRow(worksheet, item, index + 2);
    });

    const fileName = `laporan-bk-export-${Date.now()}.xlsx`;
    const filePath = path.join(this.templateDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  async importFromExcel(filePath: string): Promise<any[]> {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet('Laporan BK');
    const data: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowData = {
        namaKonseling: row.getCell(1).value?.toString() || '',
        jurusanId: this.parseNumber(row.getCell(2).value),
        kelasId: this.parseNumber(row.getCell(3).value),
        tanggalDiprosesAiBk: new Date(row.getCell(4).value as string),
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

  private setColumnWidths(worksheet: Worksheet) {
    const columnWidths = [30, 12, 12, 15, 25, 25, 25, 20, 25, 30, 25, 25, 25, 25, 12, 20, 25];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });
  }

  private addHeaders(worksheet: Worksheet) {
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
    headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
  }

  private addSampleRow(worksheet: Worksheet) {
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

  private addDataRow(worksheet: Worksheet, item: LaporanBk, rowNumber: number) {
    const row = worksheet.getRow(rowNumber);
    row.values = [
      item.namaKonseling,
      item.jurusanId,
      item.kelasId,
      item.tanggalDiprosesAiBk,
      item.deskripsiKasusMasalah,
      item.bentukPenanganganSebelumnya,
      item.riwayatSpDanKasus,
      item.layananBk,
      item.followUpTindakanBk,
      item.penahanganGuruBkKonselingProsesPembinaan,
      item.pertemuanKe1,
      item.pertemuanKe2,
      item.pertemuanKe3,
      item.hasilPemantauanKeterangan,
      item.guruBkYangMenanganiId,
      item.statusPerkembanganPesertaDidik,
      item.keteranganKetersedianDokumen,
    ];
    row.alignment = { vertical: 'top', wrapText: true };
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined) return null;
    const parsed = parseInt(value.toString(), 10);
    return isNaN(parsed) ? null : parsed;
  }
}
