import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  walletAddress?: string;
}

class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  passwordHash: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register({
      name: dto.name,
      email: dto.email,
      passwordHash: dto.passwordHash,
      role: dto.role,
      walletAddress: dto.walletAddress || '0x0000000000000000000000000000000000000000',
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.passwordHash);
  }
}
