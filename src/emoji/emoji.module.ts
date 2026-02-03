import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmojiService } from './emoji.service';
import { EmojiController } from './emoji.controller';
import { Emoji } from './entities/emoji.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Emoji])],
  controllers: [EmojiController],
  providers: [EmojiService],
  exports: [EmojiService],
})
export class EmojiModule {}
