A ideia desse arquivo é documentar o system design e dependecias, para já termos uma visão geral e não surgirem surpresas desagradaveis.

DOMÍNIO
- Registro.br
- HostGator

SERVIDOR / HOSTING
- Railway (backend)
- Render (backend)
- Vercel (frontend)

BANCO DE DADOS
- PostgreSQL ou MySQL (pode vir junto do hosting)

ARMAZENAMENTO DE MÍDIA
- Amazon S3
- Cloudflare R2

PAGAMENTO (PIX)
- GerenciaNet
- AbacatePay
- Stripe
- MercadoPago
- Nummy
- Pagar.me

FRETE
- API dos Correios
- Intermediadores opcionais: Melhor Envio

ENDEREÇO
- ViaCEP

EMAIL
- SendGrid
- Resend

CACHE (opcional, backend)
- Redis
- Memcached
- Implementação simples no backend para reduzir chamadas externas

MONITORAMENTO (opcional)
- Ferramentas integradas do hosting (Railway, Render, Vercel)
- Grafana / Prometheus (para métricas mais avançadas)

FILA / TAREFAS ASSÍNCRONAS (opcional)
- RabbitMQ
- AWS SQS
- Outros sistemas de fila para processar emails, webhooks e tarefas demoradas

CI/CD
- GitHub Actions
- integração com hosting (Railway, Render, Vercel)

HTTPS / SSL
- incluso no hosting (Vercel, Render, Railway)