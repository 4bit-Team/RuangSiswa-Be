import * as fs from 'fs';
import { SpLetter } from './entities/violation.entity';
export declare class SpPdfService {
    private readonly logger;
    private readonly pdfStoragePath;
    constructor();
    generateSpPdf(spLetter: SpLetter): Promise<string>;
    generateSpPdfBuffer(spLetter: SpLetter): Promise<Buffer>;
    private drawHeader;
    private drawStudentDetails;
    private drawViolationSummary;
    private drawViolationChecklist;
    private drawConsequences;
    private drawSignatureSection;
    private drawSignatureBox;
    private drawFooter;
    getPdfStream(filename: string): fs.ReadStream;
    deletePdf(filename: string): void;
}
