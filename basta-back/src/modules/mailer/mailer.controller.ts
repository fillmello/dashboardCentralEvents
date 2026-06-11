import {
  Body,
  Controller,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { MailerService } from './mailer.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SendEmailDto } from 'src/common/interfaces/mail.interface';
import { emailTemplates } from './templates/email-templates';
import { OrdersService } from '../orders/orders.service';
import { SendOrderStatusDto } from 'src/common/dtos/mailer/send-order-status.dto';
import { STATUS_COPY } from './order-status-messages';



@Roles(Role.ADMIN)
@Controller('mailer')
export class MailerController {
  constructor(
    private mailerService: MailerService,
    private ordersService: OrdersService,
  ) {}


  @Post('/send-email')
  async sendMail() {
    const html = await emailTemplates.welcome('Filipe');
    const dto: SendEmailDto = {
      from: { name: 'Andre', address: 'dedezin@gmail.com' },
      recipients: [{ name: 'Filipe', address: 'fillmellodev@gmail.com' }],
      subject: 'Bem-vindo à Basta Fabric!',
      html,
    };
    return await this.mailerService.sendEmail(dto);
  }

  @Post('/order-status')
  async sendOrderStatus(@Body() dto: SendOrderStatusDto) {
    const order = await this.ordersService.findOne(
      dto.orderId,
      undefined,
      Role.ADMIN,
    );
    if (!order.user?.email) {
      throw new BadRequestException('E-mail do cliente não encontrado.');
    }

    const copy = STATUS_COPY[dto.status];
    const displayName =
      order.user.fullName?.trim() ||
      order.user.email.split('@')[0] ||
      'cliente';
    const html = await emailTemplates.orderStatus({
      userName: displayName,
      orderId: order.id,
      title: copy.title,
      message: copy.message,
    });

    const sendDto: SendEmailDto = {
      recipients: [
        {
          name: displayName,
          address: order.user.email,
        },
      ],
      subject: `Pedido #${order.id} · ${copy.subject} · ${displayName}`,
      html,
    };

    return await this.mailerService.sendEmail(sendDto);
  }
}
