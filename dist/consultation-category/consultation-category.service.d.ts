import { Repository } from 'typeorm';
import { ConsultationCategory } from './entities/consultation-category.entity';
import { CreateConsultationCategoryDto, UpdateConsultationCategoryDto } from './dto/create-consultation-category.dto';
export declare class ConsultationCategoryService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<ConsultationCategory>);
    create(createDto: CreateConsultationCategoryDto): Promise<ConsultationCategory>;
    findAll(isActive?: boolean): Promise<ConsultationCategory[]>;
    findById(id: number): Promise<ConsultationCategory>;
    update(id: number, updateDto: UpdateConsultationCategoryDto): Promise<ConsultationCategory>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    incrementUsage(id: number): Promise<void>;
    decrementUsage(id: number): Promise<void>;
}
