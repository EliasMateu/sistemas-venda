import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req) {
    return this.authService.profile(req.user.id);
  }
}
