import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { PembinaanOrtuService } from './pembinaan-ortu.service';
import { CreatePembinaanOrtuDto, UpdatePembinaanOrtuDto, SendLetterDto, RecordMeetingDto, RespondFromParentDto } from './dto/create-pembinaan-ortu.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { currentUser } from '../../auth/decorators/current-user.decorator';

@Controller('v1/pembinaan-ortu')
@UseGuards(JwtAuthGuard)
export class PembinaanOrtuController {
  private readonly logger = new Logger(PembinaanOrtuController.name);

  constructor(private readonly pembinaanOrtuService: PembinaanOrtuService) {
    this.logger.log('✅ PembinaanOrtuController initialized');
  }

  /**
   * POST /api/v1/pembinaan-ortu
   * Create pembinaan ortu (from kesiswaan)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('kesiswaan', 'admin')
  async create(@Body() createDto: CreatePembinaanOrtuDto) {
    this.logger.log(`📥 POST /api/v1/pembinaan-ortu - Creating for student ${createDto.student_id}`);
    try {
      const result = await this.pembinaanOrtuService.create(createDto);
      this.logger.log(`✅ Pembinaan Ortu created successfully`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error creating pembinaan ortu: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ortu
   * Get all pembinaan ortu
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan')
  async findAll() {
    this.logger.log(`📥 GET /api/v1/pembinaan-ortu`);
    try {
      const result = await this.pembinaanOrtuService.findAll();
      this.logger.log(`✅ Retrieved ${result.length} pembinaan ortu records`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pembinaan ortu: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ortu/parent/:parentId
   * Get pembinaan ortu for parent view
   */
  @Get('parent/:parentId')
  @UseGuards(RolesGuard)
  @Roles('orang_tua', 'admin')
  async findByParentId(@Param('parentId', ParseIntPipe) parentId: number, @currentUser() user: any) {
    this.logger.log(`📥 GET /api/v1/pembinaan-ortu/parent/${parentId}`);
    try {
      const result = await this.pembinaanOrtuService.findByParentId(parentId);
      this.logger.log(`✅ Retrieved ${result.length} pembinaan ortu for parent`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pembinaan ortu for parent: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ortu/:id
   * Get pembinaan ortu by ID
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan', 'orang_tua')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`📥 GET /api/v1/pembinaan-ortu/${id}`);
    try {
      const result = await this.pembinaanOrtuService.findOne(id);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pembinaan ortu ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH /api/v1/pembinaan-ortu/:id
   * Update pembinaan ortu
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('kesiswaan', 'admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePembinaanOrtuDto) {
    this.logger.log(`📥 PATCH /api/v1/pembinaan-ortu/${id}`);
    try {
      const result = await this.pembinaanOrtuService.update(id, updateDto);
      this.logger.log(`✅ Pembinaan Ortu ${id} updated`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error updating pembinaan ortu ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * POST /api/v1/pembinaan-ortu/:id/send-letter
   * Send letter to parent
   */
  @Post(':id/send-letter')
  @UseGuards(RolesGuard)
  @Roles('kesiswaan', 'admin')
  async sendLetter(@Param('id', ParseIntPipe) id: number, @Body() sendDto: SendLetterDto) {
    this.logger.log(`📥 POST /api/v1/pembinaan-ortu/${id}/send-letter`);
    try {
      const result = await this.pembinaanOrtuService.sendLetter(id, sendDto);
      this.logger.log(`✅ Letter sent for Pembinaan Ortu ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error sending letter: ${error.message}`);
      throw error;
    }
  }

  /**
   * POST /api/v1/pembinaan-ortu/:id/parent-response
   * Record parent response
   */
  @Post(':id/parent-response')
  @UseGuards(RolesGuard)
  @Roles('orang_tua', 'admin')
  async recordParentResponse(@Param('id', ParseIntPipe) id: number, @Body() respondDto: RespondFromParentDto) {
    this.logger.log(`📥 POST /api/v1/pembinaan-ortu/${id}/parent-response`);
    try {
      const result = await this.pembinaanOrtuService.recordParentResponse(id, respondDto);
      this.logger.log(`✅ Parent response recorded`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error recording parent response: ${error.message}`);
      throw error;
    }
  }

  /**
   * POST /api/v1/pembinaan-ortu/:id/record-meeting
   * Record meeting result
   */
  @Post(':id/record-meeting')
  @UseGuards(RolesGuard)
  @Roles('kesiswaan', 'admin')
  async recordMeeting(@Param('id', ParseIntPipe) id: number, @Body() recordDto: RecordMeetingDto) {
    this.logger.log(`📥 POST /api/v1/pembinaan-ortu/${id}/record-meeting`);
    try {
      const result = await this.pembinaanOrtuService.recordMeeting(id, recordDto);
      this.logger.log(`✅ Meeting recorded`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error recording meeting: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ortu/pending/letters
   * Get pending letters
   */
  @Get('pending/letters')
  @UseGuards(RolesGuard)
  @Roles('kesiswaan', 'admin')
  async getPendingLetters() {
    this.logger.log(`📥 GET /api/v1/pembinaan-ortu/pending/letters`);
    try {
      const result = await this.pembinaanOrtuService.getPendingLetters();
      this.logger.log(`✅ Retrieved ${result.length} pending letters`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pending letters: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ortu/stats
   * Get statistics
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan')
  async getStatistics() {
    this.logger.log(`📥 GET /api/v1/pembinaan-ortu/stats`);
    try {
      const result = await this.pembinaanOrtuService.getStatistics();
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching statistics: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/pembinaan-ortu/student/:studentId
   * Get pembinaan ortu by student ID
   */
  @Get('student/:studentId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'kesiswaan')
  async findByStudentId(@Param('studentId', ParseIntPipe) studentId: number) {
    this.logger.log(`📥 GET /api/v1/pembinaan-ortu/student/${studentId}`);
    try {
      const result = await this.pembinaanOrtuService.findByStudentId(studentId);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error fetching pembinaan ortu for student: ${error.message}`);
      throw error;
    }
  }
}
