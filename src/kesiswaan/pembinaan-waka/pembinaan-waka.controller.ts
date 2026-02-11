import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PembinaanWakaService } from './pembinaan-waka.service';
import {
  CreatePembinaanWakaDto,
  DecidePembinaanWakaDto,
  AcknowledgePembinaanWakaDto,
  AppealPembinaanWakaDto,
  UpdatePembinaanWakaDto,
} from './dto/create-pembinaan-waka.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('v1/pembinaan-waka')
@UseGuards(JwtAuthGuard)
export class PembinaanWakaController {
  constructor(private readonly pembinaanWakaService: PembinaanWakaService) {}

  // Create pembinaan waka (from ReservasiService when 'berat' reservasi is created)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('kesiswaan', 'admin')
  async create(@Body() createDto: CreatePembinaanWakaDto) {
    return await this.pembinaanWakaService.create(createDto);
  }

  // Get all pembinaan waka (admin only)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return await this.pembinaanWakaService.findAll();
  }

  // Get pending pembinaan waka for WAKA
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waka', 'admin')
  async getPendingForWaka(@Request() req) {
    const waka_id = req.user.id;
    return await this.pembinaanWakaService.getPendingForWaka(waka_id);
  }

  // Get WAKA statistics dashboard
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waka', 'admin')
  async getStatistics(@Request() req) {
    const waka_id = req.user.id;
    return await this.pembinaanWakaService.getWakaStatistics(waka_id);
  }

  // Get single pembinaan waka detail
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.pembinaanWakaService.findOne(parseInt(id));
  }

  // WAKA makes decision (SP3 or DO)
  @Patch(':id/execute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waka', 'admin')
  async makeDecision(
    @Param('id') id: string,
    @Body() decideDto: DecidePembinaanWakaDto,
    @Request() req,
  ) {
    const waka_id = req.user.id;
    return await this.pembinaanWakaService.makeDecision(parseInt(id), decideDto, waka_id);
  }

  // Student acknowledges decision
  @Patch(':id/acknowledge')
  @UseGuards(JwtAuthGuard)
  async acknowledgeDecision(
    @Param('id') id: string,
    @Body() acknowledgeDto: AcknowledgePembinaanWakaDto,
    @Request() req,
  ) {
    const student_id = req.user.id;
    return await this.pembinaanWakaService.studentAcknowledge(parseInt(id), acknowledgeDto, student_id);
  }

  // WAKA marks decision as executed (after student acknowledge)
  @Patch(':id/executed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waka', 'admin')
  async executeDecision(
    @Param('id') id: string,
    @Body() body: { execution_notes?: string },
    @Request() req,
  ) {
    const waka_id = req.user.id;
    return await this.pembinaanWakaService.markAsExecuted(parseInt(id), waka_id, body.execution_notes);
  }

  // Student submits appeal
  @Patch(':id/appeal')
  @UseGuards(JwtAuthGuard)
  async submitAppeal(
    @Param('id') id: string,
    @Body() appealDto: AppealPembinaanWakaDto,
    @Request() req,
  ) {
    const student_id = req.user.id;
    return await this.pembinaanWakaService.submitAppeal(parseInt(id), appealDto, student_id);
  }

  // WAKA decides on appeal
  @Patch(':id/decide-appeal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waka', 'admin')
  async decideOnAppeal(
    @Param('id') id: string,
    @Body() body: { appeal_decision: 'sp3' | 'do' },
    @Request() req,
  ) {
    const waka_id = req.user.id;
    return await this.pembinaanWakaService.decideOnAppeal(parseInt(id), body.appeal_decision, waka_id);
  }

  // Update pembinaan waka (parent notification, etc)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('waka', 'kesiswaan', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePembinaanWakaDto,
  ) {
    return await this.pembinaanWakaService.update(parseInt(id), updateDto);
  }
}
