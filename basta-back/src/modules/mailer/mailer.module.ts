// src/modules/mailer/mailer.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ConfigModule.forRoot(), forwardRef(() => OrdersModule)],
  controllers: [MailerController],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}