import { ToxicFilterService } from './toxic-filter.service';
import { CreateToxicFilterDto } from './dto/create-toxic-filter.dto';
import { UpdateToxicFilterDto } from './dto/update-toxic-filter.dto';
export declare class ToxicFilterController {
    private readonly toxicFilterService;
    constructor(toxicFilterService: ToxicFilterService);
    getAllFilters(): Promise<import("./entities/toxic-filter.entity").ToxicFilter[]>;
    getStatistics(): Promise<{
        totalFilters: number;
        activeFilters: number;
        bySeveity: {
            low: number;
            medium: number;
            high: number;
        };
    }>;
    getFilterById(id: number): Promise<import("./entities/toxic-filter.entity").ToxicFilter>;
    createFilter(dto: CreateToxicFilterDto): Promise<import("./entities/toxic-filter.entity").ToxicFilter>;
    updateFilter(id: number, dto: UpdateToxicFilterDto): Promise<import("./entities/toxic-filter.entity").ToxicFilter | null>;
    deleteFilter(id: number): Promise<{
        message: string;
    }>;
}
