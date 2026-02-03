import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BkJurusan } from './entities/bk-jurusan.entity';
import { CreateBkJurusanDto, UpdateBkJurusanDto } from './dto/create-bk-jurusan.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BkJurusanService {
  constructor(
    @InjectRepository(BkJurusan)
    private bkJurusanRepository: Repository<BkJurusan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Create - Add a new jurusan for a BK
  async addJurusan(bkId: number, jurusanId: number) {
    // Check if already exists
    const existing = await this.bkJurusanRepository.findOne({
      where: { bkId, jurusanId },
    });

    if (existing) {
      return existing;
    }

    const bkJurusan = this.bkJurusanRepository.create({
      bkId,
      jurusanId,
    });

    return await this.bkJurusanRepository.save(bkJurusan);
  }

  // Get all jurusan assigned to a BK
  async getJurusanByBkId(bkId: number) {
    return await this.bkJurusanRepository.find({
      where: { bkId },
      relations: ['jurusan'],
      order: { createdAt: 'ASC' },
    });
  }

  // Replace all jurusan for a BK (bulk update)
  async updateJurusanList(bkId: number, jurusanIds: number[]) {
    // Delete existing assignments
    await this.bkJurusanRepository.delete({ bkId });

    // Create new assignments
    if (jurusanIds && jurusanIds.length > 0) {
      const assignments = jurusanIds.map((jurusanId) =>
        this.bkJurusanRepository.create({ bkId, jurusanId }),
      );
      await this.bkJurusanRepository.save(assignments);
    }

    // Return updated list
    return await this.getJurusanByBkId(bkId);
  }

  // Remove a specific jurusan from a BK
  async removeJurusan(bkId: number, jurusanId: number) {
    const result = await this.bkJurusanRepository.delete({
      bkId,
      jurusanId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `BK Jurusan assignment not found for BK ${bkId} and Jurusan ${jurusanId}`,
      );
    }

    return { success: true };
  }

  // Check if a BK has a specific jurusan
  async hasJurusan(bkId: number, jurusanId: number): Promise<boolean> {
    const assignment = await this.bkJurusanRepository.findOne({
      where: { bkId, jurusanId },
    });
    return !!assignment;
  }

  // Get all BKs responsible for a specific jurusan
  async getBKsByJurusanId(jurusanId: number) {
    return await this.bkJurusanRepository.find({
      where: { jurusanId },
      relations: ['bk'],
    });
  }

  // Check if BK has any jurusan assigned
  async hasBkConfiguredAnyJurusan(bkId: number): Promise<boolean> {
    const count = await this.bkJurusanRepository.count({
      where: { bkId },
    });
    return count > 0;
  }
}
