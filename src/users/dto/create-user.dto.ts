export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: 'kesiswaan' | 'siswa' | 'admin' | 'bk';
  status?: 'aktif' | 'nonaktif';
  kartu_pelajar_file?: string;
  isVerified?: boolean;
  kelas_id?: number;
  jurusan_id?: number;
}
