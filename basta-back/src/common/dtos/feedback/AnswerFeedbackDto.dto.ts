import { IsString } from 'class-validator';

export class AnswerFeedbackDto {
    @IsString()
    adminResponse: string;
}