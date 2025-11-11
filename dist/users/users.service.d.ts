import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    updateStatus(id: number, status: UserStatus): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User | null>;
    remove(id: number): Promise<User | null>;
    findOneByEmail(email: string): Promise<User | null>;
}
