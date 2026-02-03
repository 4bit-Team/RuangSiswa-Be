import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	kelas_id?: number;
	jurusan_id?: number;
	kelas_lengkap?: string;
}
