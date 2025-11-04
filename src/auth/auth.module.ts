import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { StudentCardModule } from '../student-card/student-card.module';
import { StudentCardValidationModule } from '../student-card-validation/student-card-validation.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    StudentCardModule,
    StudentCardValidationModule, // ✅ tambahkan ini
    JwtModule.register({ secret: 'SECRET_KEY', signOptions: { expiresIn: '1h' } }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
