-- Cole tudo no SQL Editor do Supabase e clique em RUN
-- Dashboard: https://supabase.com/dashboard → seu projeto → SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE userrole AS ENUM ('ADMIN', 'MOTORISTA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE parkingstatus AS ENUM ('NO_PATIO', 'FINALIZADO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role userrole NOT NULL DEFAULT 'MOTORISTA',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_em TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(7) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  cor VARCHAR(50) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_vehicles_placa_ativa
  ON vehicles (placa) WHERE excluido_em IS NULL;

CREATE TABLE IF NOT EXISTS parking_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  data_entrada TIMESTAMPTZ NOT NULL,
  data_saida TIMESTAMPTZ NULL,
  registrado_por UUID NOT NULL REFERENCES users(id),
  status parkingstatus NOT NULL DEFAULT 'NO_PATIO'
);

CREATE TABLE IF NOT EXISTS parking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacidade_maxima INTEGER NOT NULL DEFAULT 50,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS senha_provisoria BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO parking_config (capacidade_maxima)
SELECT 50
WHERE NOT EXISTS (SELECT 1 FROM parking_config);

-- Crie o admin via seed da API (ADMIN_CPF / ADMIN_SENHA no .env)
-- ou insira manualmente um hash bcrypt válido.
