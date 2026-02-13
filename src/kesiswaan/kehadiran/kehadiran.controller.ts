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
import { KehadiranService } from './kehadiran.service';
import { CreateKehadiranDto, UpdateKehadiranDto, FilterKehadiranDto } from './dto/kehadiran.dto';

@Controller('kehadiran')
export class KehadiranController {
  constructor(private readonly kehadiranService: KehadiranService) {}

  /**
   * POST /kehadiran/sync
   * Sinkronisasi kehadiran dari Walas API
   */
  @Post('sync')
  async syncFromWalas(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return await this.kehadiranService.syncFromWalas(startDate, endDate);
  }

  /**
   * GET /kehadiran
   * Get all kehadiran records dengan optional filters
   */
  @Get()
  async findAll(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('student_id', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('class_name') className?: string,
    @Query('status') status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filterDto: FilterKehadiranDto = {
      startDate,
      endDate,
      studentId,
      className,
      status,
      page: page || 1,
      limit: limit || 50,
    };
    return await this.kehadiranService.findAll(filterDto);
  }

  /**
   * GET /kehadiran/student/:studentId
   * Get kehadiran by student ID
   */
  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filterDto: FilterKehadiranDto = {
      startDate,
      endDate,
      status,
      page: page || 1,
      limit: limit || 50,
    };
    return await this.kehadiranService.findByStudent(studentId, filterDto);
  }

  /**
   * GET /kehadiran/class/:className
   * Get kehadiran by class
   */
  @Get('class/:className')
  async findByClass(
    @Param('className') className: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filterDto: FilterKehadiranDto = {
      startDate,
      endDate,
      status,
      page: page || 1,
      limit: limit || 50,
    };
    return await this.kehadiranService.findByClass(className, filterDto);
  }

  /**
   * GET /kehadiran/stats
   * Get kehadiran statistics
   */
  @Get('stats')
  async getStatistics(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('student_id', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('class_name') className?: string,
  ) {
    const filterDto: FilterKehadiranDto = {
      startDate,
      endDate,
      studentId,
      className,
    };
    return await this.kehadiranService.getStatistics(filterDto);
  }

  /**
   * GET /kehadiran/:id
   * Get single kehadiran record by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.kehadiranService.findOne(id);
  }

  /**
   * POST /kehadiran
   * Create new kehadiran record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createKehadiranDto: CreateKehadiranDto) {
    return await this.kehadiranService.create(createKehadiranDto);
  }

  /**
   * PATCH /kehadiran/:id
   * Update kehadiran record
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKehadiranDto: UpdateKehadiranDto,
  ) {
    return await this.kehadiranService.update(id, updateKehadiranDto);
  }

  /**
   * DELETE /kehadiran/:id
   * Delete kehadiran record
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.kehadiranService.delete(id);
  }
}
