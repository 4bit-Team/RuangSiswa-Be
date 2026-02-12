import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kelas } from './entities/kelas.entity';

@Injectable()
export class KelasService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepo: Repository<Kelas>,
  ) {}

  async findOne(id: number) {
    return this.kelasRepo.findOne({ where: { id } });
  }

  async findByNama(nama: string) {
    return this.kelasRepo.findOne({ where: { nama } });
  }

  async findAll() {
    return this.kelasRepo.find();
  }
}
