import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToxicFilter } from './entities/toxic-filter.entity';
import { CreateToxicFilterDto } from './dto/create-toxic-filter.dto';
import { UpdateToxicFilterDto } from './dto/update-toxic-filter.dto';
import { ToxicDetectionResult } from './toxic-detection-result';
import { SeverityLevel } from './dto/create-toxic-filter.dto';

@Injectable()
export class ToxicFilterService {
  private filterCache: ToxicFilter[] = [];
  private cacheTimestamp: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(ToxicFilter)
    private toxicFilterRepository: Repository<ToxicFilter>,
  ) {
    this.refreshCache();
  }

  // Refresh cache from database
  private async refreshCache(): Promise<void> {
    try {
      this.filterCache = await this.toxicFilterRepository.find({
        where: { isActive: true },
      });
      this.cacheTimestamp = Date.now();
    } catch (error) {
      console.error('Error refreshing toxic filter cache:', error);
    }
  }

  // Get cache or refresh if expired
  private async getCachedFilters(): Promise<ToxicFilter[]> {
    if (Date.now() - this.cacheTimestamp > this.CACHE_DURATION) {
      await this.refreshCache();
    }
    return this.filterCache;
  }

  // Detect toxic content in text
  async detectToxic(text: string): Promise<ToxicDetectionResult> {
    const filters = await this.getCachedFilters();
    const lowerText = text.toLowerCase();
    const foundWords: Array<{
      word: string;
      severity: SeverityLevel;
      replacement: string;
    }> = [];
    let filteredText = text;
    let hasSevere = false;

    for (const filter of filters) {
      // Create regex pattern with word boundaries (case-insensitive)
      const pattern = new RegExp(`\\b${this.escapeRegex(filter.word)}\\b`, 'gi');
      
      if (pattern.test(lowerText)) {
        foundWords.push({
          word: filter.word,
          severity: filter.severity as SeverityLevel,
          replacement: filter.replacement,
        });

        if (filter.severity === 'high') {
          hasSevere = true;
        }

        // Replace all occurrences
        filteredText = filteredText.replace(pattern, filter.replacement);
      }
    }

    return {
      isToxic: foundWords.length > 0,
      foundWords,
      filteredText,
      hasSevere,
    };
  }

  // Check if text contains severe toxic content
  async hasSevereToxic(text: string): Promise<boolean> {
    const result = await this.detectToxic(text);
    return result.hasSevere;
  }

  // Filter text and return only the filtered result
  async filterText(text: string): Promise<string> {
    const result = await this.detectToxic(text);
    return result.filteredText;
  }

  // Escape special regex characters
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Create toxic filter
  async create(dto: CreateToxicFilterDto): Promise<ToxicFilter> {
    const filter = this.toxicFilterRepository.create({
      word: dto.word.toLowerCase(),
      severity: dto.severity || 'medium',
      replacement: dto.replacement || '***',
      isActive: dto.isActive !== false,
      description: dto.description,
    });
    const saved = await this.toxicFilterRepository.save(filter);
    await this.refreshCache(); // Refresh cache after create
    return saved;
  }

  // Get all filters
  async findAll(active?: boolean): Promise<ToxicFilter[]> {
    const query = this.toxicFilterRepository.createQueryBuilder('filter');

    if (active !== undefined) {
      query.where('filter.isActive = :isActive', { isActive: active });
    }

    return query.orderBy('filter.severity', 'DESC').addOrderBy('filter.word', 'ASC').getMany();
  }

  // Get filter by ID
  async findById(id: number): Promise<ToxicFilter | null> {
    return this.toxicFilterRepository.findOne({ where: { id } });
  }

  // Get filter by word
  async findByWord(word: string): Promise<ToxicFilter | null> {
    return this.toxicFilterRepository.findOne({
      where: { word: word.toLowerCase() },
    });
  }

  // Update filter
  async update(id: number, dto: UpdateToxicFilterDto): Promise<ToxicFilter | null> {
    if (dto.word) {
      dto.word = dto.word.toLowerCase();
    }
    await this.toxicFilterRepository.update(id, dto);
    await this.refreshCache(); // Refresh cache after update
    return this.findById(id);
  }

  // Delete filter
  async delete(id: number): Promise<void> {
    await this.toxicFilterRepository.delete(id);
    await this.refreshCache(); // Refresh cache after delete
  }

  // Get statistics
  async getStatistics(): Promise<{
    totalFilters: number;
    activeFilters: number;
    bySeveity: {
      low: number;
      medium: number;
      high: number;
    };
  }> {
    const all = await this.toxicFilterRepository.find();
    const active = await this.toxicFilterRepository.find({
      where: { isActive: true },
    });

    const bySeverity = {
      low: all.filter((f) => f.severity === 'low').length,
      medium: all.filter((f) => f.severity === 'medium').length,
      high: all.filter((f) => f.severity === 'high').length,
    };

    return {
      totalFilters: all.length,
      activeFilters: active.length,
      bySeveity: bySeverity,
    };
  }
}
