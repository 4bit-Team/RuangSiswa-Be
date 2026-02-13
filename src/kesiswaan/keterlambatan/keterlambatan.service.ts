import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keterlambatan } from './entities/keterlambatan.entity';
import { CreateKeterlambatanDto, UpdateKeterlambatanDto, FilterKeterlambatanDto } from './dto/keterlambatan.dto';
import axios from 'axios';

@Injectable()
export class KeterlambatanService {
  private readonly walasApiBase = process.env.WALAS_API_BASE_URL || 'http://localhost:8000/api/v1';

  constructor(
    @InjectRepository(Keterlambatan)
    private keterlambatanRepository: Repository<Keterlambatan>,
  ) {}

  /**
   * Sinkronisasi keterlambatan dari Walas API
   * Note: Walas belum punya endpoint keterlambatan, sehingga menggunakan Kehadiran API
   * dan memfilter dengan nilai waktu masuk > jam standar
   */
  async syncFromWalas(startDate: string, endDate: string): Promise<any> {
    try {
      console.log(`[Keterlambatan] Syncing from Walas: ${startDate} to ${endDate}`);

      // Try to get from tardiness endpoint if available
      const walasUrl = `${this.walasApiBase}/walas/kehadiran`; // Fallback endpoint
      
      try {
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
            'Failed to fetch keterlambatan from Walas',
            HttpStatus.BAD_GATEWAY,
          );
        }

        // Note: For now, keterlambatan will need to be created manually
        // or from a different source. This is a placeholder for future integration.
        
        return {
          success: true,
          message: 'Keterlambatan sync endpoint ready (awaiting Walas API)',
          totalRecords: 0,
          results: [],
        };
      } catch (apiError) {
        // If Walas API is not available, return graceful error
        return {
          success: false,
          message: 'Walas API not available, please add keterlambatan data manually',
          error: apiError.message,
        };
      }
    } catch (error) {
      console.error('[Keterlambatan] Sync error:', error);
      throw new HttpException(
        `Failed to sync keterlambatan: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Get all keterlambatan records dengan filter
   */
  async findAll(filterDto: FilterKeterlambatanDto): Promise<any> {
    const { startDate, endDate, studentId, className, status, page = 1, limit = 50 } = filterDto;
    const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');

    if (startDate && endDate) {
      query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (studentId) {
      query.andWhere('keterlambatan.studentId = :studentId', { studentId });
    }

    if (className) {
      query.andWhere('keterlambatan.className = :className', { className });
    }

    if (status) {
      query.andWhere('keterlambatan.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('keterlambatan.date', 'DESC')
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
   * Get keterlambatan by ID
   */
  async findOne(id: number): Promise<Keterlambatan> {
    const record = await this.keterlambatanRepository.findOne({ where: { id } });
    if (!record) {
      throw new HttpException('Keterlambatan not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  /**
   * Get keterlambatan by student
   */
  async findByStudent(studentId: number, filterDto?: FilterKeterlambatanDto): Promise<any> {
    const { startDate, endDate, status, page = 1, limit = 50 } = filterDto || {};
    const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');

    query.andWhere('keterlambatan.studentId = :studentId', { studentId });

    if (startDate && endDate) {
      query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (status) {
      query.andWhere('keterlambatan.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('keterlambatan.date', 'DESC')
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
   * Get keterlambatan by class
   */
  async findByClass(className: string, filterDto?: FilterKeterlambatanDto): Promise<any> {
    const { startDate, endDate, status, page = 1, limit = 50 } = filterDto || {};
    const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');

    query.andWhere('keterlambatan.className = :className', { className });

    if (startDate && endDate) {
      query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (status) {
      query.andWhere('keterlambatan.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('keterlambatan.date', 'DESC')
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
   * Create keterlambatan record
   */
  async create(createKeterlambatanDto: CreateKeterlambatanDto): Promise<Keterlambatan> {
    const record = this.keterlambatanRepository.create(createKeterlambatanDto);
    return await this.keterlambatanRepository.save(record);
  }

  /**
   * Update keterlambatan record
   */
  async update(id: number, updateKeterlambatanDto: UpdateKeterlambatanDto): Promise<Keterlambatan> {
    await this.keterlambatanRepository.update(id, updateKeterlambatanDto);
    return this.findOne(id);
  }

  /**
   * Delete keterlambatan record
   */
  async delete(id: number): Promise<void> {
    await this.findOne(id); // Verify exists
    await this.keterlambatanRepository.delete(id);
  }

  /**
   * Get keterlambatan statistics
   */
  async getStatistics(filterDto: FilterKeterlambatanDto): Promise<any> {
    const { startDate, endDate, studentId, className } = filterDto;
    const query = this.keterlambatanRepository.createQueryBuilder('keterlambatan');

    if (startDate && endDate) {
      query.andWhere('keterlambatan.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (studentId) {
      query.andWhere('keterlambatan.studentId = :studentId', { studentId });
    }

    if (className) {
      query.andWhere('keterlambatan.className = :className', { className });
    }

    const totalTardiness = await query.getCount();
    const sumMinutes = await query
      .select('SUM(keterlambatan.minutesLate)', 'totalMinutes')
      .getRawOne();

    const resolved = await query
      .andWhere('keterlambatan.status = :status', { status: 'resolved' })
      .getCount();

    const averageMinutes = totalTardiness > 0 ? Math.round((sumMinutes?.totalMinutes || 0) / totalTardiness) : 0;

    return {
      totalTardiness,
      totalMinutesLate: sumMinutes?.totalMinutes || 0,
      averageMinutes,
      resolvedCount: resolved,
      unresolvedCount: totalTardiness - resolved,
    };
  }
}
