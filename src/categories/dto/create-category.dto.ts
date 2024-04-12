import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: '테스트 카테고리', description: '기본값' })
  @Length(1, 10, { message: '카테고리 이름은 50글자 미만으로 입력해주세요.' })
  @IsString()
  readonly category_name: string;

  @ApiProperty({ example: 'products', description: '기본값' })
  @IsString()
  @IsIn(['products', 'community'])
  type: string;

  @ApiProperty({ example: 1, description: '기본값' })
  @IsNumber()
  readonly brand_id: number;
}
