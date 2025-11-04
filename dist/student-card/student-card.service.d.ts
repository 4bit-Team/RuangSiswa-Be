import { Repository } from 'typeorm';
import { StudentCard } from './entities/student-card.entity';
import { CreateStudentCardDto } from './dto/create-student-card.dto';
import { UpdateStudentCardDto } from './dto/update-student-card.dto';
import { UsersService } from '../users/users.service';
export declare class StudentCardService {
    private readonly cardRepo;
    private readonly usersService;
    constructor(cardRepo: Repository<StudentCard>, usersService: UsersService);
    create(createDto: CreateStudentCardDto & {
        userId: number;
    }): Promise<StudentCard>;
    findAll(): Promise<StudentCard[]>;
    findOne(id: number): Promise<StudentCard>;
    update(id: number, updateDto: UpdateStudentCardDto): Promise<StudentCard>;
    remove(id: number): Promise<StudentCard>;
}
