import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PembinaanRinganService } from './pembinaan-ringan.service';
import { CreatePembinaanRinganDto, ApprovePembinaanRinganDto, CompletePembinaanRinganDto, UpdatePembinaanRinganDto } from './dto/create-pembinaan-ringan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { currentUser } from '../../auth/decorators/current-user.decorator';

@Controller('v1/pembinaan-ringan')
@UseGuards(JwtAuthGuard)
export class PembinaanRinganController {
  private readonly logger = new Logger(PembinaanRinganController.name);

  constructor(private readonly pembinaanRinganService: PembinaanRinganService) {
    this.logger.log('✅ PembinaanRinganController initialized');
  }

  /**
   * POST /api/v1/pembinaan-ringan
   * Create pembinaan ringan (from kesiswaan)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('kesiswaan', 'admin')
  async create(@Body() createDto: CreatePembinaanRinganDto) {
    this.logger.log(`📥 POST /api/v1/pembinaan-ringan - Creating for student ${createDto.student_id}`);
    try {
      const result = await this.pembinaanRinganService.create(createDto);
      this.logger.log(`✅ Pembinaan Ringan created successfully`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error creating pembinaan ringan: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ringan
   * Get all pembinaan ringan
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan', 'bk')
  async findAll() {
    this.logger.log(`📥 GET /api/v1/pembinaan-ringan`);
    try {
      const result = await this.pembinaanRinganService.findAll();
      this.logger.log(`✅ Retrieved ${result.length} pembinaan ringan records`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pembinaan ringan: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ringan/pending
   * Get pending pembinaan ringan for current BK
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('bk', 'admin')
  async findPending(@currentUser() user: any) {
    this.logger.log(`📥 GET /api/v1/pembinaan-ringan/pending for BK ${user.id}`);
    try {
      const result = await this.pembinaanRinganService.findPendingForCounselor(user.id);
      this.logger.log(`✅ Retrieved ${result.length} pending pembinaan ringan`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pending pembinaan ringan: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ringan/:id
   * Get pembinaan ringan by ID
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan', 'bk')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`📥 GET /api/v1/pembinaan-ringan/${id}`);
    try {
      const result = await this.pembinaanRinganService.findOne(id);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pembinaan ringan ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH /api/v1/pembinaan-ringan/:id/approve
   * Approve atau reject pembinaan ringan (by BK)
   */
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('bk', 'admin')
  async approve(@Param('id', ParseIntPipe) id: number, @Body() approveDto: ApprovePembinaanRinganDto) {
    this.logger.log(`📥 PATCH /api/v1/pembinaan-ringan/${id}/approve`);
    try {
      const result = await this.pembinaanRinganService.approve(id, approveDto);
      this.logger.log(`✅ Pembinaan Ringan ${id} approved/rejected`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error approving pembinaan ringan ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH /api/v1/pembinaan-ringan/:id/complete
   * Complete pembinaan ringan after counseling (by BK)
   */
  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('bk', 'admin')
  async complete(@Param('id', ParseIntPipe) id: number, @Body() completeDto: CompletePembinaanRinganDto) {
    this.logger.log(`📥 PATCH /api/v1/pembinaan-ringan/${id}/complete`);
    try {
      const result = await this.pembinaanRinganService.complete(id, completeDto);
      this.logger.log(`✅ Pembinaan Ringan ${id} completed`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error completing pembinaan ringan ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH /api/v1/pembinaan-ringan/:id
   * Update pembinaan ringan
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('kesiswaan', 'bk', 'admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePembinaanRinganDto) {
    this.logger.log(`📥 PATCH /api/v1/pembinaan-ringan/${id}`);
    try {
      const result = await this.pembinaanRinganService.update(id, updateDto);
      this.logger.log(`✅ Pembinaan Ringan ${id} updated`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error updating pembinaan ringan ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ringan/student/:studentId
   * Get pembinaan ringan by student ID
   */
  @Get('student/:studentId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan', 'bk')
  async findByStudentId(@Param('studentId', ParseIntPipe) studentId: number) {
    this.logger.log(`📥 GET /api/v1/pembinaan-ringan/student/${studentId}`);
    try {
      const result = await this.pembinaanRinganService.findByStudentId(studentId);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pembinaan ringan for student ${studentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   *GET /api/v1/pembinaan-ringan/stats
   * Get statistics
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan')
  async getStatistics() {
    this.logger.log(`📥 GET /api/v1/pembinaan-ringan/stats`);
    try {
      const result = await this.pembinaanRinganService.getStatistics();
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching statistics: ${error.message}`);
      throw error;
    }
  }
}
