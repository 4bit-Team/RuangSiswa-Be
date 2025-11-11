export declare class StudentCardValidationService {
    validate(filePath: string, inputKelas?: string, inputJurusan?: string): Promise<{
        nama: string;
        nis: string;
        nisn: string;
        ttl: string;
        gender: string;
        kelas: string;
        jurusan: string;
        raw_lines: string[];
        validasi: {
            kelas: boolean | "";
            jurusan: boolean | "";
            status: string;
        };
    }>;
}
