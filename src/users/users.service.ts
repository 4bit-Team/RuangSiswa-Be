import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);
    // Set relasi kelas dan jurusan jika ada id
    if (createUserDto.kelas_id) {
      user.kelas = { id: createUserDto.kelas_id } as any;
    }
    if (createUserDto.jurusan_id) {
      user.jurusan = { id: createUserDto.jurusan_id } as any;
    }
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateStatus(id: number, status: UserStatus): Promise<User> {
  await this.userRepo
    .createQueryBuilder()
    .update(User)
    .set({ status: status as UserStatus })
    .where('id = :id', { id })
    .execute();

  const updatedUser = await this.findOne(id);
  if (!updatedUser) throw new Error('User not found after update');
  return updatedUser;
}


  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) return null;
    if (updateUserDto.kelas_id) {
      user.kelas = { id: updateUserDto.kelas_id } as any;
    }
    if (updateUserDto.jurusan_id) {
      user.jurusan = { id: updateUserDto.jurusan_id } as any;
    }
    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) return null;
    return this.userRepo.remove(user);
  }

  // Optional: find by email (untuk login)
  findOneByEmail(email: string) {
    return this.userRepo.findOne({ 
      where: { email },
      relations: ['kelas', 'jurusan'], 
    });
  }
}
