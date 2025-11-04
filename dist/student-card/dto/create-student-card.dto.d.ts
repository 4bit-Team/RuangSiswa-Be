export declare class CreateStudentCardDto {
    userId: number;
    file_path: string;
    extracted_data?: {
        nama?: string;
        nis?: string;
        ttl?: string;
        gender?: string;
        kelas?: string;
        [key: string]: any;
    };
}
