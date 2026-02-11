import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointPelanggaran } from './entities/point-pelanggaran.entity';
import { CreatePointPelanggaranDto } from './dto/create-point-pelanggaran.dto';
import { UpdatePointPelanggaranDto } from './dto/update-point-pelanggaran.dto';

@Injectable()
export class PointPelanggaranService {
  private readonly logger = new Logger(PointPelanggaranService.name);

  constructor(
    @InjectRepository(PointPelanggaran)
    private pointPelanggaranRepository: Repository<PointPelanggaran>,
  ) {}

  /**
   * Create new point pelanggaran
   * Validasi: kode harus unik
   */
  async create(dto: CreatePointPelanggaranDto): Promise<PointPelanggaran> {
    try {
      // Validasi kode harus unik
      const existingKode = await this.pointPelanggaranRepository.findOne({
        where: { kode: dto.kode },
      });

      if (existingKode) {
        throw new ConflictException(`Kode pelanggaran ${dto.kode} sudah digunakan`);
      }

      // Jika isActive true, pastikan hanya 1 tahun point yang active per tahun
      if (dto.isActive) {
        await this.deactivateOtherActiveYear(dto.tahun_point);
      }

      const pointPelanggaran = this.pointPelanggaranRepository.create({
        tahun_point: dto.tahun_point,
        category_point: dto.category_point,
        nama_pelanggaran: dto.nama_pelanggaran,
        kode: dto.kode,
        bobot: dto.bobot,
        isActive: dto.isActive || false,
        isSanksi: dto.isSanksi || false,
        isDo: dto.isDo || false,
        deskripsi: dto.deskripsi,
      });

      return await this.pointPelanggaranRepository.save(pointPelanggaran);
    } catch (error) {
      this.logger.error(`Error creating point pelanggaran: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all point pelanggaran
   * Optional filter: tahun_point, isActive
   */
  async findAll(tahunPoint?: number, isActive?: boolean): Promise<PointPelanggaran[]> {
    const query = this.pointPelanggaranRepository.createQueryBuilder('pp');

    if (tahunPoint) {
      query.where('pp.tahun_point = :tahunPoint', { tahunPoint });
    }

    if (isActive !== undefined) {
      query.andWhere('pp.isActive = :isActive', { isActive });
    }

    return query.orderBy('pp.tahun_point', 'DESC').addOrderBy('pp.bobot', 'DESC').getMany();
  }

  /**
   * Get point pelanggaran by year (tahun point aktif)
   */
  async findByYear(tahun: number): Promise<PointPelanggaran[]> {
    return this.pointPelanggaranRepository.find({
      where: { tahun_point: tahun },
      order: { bobot: 'DESC' },
    });
  }

  /**
   * Get active point pelanggaran for current year
   */
  async findActive(): Promise<PointPelanggaran[]> {
    return this.pointPelanggaranRepository.find({
      where: { isActive: true },
      order: { bobot: 'DESC' },
    });
  }

  /**
   * Get point pelanggaran by category
   */
  async findByCategory(
    category: string,
    tahun?: number,
  ): Promise<PointPelanggaran[]> {
    const query = this.pointPelanggaranRepository
      .createQueryBuilder('pp')
      .where('pp.category_point = :category', { category });

    if (tahun) {
      query.andWhere('pp.tahun_point = :tahun', { tahun });
    }

    return query.orderBy('pp.bobot', 'DESC').getMany();
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const result = await this.pointPelanggaranRepository
      .createQueryBuilder('pp')
      .select('DISTINCT pp.category_point', 'category')
      .orderBy('pp.category_point', 'ASC')
      .getRawMany();

    return result.map((r) => r.category).filter((c) => c);
  }

  /**
   * Get point pelanggaran by ID
   */
  async findById(id: number): Promise<PointPelanggaran> {
    const pointPelanggaran = await this.pointPelanggaranRepository.findOne({
      where: { id },
    });

    if (!pointPelanggaran) {
      throw new NotFoundException(`Point pelanggaran dengan ID ${id} tidak ditemukan`);
    }

    return pointPelanggaran;
  }

  /**
   * Get point pelanggaran by kode
   */
  async findByKode(kode: number): Promise<PointPelanggaran> {
    const pointPelanggaran = await this.pointPelanggaranRepository.findOne({
      where: { kode },
    });

    if (!pointPelanggaran) {
      throw new NotFoundException(`Point pelanggaran dengan kode ${kode} tidak ditemukan`);
    }

    return pointPelanggaran;
  }

  /**
   * Update point pelanggaran
   * Validasi: kode harus tetap unik
   */
  async update(id: number, dto: UpdatePointPelanggaranDto): Promise<PointPelanggaran> {
    try {
      const pointPelanggaran = await this.findById(id);

      // Jika kode berubah, validasi kode baru harus unik
      if (dto.kode && dto.kode !== pointPelanggaran.kode) {
        const existingKode = await this.pointPelanggaranRepository.findOne({
          where: { kode: dto.kode },
        });

        if (existingKode) {
          throw new ConflictException(`Kode pelanggaran ${dto.kode} sudah digunakan`);
        }
      }

      // Jika isActive diubah menjadi true, pastikan hanya 1 tahun point yang active per tahun
      if (dto.isActive === true && !pointPelanggaran.isActive) {
        await this.deactivateOtherActiveYear(pointPelanggaran.tahun_point);
      }

      // Update field-field yang ada
      Object.assign(pointPelanggaran, dto);

      return await this.pointPelanggaranRepository.save(pointPelanggaran);
    } catch (error) {
      this.logger.error(`Error updating point pelanggaran: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete point pelanggaran
   */
  async delete(id: number): Promise<void> {
    const pointPelanggaran = await this.findById(id);
    await this.pointPelanggaranRepository.delete(id);
  }

  /**
   * Get point pelanggaran dengan kategori Sanksi
   */
  async findSanksi(tahun?: number): Promise<PointPelanggaran[]> {
    const query = this.pointPelanggaranRepository.createQueryBuilder('pp').where('pp.isSanksi = :isSanksi', {
      isSanksi: true,
    });

    if (tahun) {
      query.andWhere('pp.tahun_point = :tahun', { tahun });
    }

    return query.orderBy('pp.bobot', 'DESC').getMany();
  }

  /**
   * Get point pelanggaran dengan kategori Drop Out/Mutasi
   */
  async findDoMutasi(tahun?: number): Promise<PointPelanggaran[]> {
    const query = this.pointPelanggaranRepository.createQueryBuilder('pp').where('pp.isDo = :isDo', { isDo: true });

    if (tahun) {
      query.andWhere('pp.tahun_point = :tahun', { tahun });
    }

    return query.orderBy('pp.bobot', 'DESC').getMany();
  }

  /**
   * Deactivate other active year when setting new year as active
   * Memastikan hanya 1 tahun point yang active per tahun
   */
  private async deactivateOtherActiveYear(tahun: number): Promise<void> {
    const activeYear = await this.pointPelanggaranRepository.findOne({
      where: { tahun_point: tahun, isActive: true },
    });

    if (activeYear) {
      activeYear.isActive = false;
      await this.pointPelanggaranRepository.save(activeYear);
    }
  }

  /**
   * Set tahun point as active (deactivate others in same year)
   */
  async setActive(id: number): Promise<PointPelanggaran> {
    const pointPelanggaran = await this.findById(id);

    // Deactivate other active year
    await this.deactivateOtherActiveYear(pointPelanggaran.tahun_point);

    // Activate this year
    pointPelanggaran.isActive = true;
    return await this.pointPelanggaranRepository.save(pointPelanggaran);
  }

  /**
   * Deactivate tahun point
   */
  async setInactive(id: number): Promise<PointPelanggaran> {
    const pointPelanggaran = await this.findById(id);
    pointPelanggaran.isActive = false;
    return await this.pointPelanggaranRepository.save(pointPelanggaran);
  }

  /**
   * Get total bobot for a list of code violations
   * Berguna untuk menghitung total poin pelanggaran siswa
   */
  async calculateTotalBobot(kodes: number[]): Promise<number> {
    if (!kodes || kodes.length === 0) {
      return 0;
    }

    const result = await this.pointPelanggaranRepository
      .createQueryBuilder('pp')
      .select('SUM(pp.bobot)', 'total')
      .where('pp.kode IN (:...kodes)', { kodes })
      .getRawOne();

    return result?.total || 0;
  }

  /**
   * Get summary of all point pelanggaran by year
   */
  async getSummaryByYear(): Promise<Array<{ tahun: number; totalPelanggaran: number; activeYear: boolean }>> {
    const result = await this.pointPelanggaranRepository
      .createQueryBuilder('pp')
      .select('pp.tahun_point', 'tahun')
      .addSelect('COUNT(*)', 'totalPelanggaran')
      .addSelect('MAX(pp.isActive)', 'activeYear')
      .groupBy('pp.tahun_point')
      .orderBy('pp.tahun_point', 'DESC')
      .getRawMany();

    return result.map((row) => ({
      tahun: parseInt(row.tahun),
      totalPelanggaran: parseInt(row.totalPelanggaran),
      activeYear: row.activeYear === true,
    }));
  }

  /**
   * Get summary of all point pelanggaran by category
   */
  async getSummaryByCategory(): Promise<
    Array<{ category: string; totalPelanggaran: number; maxBobot: number }>
  > {
    const result = await this.pointPelanggaranRepository
      .createQueryBuilder('pp')
      .select('pp.category_point', 'category')
      .addSelect('COUNT(*)', 'totalPelanggaran')
      .addSelect('MAX(pp.bobot)', 'maxBobot')
      .groupBy('pp.category_point')
      .orderBy('pp.category_point', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      category: row.category,
      totalPelanggaran: parseInt(row.totalPelanggaran),
      maxBobot: parseInt(row.maxBobot),
    }));
  }
}
