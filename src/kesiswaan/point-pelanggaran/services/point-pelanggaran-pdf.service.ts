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
  
  // Load the PDF document
  await pdfParser.load();
  console.log('PDF loaded successfully');
  
  // Get text from all pages - getText() returns an object with pages array and text property
  const textResult = await pdfParser.getText();
  console.log('Text result type:', typeof textResult);
  console.log('Text result is object?', typeof textResult === 'object');
  
  // Extract the combined text from the result object
  const text = textResult?.text || '';
  console.log('Text extracted, length:', text?.length || 0);
  console.log('First 200 chars:', typeof text === 'string' ? text.substring(0, 200) : 'N/A');
  
  // Get PDF info (contains number of pages)
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

interface PdfExtractionResult {
  tahun_point: number;
  points: ExtractedPointData[];
  validation: {
    isValid: boolean;
    header_found: boolean;
    errors: string[];
  };
  debugLog?: {
    pointsPerPage: { [page: number]: number };
    totalExtracted: number;
  };
}

@Injectable()
export class PointPelanggaranPdfService {
  private readonly logger = new Logger(PointPelanggaranPdfService.name);

  /**
   * Extract point pelanggaran data from PDF file
   * Validates header: "DAFTAR KREDIT POIN PELANGGARAN SISWA SMK NEGERI 1 CIBINONG"
   * Extracts year from page 1 (format: SMKN 1 Cbn-CabDin.Wil 1/2023)
   * Extracts points from all pages dynamically
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
      const pointsData = this.extractPointsData(text);
      const points = pointsData.points;
      const pointsPerPage = pointsData.pointsPerPage;

      if (points.length === 0) {
        throw new BadRequestException(
          'Tidak ada data poin pelanggaran yang berhasil diekstrak dari halaman manapun',
        );
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
   * Extract points data from PDF text page by page
   * Dynamically scans all pages for point data
   * Returns point data with page information for debugging
   */
  private extractPointsData(text: string): { points: ExtractedPointData[], pointsPerPage: { [page: number]: number } } {
    const points: ExtractedPointData[] = [];
    let pointsPerPage: { [page: number]: number } = {};

    try {
      // Split text by lines
      const lines = text.split('\n').map((line) => line.trim());

      console.log('=== EXTRACTING POINTS DATA ===');
      console.log(`Total lines to process: ${lines.length}`);

      // Kategori mapping
      const categoryMap: { [key: string]: string } = {
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

      // Parse lines untuk menemukan pattern
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];

        if (!line || line.length < 2) continue;

        // Deteksi page break atau natural page boundary (duplikat header)
        if (line.includes('DAFTAR KREDIT POIN PELANGGARAN') && lineIndex > 100) {
          currentPage++;
          console.log(`\n📄 Detected new page: Page ${currentPage}`);
          continue;
        }

        // Deteksi kategori header (e.g., "A. KETERLAMBATAN", "B. KEHADIRAN")
        const categoryHeaderMatch = line.match(/^([A-K])\.\s*([A-Z\/\-\s]+)$/);
        if (categoryHeaderMatch) {
          const catKey = categoryHeaderMatch[1];
          currentCategory = categoryMap[catKey] || 'Umum';
          lastCategoryChangeAt = lineIndex;
          console.log(`✓ Page ${currentPage} | Found category: ${categoryHeaderMatch[0]} => ${currentCategory}`);
          continue;
        }

        // Improved pattern matching untuk menangkap berbagai format:
        // Format 1: "1. Terlambat masuk setelah istirahat A.1 10+sanksi"
        // Format 2: "10.4. Melakukan kegiatan mendekati perjinahan D.10.4 75+ Sanksi (DO)"
        const hasCategoryCode = /[A-K]\.\d+(?:\.\d+)*/g.test(line);
        
        if (hasCategoryCode) {
          // Ekstrak kode kategori [A-K].\d+(.d+)*
          const codeMatch = line.match(/([A-K]\.\d+(?:\.\d+)*)/);
          if (!codeMatch) continue;
          
          const kode = codeMatch[1];
          
          // Ekstrak bobot (angka) dan flag (sanksi/do)
          const bobotMatch = line.match(/\s([\d]+)(?:\s*\+\s*([a-z&\s()]+))?(?:\s*\([^)]*\))?$/i);
          
          if (!bobotMatch) {
            continue;
          }
          
          const bobotStr = (bobotMatch[1] ?? '0');
          const flagStr = line.substring(bobotMatch.index ?? 0).toLowerCase();
          const bobot = parseInt(bobotStr, 10);
          
          // Ekstrak deskripsi
          let jenis = line;
          jenis = jenis.replace(/^(?:\d+(?:\.\d+)*\.?\s+)/, '');
          jenis = jenis.replace(/\s+[A-K]\.\d+(?:\.\d+)*.*$/, '');
          jenis = jenis.trim();
          
          if (jenis && bobot > 0) {
            // Deteksi flag
            const isSanksi = flagStr.includes('sanksi');
            const isDo = flagStr.includes('do');
            
            let sanksiValue: string | undefined = undefined;
            if (isDo) {
              sanksiValue = 'DO';
            } else if (isSanksi) {
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

            // Track points per page
            if (!pointsPerPage[currentPage]) {
              pointsPerPage[currentPage] = 0;
            }
            pointsPerPage[currentPage]++;

            const flagInfo = sanksiValue ? `| sanksi=${sanksiValue}` : '';
            console.log(`✅ Page ${currentPage} | Extracted: ${kode} | ${jenis} | ${bobot} ${flagInfo} (${currentCategory})`);

            this.logger.debug(
              `Page ${currentPage} | Extracted: ${kode} | ${jenis} | ${bobot} (${currentCategory})`,
            );
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
    } catch (error) {
      this.logger.error(`Error extracting points data: ${error.message}`);
      return { points, pointsPerPage };
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
}
