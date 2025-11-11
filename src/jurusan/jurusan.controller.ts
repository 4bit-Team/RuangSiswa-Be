import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jurusan } from './entities/jurusan.entity';

@Controller('jurusan')
export class JurusanController {
  constructor(
    @InjectRepository(Jurusan)
    private readonly jurusanRepo: Repository<Jurusan>,
  ) {}

  @Get()
  async findAll() {
    return this.jurusanRepo.find();
  }
}
