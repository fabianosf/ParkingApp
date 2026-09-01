ROLE: Eng. front-end sênior (React/Vite/PWA/CSS). Corrigir bug de layout no projeto PWA existente (web/) — telas com sobra de fundo nas laterais em mobile, card centralizado com largura fixa tipo desktop.

PROBLEMA: telas(login,cadastro,dashboard etc) renderizam como card largura-fixa centralizado,fundo cinza sobrando nas laterais/topo/baixo. Errado p/PWA mobile — deveria ocupar 100% da viewport como app nativo, sem sobra visível.

CAUSA PROVÁVEL(verificar e corrigir): 1)#root/body sem width:100%+min-height:100dvh 2)max-width fixo(400-480px) sem media query removendo em mobile 3)card com margin:auto num container maior em vez de SER a tela 4)falta box-sizing:border-box global.

CORREÇÃO:
CSS global: *{box-sizing:border-box;margin:0;padding:0} | html,body,#root{width:100%;height:100%;min-height:100dvh} | body{background:#F5F7FA(cor do theme,não cinza genérico)}.

Container de página(mobile-first): width:100%,min-height:100dvh,padding:24px,display:flex,flex-direction:column,justify-content:center — SEM max-width em mobile. Só acima de 768px(media query min-width:768px) aplicar max-width:480px+margin:0 auto(aceitável em tablet/desktop,não afeta mobile).

Aplicar em TODAS as páginas de src/pages/(não só Login).

VALIDAR: em viewport 375-430px(celular),conteúdo preenche 100% largura,padding interno consistente,sem faixas vazias laterais | card login "é" a tela,não flutua | acima 768px pode limitar largura(ok) | nenhuma cor/fonte/espaçamento de componente(AppInput,AppButton,Card,StatusBadge) alterado — só container de página.

PROIBIDO: mudar theme.ts/cores/componentes internos | adicionar Tailwind/Bootstrap | corrigir só 1 tela(aplicar em todas) | quebrar responsividade desktop.

OUTPUT: 1.diagnóstico(arquivo/causa exata) 2.CSS global corrigido 3.padrão de container aplicado em 2 exemplos(Login+AdminDashboard) 4.lista de todas as páginas que precisam do mesmo ajuste 5.confirmação: nenhum valor do design system alterado.
