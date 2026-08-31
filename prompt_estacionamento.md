ROLE: Eng. full-stack sênior (React Native/Expo + FastAPI + PostgreSQL/SQLAlchemy). Gere app mobile completo de controle de estacionamento CORPORATIVO INTERNO (sem cobrança/tarifa/pagamento — proibido em qualquer tela/rota/campo).

APP: 2 perfis — ADMIN (porteiro/RH: gerencia veículos/colaboradores, registra entrada/saída) e MOTORISTA (colaborador: vê próprio veículo/histórico).

STACK: RN+Expo+TS+ReactNavigation+Zustand | FastAPI+Uvicorn+SQLAlchemy2.0+Alembic+Pydantic2 | PostgreSQL | JWT(access+refresh)+passlib(bcrypt) | fastapi-mail | Docker Compose.

MODELOS (SQLAlchemy, UUID pk):
- users: nome,cpf(uniq),email(uniq),senha_hash,role[ADMIN|MOTORISTA],criado_em,atualizado_em
- password_reset_tokens: user_id(fk),token(uniq),expira_em,usado(bool),criado_em
- vehicles: placa(uniq,formato antigo+mercosul),modelo,cor,owner_id(fk users),criado_em
- parking_records: vehicle_id(fk),data_entrada,data_saida(null),registrado_por(fk users),status[NO_PATIO|FINALIZADO]
- parking_config: capacidade_maxima(int),atualizado_em

TELAS: 1)Login(email/senha,link esqueci-senha,link cadastro) 2)Cadastro(nome,cpf,email,senha,confirmar;valida cpf/email/senha-forte;role default MOTORISTA) 3)RecuperarSenha-1(email→gera token 15-30min,msg genérica) 4)RecuperarSenha-2(token+nova senha+confirmar) 5)Admin-Dashboard(contador vagas X/Y,lista NO_PATIO,busca placa c/autocomplete,btn entrada[bloqueia se cheio]/saída) 6)Admin-Veículos&Colaboradores(CRUD+filtro) 7)Admin-Histórico(filtro data/veículo) 8)Admin-ConfigPátio(capacidade_maxima) 9)Motorista-MeuVeículo(dados+status+seletor se +1 veículo) 10)Motorista-Histórico 11)Perfil(dados,trocar senha c/senha atual,logout).

REGRAS: 1 entrada NO_PATIO por vez/veículo | só ADMIN cria/edita/registra | motorista só vê próprios dados | 1 colaborador pode ter N veículos | cpf/placa únicos+validados | registrado_por=admin logado automático | bloquear entrada se NO_PATIO_count>=capacidade_maxima | token reset único-uso+expira 30min | não revelar se email existe (anti-enumeração) | ZERO cobrança/tarifa/pagamento em qualquer lugar.

ARQUITETURA BACKEND: app/{main.py, core/[config,security,database].py, models/*.py, schemas/*.py, routers/[auth,users,vehicles,parking_records,parking_config].py, dependencies/auth.py(get_current_user,require_role), alembic/}.

OUTPUT (nesta ordem, código completo sem "..."): 1.estrutura pastas 2.models SQLAlchemy 3.schemas Pydantic 4.Alembic config+migration inicial 5.routers completos(JWT+role-guard) 6.email config reset-senha 7.Dockerfile+docker-compose.yml 8.telas RN/Expo(1 arquivo/tela) 9.instruções rodar local(uvicorn+expo)+link /docs.

RESTRIÇÕES: sem libs pagas | Python c/type hints, mobile 100% TS | comentar só lógica não-óbvia | nunca expor senha/cpf completo (response models Pydantic) | proibido qualquer cobrança/tarifa/pagamento.
