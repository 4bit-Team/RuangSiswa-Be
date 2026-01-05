import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaporanBk } from './entities/laporan-bk.entity';
import { CreateLaporanBkDto } from './dto/create-laporan-bk.dto';
import { UpdateLaporanBkDto } from './dto/update-laporan-bk.dto';
import { LaporanBkExcelService } from './laporan-bk-excel.service';
import * as path from 'path';

@Injectable()
export class LaporanBkService {
  constructor(
    @InjectRepository(LaporanBk)
    private readonly laporanBkRepo: Repository<LaporanBk>,
    private readonly excelService: LaporanBkExcelService,
  ) {}

  async create(createLaporanBkDto: CreateLaporanBkDto): Promise<LaporanBk> {
    const laporanBk = this.laporanBkRepo.create(createLaporanBkDto);

    // Set relasi jika ada id
    if (createLaporanBkDto.jurusanId) {
      laporanBk.jurusan = { id: createLaporanBkDto.jurusanId } as any;
    }
    if (createLaporanBkDto.kelasId) {
      laporanBk.kelas = { id: createLaporanBkDto.kelasId } as any;
    }
    if (createLaporanBkDto.guruBkYangMenanganiId) {
      laporanBk.guruBkYangMenanganis = { id: createLaporanBkDto.guruBkYangMenanganiId } as any;
    }

    return this.laporanBkRepo.save(laporanBk);
  }

  async findAll(): Promise<LaporanBk[]> {
    return this.laporanBkRepo.find({
      relations: ['jurusan', 'kelas', 'guruBkYangMenanganis'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LaporanBk> {
    const laporanBk = await this.laporanBkRepo.findOne({
      where: { id },
      relations: ['jurusan', 'kelas', 'guruBkYangMenanganis'],
    });

    if (!laporanBk) {
      throw new NotFoundException(`Laporan BK dengan ID ${id} tidak ditemukan`);
    }

    return laporanBk;
  }

  async update(id: number, updateLaporanBkDto: UpdateLaporanBkDto): Promise<LaporanBk> {
    const laporanBk = await this.findOne(id);

    // Update relasi jika ada id baru
    if (updateLaporanBkDto.jurusanId) {
      laporanBk.jurusan = { id: updateLaporanBkDto.jurusanId } as any;
    }
    if (updateLaporanBkDto.kelasId) {
      laporanBk.kelas = { id: updateLaporanBkDto.kelasId } as any;
    }
    if (updateLaporanBkDto.guruBkYangMenanganiId) {
      laporanBk.guruBkYangMenanganis = { id: updateLaporanBkDto.guruBkYangMenanganiId } as any;
    }

    Object.assign(laporanBk, updateLaporanBkDto);
    return this.laporanBkRepo.save(laporanBk);
  }

  async remove(id: number): Promise<LaporanBk> {
    const laporanBk = await this.findOne(id);
    return this.laporanBkRepo.remove(laporanBk);
  }

  async exportToExcel(): Promise<{ filePath: string; fileName: string }> {
    const data = await this.findAll();

    if (data.length === 0) {
      throw new BadRequestException('Tidak ada data untuk di-export');
    }

    const filePath = await this.excelService.exportToExcel(data);
    const fileName = path.basename(filePath);

    return { filePath, fileName };
  }

  async generateTemplate(): Promise<{ filePath: string; fileName: string }> {
    const filePath = await this.excelService.createTemplateFile();
    const fileName = path.basename(filePath);

    return { filePath, fileName };
  }

  async importFromExcel(filePath: string): Promise<{ success: number; failed: number; errors: any[] }> {
    try {
      const data = await this.excelService.importFromExcel(filePath);

      if (!data || data.length === 0) {
        throw new BadRequestException('File Excel tidak memiliki data');
      }

      let success = 0;
      let failed = 0;
      const errors: any[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];

          // Skip empty rows
          if (!row.namaKonseling) {
            continue;
          }

          await this.create(row);
          success++;
        } catch (error) {
          failed++;
          errors.push({
            row: i + 2,
            error: error.message,
          });
        }
      }

      return { success, failed, errors };
    } catch (error) {
      throw new BadRequestException(`Error importing Excel: ${error.message}`);
    }
  }
}

