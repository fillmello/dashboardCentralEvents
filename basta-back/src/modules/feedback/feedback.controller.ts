import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request, Patch } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from 'src/common/dtos/feedback/CreateFeedbackDto.dto';
import { AnswerFeedbackDto } from 'src/common/dtos/feedback/AnswerFeedbackDto.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('feedback')
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) {}

    @Roles(Role.ADMIN)
    @Get()
    findAll() {
        return this.feedbackService.findAll();
    }

    @Roles(Role.USER)
    @Post(':productReleaseId')
    create(
        @Request() req: any,
        @Param('productReleaseId', ParseIntPipe) productReleaseId: number,
        @Body() dto: CreateFeedbackDto
    ) {
        return this.feedbackService.create(req.user.sub, productReleaseId, dto);
    }

    @Roles(Role.USER, Role.ADMIN)
    @Delete(':id')
    remove(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.feedbackService.remove(req.user.sub, id, req.user.role);
    }

    @Roles(Role.USER)
    @Patch(':id')
    update(
        @Request() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateFeedbackDto,
    ) {
        return this.feedbackService.update(req.user.sub, id, dto);
    }

    @Roles(Role.ADMIN)
    @Patch(':id/answer')
    answer(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AnswerFeedbackDto
    ) {
        return this.feedbackService.answer(id, dto);
    }
}