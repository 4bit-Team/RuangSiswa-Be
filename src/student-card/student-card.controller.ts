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
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';

@Controller('student-card')
export class StudentCardController {
  constructor(
    private readonly cardService: StudentCardService,
    private readonly cardValidator: StudentCardValidationService,
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
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
  ) {
    if (!file) throw new BadRequestException('File kartu pelajar wajib diunggah');
    if (!userId) throw new BadRequestException('userId wajib dikirim');

    // 1️⃣ Jalankan OCR dengan Tesseract
    const extractedData = await this.cardValidator.validate(file.path);

    // 2️⃣ Simpan ke database (ubah id_user -> user)
    const card = await this.cardService.create({
      userId,
      file_path: file.path,
      extracted_data: extractedData,
    });

    return {
      message: '✅ Kartu pelajar berhasil diunggah dan diproses',
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
