import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ToxicFilterService } from './toxic-filter.service';
import { CreateToxicFilterDto } from './dto/create-toxic-filter.dto';
import { UpdateToxicFilterDto } from './dto/update-toxic-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('toxic-filters')
export class ToxicFilterController {
  constructor(private readonly toxicFilterService: ToxicFilterService) {}

  // Get all filters (Admin only)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllFilters() {
    return await this.toxicFilterService.findAll();
  }

  // Get statistics (Admin only)
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getStatistics() {
    return await this.toxicFilterService.getStatistics();
  }

  // Get filter by ID (Admin only)
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getFilterById(@Param('id') id: number) {
    const filter = await this.toxicFilterService.findById(id);
    if (!filter) {
      throw new NotFoundException('Filter not found');
    }
    return filter;
  }

  // Create filter (Admin only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createFilter(@Body() dto: CreateToxicFilterDto) {
    const existing = await this.toxicFilterService.findByWord(dto.word);
    if (existing) {
      throw new BadRequestException('Filter word already exists');
    }
    return await this.toxicFilterService.create(dto);
  }

  // Update filter (Admin only)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateFilter(
    @Param('id') id: number,
    @Body() dto: UpdateToxicFilterDto,
  ) {
    const filter = await this.toxicFilterService.findById(id);
    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    // If updating word, check for duplicates
    if (dto.word && dto.word.toLowerCase() !== filter.word) {
      const existing = await this.toxicFilterService.findByWord(dto.word);
      if (existing) {
        throw new BadRequestException('Filter word already exists');
      }
    }

    return await this.toxicFilterService.update(id, dto);
  }

  // Delete filter (Admin only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteFilter(@Param('id') id: number) {
    const filter = await this.toxicFilterService.findById(id);
    if (!filter) {
      throw new NotFoundException('Filter not found');
    }
    await this.toxicFilterService.delete(id);
    return { message: 'Filter deleted successfully' };
  }
}
