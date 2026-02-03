import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emoji } from './entities/emoji.entity';
import { CreateEmojiDto } from './dto/create-emoji.dto';
import { UpdateEmojiDto } from './dto/update-emoji.dto';

@Injectable()
export class EmojiService {
  constructor(
    @InjectRepository(Emoji)
    private emojiRepository: Repository<Emoji>,
  ) {}

  // Create emoji
  async create(dto: CreateEmojiDto): Promise<Emoji> {
    const emoji = this.emojiRepository.create({
      emoji: dto.emoji,
      name: dto.name,
      category: dto.category || 'other',
      keywords: dto.keywords,
      isActive: dto.isActive !== false,
    });
    return this.emojiRepository.save(emoji);
  }

  // Get all emojis
  async findAll(active?: boolean): Promise<Emoji[]> {
    const query = this.emojiRepository.createQueryBuilder('emoji');
    
    if (active !== undefined) {
      query.where('emoji.isActive = :isActive', { isActive: active });
    }

    return query.orderBy('emoji.category', 'ASC').addOrderBy('emoji.name', 'ASC').getMany();
  }

  // Get emoji by ID
  async findById(id: number): Promise<Emoji | null> {
    return this.emojiRepository.findOne({ where: { id } });
  }

  // Get emoji by emoji character
  async findByEmoji(emoji: string): Promise<Emoji | null> {
    return this.emojiRepository.findOne({ where: { emoji } });
  }

  // Get emojis by category
  async findByCategory(category: string): Promise<Emoji[]> {
    return this.emojiRepository.find({
      where: { category, isActive: true },
      order: { name: 'ASC' },
    });
  }

  // Search emojis by name or keywords
  async search(query: string): Promise<Emoji[]> {
    return this.emojiRepository
      .createQueryBuilder('emoji')
      .where('emoji.name ILIKE :query', { query: `%${query}%` })
      .orWhere('emoji.keywords ILIKE :query', { query: `%${query}%` })
      .andWhere('emoji.isActive = true')
      .orderBy('emoji.name', 'ASC')
      .getMany();
  }

  // Update emoji
  async update(id: number, dto: UpdateEmojiDto): Promise<Emoji | null> {
    await this.emojiRepository.update(id, dto);
    return this.findById(id);
  }

  // Delete emoji
  async delete(id: number): Promise<void> {
    await this.emojiRepository.delete(id);
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    const result = await this.emojiRepository
      .createQueryBuilder('emoji')
      .select('DISTINCT emoji.category', 'category')
      .where('emoji.isActive = true')
      .orderBy('emoji.category', 'ASC')
      .getRawMany();

    return result.map((r) => r.category).filter((c) => c);
  }
}
