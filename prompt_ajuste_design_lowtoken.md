ROLE: Eng. front-end mobile sênior (React Native/Expo/TS). AJUSTE VISUAL apenas — projeto já existe (login,cadastro,recuperar-senha,dashboard-admin,gestão-veículos,histórico,meu-veículo,perfil). NÃO altere lógica/API/navegação, só camada visual (JSX).

CORES: primary #1E3A5F(headers/btn principal) | primaryLight #2E5C8A(cards destaque) | accent #00B894(sucesso/no-pátio) | warning #F39C12(aviso) | danger #E74C3C(erro/sair) | background #F5F7FA | card #FFF | border #E1E5EA | textDark #1C2833 | textMuted #7F8C8D.

ARQUIVOS: theme/theme.ts(cores+spacing+radius+typography+shadow) | store/useThemeStore.ts(Zustand,dark-mode-ready) | components/UI.tsx(AppInput,AppButton,Card,StatusBadge,OccupancyBar,VehicleRow).

COMPONENTES (obrigatório usar, nunca estilo inline duplicado):
- AppInput: label+borda cinza,vermelha+msg se erro
- AppButton: variants primary|accent|danger|ghost
- Card: branco,sombra suave(opacity.06,elevation2),radius12
- StatusBadge: pílula NO_PATIO(verde)|FINALIZADO(cinza)+dot
- OccupancyBar: card primaryLight,"X/Y vagas",barra progresso→vermelho se cheio
- VehicleRow: barra-lateral-colorida+placa bold+subtítulo+StatusBadge

APLICAR POR TELA:
1)Login/Cadastro: AppInput todos campos,AppButton primary(entrar)/accent(cadastrar),logo circular iniciais
2)RecuperarSenha(1-2): AppInput+AppButton primary,instrução em textMuted
3)Dashboard-Admin: OccupancyBar topo,lista=VehicleRow,AppButton accent(entrada)/ghost+warning(saída)
4)Gestão-Veículos: VehicleRow/Card+AppInput busca
5)Histórico: Card por item(entrada/saída/duração,sem badge se finalizado)
6)MeuVeículo: Card dados+dot status,Card separado tempo-destaque(fonte grande,cor primary)
7)Perfil: avatar circular iniciais,dados textMuted,AppButton ghost(alterar senha)/danger outline(sair)

REGRAS: zero estilo inline duplicado(tudo via theme.ts+components) | não mudar props/rotas/API/state | width 100% responsivo,sem px fixo | renomear conflito de nome local | proibido lib UI externa(NativeBase/Paper) — só components próprios.

OUTPUT: 1.theme.ts 2.useThemeStore.ts 3.UI.tsx(todos componentes) 4.cada tela refatorada completa(mesma ordem original) 5.resumo final(arquivo→o que mudou,2-3 linhas cada).

RESTRIÇÕES: 100% TS | não remover funcionalidade existente | zero cobrança/pagamento(app corporativo interno).
