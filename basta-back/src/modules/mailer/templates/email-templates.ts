import { render } from '@react-email/components';
import { WelcomeEmail } from './WelcomeEmail';
import { OrderStatusEmail } from './OrderStatusEmail';

export const emailTemplates = {
  welcome: async (userName: string): Promise<string> => {
    return await render(WelcomeEmail({ userName }));
  },
  orderStatus: async (payload: {
    userName: string;
    orderId: number;
    title: string;
    message: string;
  }): Promise<string> => {
    return await render(OrderStatusEmail(payload));
  },
};
