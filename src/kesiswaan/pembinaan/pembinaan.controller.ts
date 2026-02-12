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
  Logger,
} from '@nestjs/common';
import { PembinaanService } from './pembinaan.service';
import { SyncPembinaanDto } from './dto/sync-pembinaan.dto';
import { UpdatePembinaanDto } from './dto/update-pembinaan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('v1/pembinaan')
export class PembinaanController {
  private readonly logger = new Logger(PembinaanController.name);

  constructor(private readonly pembinaanService: PembinaanService) {
    this.logger.log('✅ PembinaanController initialized');
  }

  /**
   * GET /api/v1/pembinaan
   * Get all pembinaan records with optional filters
   */
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('siswas_id') siswas_id?: string,
    @Query('walas_id') walas_id?: string,
  ) {
    const filters = {
      status,
      siswas_id: siswas_id ? parseInt(siswas_id) : undefined,
      walas_id: walas_id ? parseInt(walas_id) : undefined,
    };

    this.logger.log('📥 GET /api/v1/pembinaan called with filters:', JSON.stringify(filters));

    try {
      const result = await this.pembinaanService.findAll(filters);
      this.logger.log(`✅ Successfully retrieved ${result.length} pembinaan records`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error in findAll: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan/stats
   * Get statistics of pembinaan records
   */
  @Get('stats')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('siswas_id') siswas_id?: string,
    @Query('walas_id') walas_id?: string,
  ) {
    const filters = {
      startDate,
      endDate,
      siswas_id: siswas_id ? parseInt(siswas_id) : undefined,
      walas_id: walas_id ? parseInt(walas_id) : undefined,
    };

    return await this.pembinaanService.getStatistics(filters);
  }

  /**
   * GET /api/v1/pembinaan/walas-stats
   * Get pembinaan statistics from WALASU (centralized via WalasApiClient)
   */
  @Get('walas-stats')
  async getWalasStatistics(
    @Query('class_id') class_id?: string,
    @Query('walas_id') walas_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    const filters = {
      class_id: class_id ? parseInt(class_id) : undefined,
      walas_id: walas_id ? parseInt(walas_id) : undefined,
      start_date,
      end_date,
    };

    return await this.pembinaanService.getWalasStatistics(filters);
  }

  /**
   * GET /api/v1/pembinaan/unmatched
   * Get pembinaan records that couldn't be auto-matched
   * These need manual review/assignment
   */
  @Get('unmatched')
  async getUnmatched() {
    return await this.pembinaanService.getUnmatched();
  }

  /**
   * GET /api/v1/pembinaan/search
   * Search pembinaan by kasus, keterangan, or student name
   */
  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 2) {
      throw new BadRequestException('Query parameter must be at least 2 characters');
    }

    return await this.pembinaanService.search(query);
  }

  /**
   * GET /api/v1/pembinaan/:id
   * Get single pembinaan detail
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.pembinaanService.findById(id);
  }

  /**
   * GET /api/v1/pembinaan/student/:siswas_id
   * Get all pembinaan records for a specific student
   */
  @Get('student/:siswas_id')
  async findByStudent(@Param('siswas_id', ParseIntPipe) siswas_id: number) {
    return await this.pembinaanService.findByStudent(siswas_id);
  }

  /**
   * GET /api/v1/pembinaan/walas/:walas_id
   * Get all pembinaan records reported by a specific walas
   */
  @Get('walas/:walas_id')
  async findByWalas(@Param('walas_id', ParseIntPipe) walas_id: number) {
    return await this.pembinaanService.findByWalas(walas_id);
  }

  /**
   * POST /api/v1/pembinaan/fetch-sync
   * Fetch and sync all pembinaan data from WALASU
   * Does NOT require request body - pulls directly from WALASU
   * Supports optional filters: class_id, walas_id, student_id
   */
  @Post('fetch-sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async fetchAndSyncFromWalas(
    @Query('class_id') class_id?: string,
    @Query('walas_id') walas_id?: string,
    @Query('student_id') student_id?: string,
  ) {
    const filters = {
      class_id: class_id ? parseInt(class_id) : undefined,
      walas_id: walas_id ? parseInt(walas_id) : undefined,
      student_id: student_id ? parseInt(student_id) : undefined,
    };

    this.logger.log('📥 POST /api/v1/pembinaan/fetch-sync called with filters:', JSON.stringify(filters));

    try {
      const result = await this.pembinaanService.fetchAndSyncFromWalas(filters);
      this.logger.log(`✅ Fetch-sync complete: Synced=${result.synced}, Skipped=${result.skipped}, Errors=${result.errors.length}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error in fetchAndSyncFromWalas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * POST /api/v1/pembinaan/sync
   * Sync pembinaan data from WALASU
   * Automatically matches with point pelanggaran based on kasus
   * Requires: kasus, tindak_lanjut in body
   */
  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async syncFromWalas(@Body() dto: SyncPembinaanDto) {
    if (!dto.kasus || !dto.tindak_lanjut) {
      throw new BadRequestException('kasus dan tindak_lanjut harus diisi');
    }

    return await this.pembinaanService.syncFromWalas(dto);
  }

  /**
   * PATCH /api/v1/pembinaan/:id
   * Update pembinaan record
   * Can update: hasil_pembinaan, catatan_bk, status, follow_up, point_pelanggaran_id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN', 'BK')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePembinaanDto) {
    return await this.pembinaanService.update(id, dto);
  }

  /**
   * PATCH /api/v1/pembinaan/:id/assign-point
   * Manually assign point pelanggaran to pembinaan (for unmatched cases)
   */
  @Patch(':id/assign-point')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN', 'BK')
  async assignPoint(
    @Param('id', ParseIntPipe) id: number,
    @Body('point_pelanggaran_id', ParseIntPipe) point_pelanggaran_id: number,
  ) {
    if (!point_pelanggaran_id) {
      throw new BadRequestException('point_pelanggaran_id harus diisi');
    }

    return await this.pembinaanService.update(id, {
      point_pelanggaran_id,
    });
  }

  /**
   * PATCH /api/v1/pembinaan/bulk-status
   * Update status for multiple pembinaan records
   */
  @Patch('bulk/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async bulkUpdateStatus(
    @Body('ids', ParseIntPipe) ids: number[],
    @Body('status') status: string,
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids harus berupa array yang tidak kosong');
    }

    if (!status) {
      throw new BadRequestException('status harus diisi');
    }

    await this.pembinaanService.updateStatus(ids, status);
    return { message: `${ids.length} pembinaan records updated`, status };
  }

  /**
   * DELETE /api/v1/pembinaan/:id
   * Delete pembinaan record
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KESISWAAN')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.pembinaanService.delete(id);
    return { message: 'Pembinaan berhasil dihapus' };
  }
}
