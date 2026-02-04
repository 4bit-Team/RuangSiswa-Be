import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NewsCategoryService } from './news-category.service';
import { CreateNewsCategoryDto, UpdateNewsCategoryDto } from './dto/create-news-category.dto';

@Controller('news-category')
export class NewsCategoryController {
  constructor(private readonly categoryService: NewsCategoryService) {}

  // Public endpoint - no authentication required
  @Get('public/list')
  async getPublicCategories() {
    return await this.categoryService.findAll(true);
  }

  // Protected endpoints - require authentication
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk', 'kesiswaan', 'admin')
  async create(@Body() createDto: CreateNewsCategoryDto) {
    return await this.categoryService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return await this.categoryService.findAll(true);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllIncludeInactive() {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findById(@Param('id') id: number) {
    return await this.categoryService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk', 'kesiswaan', 'admin')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateNewsCategoryDto,
  ) {
    return await this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async delete(@Param('id') id: number) {
    return await this.categoryService.delete(id);
  }
}
