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
}
