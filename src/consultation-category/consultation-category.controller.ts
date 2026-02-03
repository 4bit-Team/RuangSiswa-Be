import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConsultationCategoryService } from './consultation-category.service';
import { CreateConsultationCategoryDto, UpdateConsultationCategoryDto } from './dto/create-consultation-category.dto';

@Controller('consultation-category')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationCategoryController {
  constructor(private readonly categoryService: ConsultationCategoryService) {}

  @Post()
  @Roles('siswa', 'kesiswaan', 'admin')
  async create(@Body() createDto: CreateConsultationCategoryDto) {
    return await this.categoryService.create(createDto);
  }

  @Get()
  async findAll() {
    return await this.categoryService.findAll(true);
  }

  @Get('all')
  async findAllIncludeInactive() {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.categoryService.findById(id);
  }

  @Put(':id')
  @Roles('siswa', 'kesiswaan', 'admin')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateConsultationCategoryDto,
  ) {
    return await this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(200)
  async delete(@Param('id') id: number) {
    return await this.categoryService.delete(id);
  }
}
