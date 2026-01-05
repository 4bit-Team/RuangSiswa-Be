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
  BadRequestException,
} from '@nestjs/common';
import { BkJurusanService } from './bk-jurusan.service';
import { UpdateBkJurusanDto } from './dto/create-bk-jurusan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bk-jurusan')
@UseGuards(JwtAuthGuard)
export class BkJurusanController {
  constructor(private readonly bkJurusanService: BkJurusanService) {}

  // Get all jurusan assigned to current BK
  @Get('my-jurusan')
  async getMyJurusan(@Request() req) {
    const bkId = req.user.id;
    console.log('📖 Getting jurusan list for BK:', bkId);
    return await this.bkJurusanService.getJurusanByBkId(bkId);
  }

  // Add a single jurusan to current BK
  @Post('add/:jurusanId')
  async addJurusan(
    @Param('jurusanId') jurusanId: string,
    @Request() req,
  ) {
    const bkId = req.user.id;
    const jurusanIdNum = parseInt(jurusanId, 10);

    if (isNaN(jurusanIdNum)) {
      throw new BadRequestException('Invalid jurusanId');
    }

    console.log('📝 Adding jurusan', jurusanIdNum, 'to BK:', bkId);
    return await this.bkJurusanService.addJurusan(bkId, jurusanIdNum);
  }

  // Remove a specific jurusan from current BK
  @Delete('remove/:jurusanId')
  async removeJurusan(
    @Param('jurusanId') jurusanId: string,
    @Request() req,
  ) {
    const bkId = req.user.id;
    const jurusanIdNum = parseInt(jurusanId, 10);

    if (isNaN(jurusanIdNum)) {
      throw new BadRequestException('Invalid jurusanId');
    }

    console.log('🗑️ Removing jurusan', jurusanIdNum, 'from BK:', bkId);
    return await this.bkJurusanService.removeJurusan(bkId, jurusanIdNum);
  }

  // Update entire jurusan list for current BK
  @Put('update-list')
  async updateJurusanList(
    @Body() updateDto: UpdateBkJurusanDto,
    @Request() req,
  ) {
    const bkId = req.user.id;

    if (!Array.isArray(updateDto.jurusanIds)) {
      throw new BadRequestException('jurusanIds must be an array');
    }

    console.log('📝 Updating jurusan list for BK:', bkId, 'with:', updateDto.jurusanIds);
    return await this.bkJurusanService.updateJurusanList(bkId, updateDto.jurusanIds);
  }

  // Check if BK has any jurusan configured
  @Get('is-configured')
  async isConfigured(@Request() req) {
    const bkId = req.user.id;
    const isConfigured = await this.bkJurusanService.hasBkConfiguredAnyJurusan(bkId);
    return { isConfigured };
  }

  // Get BK list for a specific jurusan (for admin purposes)
  @Get('by-jurusan/:jurusanId')
  async getBKsByJurusan(@Param('jurusanId') jurusanId: string) {
    const jurusanIdNum = parseInt(jurusanId, 10);

    if (isNaN(jurusanIdNum)) {
      throw new BadRequestException('Invalid jurusanId');
    }

    console.log('📖 Getting BK list for jurusan:', jurusanIdNum);
    return await this.bkJurusanService.getBKsByJurusanId(jurusanIdNum);
  }
}
