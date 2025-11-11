export class CreateStudentCardDto {
  userId: number;
  file_path: string;
  kelas?: string;
  jurusan?: string;
  extracted_data?: {
    nama?: string;
    nis?: string;
    ttl?: string;
    gender?: string;
    kelas?: string;
    jurusan?: string;
    [key: string]: any;
  };
}
