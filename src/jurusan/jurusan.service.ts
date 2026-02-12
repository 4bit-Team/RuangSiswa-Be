import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jurusan } from './entities/jurusan.entity';

@Injectable()
export class JurusanService {
  constructor(
    @InjectRepository(Jurusan)
    private readonly jurusanRepo: Repository<Jurusan>,
  ) {}

  async findOne(id: number) {
    return this.jurusanRepo.findOne({ where: { id } });
  }

  async findByKode(kode: string) {
    return this.jurusanRepo.findOne({ where: { kode } });
  }

  async findByNama(nama: string) {
    return this.jurusanRepo.findOne({ where: { nama } });
  }

  async findAll() {
    return this.jurusanRepo.find();
  }
}
