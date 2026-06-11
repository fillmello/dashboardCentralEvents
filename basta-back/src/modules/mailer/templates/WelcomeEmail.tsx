import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Button,
  Hr,
  Section,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userName }) => {
  const colors = {
    background: '#f4f3ef',
    foreground: '#171717',
    surface: '#27272a',
    muted: '#9ca4b5',
    accent: '#fef08a',
    stroke: '#30374b',
  };

  return (
    <Html lang="pt-BR">
      <Head />
      <Body style={{ margin: 0, padding: 0, fontFamily: "'Geist Sans', sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: colors.background }}>
          {/* Header */}
          <Section
            style={{
              background: colors.foreground,
              padding: '40px 24px',
              textAlign: 'center' as const,
            }}
          >
            <Heading
              as="h1"
              style={{
                color: '#ffffff',
                margin: '0 0 8px 0',
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              Basta
            </Heading>
            <Text style={{ color: colors.accent, margin: 0, fontSize: '14px', fontWeight: 400, fontStyle: 'italic' }}>
              fabric
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: '40px 24px', background: '#ffffff' }}>
            <Heading
              as="h2"
              style={{
                color: colors.foreground,
                fontSize: '24px',
                fontWeight: 600,
                margin: '0 0 20px 0',
              }}
            >
              Bem-vindo, {userName}! 👋
            </Heading>

            <Text style={{ color: colors.foreground, fontSize: '16px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              Estamos felizes em tê-lo conosco! Na <strong>Basta Fabric</strong>, você encontra os melhores tecidos
              e coleções exclusivas para seus projetos.
            </Text>

            <Section
              style={{
                background: colors.background,
                borderLeft: `4px solid ${colors.accent}`,
                padding: '16px 20px',
                margin: '24px 0',
                borderRadius: '4px',
              }}
            >
              <Text style={{ color: colors.foreground, fontSize: '14px', fontWeight: 600, margin: '0 0 8px 0' }}>
                📦 Comece agora:
              </Text>
              <Text style={{ color: colors.muted, fontSize: '13px', margin: 0 }}>
                Explore nossas coleções, adicione seus favoritos ao carrinho e aproveite tecidos de qualidade premium.
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button
                href="http://localhost:3000"
                style={{
                  background: colors.foreground,
                  color: colors.accent,
                  padding: '12px 32px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontSize: '14px',
                  border: `1px solid ${colors.stroke}`,
                }}
              >
                Acessar Catálogo
              </Button>
            </Section>

            <Hr style={{ border: 'none', borderTop: `1px solid ${colors.stroke}`, margin: '24px 0' }} />

            <Text style={{ color: colors.muted, fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
              Dúvidas?{' '}
              <Link href="mailto:support@bastafabric.com" style={{ color: colors.accent, textDecoration: 'underline' }}>
                Entre em contato
              </Link>
              . Estamos prontos para ajudar!
            </Text>
          </Section>

          {/* Footer */}
          <Section
            style={{
              background: colors.foreground,
              padding: '24px',
              textAlign: 'center' as const,
              borderTop: `1px solid ${colors.stroke}`,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: '12px', margin: 0, fontWeight: 600 }}>
              © 2026 Basta Fabric
            </Text>
            <Text style={{ color: colors.muted, fontSize: '11px', margin: '8px 0 0 0' }}>
              <Link href="http://localhost:3000" style={{ color: colors.accent, textDecoration: 'none' }}>
                Visite nosso site
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
