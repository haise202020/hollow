# Hollow

Loja de **Robux** e **Gamepasses** do Roblox — Next.js, tema preto/branco com destaques roxos e base de segurança pronta para evoluir.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Segurança (já incluída)

- Headers: CSP, `X-Frame-Options`, `nosniff`, Referrer-Policy, Permissions-Policy, HSTS (produção)
- `poweredByHeader` desligado
- Middleware com rate limit global e cookie CSRF
- API `/api/contact` com CSRF, sanitização, validação Zod e rate limit por IP
- Imagens remotas restritas a `i.imgur.com`
- Sem `dangerouslySetInnerHTML`

Em produção, defina um segredo forte:

```bash
# .env.local
CSRF_SECRET=gere_com_openssl_rand_hex_32
```

## Próximos passos

- Banco de dados e autenticação real do Login
- Checkout / gateway de pagamento
- Rate limit distribuído (Redis/Upstash) em multi-instância
