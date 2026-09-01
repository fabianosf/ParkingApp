# Estaciona+ PWA

Aplicação web progressiva (PWA) do controle interno de estacionamento corporativo. Migração fiel do app React Native/Expo — mesmas cores, espaçamentos, componentes e fluxos.

## Pré-requisitos

- Node.js 18+
- Backend FastAPI rodando (padrão: `http://127.0.0.1:8000`)

## Desenvolvimento

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:5173`.

Configure `VITE_API_URL` no `.env` apontando para a API.

## Build de produção

```bash
npm run build
npm run preview
```

Os arquivos ficam em `dist/`. O service worker cacheia apenas assets estáticos (JS, CSS, ícones). A API continua exigindo conexão.

## Instalar como app (PWA)

### Android (Chrome / Edge)

1. Abra o site no navegador
2. Menu (⋮) → **Instalar app** ou **Adicionar à tela inicial**

### iOS (Safari)

1. Abra o site no Safari
2. Toque em **Compartilhar** (ícone de exportar)
3. **Adicionar à Tela de Início**

## Estrutura

```
web/
├── public/
│   ├── manifest.json      # name, theme_color, icons
│   └── icons/             # 192×192 e 512×512
├── src/
│   ├── theme/theme.ts     # valores idênticos ao RN
│   ├── components/UI.tsx  # View→div, Text→span, etc.
│   ├── pages/             # 12 telas convertidas
│   ├── services/api.ts    # axios + localStorage
│   ├── store/             # Zustand (auth + theme)
│   └── routes/            # ProtectedRoute + tabs
└── vite.config.ts         # vite-plugin-pwa
```

## Fluxos preservados

- Login por CPF + senha
- Cadastro com política de senha
- Recuperação e redefinição de senha
- **Senha provisória** → tela obrigatória de troca no primeiro acesso
- Rotas protegidas por role (ADMIN / MOTORISTA)

## Confirmação visual

Nenhum valor de cor, spacing, radius ou tipografia foi alterado em relação ao `theme.ts` original do app mobile.
