import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StudentCardService } from '../student-card/student-card.service';
import { StudentCardValidationService } from '../student-card-validation/student-card-validation.service';

@Injectable()
export class AuthService {
  // Expose usersService for controller
  getUsersService() {
    return this.usersService;
  }
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
      status: 'nonaktif',
      kartu_pelajar_file: filePath || undefined,
      kelas_id: registerDto.kelas_id,
      jurusan_id: registerDto.jurusan_id,
      phone_number: registerDto.phone_number,
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

  // async login(loginDto: LoginDto) {
  //   const user = await this.usersService.findOneByEmail(loginDto.email);
  //   if (!user) throw new UnauthorizedException('Email atau password salah.');

  //   const match = await bcrypt.compare(loginDto.password, user.password);
  //   if (!match) throw new UnauthorizedException('Email atau password salah.');

  //   const payload = { id: user.id, email: user.email, role: user.role };
  //   const token = this.jwtService.sign(payload);

  //   return {
  //     message: 'Login berhasil',
  //     access_token: token,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       role: user.role,
  //       status: user.status,
  //     },
  //   };
  // }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findOneByEmail(loginDto.email);
      if (!user) {
        console.error('[LOGIN ERROR] User not found for email:', loginDto.email);
        throw new BadRequestException('Akun tidak ditemukan');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        console.error('[LOGIN ERROR] Invalid password for email:', loginDto.email);
        throw new BadRequestException('Password yang dimasukkan salah');
      }

      const payload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        kelas: user.kelas?.nama,
        jurusan: user.jurusan?.nama,
        kelas_lengkap: user.kelas_lengkap,
      };

      const token = this.jwtService.sign(payload);
      const { password, ...result } = user;
      console.log('[LOGIN SUCCESS] User:', result);
      console.log('[LOGIN SUCCESS] Role:', result.role);
      return { ...result, token };
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      throw err;
    }
  }
}
