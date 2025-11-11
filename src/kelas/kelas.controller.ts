import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kelas } from './entities/kelas.entity';

@Controller('kelas')
export class KelasController {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepo: Repository<Kelas>,
  ) {}

  @Get()
  async findAll() {
    return this.kelasRepo.find();
  }
}
