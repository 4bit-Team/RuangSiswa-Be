import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(5000)
  content: string;
}
