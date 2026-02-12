import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ExtractedPointData } from '../dto/import-point-pelanggaran.dto';

const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse;

// Wrapper function to parse PDF using the PDFParse class
// const pdfParse = async (buffer: Buffer) => {
//   const pdfParser = new PDFParse(buffer);
  
//   // Debug: Log available methods
//   console.log('PDFParse methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(pdfParser)));
//   console.log('PDFParse keys:', Object.keys(pdfParser));
//   console.log('Has parse?', typeof pdfParser.parse);
//   console.log('Has parseDocument?', typeof pdfParser.parseDocument);
//   console.log('Has parseAsync?', typeof pdfParser.parseAsync);
  
//   // Try different methods
//   if (typeof pdfParser.parse === 'function') {
//     return pdfParser.parse();
//   } else if (typeof pdfParser.parseDocument === 'function') {
//     return pdfParser.parseDocument();
//   } else if (typeof pdfParser.parseAsync === 'function') {
//     return pdfParser.parseAsync();
//   } else {
//     throw new Error(`PDFParse has no parse method. Available methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(pdfParser)).join(', ')}`);
//   }
// };

// Wrapper function to parse PDF using the PDFParse class
const pdfParse = async (buffer: Buffer) => {
  // Convert Buffer to Uint8Array as required by PDFParse
  const uint8Array = new Uint8Array(buffer);
  
  const pdfParser = new PDFParse(uint8Array);

  console.log('=== PDF-PARSE DEBUG ===');
  console.log('PDFParse instance created');
  console.log('PDFParse methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(pdfParser)));
  
  // Load the PDF document
  await pdfParser.load();
  console.log('PDF loaded successfully');
  
  // Get text from all pages
  const text = await pdfParser.getText();
  console.log('Text extracted, length:', text?.length || 0);
  console.log('Text type:', typeof text);
  console.log('Text is array?', Array.isArray(text));
  console.log('Text content sample:', JSON.stringify(text));
  console.log('First 200 chars:', typeof text === 'string' ? text.substring(0, 200) : 'N/A (not a string)');
  
  // Get PDF info (contains number of pages)
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

interface PdfExtractionResult {
  tahun_point: number;
  points: ExtractedPointData[];
  validation: {
    isValid: boolean;
    header_found: boolean;
    errors: string[];
  };
}

@Injectable()
export class PointPelanggaranPdfService {
  private readonly logger = new Logger(PointPelanggaranPdfService.name);

  /**
   * Extract point pelanggaran data from PDF file
   * Validates header: "DAFTAR KREDIT POIN PELANGGARAN SISWA SMK NEGERI 1 CIBINONG"
   * Extracts year from page 1 (format: SMKN 1 Cbn-CabDin.Wil 1/2023)
   * Extracts points from pages 4-5
   */
  async extractPointsFromPdf(fileBuffer: Buffer): Promise<PdfExtractionResult> {
    try {
      this.logger.log('Starting PDF extraction...');

      // Parse PDF
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData.text;

      this.logger.debug(`PDF extracted with ${pdfData.numpages} pages`);

      // Validasi header: cari "DAFTAR KREDIT POIN PELANGGARAN SISWA"
      const headerValidation = this.validatePdfHeader(text);
      if (!headerValidation.isValid) {
        throw new BadRequestException(
          `PDF validation failed: ${headerValidation.errors.join(', ')}`,
        );
      }

      // Extract tahun point dari halaman 1
      const tahun_point = this.extractYearFromPdf(text);
      if (!tahun_point) {
        throw new BadRequestException(
          'Tidak dapat menemukan tahun ajaran di halaman 1. Format yang diharapkan: "SMKN 1 Cbn-CabDin.Wil 1/2023"',
        );
      }

      this.logger.log(`Extracted tahun_point: ${tahun_point}`);

      // Extract points data
      const points = this.extractPointsData(text);
      if (points.length === 0) {
        throw new BadRequestException(
          'Tidak ada data poin pelanggaran yang berhasil diekstrak dari halaman 4-5',
        );
      }

      this.logger.log(`Extracted ${points.length} points`);

      return {
        tahun_point,
        points,
        validation: headerValidation,
      };
    } catch (error) {
      this.logger.error(`Error extracting PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate PDF header
   * Cari "DAFTAR KREDIT POIN PELANGGARAN SISWA"
   */
  private validatePdfHeader(text: string): {
    isValid: boolean;
    header_found: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    let header_found = false;

    if (
      text.includes('DAFTAR KREDIT POIN PELANGGARAN SISWA') &&
      text.includes('CIBINONG')
    ) {
      header_found = true;
    } else {
      errors.push(
        'Header tidak ditemukan. Pastikan PDF berisi "DAFTAR KREDIT POIN PELANGGARAN SISWA SMK NEGERI 1 CIBINONG"',
      );
    }

    return {
      isValid: header_found,
      header_found,
      errors,
    };
  }

  /**
   * Extract year from page 1
   * Format: SMKN 1 Cbn-CabDin.Wil 1/2023
   * Ambil tahun terakhir: 2023
   */
  private extractYearFromPdf(text: string): number | null {
    try {
      // Cari pattern: angka/angka atau angka-angka/angka
      // Format bisa: 1/2023, 1/2024, dll
      const yearMatch = text.match(/(\d{1,2})\/(\d{4})/);

      if (yearMatch && yearMatch[2]) {
        const year = parseInt(yearMatch[2]);
        if (year >= 2020 && year <= 2099) {
          return year;
        }
      }

      // Fallback: cari hanya angka 4 digit yang terlihat seperti tahun
      const fallbackMatch = text.match(/\b(20\d{2})\b/);
      if (fallbackMatch && fallbackMatch[1]) {
        return parseInt(fallbackMatch[1]);
      }

      return null;
    } catch (error) {
      this.logger.warn(`Error extracting year: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract points data from PDF text
   * Expected format:
   * JENIS PELANGGARAN | KODE | BOBOT
   * Terlambat masuk | A.1 | 10+sanksi
   */
  private extractPointsData(text: string): ExtractedPointData[] {
    const points: ExtractedPointData[] = [];

    try {
      // Split text by lines
      const lines = text.split('\n').map((line) => line.trim());

      // Kategori mapping
      const categories: { [key: string]: string } = {
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
      const codeMap = new Map<string, number>();
      let nextCodeNumber = 1;

      // Parse lines untuk menemukan pattern
      for (lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];

        if (!line || line.length < 2) continue;

        // Deteksi kategori (uppercase headers)
        for (const [key, value] of Object.entries(categories)) {
          if (line.toUpperCase().includes(key.toUpperCase())) {
            currentCategory = value;
            break;
          }
        }

        // Deteksi pattern: KODE | PELANGGARAN | BOBOT
        // Expected: A.1 atau B.2 atau C.1.1
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
                  // Convert kode string ke number (A.1 -> 1, B.2 -> 2, dll)
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

                  this.logger.debug(
                    `Extracted: ${kode} | ${jenis} | ${bobot} (${currentCategory})`,
                  );
                }
              }
            }
          } catch (e) {
            this.logger.warn(`Error parsing line: ${line}`);
          }
        }
      }

      return points;
    } catch (error) {
      this.logger.error(`Error extracting points data: ${error.message}`);
      return [];
    }
  }

  /**
   * Parse bobot value (contoh: "10+sanksi", "20", "50+do")
   * Return hanya angka numerik
   */
  private parseBobotValue(bobotStr: string): number {
    try {
      const match = bobotStr.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Convert kode string (A.1, B.2, C.1.1) ke numeric code
   * Simple mapping: A.1 -> 1, A.2 -> 2, B.1 -> 3, dll
   */
  private convertKodeToNumber(
    kode: string,
    codeMap: Map<string, number>,
    nextNumber: number,
  ): number {
    if (!codeMap.has(kode)) {
      codeMap.set(kode, nextNumber);
    }
    return codeMap.get(kode) || nextNumber;
  }
}
