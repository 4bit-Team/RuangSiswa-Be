import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { GroupReservasiService } from './group-reservasi.service';
import { CreateGroupReservasiDto, UpdateGroupReservasiStatusDto } from './dto/create-group-reservasi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservasi/group')
@UseGuards(JwtAuthGuard)
export class GroupReservasiController {
  constructor(private readonly groupReservasiService: GroupReservasiService) {}

  // Create group reservasi baru (siswa)
  @Post()
  async create(@Body() createGroupReservasiDto: CreateGroupReservasiDto, @Request() req) {
    console.log('Creating group reservasi:', createGroupReservasiDto);
    return await this.groupReservasiService.create(createGroupReservasiDto);
  }

  // Get all group reservasi dengan filter
  @Get()
  async findAll(
    @Query('creatorId') creatorId?: string,
    @Query('counselorId') counselorId?: string,
    @Query('status') status?: string,
  ) {
    const filters = {
      creatorId: creatorId ? parseInt(creatorId) : undefined,
      counselorId: counselorId ? parseInt(counselorId) : undefined,
      status,
    };
    return await this.groupReservasiService.findAll(filters);
  }

  // Get group reservasi untuk user saat ini (siswa/creator)
  @Get('student/my-group-reservations')
  async getMyGroupReservations(@Request() req) {
    const studentId = req.user.id;
    return await this.groupReservasiService.findByStudentId(studentId);
  }

  // Get group reservasi by student ID
  @Get('student/:studentId')
  async getByStudentId(@Param('studentId') studentId: string) {
    return await this.groupReservasiService.findByStudentId(parseInt(studentId));
  }

  // Get group reservasi untuk counselor
  @Get('counselor/all')
  async getByCounselorId(@Request() req) {
    const counselorId = req.user.id;
    return await this.groupReservasiService.findByCounselorId(counselorId);
  }

  // Get pending group reservasi untuk counselor
  @Get('counselor/pending')
  async getPendingGroupReservations(@Request() req) {
    const counselorId = req.user.id;
    return await this.groupReservasiService.getPendingForCounselor(counselorId);
  }

  // Get single group reservasi
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.groupReservasiService.findOne(parseInt(id));
  }

  // Update status group reservasi (approve/reject) - BK only
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateGroupReservasiStatusDto,
    @Request() req,
  ) {
    const groupReservasi = await this.groupReservasiService.findOne(parseInt(id));

    if (!groupReservasi) {
      throw new NotFoundException('Group reservasi tidak ditemukan');
    }

    // Verify user is the counselor
    if (groupReservasi.counselorId !== req.user.id) {
      throw new Error('Hanya konselor yang dapat mengubah status');
    }

    return await this.groupReservasiService.updateStatus(parseInt(id), updateStatusDto);
  }

  // Delete group reservasi
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const groupReservasi = await this.groupReservasiService.findOne(parseInt(id));

    if (!groupReservasi) {
      throw new NotFoundException('Group reservasi tidak ditemukan');
    }

    // Verify user is the creator
    if (groupReservasi.creatorId !== req.user.id) {
      throw new Error('Hanya pembuat grup yang dapat menghapus');
    }

    return await this.groupReservasiService.remove(parseInt(id));
  }
}
