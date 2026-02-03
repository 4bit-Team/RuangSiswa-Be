import { Controller, Post, Get, Body, Req, Res, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto);

    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.ruangsiswa.my.id',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login berhasil',
      user: result,
      token: result.token,
    });
  }


  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.ruangsiswa.my.id',
      path: '/',
    });
    res.clearCookie('auth_profile', {
      domain: '.ruangsiswa.my.id',
      path: '/',
    });
    return { message: 'Logout berhasil' };
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    // Ambil user lengkap dari database
    const userService = this.authService.getUsersService();
    let user: any = null;
    // req.user is set by JwtStrategy, should have id, username, email, role
    const jwtUser = req.user as any;
    if (jwtUser && typeof jwtUser === 'object') {
      if (typeof jwtUser.email === 'string' && jwtUser.email) {
        user = await userService.findOneByEmail(jwtUser.email);
      } else if (typeof jwtUser.id === 'number' && jwtUser.id) {
        user = await userService.findOne(jwtUser.id);
      }
    }
    if (!user) {
      return { error: 'User not found' };
    }
    // Remove password before returning
    if (typeof user === 'object' && user !== null && 'password' in user) {
      const { password, ...profile } = user;
      return profile;
    }
    return user;
  }
}
