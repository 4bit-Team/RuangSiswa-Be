import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KeterlambatanService } from './keterlambatan.service';
import { CreateKeterlambatanDto, UpdateKeterlambatanDto, FilterKeterlambatanDto } from './dto/keterlambatan.dto';

@Controller('keterlambatan')
export class KeterlambatanController {
  constructor(private readonly keterlambatanService: KeterlambatanService) {}

  /**
   * POST /keterlambatan/sync
   * Sinkronisasi keterlambatan dari Walas API
   */
  @Post('sync')
  async syncFromWalas(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return await this.keterlambatanService.syncFromWalas(startDate, endDate);
  }

  /**
   * GET /keterlambatan
   * Get all keterlambatan records dengan optional filters
   */
  @Get()
  async findAll(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('student_id', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('class_name') className?: string,
    @Query('status') status?: 'recorded' | 'verified' | 'appealed' | 'resolved',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filterDto: FilterKeterlambatanDto = {
      startDate,
      endDate,
      studentId,
      className,
      status,
      page: page || 1,
      limit: limit || 50,
    };
    return await this.keterlambatanService.findAll(filterDto);
  }

  /**
   * GET /keterlambatan/student/:studentId
   * Get keterlambatan by student ID
   */
  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: 'recorded' | 'verified' | 'appealed' | 'resolved',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filterDto: FilterKeterlambatanDto = {
      startDate,
      endDate,
      status,
      page: page || 1,
      limit: limit || 50,
    };
    return await this.keterlambatanService.findByStudent(studentId, filterDto);
  }

  /**
   * GET /keterlambatan/class/:className
   * Get keterlambatan by class
   */
  @Get('class/:className')
  async findByClass(
    @Param('className') className: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: 'recorded' | 'verified' | 'appealed' | 'resolved',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filterDto: FilterKeterlambatanDto = {
      startDate,
      endDate,
      status,
      page: page || 1,
      limit: limit || 50,
    };
    return await this.keterlambatanService.findByClass(className, filterDto);
  }

  /**
   * GET /keterlambatan/stats
   * Get keterlambatan statistics
   */
  @Get('stats')
  async getStatistics(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('student_id', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('class_name') className?: string,
  ) {
    const filterDto: FilterKeterlambatanDto = {
      startDate,
      endDate,
      studentId,
      className,
    };
    return await this.keterlambatanService.getStatistics(filterDto);
  }

  /**
   * GET /keterlambatan/:id
   * Get single keterlambatan record by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.keterlambatanService.findOne(id);
  }

  /**
   * POST /keterlambatan
   * Create new keterlambatan record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createKeterlambatanDto: CreateKeterlambatanDto) {
    return await this.keterlambatanService.create(createKeterlambatanDto);
  }

  /**
   * PATCH /keterlambatan/:id
   * Update keterlambatan record
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKeterlambatanDto: UpdateKeterlambatanDto,
  ) {
    return await this.keterlambatanService.update(id, updateKeterlambatanDto);
  }

  /**
   * DELETE /keterlambatan/:id
   * Delete keterlambatan record
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.keterlambatanService.delete(id);
  }
}
