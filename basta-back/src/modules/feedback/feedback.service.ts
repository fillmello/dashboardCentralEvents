import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Feedback } from 'src/common/entities/feedback.entity';
import { Order } from 'src/common/entities/order.entity';
import { CreateFeedbackDto } from 'src/common/dtos/feedback/CreateFeedbackDto.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Role } from 'src/common/enums/role.enum';
import { AnswerFeedbackDto } from 'src/common/dtos/feedback/AnswerFeedbackDto.dto';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private feedbackRepository: Repository<Feedback>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
    ) {}

    async create(userId: number, productReleaseId: number, dto: CreateFeedbackDto): Promise<void> {
        const hasPurchased = await this.orderRepository.findOne({
            where: {
                user: { id: userId },
                status: In([
                    OrderStatus.PAGO,
                    OrderStatus.EM_SEPARACAO,
                    OrderStatus.ENVIADO,
                    OrderStatus.ENTREGUE,
                ]),
                items: { productRelease: { id: productReleaseId } }
            },
            relations: { items: { productRelease: true } }
        });

        if (!hasPurchased) throw new ForbiddenException('Apenas usuários que compraram o produto podem comentar');

        const feedback = this.feedbackRepository.create({
            description: dto.description,
            productRelease: { id: productReleaseId },
            usr: { id: userId },
        });

        await this.feedbackRepository.save(feedback);
    }

    async findAll(): Promise<Feedback[]> {
        return this.feedbackRepository.find({
            relations: { usr: true, productRelease: true },
            select: {
                id: true,
                description: true,
                createdAt: true,
                adminResponse: true,
                respondedAt: true,
                usr: { id: true, fullName: true },
                productRelease: { id: true, name: true , imageFrontUrl: true},
            },
            order: { createdAt: 'DESC' },
        });
    }

    async remove(userId: number, feedbackId: number, role: string): Promise<void> {
        const feedback = await this.feedbackRepository.findOne({
            where: { id: feedbackId },
            relations: { usr: true }
        });
        if (!feedback) throw new NotFoundException('Feedback não encontrado');

        if (role !== Role.ADMIN && feedback.usr.id !== userId) {
            throw new ForbiddenException('Você só pode excluir seu próprio feedback');
        }

        await this.feedbackRepository.remove(feedback);
    }

    async update(userId: number, feedbackId: number, dto: CreateFeedbackDto): Promise<void> {
        const feedback = await this.feedbackRepository.findOne({
            where: { id: feedbackId },
            relations: { usr: true },
        });
        if (!feedback) throw new NotFoundException('Feedback não encontrado');
        if (feedback.usr.id !== userId) throw new ForbiddenException('Você só pode editar seu próprio feedback');

        feedback.description = dto.description;
        await this.feedbackRepository.save(feedback);
    }

    async answer(feedbackId: number, dto: AnswerFeedbackDto): Promise<void> {
        const feedback = await this.feedbackRepository.findOne({
            where: { id: feedbackId }
        });
        if (!feedback) throw new NotFoundException('Feedback não encontrado');

        feedback.adminResponse = dto.adminResponse;
        feedback.respondedAt = new Date();
        await this.feedbackRepository.save(feedback);
    }
}