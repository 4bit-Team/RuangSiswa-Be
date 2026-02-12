import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PointPelanggaranService } from './point-pelanggaran.service';
import { CreatePointPelanggaranDto } from './dto/create-point-pelanggaran.dto';
import { UpdatePointPelanggaranDto } from './dto/update-point-pelanggaran.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('point-pelanggaran')
export class PointPelanggaranController {
  constructor(private readonly pointPelanggaranService: PointPelanggaranService) {}

  /**
   * Get all unique categories
   */
  @Get('categories')
  async getCategories() {
    return await this.pointPelanggaranService.getCategories();
  }

  /**
   * Get point pelanggaran by category
   */
  @Get('category/:category')
  async getByCategory(@Param('category') category: string, @Query('tahun') tahun?: string) {
    const tahunPoint = tahun ? parseInt(tahun) : undefined;
    return await this.pointPelanggaranService.findByCategory(category, tahunPoint);
  }

  /**
   * Get summary of point pelanggaran by category
   */
  @Get('summary/category')
  async getSummaryByCategory() {
    return await this.pointPelanggaranService.getSummaryByCategory();
  }

  /**
   * Get all point pelanggaran
   * Optional query: tahun_point, isActive
   */
  @Get()
  async findAll(@Query('tahun') tahun?: string, @Query('isActive') isActive?: string) {
    const tahunPoint = tahun ? parseInt(tahun) : undefined;
    const isActiveFilter = isActive === undefined ? undefined : isActive === 'true';

    return await this.pointPelanggaranService.findAll(tahunPoint, isActiveFilter);
  }

  /**
   * Get point pelanggaran by year
   */
  @Get('year/:tahun')
  async findByYear(@Param('tahun', ParseIntPipe) tahun: number) {
    return await this.pointPelanggaranService.findByYear(tahun);
  }

  /**
   * Get active point pelanggaran (tahun ajaran aktif)
   */
  @Get('active')
  async findActive() {
    return await this.pointPelanggaranService.findActive();
  }

  /**
   * Get point pelanggaran dengan kategori Sanksi
   */
  @Get('sanksi')
  async findSanksi(@Query('tahun') tahun?: string) {
    const tahunPoint = tahun ? parseInt(tahun) : undefined;
    return await this.pointPelanggaranService.findSanksi(tahunPoint);
  }

  /**
   * Get point pelanggaran dengan kategori Drop Out/Mutasi
   */
  @Get('do-mutasi')
  async findDoMutasi(@Query('tahun') tahun?: string) {
    const tahunPoint = tahun ? parseInt(tahun) : undefined;
    return await this.pointPelanggaranService.findDoMutasi(tahunPoint);
  }

  /**
   * Get summary of point pelanggaran by year
   */
  @Get('summary')
  async getSummary() {
    return await this.pointPelanggaranService.getSummaryByYear();
  }

  /**
   * Import point pelanggaran dari PDF
   * Validasi: Header harus berisi "DAFTAR KREDIT POIN PELANGGARAN SISWA SMK NEGERI 1 CIBINONG"
   * Extract: Tahun dari format "SMKN 1 Cbn-CabDin.Wil 1/2023"
   * Extract: Points dari halaman 4-5
   */
  @Post('import-pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  @UseInterceptors(FileInterceptor('file'))
  async importPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File PDF harus diunggah');
    }

    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException('File harus berformat PDF');
    }

    return await this.pointPelanggaranService.importPointsFromPdf(file.buffer);
  }

  /**
   * Calculate total bobot from multiple kode
   */
  @Post('calculate-bobot')
  async calculateBobot(@Body('kodes') kodes: number[]) {
    if (!Array.isArray(kodes)) {
      throw new BadRequestException('kodes harus berupa array');
    }

    const total = await this.pointPelanggaranService.calculateTotalBobot(kodes);
    return { kodes, total };
  }

  /**
   * Get point pelanggaran by ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.pointPelanggaranService.findById(id);
  }

  /**
   * Create new point pelanggaran (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async create(@Body() dto: CreatePointPelanggaranDto) {
    return await this.pointPelanggaranService.create(dto);
  }

  /**
   * Update point pelanggaran (Admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePointPelanggaranDto) {
    return await this.pointPelanggaranService.update(id, dto);
  }

  /**
   * Set tahun point as active (Admin only)
   */
  @Patch(':id/set-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async setActive(@Param('id', ParseIntPipe) id: number) {
    return await this.pointPelanggaranService.setActive(id);
  }

  /**
   * Set tahun point as inactive (Admin only)
   */
  @Patch(':id/set-inactive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async setInactive(@Param('id', ParseIntPipe) id: number) {
    return await this.pointPelanggaranService.setInactive(id);
  }

  /**
   * Delete point pelanggaran (Admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.pointPelanggaranService.delete(id);
    return { message: 'Point pelanggaran berhasil dihapus' };
  }
}
