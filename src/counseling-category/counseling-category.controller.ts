import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CounselingCategoryService } from './counseling-category.service';
import { CreateCounselingCategoryDto, UpdateCounselingCategoryDto } from './dto/create-counseling-category.dto';

@Controller('counseling-category')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CounselingCategoryController {
  constructor(private readonly categoryService: CounselingCategoryService) {}

  @Post()
  @Roles('bk', 'kesiswaan', 'admin')
  async create(@Body() createDto: CreateCounselingCategoryDto) {
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
  @Roles('bk', 'kesiswaan', 'admin')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateCounselingCategoryDto,
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
