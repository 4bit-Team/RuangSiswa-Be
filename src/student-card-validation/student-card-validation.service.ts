import { Injectable, BadRequestException } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';

@Injectable()
export class StudentCardValidationService {
  /**
   * Melakukan validasi & ekstraksi data dari kartu pelajar
   * menggunakan OCR (Tesseract.js)
   */
  async validate(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('❌ File kartu pelajar tidak ditemukan di server.');
    }

    try {
      console.log(`🔍 [OCR] Memulai pembacaan file: ${filePath}`);

      // Jalankan OCR (gunakan bahasa Indonesia + Inggris agar akurat)
      const {
        data: { text },
      } = await Tesseract.recognize(filePath, 'ind+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`🧠 OCR Progress: ${(m.progress * 100).toFixed(0)}%\r`);
          }
        },
      });

      console.log('\n🧾 [OCR Result Raw Text]:\n', text);

      // Pastikan ini kartu dari SMKN 1 Cibinong
      const expectedHeadline = 'SEKOLAH MENENGAH KEJURUAN NEGERI 1 CIBINONG';
      if (!text.toUpperCase().includes(expectedHeadline)) {
        throw new BadRequestException(
          '⚠️ Gagal validasi: Kartu pelajar bukan dari SMKN 1 Cibinong.'
        );
      }

      // Gunakan regex yang toleran terhadap variasi OCR (spasi, titik, dll)
      const namaMatch = text.match(/NAMA\s*[:\-]?\s*([A-Za-z\s]+)/i);
      const nisMatch = text.match(/NIS(?:\/NISN)?\s*[:\-]?\s*([\d\/\s]+)/i);
      const ttlMatch = text.match(/T\.?T\.?L\s*[:\-]?\s*([A-Za-z\s,0-9]+)/i);
      const genderMatch = text.match(/L\s*\/\s*P\s*[:\-]?\s*(L|P)/i);
      const kelasMatch = text.match(/KELAS\s*[:\-]?\s*([A-Za-z0-9\s]+)/i);

      // Cek kelengkapan
      if (!namaMatch || !nisMatch || !ttlMatch || !genderMatch || !kelasMatch) {
        console.error('⚠️ [OCR] Regex gagal menangkap semua field');
        throw new BadRequestException(
          '⚠️ Data kartu pelajar tidak lengkap atau teks sulit dibaca. Coba unggah ulang dengan gambar lebih jelas.'
        );
      }

      // Format hasil akhir
      const result = {
        nama: namaMatch[1].trim(),
        nis: nisMatch[1].trim().replace(/\s+/g, ' '),
        ttl: ttlMatch[1].trim(),
        gender: genderMatch[1].trim().toUpperCase(),
        kelas: kelasMatch[1].trim(),
      };

      console.log('✅ [OCR Extracted Data]:', result);
      return result;
    } catch (error) {
      console.error('❌ [OCR Error]:', error.message || error);
      throw new BadRequestException(
        '❌ Gagal membaca data dari kartu pelajar. Pastikan gambar tajam dan teks terlihat jelas.'
      );
    }
  }
}
