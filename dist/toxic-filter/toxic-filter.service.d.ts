import { Repository } from 'typeorm';
import { ToxicFilter } from './entities/toxic-filter.entity';
import { CreateToxicFilterDto } from './dto/create-toxic-filter.dto';
import { UpdateToxicFilterDto } from './dto/update-toxic-filter.dto';
import { ToxicDetectionResult } from './toxic-detection-result';
export declare class ToxicFilterService {
    private toxicFilterRepository;
    private filterCache;
    private cacheTimestamp;
    private CACHE_DURATION;
    constructor(toxicFilterRepository: Repository<ToxicFilter>);
    private refreshCache;
    private getCachedFilters;
    detectToxic(text: string): Promise<ToxicDetectionResult>;
    hasSevereToxic(text: string): Promise<boolean>;
    filterText(text: string): Promise<string>;
    private escapeRegex;
    create(dto: CreateToxicFilterDto): Promise<ToxicFilter>;
    findAll(active?: boolean): Promise<ToxicFilter[]>;
    findById(id: number): Promise<ToxicFilter | null>;
    findByWord(word: string): Promise<ToxicFilter | null>;
    update(id: number, dto: UpdateToxicFilterDto): Promise<ToxicFilter | null>;
    delete(id: number): Promise<void>;
    getStatistics(): Promise<{
        totalFilters: number;
        activeFilters: number;
        bySeveity: {
            low: number;
            medium: number;
            high: number;
        };
    }>;
}
