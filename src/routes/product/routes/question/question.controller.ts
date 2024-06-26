import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AddQuestionDto } from './dto/AddQuestionDto.dto';
import { QuestionService } from './question.service';
import { ResponesContainerDto } from 'src/global/dto/respones-container.dto';
import { TokenPayload } from 'src/routes/auth/interfaces/token-payload.interface';
import { ProductQuestion } from './entities/productQuestion.entity';

@Controller('product/question')
@ApiTags('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post(':optionId')
  @ApiOperation({ summary: '상품 문의 등록' })
  async addQuestion(
    @Body() addQuestionDto: AddQuestionDto,
    @Req() request: Request,
  ): Promise<ResponesContainerDto<null>> {
    const user = request['user'] as TokenPayload;
    await this.questionService.addQuestion(addQuestionDto, user.userId);
    return {
      statusCode: 201,
      message: '상품 문의 등록 성공',
      data: null,
    };
  }

  @Get('/:productId')
  @ApiOperation({ summary: '상품 별 문의 조회' })
  @ApiQuery({ name: 'isOwner', required: false, type: Boolean })
  async getQuestionByProductId(
    @Param('productId') productId: number,
    @Req() request: Request,
    @Query('isOwner') isOwner?: boolean,
  ): Promise<ResponesContainerDto<ProductQuestion[]>> {
    const user = request['user'] as TokenPayload;
    const data: ProductQuestion[] =
      await this.questionService.getQuestionByProductId(
        productId,
        user.userId,
        isOwner,
      );
    return {
      statusCode: 200,
      message: `상품 문의 조회 성공`,
      data: data,
    };
  }

  @Get('/user')
  @ApiOperation({ summary: '개인 별 문의 조회' })
  async getQuestionByUserId(
    @Req() request: Request,
  ): Promise<ResponesContainerDto<ProductQuestion[]>> {
    const user = request['user'] as TokenPayload;
    const data: ProductQuestion[] =
      await this.questionService.getQuestionByUserId(user.userId);
    return {
      statusCode: 200,
      message: `상품 문의 조회 성공`,
      data: data,
    };
  }

  @Delete('/:questionId')
  @ApiOperation({ summary: '상품 문의 삭제' })
  async deleteQuestion(
    @Param('questionId') questionId: number,
    @Req() request: Request,
  ): Promise<ResponesContainerDto<null>> {
    const user = request['user'] as TokenPayload;
    await this.questionService.deleteQuestion(questionId, user.userId);
    return {
      statusCode: 200,
      message: '상품 문의 삭제 성공',
      data: null,
    };
  }
}
