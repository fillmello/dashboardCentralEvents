import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
} from '@react-email/components';

interface OrderStatusEmailProps {
  userName: string;
  orderId: number;
  title: string;
  message: string;
}

export const OrderStatusEmail: React.FC<OrderStatusEmailProps> = ({
  userName,
  orderId,
  title,
  message,
}) => {
  const colors = {
    background: '#f4f3ef',
    foreground: '#171717',
    muted: '#9ca4b5',
    accent: '#fef08a',
    stroke: '#30374b',
  };

  return (
    <Html lang="pt-BR">
      <Head />
      <Body style={{ margin: 0, padding: 0, fontFamily: "'Geist Sans', sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: colors.background }}>
          <Section
            style={{
              background: colors.foreground,
              padding: '32px 24px',
              textAlign: 'center' as const,
            }}
          >
            <Heading
              as="h1"
              style={{
                color: '#ffffff',
                margin: '0 0 6px 0',
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              Basta
            </Heading>
            <Text style={{ color: colors.accent, margin: 0, fontSize: '12px', fontWeight: 400, fontStyle: 'italic' }}>
              fabric
            </Text>
          </Section>

          <Section style={{ padding: '32px 24px', background: '#ffffff' }}>
            <Heading
              as="h2"
              style={{
                color: colors.foreground,
                fontSize: '20px',
                fontWeight: 600,
                margin: '0 0 16px 0',
              }}
            >
              {title}
            </Heading>

            <Text style={{ color: colors.foreground, fontSize: '15px', lineHeight: '1.6', margin: '0 0 18px 0' }}>
              Ola {userName}, seu pedido <strong>#{orderId}</strong> esta com o status: <strong>{title}</strong>.
            </Text>

            <Section
              style={{
                background: colors.background,
                borderLeft: `4px solid ${colors.accent}`,
                padding: '16px 20px',
                margin: '0 0 20px 0',
                borderRadius: '4px',
              }}
            >
              <Text style={{ color: colors.foreground, fontSize: '14px', margin: 0 }}>
                {message}
              </Text>
            </Section>

            <Hr style={{ border: 'none', borderTop: `1px solid ${colors.stroke}`, margin: '20px 0' }} />

            <Text style={{ color: colors.muted, fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
              Se tiver qualquer duvida, responda este email que a nossa equipe ajuda voce.
            </Text>
          </Section>

          <Section
            style={{
              background: colors.foreground,
              padding: '20px',
              textAlign: 'center' as const,
              borderTop: `1px solid ${colors.stroke}`,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: '12px', margin: 0, fontWeight: 600 }}>
              © 2026 Basta Fabric
            </Text>
            <Text style={{ color: colors.muted, fontSize: '11px', margin: '8px 0 0 0' }}>
              Obrigado por comprar com a gente.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
