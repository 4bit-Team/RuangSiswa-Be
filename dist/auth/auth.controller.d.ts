import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: import("../users/entities/user.entity").User;
        studentCard: {
            nama: string;
            nis: string;
            ttl: string;
            gender: string;
            kelas: string;
        };
    } | {
        message: string;
        user: import("../users/entities/user.entity").User;
        studentCard?: undefined;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        access_token: string;
        user: {
            id: number;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            status: import("../users/entities/user.entity").UserStatus;
        };
    }>;
}
