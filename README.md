# Estacionamento Corporativo

App mobile de controle de estacionamento interno corporativo (sem cobrança/tarifa/pagamento).

**Perfis:** ADMIN (porteiro/RH) e MOTORISTA (colaborador).

## Estrutura do Projeto

```
ParkingApp/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── database.py
│   │   │   └── email.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── password_reset_token.py
│   │   │   ├── vehicle.py
│   │   │   ├── parking_record.py
│   │   │   └── parking_config.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── auth.py
│   │   │   ├── vehicle.py
│   │   │   ├── parking_record.py
│   │   │   └── parking_config.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── vehicles.py
│   │   │   ├── parking_records.py
│   │   │   └── parking_config.py
│   │   └── dependencies/
│   │       └── auth.py
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/001_initial.py
│   ├── alembic.ini
│   ├── Dockerfile
│   └── requirements.txt
├── mobile/
│   ├── App.tsx
│   └── src/
│       ├── api/client.ts
│       ├── store/authStore.ts
│       ├── navigation/
│       ├── screens/ (11 telas)
│       ├── styles/common.ts
│       ├── types/index.ts
│       └── utils/validation.ts
└── docker-compose.yml
```

## Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para o mobile)
- Python 3.12+ (opcional, para rodar backend local sem Docker)

## Escolher o ambiente (`ambiente.txt`)

Na raiz do projeto existe o arquivo **`ambiente.txt`**. A API lê esse arquivo na subida e monta o banco automaticamente:

| Valor em `ambiente.txt` | Banco |
|-------------------------|--------|
| `local` | SQLite (`backend/parking_local.db`) — sem Docker |
| `postgres` | Postgres em `localhost:5433` |
| `docker` | Postgres do compose (`db:5432`) |
| `production` | Postgres de produção (use `DATABASE_URL` no `.env`) |

Troque só a palavra no arquivo e **reinicie** o backend. Confira em http://localhost:8000/health (`environment` + `database`).

`APP_ENV` / `DATABASE_URL` no `.env` ou no sistema ainda têm prioridade se estiverem preenchidos.

## Rodar localmente (recomendado — SQLite, sem Docker)

1. Deixe `ambiente.txt` com `local`.
2. Copie o ambiente do backend:

```powershell
cd backend
copy .env.example .env
```

Ajuste `ADMIN_CPF` / `ADMIN_SENHA` no `.env`. Deixe `DATABASE_URL=` vazio para seguir o `ambiente.txt`.

3. Backend (terminal 1):

```powershell
cd backend
pip install -r requirements.txt
$env:PYTHONPATH="."
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Na primeira subida o SQLite cria as tabelas automaticamente e o admin do `.env`.

4. Frontend (terminal 2):

```powershell
cd web
npm install
npm run dev
```

App: http://localhost:5173  
API: http://localhost:8000/docs

### Login (exemplo local)

- CPF: o valor de `ADMIN_CPF` no `.env`
- Senha: o valor de `ADMIN_SENHA` no `.env`

### Postgres / Supabase (opcional)

Coloque `postgres` em `ambiente.txt` (ou preencha `DATABASE_URL` no `.env`) e rode `alembic upgrade head`.

---

## Rodar tudo com Docker (recomendado — PWA + API + Postgres)

Na raiz do projeto:

```powershell
# 1. (Opcional) variáveis de produção
copy .env.docker.example .env

# 2. Subir stack completa
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| **App (PWA)** | http://localhost:8080 |
| **API / Swagger** | http://localhost:8000/docs |
| **PostgreSQL** | localhost:5433 (user: `parking`, pass: `parking`, db: `parking_db`) |

O container `web` (nginx) serve o frontend e faz proxy da API na mesma origem — sem CORS no navegador.

**Parar:**
```powershell
docker compose down
```

**Parar e apagar banco:**
```powershell
docker compose down -v
```

### Docker só com Supabase (sem Postgres local)

```powershell
docker compose -f docker-compose.supabase.yml up --build
```

Configure `backend/.env` com `DATABASE_URL` ou credenciais Supabase antes de subir.

---

## Deploy no VPS (acessar no celular)

### 1. Preparar o VPS (Ubuntu 22/24)

```bash
# SSH no servidor
ssh root@SEU_IP_VPS

# Instalar Docker
curl -fsSL https://get.docker.com | sh
apt install -y git

# Clonar projeto
git clone https://github.com/fabianosf/ParkingApp.git
cd ParkingApp
```

### 2. Configurar variáveis

```bash
cp .env.docker.example .env
nano .env
```

Ajuste no mínimo:

```env
SECRET_KEY=change-me-in-production
POSTGRES_PASSWORD=CHANGE_ME_DB_PASSWORD
ADMIN_CPF=
ADMIN_SENHA=CHANGE_ME_ADMIN_PASSWORD

# Troque pelo IP público do VPS
FRONTEND_URL=http://SEU_IP_VPS
CORS_ORIGINS=http://SEU_IP_VPS
```

### 3. Subir a aplicação

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Aguarde ~2 min. Verifique:

```bash
docker compose ps
curl http://localhost/health
```

### 4. Liberar firewall

No painel do VPS ou via UFW:

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow OpenSSH
ufw enable
```

**Não** exponha a porta `5432` (Postgres) na internet.

### 5. Abrir no celular

No navegador do celular (Chrome/Safari), acesse:

```
http://IP_DO_VPS
```

Ex.: `http://123.45.67.89`

Funciona com **4G/Wi‑Fi** — o app fica público na internet.

Para **instalar como PWA** (ícone na tela inicial), prefira **HTTPS com domínio** (passo 6).

### 6. (Recomendado) Domínio + HTTPS

1. Compre/use um domínio (ex.: `estacionamento.suaempresa.com.br`)
2. Crie um registro **A** apontando para o IP do VPS
3. No `.env`:

```env
DOMAIN=estacionamento.suaempresa.com.br
FRONTEND_URL=https://estacionamento.suaempresa.com.br
CORS_ORIGINS=https://estacionamento.suaempresa.com.br
```

4. Suba com Caddy (certificado automático):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml up -d --build
```

5. No celular: `https://estacionamento.suaempresa.com.br`

### 7. Atualizar depois

```bash
cd ParkingApp
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

(Adicione `-f docker-compose.https.yml` se usar HTTPS.)

---

## Rodar com Docker (legado — só API + Postgres)

```bash
docker compose up db api --build
```

A API ficará disponível em:
- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **PostgreSQL:** localhost:5433 (user: parking, pass: parking, db: parking_db)

Para o PWA, use `npm run dev` em `web/` ou suba o serviço `web` conforme seção acima.

## Rodar Backend Local (sem Docker)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Suba o PostgreSQL (via Docker ou local)
# Ajuste DATABASE_URL no .env se necessário

alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Rodar Mobile (Expo)

```bash
cd mobile
npm install
cp .env.example .env

# Para emulador Android use:
# EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# Para dispositivo físico use o IP da sua máquina:
# EXPO_PUBLIC_API_URL=http://192.168.x.x:8000

npx expo start
```

Escaneie o QR code com o app Expo Go ou pressione `a` (Android) / `i` (iOS).

## Primeiro Acesso

1. **Admin:** faça login com o CPF configurado em `ADMIN_CPF` (criado automaticamente na 1ª subida da API).
2. **Motorista:** use **Criar conta** no app (cadastro continua com email; login é por CPF).
3. Admin gerencia veículos, entradas/saídas e capacidade do pátio.

## Telas

| # | Tela | Perfil |
|---|------|--------|
| 1 | Login | Todos |
| 2 | Cadastro | Todos |
| 3 | Recuperar Senha (CPF) | Todos |
| 4 | Redefinir Senha (token) | Todos |
| 5 | Dashboard (vagas, entrada/saída) | ADMIN |
| 6 | Veículos & Colaboradores (CRUD) | ADMIN |
| 7 | Histórico (filtros) | ADMIN |
| 8 | Configuração do Pátio | ADMIN |
| 9 | Meu Veículo (status) | MOTORISTA |
| 10 | Meu Histórico | MOTORISTA |
| 11 | Perfil (trocar senha, logout) | Todos |

## Email (Reset de Senha)

Configure as variáveis no `.env` do backend ou no `docker-compose.yml`:

```
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-app-password
MAIL_FROM=noreply@parking.local
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
```

Sem configuração de email, o token é gerado no banco mas não enviado (consulte a tabela `password_reset_tokens` para testes).

## API Docs

Documentação interativa Swagger: **http://localhost:8000/docs**
