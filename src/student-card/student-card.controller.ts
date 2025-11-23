import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { StudentCardService } from './student-card.service';
import { CreateStudentCardDto } from './dto/create-student-card.dto';
import { UpdateStudentCardDto } from './dto/update-student-card.dto';
import { UsersService } from '../users/users.service';
import { KelasService } from '../kelas/kelas.service';
import { JurusanService } from '../jurusan/jurusan.service';
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';

@Controller('student-card')
export class StudentCardController {
  constructor(
    private readonly cardService: StudentCardService,
    private readonly cardValidator: StudentCardValidationService,
    private readonly usersService: UsersService,
    private readonly kelasService: KelasService,
    private readonly jurusanService: JurusanService, 
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('kartu_pelajar', {
      storage: diskStorage({
        destination: './uploads/student-cards',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          cb(new BadRequestException('Hanya file gambar yang diizinkan!'), false);
        } else cb(null, true);
      },
    }),
  )
  async uploadCard(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
    @Body('kelas') kelasId: number,
    @Body('jurusan') jurusanId: number,
  ) {
    if (!file) throw new BadRequestException('File kartu pelajar wajib diunggah');
    if (!userId) throw new BadRequestException('userId wajib dikirim');
    if (!kelasId) throw new BadRequestException('kelas wajib dikirim');
    if (!jurusanId) throw new BadRequestException('jurusan wajib dikirim');

    // 🔍 Ambil nama kelas & jurusan dari database
    const kelasData = await this.kelasService.findOne(kelasId);
    const jurusanData = await this.jurusanService.findOne(jurusanId);

    if (!kelasData || !jurusanData) {
      throw new BadRequestException('Kelas atau jurusan tidak ditemukan di database');
    }

    // 🧠 Jalankan OCR dan validasi
    const extractedData = await this.cardValidator.validate(
      file.path,
      kelasData.nama,
      jurusanData.kode
    );

    // ❌ Jika OCR tidak sesuai
    if (!extractedData.validasi?.kelas || !extractedData.validasi?.jurusan) {
      return {
        message: '❌ Kelas/jurusan pada kartu pelajar tidak sesuai dengan data registrasi. Mohon upload ulang.',
        file: file.filename,
        extractedData,
        card: null,
      };
    }

    // ✅ Simpan ke database
    const card = await this.cardService.create({
      userId,
      file_path: file.path,
      extracted_data: extractedData,
    });

    await this.usersService.updateStatus(userId, 'aktif');

    return {
      message: 'Kartu pelajar berhasil diunggah dan diproses',
      file: file.filename,
      extractedData,
      card,
    };
  }

  @Post()
  create(@Body() createDto: CreateStudentCardDto) {
    return this.cardService.create(createDto);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  @Get('extracted_data')
  async getExtractedData() {
    const cards = await this.cardService.findAll();
    return cards
      .filter(card => card.extracted_data)
      .map(card => ({
        user_id: card.user?.id?.toString() || '',
        kelas: card.extracted_data?.kelas || card.kelas || '',
        nama: card.extracted_data?.nama || '',
        nis: card.extracted_data?.nis || '',
        nisn: card.extracted_data?.nisn || '',
        ttl: card.extracted_data?.ttl || '',
        gender: card.extracted_data?.gender || '',
        jurusan: card.extracted_data?.jurusan || card.jurusan || '',
      }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateStudentCardDto) {
    return this.cardService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }
}
