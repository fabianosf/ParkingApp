ROLE: Eng. backend sênior (FastAPI+SQLAlchemy+PostgreSQL). AJUSTE apenas — projeto já existe. Adicionar: senha provisória padrão + troca obrigatória 1º acesso + política de complexidade. Não altere lógica de veículos/pátio/histórico.

REGRA: 1)Admin cadastra colaborador→senha auto="12345"(hash),sem input de senha no form 2)novo user nasce senha_provisoria=true 3)login: se true→retorna must_change_password=true(antes/em vez de token completo,ou token escopo-restrito só p/ troca) 4)mobile: se true→navigation.reset p/ tela "TrocarSenhaObrigatória"(sem voltar,sem acesso outras telas) 5)troca ok→senha_provisoria=false,libera token completo.

POLÍTICA SENHA (aplicar em TODOS fluxos: cadastro,troca-obrigatória,alterar-perfil,redefinir-recuperação): min 6 chars | 1 maiúscula | 1 minúscula | 1 número | 1 especial(!@#$%^&*()-_+=) | nova≠"12345" e nova≠atual. Validar backend(Pydantic,reutilizável)+frontend(checklist ✓/✗ tempo-real). Erros específicos por critério, não genérico.

MODELO: users.senha_provisoria: Boolean default=False (único campo novo).

BACKEND: routers/users.py(criar colaborador: remove input senha,seta hash("12345")+provisoria=True) | routers/auth.py(login retorna must_change_password; novo endpoint POST /auth/change-password-first-access: só nova senha,sem senha-atual,valida política,seta provisoria=False) | dependency bloqueia toda rota exceto troca/logout se provisoria=True(403) | validador Pydantic validate_password_strength reutilizável nos 4 fluxos.

MOBILE: nova tela TrocarSenhaObrigatória(sem header/voltar,campo+confirmar,checklist 5 critérios tempo-real,botão desabilitado até tudo ✓) | Login: se must_change_password→navigation.reset(não navigate) p/ essa tela | reusar checklist em Cadastro/AlterarSenha-perfil/RedefinirSenha-recuperação | manter design system(AppInput,AppButton,Card).

RESTRIÇÕES: só módulo auth, resto intacto | 100%TS mobile,Python type-hints backend | zero cobrança/pagamento.

OUTPUT: 1.model User+campo 2.migration Alembic 3.validador Pydantic senha 4.routers auth.py+users.py completos 5.dependency bloqueio 6.tela mobile completa 7.trecho Login ajustado 8.resumo(arquivo→mudança,2-3 linhas).
