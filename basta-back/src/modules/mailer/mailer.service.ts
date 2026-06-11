import { Injectable } from '@nestjs/common';
import { SendEmailDto } from '../../common/interfaces/mail.interface';
import * as nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';

@Injectable()
export class MailerService {
    mailTransport(): Transporter {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.example.com',
        port: Number(process.env.MAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    return transporter;
    }

    async sendEmail(dto: SendEmailDto & { subject: string }){
        if (process.env.NODE_ENV === 'production') return;
        const {from, recipients, subject, html, placeholderReplacement} = dto;

        const transport = this.mailTransport();
        const options: SendMailOptions = {
            from: from ?? {         
                name: process.env.APP_NAME || 'Basta Fabric',
                address: process.env.MAIL_FROM || 'noreply@bastafabric.com',
            },
            to: recipients,
            subject,
            html,
        };

        try {
            const result = await transport.sendMail(options);
            return result;
        } catch (error) {
            console.log('Error sending email:', error);
            throw error;
        }
    }
}