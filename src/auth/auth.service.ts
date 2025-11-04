import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StudentCardService } from '../student-card/student-card.service';
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cardService: StudentCardService,
    private readonly cardValidator: StudentCardValidationService,
  ) {}

  async register(registerDto: RegisterDto, filePath?: string) {
    // 1️⃣ Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 2️⃣ Buat user baru (default role siswa)
    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: 'siswa', // default
      status: 'nonaktif', // belum aktif sampai verifikasi kartu
    });

    // 3️⃣ Jika ada file upload (opsional)
    if (filePath) {
      const extractedData = await this.cardValidator.validate(filePath);

      await this.cardService.create({
        userId: user.id,
        file_path: filePath,
        extracted_data: extractedData,
      });

      return {
        message: 'Registrasi berhasil. Kartu pelajar berhasil diunggah.',
        user,
        studentCard: extractedData,
      };
    }

    // 4️⃣ Kalau belum upload kartu pelajar
    return {
      message: 'Registrasi berhasil. Silakan upload kartu pelajar Anda untuk verifikasi.',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Email atau password salah.');

    const match = await bcrypt.compare(loginDto.password, user.password);
    if (!match) throw new UnauthorizedException('Email atau password salah.');

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login berhasil',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }
}
