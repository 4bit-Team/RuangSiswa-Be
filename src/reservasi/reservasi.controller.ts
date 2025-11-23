import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReservasiService } from './reservasi.service';
import { CreateReservasiDto, UpdateReservasiStatusDto } from './dto/create-reservasi.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('reservasi')
@UseGuards(JwtAuthGuard)
export class ReservasiController {
  constructor(private readonly reservasiService: ReservasiService) {}

  // Create reservasi baru (siswa)
  @Post()
  async create(@Body() createReservasiDto: CreateReservasiDto, @Request() req) {
    console.log('Creating reservasi:', createReservasiDto);
    return await this.reservasiService.create(createReservasiDto);
  }

  // Get all reservasi dengan filter
  @Get()
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('counselorId') counselorId?: string,
    @Query('status') status?: string,
  ) {
    const filters = {
      studentId: studentId ? parseInt(studentId) : undefined,
      counselorId: counselorId ? parseInt(counselorId) : undefined,
      status,
    };
    return await this.reservasiService.findAll(filters);
  }

  // Get reservasi untuk user saat ini (siswa)
  @Get('student/my-reservations')
  async getMyReservations(@Request() req) {
    const studentId = req.user.id;
    return await this.reservasiService.findByStudentId(studentId);
  }

  // Get pending reservasi untuk counselor
  @Get('counselor/pending')
  async getPendingReservations(@Request() req) {
    const counselorId = req.user.id;
    return await this.reservasiService.getPendingForCounselor(counselorId);
  }

  // Get schedule untuk counselor
  @Get('counselor/schedule')
  async getSchedule(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const counselorId = req.user.id;
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : new Date(fromDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later
    return await this.reservasiService.getSchedule(counselorId, fromDate, toDate);
  }

  // Get single reservasi
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.reservasiService.findOne(parseInt(id));
  }

  // Update status reservasi (approve/reject) - BK only
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReservasiStatusDto,
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }
    
    // Verify user is the counselor
    if (reservasi.counselorId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only the counselor can update this reservasi');
    }

    console.log(`Updating reservasi ${id} status to ${updateStatusDto.status}`);
    return await this.reservasiService.updateStatus(parseInt(id), updateStatusDto);
  }

  // Approve reservasi - BK only
  @Patch(':id/approve')
  async approveReservasi(@Param('id') id: string, @Request() req) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }
    
    // Verify user is the counselor
    if (reservasi.counselorId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only the counselor can approve this reservasi');
    }

    console.log(`Approving reservasi ${id}`);
    return await this.reservasiService.updateStatus(parseInt(id), { status: 'approved' });
  }

  // Reject reservasi - BK only
  @Patch(':id/reject')
  async rejectReservasi(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }
    
    // Verify user is the counselor
    if (reservasi.counselorId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only the counselor can reject this reservasi');
    }

    console.log(`Rejecting reservasi ${id}`, body.reason);
    return await this.reservasiService.updateStatus(parseInt(id), { 
      status: 'rejected',
      rejectionReason: body.reason
    });
  }

  // Delete reservasi
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }
    
    // Verify user is student or counselor
    if (reservasi.studentId !== req.user.id && reservasi.counselorId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only student or counselor can delete this reservasi');
    }

    const success = await this.reservasiService.delete(parseInt(id));
    return { success, message: success ? 'Reservasi deleted' : 'Failed to delete' };
  }
}
