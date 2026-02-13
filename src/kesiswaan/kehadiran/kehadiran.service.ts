import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Kehadiran } from './entities/kehadiran.entity';
import { CreateKehadiranDto, UpdateKehadiranDto, FilterKehadiranDto } from './dto/kehadiran.dto';
import axios from 'axios';

@Injectable()
export class KehadiranService {
  private readonly walasApiBase = process.env.WALAS_API__URL || 'http://localhost:8000/api/v1';

  constructor(
    @InjectRepository(Kehadiran)
    private kehadiranRepository: Repository<Kehadiran>,
  ) {}

  /**
   * Sinkronisasi kehadiran dari Walas API
   */
  async syncFromWalas(startDate: string, endDate: string): Promise<any> {
    try {
      console.log(`[Kehadiran] Syncing from Walas: ${startDate} to ${endDate}`);

      const walasUrl = `${this.walasApiBase}/v1/walas/kehadiran`;
      const response = await axios.get(walasUrl, {
        params: {
          start_date: startDate,
          end_date: endDate,
          limit: 500,
        },
        timeout: 10000,
      });

      if (!response.data?.success || !response.data?.data) {
        throw new HttpException(
          'Failed to fetch kehadiran from Walas',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const kehadiranRecords = response.data.data;
      const syncResults: Array<{ status: string; record: any; error?: string }> = [];

      // Process each record
      for (const record of kehadiranRecords) {
        try {
          const existingRecord = await this.kehadiranRepository.findOne({
            where: {
              studentId: record.siswas_id || record.studentId,
              date: record.tanggal || record.date,
            },
          });

          const kehadiranData: CreateKehadiranDto = {
            studentId: record.siswas_id || record.studentId,
            studentName: record.student_name || record.studentName,
            className: record.kelas || record.className,
            date: record.tanggal || record.date,
            status: this.mapStatusFromWalas(record.status),
            time: record.time,
            notes: record.keterangan,
            walasId: record.walas_id,
            walasName: record.walas_name,
            source: 'sync',
          };

          if (existingRecord) {
            // Update existing record
            await this.kehadiranRepository.update(existingRecord.id, kehadiranData);
            syncResults.push({
              status: 'updated',
              record: record.siswas_id,
            });
          } else {
            // Create new record
            const newRecord = this.kehadiranRepository.create(kehadiranData);
            await this.kehadiranRepository.save(newRecord);
            syncResults.push({
              status: 'created',
              record: record.siswas_id,
            });
          }
        } catch (error) {
          console.error(`[Kehadiran] Error processing record:`, error);
          syncResults.push({
            status: 'error',
            record: record.siswas_id,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        message: 'Kehadiran synchronized successfully',
        totalRecords: kehadiranRecords.length,
        results: syncResults,
      };
    } catch (error) {
      console.error('[Kehadiran] Sync error:', error);
      throw new HttpException(
        `Failed to sync kehadiran: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Map status dari Walas ke format lokal
   */
  private mapStatusFromWalas(status: string): 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' {
    const statusMap: Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'> = {
      H: 'Hadir',
      S: 'Sakit',
      I: 'Izin',
      A: 'Alpa',
      hadir: 'Hadir',
      sakit: 'Sakit',
      izin: 'Izin',
      alfa: 'Alpa',
    };
    return statusMap[status?.toLowerCase()] || 'Hadir';
  }

  /**
   * Get all kehadiran records dengan filter
   */
  async findAll(filterDto: FilterKehadiranDto): Promise<any> {
    const { startDate, endDate, studentId, className, status, page = 1, limit = 50 } = filterDto;
    const query = this.kehadiranRepository.createQueryBuilder('kehadiran');

    if (startDate && endDate) {
      query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (studentId) {
      query.andWhere('kehadiran.studentId = :studentId', { studentId });
    }

    if (className) {
      query.andWhere('kehadiran.className = :className', { className });
    }

    if (status) {
      query.andWhere('kehadiran.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('kehadiran.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get kehadiran by ID
   */
  async findOne(id: number): Promise<Kehadiran> {
    const record = await this.kehadiranRepository.findOne({ where: { id } });
    if (!record) {
      throw new HttpException('Kehadiran not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  /**
   * Get kehadiran by student
   */
  async findByStudent(studentId: number, filterDto?: FilterKehadiranDto): Promise<any> {
    const { startDate, endDate, status, page = 1, limit = 50 } = filterDto || {};
    const query = this.kehadiranRepository.createQueryBuilder('kehadiran');

    query.andWhere('kehadiran.studentId = :studentId', { studentId });

    if (startDate && endDate) {
      query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (status) {
      query.andWhere('kehadiran.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('kehadiran.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get kehadiran by class
   */
  async findByClass(className: string, filterDto?: FilterKehadiranDto): Promise<any> {
    const { startDate, endDate, status, page = 1, limit = 50 } = filterDto || {};
    const query = this.kehadiranRepository.createQueryBuilder('kehadiran');

    query.andWhere('kehadiran.className = :className', { className });

    if (startDate && endDate) {
      query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (status) {
      query.andWhere('kehadiran.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('kehadiran.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create kehadiran record
   */
  async create(createKehadiranDto: CreateKehadiranDto): Promise<Kehadiran> {
    const record = this.kehadiranRepository.create(createKehadiranDto);
    return await this.kehadiranRepository.save(record);
  }

  /**
   * Update kehadiran record
   */
  async update(id: number, updateKehadiranDto: UpdateKehadiranDto): Promise<Kehadiran> {
    await this.kehadiranRepository.update(id, updateKehadiranDto);
    return this.findOne(id);
  }

  /**
   * Delete kehadiran record
   */
  async delete(id: number): Promise<void> {
    await this.findOne(id); // Verify exists
    await this.kehadiranRepository.delete(id);
  }

  /**
   * Get kehadiran statistics
   */
  async getStatistics(filterDto: FilterKehadiranDto): Promise<any> {
    const { startDate, endDate, studentId, className } = filterDto;
    const query = this.kehadiranRepository.createQueryBuilder('kehadiran');

    if (startDate && endDate) {
      query.andWhere('kehadiran.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (studentId) {
      query.andWhere('kehadiran.studentId = :studentId', { studentId });
    }

    if (className) {
      query.andWhere('kehadiran.className = :className', { className });
    }

    const totalRecords = await query.getCount();
    const hadir = await query.andWhere('kehadiran.status = :status', { status: 'Hadir' }).getCount();
    const sakit = await query.andWhere('kehadiran.status = :status', { status: 'Sakit' }).getCount();
    const izin = await query.andWhere('kehadiran.status = :status', { status: 'Izin' }).getCount();
    const alpa = await query.andWhere('kehadiran.status = :status', { status: 'Alpa' }).getCount();

    return {
      totalRecords,
      totalHadir: hadir,
      totalSakit: sakit,
      totalIzin: izin,
      totalAlpa: alpa,
      attendancePercentage: totalRecords > 0 ? Math.round((hadir / totalRecords) * 100) : 0,
    };
  }
}
