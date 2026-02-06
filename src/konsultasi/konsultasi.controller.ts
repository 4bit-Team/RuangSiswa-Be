import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { KonsultasiService } from './konsultasi.service';
import { CreateKonsultasiDto } from './dto/create-konsultasi.dto';
import { UpdateKonsultasiDto } from './dto/update-konsultasi.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { FilterKonsultasiDto } from './dto/filter-konsultasi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('v1/konsultasi')
export class KonsultasiController {
  constructor(private readonly konsultasiService: KonsultasiService) {}

  // Get statistics - MUST be before /:id route
  @Get('statistics/overview')
  async getStatistics() {
    return this.konsultasiService.getStatistics();
  }

  // Get question by slug - MUST be before /:id route
  @Get('slug/:slug')
  async getQuestionBySlug(@Param('slug') slug: string) {
    return this.konsultasiService.findOneBySlug(slug);
  }

  // Get user's answers - MUST be before /:id route
  @Get('answers')
  async getUserAnswers(@Query('userId') userId: string) {
    return this.konsultasiService.getUserAnswers(userId);
  }

  // Get all questions with filtering and pagination
  @Get()
  async getAllQuestions(
    @Query('category') category?: string,
    @Query('sort') sort: 'trending' | 'newest' | 'unanswered' = 'trending',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.konsultasiService.findAll({
      category,
      sort,
      page,
      limit,
      search,
    });
  }

  // Get question detail with answers
  @Get(':id')
  async getQuestionDetail(@Param('id') id: string) {
    return this.konsultasiService.findOneWithAnswers(id);
  }

  // Create new question
  @Post()
  @Roles('siswa', 'bk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createQuestion(
    @Body() createKonsultasiDto: CreateKonsultasiDto,
    @Request() req,
  ) {
    return this.konsultasiService.create(createKonsultasiDto, req.user.id);
  }

  // Update question (only author or admin)
  @Put(':id')
  @Roles('siswa', 'bk', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateKonsultasiDto: UpdateKonsultasiDto,
    @Request() req,
  ) {
    return this.konsultasiService.update(id, updateKonsultasiDto, req.user.id);
  }

  // Delete question (only author or admin)
  @Delete(':id')
  @Roles('siswa', 'bk', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteQuestion(@Param('id') id: string, @Request() req) {
    return this.konsultasiService.delete(id, req.user.id);
  }

  // Upvote/downvote question
  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  async voteQuestion(
    @Param('id') id: string,
    @Body() { vote }: { vote: 1 | -1 },
    @Request() req,
  ) {
    return this.konsultasiService.voteQuestion(id, req.user.id, vote);
  }

  // Post answer to question
  @Post(':id/answers')
  @Roles('siswa', 'bk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addAnswer(
    @Param('id') questionId: string,
    @Body() createAnswerDto: CreateAnswerDto,
    @Request() req,
  ) {
    return this.konsultasiService.addAnswer(questionId, createAnswerDto, req.user.id);
  }

  // Upvote/downvote answer
  @Post(':questionId/answers/:answerId/vote')
  @UseGuards(JwtAuthGuard)
  async voteAnswer(
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
    @Body() { vote }: { vote: 1 | -1 },
    @Request() req,
  ) {
    return this.konsultasiService.voteAnswer(questionId, answerId, req.user.id, vote);
  }

  // Create reply to answer
  @Post(':questionId/answers/:answerId/replies')
  @UseGuards(JwtAuthGuard)
  async createReply(
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
    @Body() createReplyDto: CreateReplyDto,
    @Request() req,
  ) {
    return this.konsultasiService.createReply(questionId, answerId, createReplyDto, req.user.id);
  }

  // Vote on reply
  @Post(':questionId/answers/:answerId/replies/:replyId/vote')
  @UseGuards(JwtAuthGuard)
  async voteReply(
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
    @Param('replyId') replyId: string,
    @Body() { vote }: { vote: 1 | -1 },
    @Request() req,
  ) {
    return this.konsultasiService.voteReply(questionId, answerId, replyId, req.user.id, vote);
  }

  // Mark answer as verified (only BK role)
  @Put(':questionId/answers/:answerId/verify')
  @Roles('bk', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async verifyAnswer(
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
    @Request() req,
  ) {
    return this.konsultasiService.verifyAnswer(questionId, answerId, req.user.id);
  }

  // Apply toxic filter (returns filtered text without modifying data)
  @Post(':id/filter-toxic')
  @UseGuards(JwtAuthGuard)
  async filterToxic(@Param('id') id: string) {
    return this.konsultasiService.applyToxicFilter(id);
  }

  // Bookmark question
  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  async bookmarkQuestion(
    @Param('id') questionId: string,
    @Request() req,
  ) {
    return this.konsultasiService.bookmarkQuestion(questionId, req.user.id);
  }

  // Remove bookmark
  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  async removeBookmark(
    @Param('id') questionId: string,
    @Request() req,
  ) {
    return this.konsultasiService.removeBookmark(questionId, req.user.id);
  }

  // Get user bookmarks
  @Get('user/bookmarks')
  @UseGuards(JwtAuthGuard)
  async getUserBookmarks(@Request() req) {
    return this.konsultasiService.getUserBookmarks(req.user.id);
  }

  // Check if question is bookmarked by user
  @Get(':id/is-bookmarked')
  @UseGuards(JwtAuthGuard)
  async isBookmarked(
    @Param('id') questionId: string,
    @Request() req,
  ) {
    return this.konsultasiService.isBookmarked(questionId, req.user.id);
  }
}
