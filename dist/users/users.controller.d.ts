import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    findAll(role?: string): Promise<import("./entities/user.entity").User[]>;
    findByRole(role: string, student_id?: string): Promise<import("./entities/user.entity").User[]>;
    getCount(): Promise<{
        total: number;
        siswa: number;
        bk: number;
        kesiswaan: number;
        admin: number;
    }>;
    findOne(id: string): Promise<import("./entities/user.entity").User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User | null>;
    remove(id: string): Promise<import("./entities/user.entity").User | null>;
    getStudentsByJurusan(jurusanIds: string): Promise<import("./entities/user.entity").User[]>;
}
