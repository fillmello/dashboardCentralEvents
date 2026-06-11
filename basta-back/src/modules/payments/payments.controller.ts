import type { RawBodyRequest } from '@nestjs/common';
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  Req,
  Headers,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreatePixDto } from 'src/common/dtos/payment/create-pix.dto';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Roles(Role.USER)
  @Post('pix')
  createPix(@Request() req: AuthenticatedRequest, @Body() dto: CreatePixDto) {
    return this.paymentsService.createPix(dto.orderId, req.user.sub);
  }

  @Roles(Role.USER)
  @Get('order/:orderId')
  getStatus(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.getStatus(orderId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody ?? Buffer.alloc(0);
    await this.paymentsService.handleWebhook(
      rawBody,
      signature ?? '',
      requestId ?? '',
    );
    return { received: true };
  }
}
