import { IsIn, IsOptional, IsString } from 'class-validator';

export class FindTasksDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  isCompleted?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
