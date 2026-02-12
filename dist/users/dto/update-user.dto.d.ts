import { CreateUserDto } from './create-user.dto';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    kelas_id?: number;
    jurusan_id?: number;
    kelas_lengkap?: string;
}
export {};
