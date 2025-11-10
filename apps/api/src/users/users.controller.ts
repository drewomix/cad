import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { RoleGuard } from '../security/role.guard.js';
import { Roles } from '../security/roles.decorator.js';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsString()
  password?: string;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  list() {
    return { data: this.service.list() };
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }
}
