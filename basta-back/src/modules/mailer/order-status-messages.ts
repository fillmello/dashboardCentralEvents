import { OrderStatus } from 'src/common/enums/order-status.enum';

export const STATUS_COPY: Record<
  OrderStatus,
  { subject: string; title: string; message: string }
> = {
  RESERVADO: {
    subject: 'Pedido reservado',
    title: 'Pedido reservado',
    message:
      'Seu pedido foi reservado com sucesso. Assim que o pagamento for confirmado, iniciamos a separacao dos itens.',
  },
  PAGO: {
    subject: 'Pagamento confirmado',
    title: 'Pagamento confirmado',
    message:
      'Pagamento aprovado! Estamos preparando os produtos e em breve voce recebera as informacoes de envio.',
  },
  EM_SEPARACAO: {
    subject: 'Pedido em separacao',
    title: 'Seu pedido esta em separacao',
    message:
      'Nossa equipe esta separando os itens com cuidado. Assim que finalizar, o pedido segue para envio.',
  },
  ENVIADO: {
    subject: 'Pedido enviado',
    title: 'Seu pedido esta a caminho',
    message:
      'Pedido despachado! Agora e com a transportadora. Em breve ele chega no seu endereco.',
  },
  ENTREGUE: {
    subject: 'Pedido entregue',
    title: 'Pedido entregue',
    message:
      'Entrega confirmada! Esperamos que voce ame sua compra. Se precisar de ajuda, estamos a disposicao.',
  },
  CANCELADO: {
    subject: 'Pedido cancelado',
    title: 'Pedido cancelado',
    message:
      'Seu pedido foi cancelado. Caso queira mais detalhes ou suporte, fale com a nossa equipe.',
  },
};
