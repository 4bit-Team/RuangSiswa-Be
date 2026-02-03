import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EmojiService } from './emoji.service';
import { CreateEmojiDto } from './dto/create-emoji.dto';
import { UpdateEmojiDto } from './dto/update-emoji.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('emojis')
export class EmojiController {
  constructor(private readonly emojiService: EmojiService) {}

  // Get all emojis (public endpoint - returns all if no filter, or filtered by active status)
  @Get()
  async getAllEmojis(@Query('active') active?: string) {
    // If active not specified, return all. If specified, filter by active status
    const isActive = active === undefined ? undefined : (active === 'false' ? false : true);
    return await this.emojiService.findAll(isActive);
  }

  // Search emojis
  @Get('search')
  async searchEmojis(@Query('q') query: string) {
    if (!query || query.length < 1) {
      return [];
    }
    return await this.emojiService.search(query);
  }

  // Get emoji categories
  @Get('categories')
  async getCategories() {
    return await this.emojiService.getCategories();
  }

  // Get emoji by ID
  @Get(':id')
  async getEmojiById(@Param('id') id: number) {
    const emoji = await this.emojiService.findById(id);
    if (!emoji) {
      throw new NotFoundException('Emoji not found');
    }
    return emoji;
  }

  // Create emoji (Admin only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createEmoji(@Body() dto: CreateEmojiDto) {
    const existing = await this.emojiService.findByEmoji(dto.emoji);
    if (existing) {
      throw new BadRequestException('Emoji already exists');
    }
    return await this.emojiService.create(dto);
  }

  // Update emoji (Admin only)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateEmoji(@Param('id') id: number, @Body() dto: UpdateEmojiDto) {
    const emoji = await this.emojiService.findById(id);
    if (!emoji) {
      throw new NotFoundException('Emoji not found');
    }
    return await this.emojiService.update(id, dto);
  }

  // Delete emoji (Admin only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteEmoji(@Param('id') id: number) {
    const emoji = await this.emojiService.findById(id);
    if (!emoji) {
      throw new NotFoundException('Emoji not found');
    }
    await this.emojiService.delete(id);
    return { message: 'Emoji deleted successfully' };
  }
}
