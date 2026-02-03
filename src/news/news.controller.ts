import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewsService } from './news.service';
import { CreateNewsDto, NewsQueryDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Create news
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createNewsDto: CreateNewsDto, @Req() req: any) {
    return this.newsService.create(createNewsDto, req.user.id);
  }

  // Get all news with filters
  @Get()
  async findAll(@Query() query: NewsQueryDto) {
    return this.newsService.findAll(query);
  }

  // Get published news only
  @Get('published')
  async findPublished(@Query() query: NewsQueryDto) {
    return this.newsService.findPublished(query);
  }

  // Get news by category
  @Get('category/:category')
  async getByCategory(
    @Param('category') category: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.newsService.getByCategory(
      category as any,
      parseInt(page),
      parseInt(limit),
    );
  }

  // Get user's news
  @Get('user/:userId')
  async getUserNews(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.newsService.getUserNews(
      parseInt(userId),
      parseInt(page),
      parseInt(limit),
    );
  }

  // Get single news by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(parseInt(id));
  }

  // Update news
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @Req() req: any,
  ) {
    return this.newsService.update(parseInt(id), updateNewsDto, req.user.id);
  }

  // Delete news
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.newsService.delete(parseInt(id), req.user.id);
    return { message: 'News deleted successfully' };
  }

  // Like/Unlike news
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    const liked = await this.newsService.toggleLike(parseInt(id), req.user.id);
    return { liked, message: liked ? 'News liked' : 'News unliked' };
  }

  // Check if user liked news
  @Get(':id/liked')
  @UseGuards(JwtAuthGuard)
  async hasUserLiked(@Param('id') id: string, @Req() req: any) {
    const liked = await this.newsService.hasUserLiked(
      parseInt(id),
      req.user.id,
    );
    return { liked };
  }

  // Get likes count
  @Get(':id/likes-count')
  async getLikesCount(@Param('id') id: string) {
    const count = await this.newsService.getLikesCount(parseInt(id));
    return { count };
  }

  // Add comment
  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id') id: string,
    @Body() { content }: { content: string },
    @Req() req: any,
  ) {
    return this.newsService.addComment(parseInt(id), req.user.id, content);
  }

  // Get comments
  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.newsService.getComments(
      parseInt(id),
      parseInt(page),
      parseInt(limit),
    );
  }

  // Delete comment
  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    await this.newsService.deleteComment(parseInt(commentId), req.user.id);
    return { message: 'Comment deleted successfully' };
  }
}
