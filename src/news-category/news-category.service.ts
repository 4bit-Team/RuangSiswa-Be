import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsCategory } from './entities/news-category.entity';
import { CreateNewsCategoryDto, UpdateNewsCategoryDto } from './dto/create-news-category.dto';

@Injectable()
export class NewsCategoryService {
  constructor(
    @InjectRepository(NewsCategory)
    private readonly categoryRepository: Repository<NewsCategory>,
  ) {}

  async create(createDto: CreateNewsCategoryDto) {
    // Check if name already exists
    const existing = await this.categoryRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(`Category with name "${createDto.name}" already exists`);
    }

    const category = this.categoryRepository.create(createDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(isActive?: boolean) {
    const query = this.categoryRepository.createQueryBuilder('category');

    if (isActive !== undefined) {
      query.where('category.isActive = :isActive', { isActive });
    }

    return await query.orderBy('category.name', 'ASC').getMany();
  }

  async findById(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateDto: UpdateNewsCategoryDto) {
    const category = await this.findById(id);

    // If name is being updated, check for duplicates
    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existing) {
        throw new ConflictException(`Category with name "${updateDto.name}" already exists`);
      }
    }

    Object.assign(category, updateDto);
    return await this.categoryRepository.save(category);
  }

  async delete(id: number) {
    const category = await this.findById(id);
    await this.categoryRepository.remove(category);
    return { success: true, message: 'Category deleted successfully' };
  }

  async incrementUsage(id: number) {
    await this.categoryRepository.increment({ id }, 'usageCount', 1);
  }

  async decrementUsage(id: number) {
    await this.categoryRepository.decrement({ id }, 'usageCount', 1);
  }
}
