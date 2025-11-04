import { StudentCardService } from './student-card.service';
import { CreateStudentCardDto } from './dto/create-student-card.dto';
import { UpdateStudentCardDto } from './dto/update-student-card.dto';
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';
export declare class StudentCardController {
    private readonly cardService;
    private readonly cardValidator;
    constructor(cardService: StudentCardService, cardValidator: StudentCardValidationService);
    uploadCard(file: Express.Multer.File, userId: number): Promise<{
        message: string;
        file: string;
        extractedData: {
            nama: string;
            nis: string;
            ttl: string;
            gender: string;
            kelas: string;
        };
        card: import("./entities/student-card.entity").StudentCard;
    }>;
    create(createDto: CreateStudentCardDto): Promise<import("./entities/student-card.entity").StudentCard>;
    findAll(): Promise<import("./entities/student-card.entity").StudentCard[]>;
    findOne(id: string): Promise<import("./entities/student-card.entity").StudentCard>;
    update(id: string, updateDto: UpdateStudentCardDto): Promise<import("./entities/student-card.entity").StudentCard>;
    remove(id: string): Promise<import("./entities/student-card.entity").StudentCard>;
}
