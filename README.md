# Hollow

Loja de Robux e gamepasses do Roblox. Next.js, login com Discord, checkout Pix, pedidos no MongoDB e avisos no Discord.

## Como rodar

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Preencha `.env.local` com os valores reais. O arquivo `.env.example` lista todas as variáveis. Não commite `.env`, `.env.local` nem chaves.

Em produção, `CSRF_SECRET` e `AUTH_SECRET` precisam ter pelo menos 32 caracteres.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run start` — sobe o build
- `npm run lint` — ESLint
