import { LaporanBk } from './entities/laporan-bk.entity';
export declare class LaporanBkExcelService {
    private readonly templateDir;
    constructor();
    private ensureTemplateDir;
    createTemplateFile(): Promise<string>;
    exportToExcel(data: LaporanBk[]): Promise<string>;
    importFromExcel(filePath: string): Promise<any[]>;
    private setColumnWidths;
    private addHeaders;
    private addSampleRow;
    private addDataRow;
    private parseNumber;
}
