import { SeverityLevel } from './dto/create-toxic-filter.dto';
export declare class ToxicDetectionResult {
    isToxic: boolean;
    foundWords: Array<{
        word: string;
        severity: SeverityLevel;
        replacement: string;
    }>;
    filteredText: string;
    hasSevere: boolean;
}
