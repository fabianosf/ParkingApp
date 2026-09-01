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

## Rodar localmente com Supabase (recomendado)

**Arquitetura:** API + Mobile na sua máquina | Banco no Supabase (nuvem).

### 1. Supabase — restaurar projeto

1. Abra o [dashboard](https://supabase.com/dashboard/project/ugkwzsfezarwqdpinpci)
2. Se estiver **pausado**, clique em **Restore project** e aguarde ~2 min
3. Em **Database → Connection string → URI** (Session pooler), copie a URI
4. Cole em `backend/.env` como `DATABASE_URL=postgresql+psycopg://...`  
   (substitua `[YOUR-PASSWORD]` por `Parking2026Secure`)

### 2. Backend (terminal 1)

```powershell
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Na primeira subida, o **admin padrão** é criado automaticamente (ver `.env`: `ADMIN_CPF`, `ADMIN_SENHA`).

### 3. Mobile (terminal 2)

```powershell
cd mobile
npm install
npx expo start
```

No `.env` do mobile: `EXPO_PUBLIC_API_URL=http://SEU_IP:8000` (celular) ou `http://localhost:8000` (emulador).

### 4. Login

- **Campo:** CPF + senha (não usa email no login)
- **Admin padrão:** CPF `057.218.457-32` | senha definida em `ADMIN_SENHA` no `.env`

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
| **PostgreSQL** | localhost:5432 (user: `parking`, pass: `parking`, db: `parking_db`) |

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

## Rodar com Docker (legado — só API + Postgres)

```bash
docker compose up db api --build
```

A API ficará disponível em:
- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **PostgreSQL:** localhost:5432 (user: parking, pass: parking, db: parking_db)

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
| 3 | Recuperar Senha (email) | Todos |
| 4 | Recuperar Senha (token) | Todos |
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
