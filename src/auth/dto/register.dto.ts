export class RegisterDto {
  username: string;
  email: string;
  password: string;
  kartu_pelajar_file: string;
  kelas_id?: number;
  jurusan_id?: number;
  phone_number?: string;
}