import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('role') role?: string) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    return this.usersService.findAll();
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getCount() {
    return this.usersService.getCountByRole();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // Get students by jurusan IDs
  @Get('students/by-jurusan')
  @UseGuards(JwtAuthGuard)
  async getStudentsByJurusan(@Query('jurusanIds') jurusanIds: string) {
    if (!jurusanIds) {
      return [];
    }
    // Parse comma-separated or JSON array format
    let ids: number[] = [];
    try {
      ids = JSON.parse(jurusanIds);
    } catch {
      ids = jurusanIds.split(',').map((id) => parseInt(id, 10)).filter(id => !isNaN(id));
    }
    return await this.usersService.getStudentsByJurusanIdsAdvanced(ids);
  }
}
