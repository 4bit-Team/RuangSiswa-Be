import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentCard } from './entities/student-card.entity';
import { CreateStudentCardDto } from './dto/create-student-card.dto';
import { UpdateStudentCardDto } from './dto/update-student-card.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class StudentCardService {
  constructor(
    @InjectRepository(StudentCard)
    private readonly cardRepo: Repository<StudentCard>,
    private readonly usersService: UsersService,
  ) {}

  async create(createDto: CreateStudentCardDto & { userId: number }) {
    console.log('📩 [StudentCardService] Create DTO diterima:', createDto);

    // Cek user valid
    const user = await this.usersService.findOne(createDto.userId);
    if (!user) throw new NotFoundException(`User #${createDto.userId} not found`);

    // Buat entity card dengan type casting agar aman untuk TypeORM
    const card = this.cardRepo.create({
      user: user as any, // cast agar DeepPartial cocok
      file_path: createDto.file_path,
      extracted_data: createDto.extracted_data ?? undefined, // undefined, bukan null
    });

    console.log('💾 [StudentCardService] Akan disimpan ke DB:', card);

    // Simpan ke DB
    const saved = await this.cardRepo.save(card);
    console.log('✅ [StudentCardService] Berhasil disimpan:', saved);
    return saved;
  }

  findAll() {
    return this.cardRepo.find({ relations: ['user'] });
  }

  async findOne(id: number) {
    const card = await this.cardRepo.findOne({ where: { id }, relations: ['user'] });
    if (!card) throw new NotFoundException(`Student card #${id} not found`);
    return card;
  }

  async findByUserId(userId: number) {
    return await this.cardRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
  }

  async update(id: number, updateDto: UpdateStudentCardDto) {
    const card = await this.findOne(id);
    if (updateDto.file_path) {  
      card.file_path = updateDto.file_path;
    }
    return this.cardRepo.save(card);
  }

  async remove(id: number) {
    const card = await this.findOne(id);
    return this.cardRepo.remove(card);
  }
}
