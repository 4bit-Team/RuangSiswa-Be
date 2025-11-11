import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
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
    login(dto: LoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    getProfile(req: Request): Promise<any>;
}
