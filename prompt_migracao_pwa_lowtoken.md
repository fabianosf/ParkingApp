ROLE: Eng. front-end sênior (React/Vite/PWA). Migrar app RN/Expo(estacionamento corporativo) p/ PWA. Backend FastAPI intacto,não altera nada nele.

RESTRIÇÃO CRÍTICA: visual 100% IDÊNTICO ao RN original — mesmas cores,espaçamento,componentes,hierarquia por tela. Migração é SÓ de plataforma/execução, não redesign. Qualquer alteração visual não pedida = erro.

STACK: React18+Vite(não Next,sem SSR necessário) | React Router(substitui React Navigation) | Zustand(mesma lib do RN) | vite-plugin-pwa+manifest.json+service worker | CSS-in-JS/CSS Modules replicando theme.ts exato(sem lib UI externa:Material/Chakra/Bootstrap/Tailwind proibidos) | mesma lógica HTTP(axios/fetch) do RN.

MAPEAMENTO COMPONENTES(preservar aparência exata,mesmas props/variantes/cores):
View→div | Text→span/p(mesma fonte/cor/peso) | TextInput(AppInput)→input(mesma borda/radius/erro) | Pressable(AppButton)→button(variants primary|accent|danger|ghost,mesmas cores) | Card→div.card(mesma sombra opacity.06,radius12) | StatusBadge→span.badge(pílula+dot,mesmas cores/status) | OccupancyBar→div(mesmo card azul,número grande,barra progresso verde/vermelho) | VehicleRow→div(barra lateral+placa+subtítulo+badge).

theme.ts: copiar SEM alterar valores(cores/spacing/radius/typography/shadow),só muda sintaxe StyleSheet→CSS.

ESTRUTURA: web/{public/[manifest.json,icons/,favicon.ico], src/[main.tsx,App.tsx,theme/theme.ts,store/useThemeStore.ts,components/UI.tsx,pages/(Login,Cadastro,RecuperarSenha1,RecuperarSenha2,TrocarSenhaObrigatoria,AdminDashboard,AdminVeiculos,AdminHistorico,AdminConfigPatio,MotoristaMeuVeiculo,MotoristaHistorico,Perfil),services/api.ts,store/useAuthStore.ts,routes/ProtectedRoute.tsx], index.html,vite.config.ts,package.json}.

AJUSTES DE PLATAFORMA(não visuais): AsyncStorage/SecureStore→localStorage | navigation.reset()→<Navigate replace/> +ProtectedRoute bloqueando se must_change_password=true | manifest ícones 192x192+512x512 | display:standalone,100vw/100vh+safe-area-inset | service worker cacheia só assets estáticos(JS/CSS/ícones),app depende de conexão p/ API como antes.

MANIFEST: name"Estaciona+",background_color"#F5F7FA",theme_color"#1E3A5F"(usar hex exatos do theme,não inventar cor nova).

PROIBIDO: mudar cor/spacing/radius/tipografia do theme original | lib UI externa | redesenhar ordem/hierarquia de qualquer tela | mudar regra de negócio/endpoint/dados | remover fluxo senha-provisória+troca-obrigatória(replicar igual) | qualquer cobrança/pagamento.

OUTPUT: 1.estrutura pastas web/ 2.theme.ts copiado 3.UI.tsx componentes convertidos(tabela acima) 4.manifest.json 5.vite.config.ts c/pwa-plugin 6.cada page convertida(lista acima),layout idêntico ao RN 7.services/api.ts 8.ProtectedRoute.tsx(role+senha-provisória) 9.instruções dev/build/instalar(Android:menu→instalar;iOS:Safari→compartilhar→adicionar tela início) 10.confirmação final: nenhum valor visual alterado.
