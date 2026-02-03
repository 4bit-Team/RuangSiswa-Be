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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('reservasi')
@UseGuards(JwtAuthGuard)
export class ReservasiController {
  constructor(
    private readonly reservasiService: ReservasiService,
    private readonly feedbackService: FeedbackService,
  ) {}

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

  // Get reservasi by student ID
  @Get('student/:studentId')
  async getByStudentId(@Param('studentId') studentId: string) {
    return await this.reservasiService.findByStudentId(parseInt(studentId));
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('bk')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReservasiStatusDto,
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
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

  // Cancel reservasi - Student only (untuk pending atau approved status)
  @Patch(':id/cancel')
  async cancelReservasi(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }
    
    // Verify user is the student
    if (reservasi.studentId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only student can cancel this reservasi');
    }

    // Check if reservasi can be cancelled
    if (!['pending', 'approved'].includes(reservasi.status)) {
      throw new BadRequestException(`Cannot cancel reservasi with status ${reservasi.status}`);
    }

    console.log(`Cancelling reservasi ${id}`, body.reason);
    return await this.reservasiService.updateStatus(parseInt(id), { 
      status: 'cancelled',
      rejectionReason: body.reason || 'Dibatalkan oleh siswa'
    });
  }

  // Reschedule reservasi - Student only (update date, time, dan optionally counselor)
  @Patch(':id/reschedule')
  async rescheduleReservasi(
    @Param('id') id: string,
    @Body() body: {
      preferredDate?: string;
      preferredTime?: string;
      counselorId?: number;
    },
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }
    
    // Verify user is the student
    if (reservasi.studentId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only student can reschedule this reservasi');
    }

    // Check if reservasi can be rescheduled
    if (!['pending', 'approved'].includes(reservasi.status)) {
      throw new BadRequestException(`Cannot reschedule reservasi with status ${reservasi.status}`);
    }

    // Validate that at least one field is provided
    if (!body.preferredDate && !body.preferredTime && !body.counselorId) {
      throw new BadRequestException('At least one of preferredDate, preferredTime, or counselorId must be provided');
    }

    console.log(`Rescheduling reservasi ${id}`, body);
    return await this.reservasiService.reschedule(parseInt(id), body);
  }

  // ======================== QR CODE & ATTENDANCE ========================

  @Post(':id/generate-qr')
  @UseGuards(JwtAuthGuard)
  async generateQRCode(
    @Param('id') id: string,
    @Body() body: { room?: string },
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }

    // Verify user is the counselor
    if (reservasi.counselorId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only assigned counselor can generate QR code');
    }

    // Check if reservasi is approved
    if (reservasi.status !== 'approved') {
      throw new BadRequestException(`Cannot generate QR for reservasi with status ${reservasi.status}`);
    }

    // Auto-assign room as "bk room" for all sessions
    const room = 'bk room';
    await this.reservasiService.assignRoom(parseInt(id), room);

    // Generate QR code
    const qrCode = await this.reservasiService.generateQRCode(parseInt(id));
    
    return {
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode,
        room,
      },
    };
  }

  @Post(':id/confirm-attendance')
  @UseGuards(JwtAuthGuard)
  async confirmAttendance(
    @Param('id') id: string,
    @Body() body: { qrData: string },
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }

    // Allow both counselor and student to confirm attendance
    const isStudent = reservasi.studentId === req.user.id;
    const isCounselor = reservasi.counselorId === req.user.id;
    
    if (!isStudent && !isCounselor) {
      throw new BadRequestException('Unauthorized: Only assigned student or counselor can confirm attendance');
    }

    // Check if reservasi is approved and has QR
    if (reservasi.status !== 'approved') {
      throw new BadRequestException(`Cannot confirm attendance for reservasi with status ${reservasi.status}`);
    }

    if (!reservasi.qrCode) {
      throw new BadRequestException('QR code has not been generated yet');
    }

    const updated = await this.reservasiService.confirmAttendance(parseInt(id), body.qrData);
    
    return {
      success: true,
      message: 'Attendance confirmed successfully. Session status changed to in_counseling',
      data: updated,
    };
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  async markAsCompleted(
    @Param('id') id: string,
    @Request() req,
  ) {
    const reservasi = await this.reservasiService.findOne(parseInt(id));
    
    if (!reservasi) {
      throw new NotFoundException('Reservasi not found');
    }

    // Verify user is the counselor
    if (reservasi.counselorId !== req.user.id) {
      throw new BadRequestException('Unauthorized: Only assigned counselor can mark as completed');
    }

    // Check if reservasi is in_counseling or approved status
    if (!['in_counseling', 'approved'].includes(reservasi.status)) {
      throw new BadRequestException(`Cannot mark as completed. Current status: ${reservasi.status}. Session must be in progress (in_counseling) or approved for chat sessions`);
    }

    const updated = await this.reservasiService.markAsCompleted(parseInt(id));
    
    return {
      success: true,
      message: 'Session marked as completed successfully. Status changed to selesai',
      data: updated,
    };
  }

  // ======================== FEEDBACK & RATING ========================

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req,
  ) {
    const feedback = await this.feedbackService.createFeedback(
      createFeedbackDto,
      req.user.id,
    );

    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    };
  }

  @Get('feedback/:reservasiId')
  @UseGuards(JwtAuthGuard)
  async getFeedback(
    @Param('reservasiId') reservasiId: string,
    @Request() req,
  ) {
    const feedback = await this.feedbackService.getFeedbackByReservasi(
      parseInt(reservasiId),
    );

    if (!feedback) {
      throw new NotFoundException('Feedback not found for this reservasi');
    }

    // Verify user is either student or counselor
    if (
      feedback.studentId !== req.user.id &&
      feedback.counselorId !== req.user.id
    ) {
      throw new BadRequestException('Unauthorized: You can only view feedback related to you');
    }

    return {
      success: true,
      data: feedback,
    };
  }

  @Get('counselor/:counselorId/feedback')
  @UseGuards(JwtAuthGuard)
  async getCounselorFeedback(
    @Param('counselorId') counselorId: string,
    @Request() req,
  ) {
    // Verify user is the counselor or admin
    if (parseInt(counselorId) !== req.user.id && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized: You can only view your own feedback');
    }

    const feedbacks = await this.feedbackService.getFeedbackByCounselor(
      parseInt(counselorId),
    );

    const averageRating = await this.feedbackService.getAverageRating(
      parseInt(counselorId),
    );

    return {
      success: true,
      data: {
        feedbacks,
        averageRating,
        totalFeedbacks: feedbacks.length,
      },
    };
  }

  @Get('student/:studentId/feedback')
  @UseGuards(JwtAuthGuard)
  async getStudentFeedback(
    @Param('studentId') studentId: string,
    @Request() req,
  ) {
    // Verify user is the student or admin
    if (parseInt(studentId) !== req.user.id && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized: You can only view your own feedback');
    }

    const feedbacks = await this.feedbackService.getFeedbackByStudent(
      parseInt(studentId),
    );

    return {
      success: true,
      data: feedbacks,
    };
  }
}
