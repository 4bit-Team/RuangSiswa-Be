import { Injectable, BadRequestException } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';
import sharp from 'sharp';

@Injectable()
export class StudentCardValidationService {
  /**
   * Melakukan validasi & ekstraksi data dari kartu pelajar
   * menggunakan OCR (Tesseract.js)
   */
  async validate(filePath: string, inputKelas?: string, inputJurusan?: string) {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('❌ File kartu pelajar tidak ditemukan di server.');
    }

    try {
      console.log(`🔍 [OCR] Memulai pembacaan file: ${filePath}`);

      // === 1️⃣ Crop Gambar: HEADLINE & DATA ===
      const headlinePath = filePath.replace(/(\.[a-zA-Z0-9]+)$/i, '-HEADLINE.png');
      const dataPath = filePath.replace(/(\.[a-zA-Z0-9]+)$/i, '-DATA.png');

      const meta = await sharp(filePath).metadata();
      const headlineHeight = Math.floor(meta.height * 0.32);
      const headlineLeft = Math.floor(meta.width * 0.05);
      const headlineWidth = meta.width - headlineLeft;

      const dataTop = headlineHeight + 8;
      const dataHeight = Math.floor((meta.height - dataTop) * 0.82);
      const dataWidth = Math.floor(meta.width * 0.85);

      await sharp(filePath)
        .extract({ left: headlineLeft, top: 0, width: headlineWidth, height: headlineHeight })
        .toFile(headlinePath);

      await sharp(filePath)
        .extract({ left: 0, top: dataTop, width: dataWidth, height: dataHeight })
        .toFile(dataPath);

      // === 2️⃣ Preprocessing: grayscale & kontras ===
      const headlineScanPath = headlinePath.replace(/\.png$/i, '-SCAN.png');
      await sharp(headlinePath)
        .grayscale()
        .resize({ width: 1400 })
        .modulate({ brightness: 1.1 })
        .linear(1.15, -15)
        .toFile(headlineScanPath);

      const dataScanPath = dataPath.replace(/\.png$/i, '-SCAN.png');
      await sharp(dataPath)
        .grayscale()
        .resize({ width: 1400 })
        .modulate({ brightness: 1.1 })
        .linear(1.15, -15)
        .toFile(dataScanPath);

      // === 3️⃣ OCR HEADLINE & DATA ===
      const { data: { text: headlineText } } = await Tesseract.recognize(headlineScanPath, 'ind+eng', {
        logger: (m) => m.status === 'recognizing text' &&
          process.stdout.write(`🧠 OCR HEADLINE Progress: ${(m.progress * 100).toFixed(0)}%\r`)
      });

      const { data: { text: dataText } } = await Tesseract.recognize(dataScanPath, 'ind+eng', {
        logger: (m) => m.status === 'recognizing text' &&
          process.stdout.write(`🧠 OCR DATA Progress: ${(m.progress * 100).toFixed(0)}%\r`)
      });

      const text = (headlineText || '') + '\n' + (dataText || '');
      console.log('\n🧾 [OCR Result Raw Text]:\n', text);

      // === Helper Functions ===
      function levenshtein(a: string, b: string): number {
        a = a || ''; b = b || '';
        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + cost
            );
          }
        }
        return matrix[a.length][b.length];
      }

      function normalize(s: string) {
        return (s || '')
          .toUpperCase()
          .replace(/[|]/g, 'I')
          .replace(/[‘’´`]/g, "'")
          .replace(/[^A-Z0-9\/\s\-\:,\.]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      function similarity(a: string, b: string) {
        a = normalize(a).replace(/[^A-Z]/g, '');
        b = normalize(b).replace(/[^A-Z]/g, '');
        if (!a.length || !b.length) return 0;
        const dist = levenshtein(a, b);
        return 1 - dist / Math.max(a.length, b.length);
      }

      // === 4️⃣ Headline Validation (Gabungan Final) ===
      const keywords = [
        'SEKOLAH MENENGAH KEJURUAN NEGERI 1 CIBINONG',
        'SMKN 1 CIBINONG',
        'KARTU PELAJAR',
        'DINAS PENDIDIKAN',
        'JAWA BARAT'
      ];

      const allLines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const topLines = allLines.slice(0, 12).map(l => normalize(l));

      let headlineOk = false;
      let headlineMatched = '';

      for (const line of topLines) {
        for (const kw of keywords) {
          const sim = similarity(line, kw);
          if (sim > 0.6 || line.includes(normalize(kw).replace(/[^A-Z]/g, ''))) {
            headlineOk = true;
            headlineMatched = kw;
            break;
          }
        }
        if (headlineOk) break;
      }

      if (!headlineOk) {
        console.error('❌ [OCR] Kartu pelajar bukan dari SMKN 1 Cibinong!');
        throw new BadRequestException(
          '❌ Kartu pelajar tidak valid. Hanya kartu dari SMKN 1 CIBINONG yang diterima.'
        );
      }

      console.log(`✅ [OCR] Validasi sekolah berhasil: ${headlineMatched}`);

      // === 5️⃣ Field Extraction ===
      const cleanText = text
        .replace(/[|]/g, 'I')
        .replace(/\u00A0/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/ +/g, ' ');

      const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
      const upperLines = lines.map(l => normalize(l));

      function extractByLabel(labels: string[]): string {
        for (const lbl of labels) {
          const rx = new RegExp(lbl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
          const idx = lines.findIndex(l => rx.test(l));
          if (idx >= 0) {
            const l = lines[idx];
            const parts = l.split(/[:\-]/);
            if (parts.length >= 2) {
              const rest = parts.slice(1).join(':').trim();
              if (rest) return rest;
            }
            const after = l.replace(new RegExp(`^.*${lbl}`, 'i'), '').trim();
            if (after) return after;
            if (idx + 1 < lines.length) {
              const next = lines[idx + 1].trim();
              if (next.length > 0 && next.length < 60) return next;
            }
          }
        }
        return '';
      }

      const namaValue = extractByLabel(['NAMA', 'NAME']);
      let nisRaw = extractByLabel(['NIS/NISN', 'NIS', 'NISN']);
      let nis = '', nisn = '';

      if (nisRaw) {
        nisRaw = nisRaw.replace(/[^\d\/\s]/g, '').replace(/\s+/g, ' ').trim();
        const match = nisRaw.match(/(\d{8,12})\s*[\/ ]\s*(\d{8,12})/);
        if (match) {
          nis = match[1];
          nisn = match[2];
        } else {
          const single = nisRaw.match(/\d{8,12}/);
          if (single) nis = single[0];
        }
      }

      let ttlValue = extractByLabel(['T.T.L', 'TTL', 'T T L', 'T.T L', 'T.T.L.']) || '';
      let ttlNormalized = ttlValue
        .replace(/\s+/g, ' ')
        .replace(/[,;]+/g, ',')
        .replace(/(\d{2}):(\d{2}):(\d{4})/, '$1-$2-$3')
        .trim();

      // === Gender Parsing ===
      let genderValue = '';
      const genderCandidates = upperLines.filter(l => /(L\/P|L P|L\/|\/P|L:|P:|L$|P$)/i.test(l));
      if (genderCandidates.length) {
        for (const cand of genderCandidates) {
          const cleanCand = cand.replace(/[^A-Z]/g, '').trim();
          if (/\bP\b/.test(cleanCand) || cleanCand.endsWith('P')) { genderValue = 'P'; break; }
          if (/\bL\b/.test(cleanCand) || cleanCand.endsWith('L')) { genderValue = 'L'; break; }
        }
      }
      if (!genderValue) {
        const m = text.match(/L\/P\s*[:\-]?\s*([LP])/i);
        if (m) genderValue = m[1].toUpperCase();
      }

      // === Kelas & Jurusan ===
      const jurusanList = ['DKV', 'TKP', 'DPIB', 'RPL', 'SIJA', 'TKJ', 'TP', 'TOI', 'TKR', 'TFLM'];
      let kelasValue = '', jurusanValue = '';
      const kelasRaw = extractByLabel(['KELAS', 'CLASS']);

      if (kelasRaw) {
        let k = kelasRaw.toUpperCase().replace(/O/g, '0').replace(/\s+/g, ' ').trim();
        k = k.replace(/[^A-Z0-9 ]/g, '').replace(/\s{2,}/g, ' ');
        const tingkatMatch = k.match(/\b(XIII|XII|XI|X)\b/);
        const tingkat = tingkatMatch ? tingkatMatch[0] : '';
        const afterTingkat = k.replace(/\b(XIII|XII|XI|X)\b/, '').trim();

        let bestMatch = { jur: '', sim: 0 };
        for (const j of jurusanList) {
          const sim = similarity(afterTingkat, j);
          if (sim > bestMatch.sim) bestMatch = { jur: j, sim };
        }
        const jurusanDetected = bestMatch.sim >= 0.4 ? bestMatch.jur : '';
        const nomorMatch = k.match(/\b\d{1,2}\b/);
        const nomor = nomorMatch ? nomorMatch[0] : '';
        jurusanValue = jurusanDetected;
        kelasValue = [tingkat, jurusanDetected, nomor].filter(Boolean).join(' ').trim();
        if (!kelasValue) kelasValue = k;
      }

      const fieldsPresent = Boolean(namaValue && (nis || nisn) && ttlNormalized && kelasValue);
      if (!fieldsPresent) {
        throw new BadRequestException('⚠️ Data kartu pelajar tidak lengkap. Coba unggah ulang dengan gambar lebih jelas.');
      }

      // === 6️⃣ Validasi dengan input register ===
      function normalizeCompare(s: string) {
        return (s || '').toUpperCase().replace(/\s+/g, ' ').trim();
      }
      function extractRomawiKelas(kelasOcr: string): string {
        const romawiList = ['X', 'XI', 'XII', 'XIII'];
        if (!kelasOcr) return '';
        const firstWord = kelasOcr.split(' ')[0].toUpperCase();
        return romawiList.includes(firstWord) ? firstWord : '';
      }

      const kelasOcrRomawi = extractRomawiKelas(kelasValue || '');
      const inputKelasNorm = normalizeCompare(inputKelas || '');
      const kelasOcrNorm = normalizeCompare(kelasOcrRomawi || '');
      const inputJurusanNorm = normalizeCompare(inputJurusan || '');
      const jurusanOcrNorm = normalizeCompare(jurusanValue || '');

      const kelasValid = kelasOcrNorm && inputKelasNorm && kelasOcrNorm === inputKelasNorm;
      const jurusanValid = jurusanOcrNorm && inputJurusanNorm && jurusanOcrNorm === inputJurusanNorm;

      console.log('\n🧩 [VALIDASI PERBANDINGAN]');
      console.log(`OCR KELAS    : "${kelasOcrNorm}"`);
      console.log(`INPUT KELAS  : "${inputKelasNorm}"`);
      console.log(`➡️ HASIL KELAS VALID: ${kelasValid ? '✅ Sesuai' : '❌ Tidak sesuai'}`);
      console.log(`OCR JURUSAN  : "${jurusanOcrNorm}"`);
      console.log(`INPUT JURUSAN: "${inputJurusanNorm}"`);
      console.log(`➡️ HASIL JURUSAN VALID: ${jurusanValid ? '✅ Sesuai' : '❌ Tidak sesuai'}`);

      return {
        nama: namaValue || '',
        nis,
        nisn,
        ttl: ttlNormalized,
        gender: genderValue,
        kelas: kelasValue,
        jurusan: jurusanValue,
        raw_lines: lines.slice(0, 30),
        validasi: {
          kelas: kelasValid,
          jurusan: jurusanValid,
          status: kelasValid && jurusanValid ? 'sesuai' : 'tidak sesuai'
        }
      };
    } catch (error) {
      console.error('❌ [OCR Error]:', error?.message || error);
      throw new BadRequestException('❌ Gagal membaca data dari kartu pelajar. Pastikan gambar tajam dan teks terlihat jelas.');
    }
  }
}
