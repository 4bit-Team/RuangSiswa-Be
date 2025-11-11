import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StudentCardService } from '../student-card/student-card.service';
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly cardService;
    private readonly cardValidator;
    getUsersService(): UsersService;
    constructor(usersService: UsersService, jwtService: JwtService, cardService: StudentCardService, cardValidator: StudentCardValidationService);
    register(registerDto: RegisterDto, filePath?: string): Promise<{
        message: string;
        user: import("../users/entities/user.entity").User;
        studentCard: {
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
    } | {
        message: string;
        user: import("../users/entities/user.entity").User;
        studentCard?: undefined;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        id: number;
        username: string;
        email: string;
        role: import("../users/entities/user.entity").UserRole;
        status: import("../users/entities/user.entity").UserStatus;
        kartu_pelajar_file: string;
        kelas: import("../kelas/entities/kelas.entity").Kelas;
        jurusan: import("../jurusan/entities/jurusan.entity").Jurusan;
        studentCards: import("../student-card/entities/student-card.entity").StudentCard[];
    }>;
}
