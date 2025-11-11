import { StudentCardService } from './student-card.service';
import { CreateStudentCardDto } from './dto/create-student-card.dto';
import { UpdateStudentCardDto } from './dto/update-student-card.dto';
import { UsersService } from '../users/users.service';
import { KelasService } from '../kelas/kelas.service';
import { JurusanService } from '../jurusan/jurusan.service';
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';
export declare class StudentCardController {
    private readonly cardService;
    private readonly cardValidator;
    private readonly usersService;
    private readonly kelasService;
    private readonly jurusanService;
    constructor(cardService: StudentCardService, cardValidator: StudentCardValidationService, usersService: UsersService, kelasService: KelasService, jurusanService: JurusanService);
    uploadCard(file: Express.Multer.File, userId: number, kelasId: number, jurusanId: number): Promise<{
        message: string;
        file: string;
        extractedData: {
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
        };
        card: null;
    } | {
        message: string;
        file: string;
        extractedData: {
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
        };
        card: import("./entities/student-card.entity").StudentCard;
    }>;
    create(createDto: CreateStudentCardDto): Promise<import("./entities/student-card.entity").StudentCard>;
    findAll(): Promise<import("./entities/student-card.entity").StudentCard[]>;
    findOne(id: string): Promise<import("./entities/student-card.entity").StudentCard>;
    update(id: string, updateDto: UpdateStudentCardDto): Promise<import("./entities/student-card.entity").StudentCard>;
    remove(id: string): Promise<import("./entities/student-card.entity").StudentCard>;
}
