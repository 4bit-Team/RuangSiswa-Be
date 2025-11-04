export declare class StudentCardValidationService {
    validate(filePath: string): Promise<{
        nama: string;
        nis: string;
        ttl: string;
        gender: string;
        kelas: string;
    }>;
}
