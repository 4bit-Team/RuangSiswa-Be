import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { SpLetter } from './entities/violation.entity';

@Injectable()
export class SpPdfService {
  private readonly logger = new Logger(SpPdfService.name);

  // Path to store generated PDFs
  private readonly pdfStoragePath = path.join(process.cwd(), 'storage', 'sp-letters');

  constructor() {
    // Ensure storage directory exists
    if (!fs.existsSync(this.pdfStoragePath)) {
      fs.mkdirSync(this.pdfStoragePath, { recursive: true });
    }
  }

  /**
   * Generate SP PDF from SpLetter entity
   * Matches real template structure from user images:
   * - Header: School name, "SURAT PERJANJIAN MURID", date
   * - Student details: NIS, Nama, Kelas/Kompetensi, Alamat, Kasus
   * - Violation checklist (9 items)
   * - Consequences/Sanctions
   * - Signature blocks (4 parties)
   * - Material cost
   */
  async generateSpPdf(spLetter: SpLetter): Promise<string> {
    try {
      const filename = `${spLetter.sp_number.replace(/\//g, '-')}.pdf`;
      const filepath = path.join(this.pdfStoragePath, filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
        bufferPages: true,
      });

      // Pipe to file
      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // ===== HEADER SECTION =====
      this.drawHeader(doc, spLetter);

      // ===== MAIN CONTENT =====
      this.drawStudentDetails(doc, spLetter);
      doc.moveDown(0.3);

      this.drawViolationSummary(doc, spLetter);
      doc.moveDown(0.3);

      this.drawViolationChecklist(doc, spLetter);
      doc.moveDown(0.5);

      this.drawConsequences(doc, spLetter);
      doc.moveDown(0.5);

      // ===== SIGNATURE SECTION =====
      this.drawSignatureSection(doc, spLetter);

      // ===== FOOTER =====
      this.drawFooter(doc, spLetter);

      // Finalize PDF
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
    } catch (error) {
      this.logger.error(`Failed to generate SP PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate and return PDF buffer (for streaming/preview)
   */
  async generateSpPdfBuffer(spLetter: SpLetter): Promise<Buffer> {
    try {
      return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];

        const doc = new PDFDocument({
          size: 'A4',
          margin: 30,
          bufferPages: true,
        });

        doc.on('data', (chunk: Buffer) => {
          buffers.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        doc.on('error', (error) => {
          reject(error);
        });

        // Draw all sections
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
    } catch (error) {
      this.logger.error(`Failed to generate SP PDF buffer: ${error.message}`);
      throw error;
    }
  }

  // ===== DRAWING METHODS =====

  private drawHeader(doc: any, spLetter: SpLetter): void {
    // School name (centered)
    doc.fontSize(12).font('Helvetica-Bold').text('SEKOLAH MENENGAH KEJURUAN NEGERI 1 CIBINONG', {
      align: 'center',
      underline: true,
    });

    // Address
    doc.fontSize(9).font('Helvetica').text('Jl. Industri No. 25 Cibinong, Bogor 16912', {
      align: 'center',
    });
    doc.text('Telp. (021) XXXX-XXXX | Website: smkn1cibinong.sch.id', {
      align: 'center',
    });

    // Horizontal line
    doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown(0.5);

    // Title
    doc.fontSize(14).font('Helvetica-Bold').text('SURAT PERJANJIAN MURID', {
      align: 'center',
    });

    // SP Level and Number
    const spLevelText = {
      1: 'SP 1 (Peringatan Pertama)',
      2: 'SP 2 (Peringatan Kedua)',
      3: 'SP 3 (Peringatan Ketiga/Akhir)',
    };

    doc.fontSize(11).font('Helvetica-Bold').text(spLevelText[spLetter.sp_level] || '', {
      align: 'center',
    });

    // SP Number and Date
    doc.fontSize(9).font('Helvetica').text(`Nomor: ${spLetter.sp_number} | Tanggal: ${spLetter.tanggal_sp}`, {
      align: 'center',
    });

    doc.moveDown(0.5);
  }

  private drawStudentDetails(doc: any, spLetter: SpLetter): void {
    doc.fontSize(9).font('Helvetica-Bold').text('DATA DIRI SISWA:', {
      underline: true,
    });

    // Create table-like structure
    const leftMargin = 45;
    const dataWidth = 200;

    doc.fontSize(8).font('Helvetica');
    const startY = doc.y;

    // Left column
    doc.text('Nama Siswa', leftMargin, startY);
    doc.text('NIS/NISN', leftMargin, startY + 20);
    doc.text('Kelas', leftMargin, startY + 40);
    doc.text('Kompetensi Keahlian', leftMargin, startY + 60);
    doc.text('Alamat', leftMargin, startY + 80);

    // Values (left aligned after colon)
    const valuesX = leftMargin + 140;
    doc.text(`: ${spLetter.student_name}`, valuesX, startY);
    doc.text(`: ${spLetter.nis || 'N/A'}`, valuesX, startY + 20);
    doc.text(`: ${spLetter.class_id || 'N/A'}`, valuesX, startY + 40);
    doc.text(`: ${spLetter.kompetensi_keahlian || 'N/A'}`, valuesX, startY + 60);

    // Alamat text wrap
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

  private drawViolationSummary(doc: any, spLetter: SpLetter): void {
    doc.fontSize(9).font('Helvetica-Bold').text('KASUS/PELANGGARAN:', {
      underline: true,
    });

    doc.fontSize(8).font('Helvetica');
    doc.text(spLetter.violations_text, {
      width: 515,
      align: 'justify',
    });
  }

  private drawViolationChecklist(doc: any, spLetter: SpLetter): void {
    doc.fontSize(9).font('Helvetica-Bold').text('DAFTAR PELANGGARAN TATA TERTIB SEKOLAH:', {
      underline: true,
    });

    // 9-item checklist (from real template)
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

  private drawConsequences(doc: any, spLetter: SpLetter): void {
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

  private drawSignatureSection(doc: any, spLetter: SpLetter): void {
    doc.moveDown(1);

    // Create 2x2 signature grid
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

    // Row 1
    this.drawSignatureBox(doc, leftX, doc.y, signatureWidth, signatureHeight, signatures[0]);
    this.drawSignatureBox(doc, rightX, doc.y - (signatureHeight + 10), signatureWidth, signatureHeight, signatures[1]);

    doc.moveDown(signatureHeight + 20);

    // Row 2
    this.drawSignatureBox(doc, leftX, doc.y, signatureWidth, signatureHeight, signatures[2]);
    this.drawSignatureBox(doc, rightX, doc.y - (signatureHeight + 10), signatureWidth, signatureHeight, signatures[3]);
  }

  private drawSignatureBox(
    doc: any,
    x: number,
    y: number,
    width: number,
    height: number,
    signatureData: { label: string; name: string },
  ): void {
    doc.fontSize(8).font('Helvetica').text(signatureData.label, x, y, { width });
    doc.text('', x, y + 20); // Space for signature
    doc.moveTo(x, y + 50).lineTo(x + width, y + 50).stroke();
    doc.fontSize(7).text(`(${signatureData.name})`, x, y + 52, { width, align: 'center' });
  }

  private drawFooter(doc: any, spLetter: SpLetter): void {
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica');

    // Material cost
    doc.text(`Biaya Kertas/Print: Rp. ${spLetter.material_cost?.toLocaleString('id-ID') || '10.000'}`, {
      align: 'center',
    });

    // Approval line
    doc.moveDown(0.3);
    doc.text('Mengetahui,', 400, doc.y);
    doc.moveDown(1);
    doc.text('Wakasek Bid. Kesiswaan', 400, doc.y, { width: 100, align: 'center' });
    doc.moveDown(0.5);
    doc.text('_____________________________', 400, doc.y, { width: 100, align: 'center' });

    // Document info
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

  /**
   * Get PDF file stream
   */
  getPdfStream(filename: string): fs.ReadStream {
    const filepath = path.join(this.pdfStoragePath, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error(`PDF file not found: ${filename}`);
    }

    return fs.createReadStream(filepath);
  }

  /**
   * Remove/delete PDF file
   */
  deletePdf(filename: string): void {
    const filepath = path.join(this.pdfStoragePath, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      this.logger.log(`SP PDF deleted: ${filename}`);
    }
  }
}
