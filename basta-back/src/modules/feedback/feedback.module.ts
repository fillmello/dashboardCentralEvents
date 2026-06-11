import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from 'src/common/entities/feedback.entity';
import { Order } from 'src/common/entities/order.entity';
import { OrderItem } from 'src/common/entities/order-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Feedback, Order, OrderItem])],
    controllers: [FeedbackController],
    providers: [FeedbackService],
})
export class FeedbackModule {}