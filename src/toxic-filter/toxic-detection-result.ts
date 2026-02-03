import { SeverityLevel } from './dto/create-toxic-filter.dto';

export class ToxicDetectionResult {
  isToxic: boolean;
  foundWords: Array<{
    word: string;
    severity: SeverityLevel;
    replacement: string;
  }>;
  filteredText: string;
  hasSevere: boolean; // true if any HIGH severity word found
}
