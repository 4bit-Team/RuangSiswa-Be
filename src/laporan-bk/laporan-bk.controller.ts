import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { LaporanBkService } from './laporan-bk.service';
import { CreateLaporanBkDto } from './dto/create-laporan-bk.dto';
import { UpdateLaporanBkDto } from './dto/update-laporan-bk.dto';

@Controller('laporan-bk')
export class LaporanBkController {
  constructor(private readonly laporanBkService: LaporanBkService) {}

  @Post()
  create(@Body() createLaporanBkDto: CreateLaporanBkDto) {
    return this.laporanBkService.create(createLaporanBkDto);
  }

  @Get()
  findAll() {
    return this.laporanBkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laporanBkService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLaporanBkDto: UpdateLaporanBkDto) {
    return this.laporanBkService.update(+id, updateLaporanBkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laporanBkService.remove(+id);
  }

  @Get('export/excel')
  async exportExcel(@Res() res: Response) {
    try {
      const { filePath, fileName } = await this.laporanBkService.exportToExcel();

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Optional: delete file after download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  @Get('template/download')
  async downloadTemplate(@Res() res: Response) {
    try {
      const { filePath, fileName } = await this.laporanBkService.generateTemplate();

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Optional: delete file after download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  @Post('import/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'src', '..', 'uploads', 'laporan');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/application\/(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$/)) {
          cb(new BadRequestException('Only Excel files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.laporanBkService.importFromExcel(file.path);

      // Delete uploaded file after processing
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });

      return result;
    } catch (error) {
      // Delete uploaded file on error
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });

      throw error;
    }
  }
}
