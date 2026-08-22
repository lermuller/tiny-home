# Handoff: Tiny Home — tarefas e listas de compras da casa

## Overview
Tiny Home é um app mobile para um casal (Evelyn e Leo) organizar as tarefas da casa em formato de quadro
(diárias, semanais, mensais, pontuais) e manter várias listas de compras separadas (Mercado, Ferragem,
Roupas, Farmácia, além de listas criadas pelo usuário).

Quatro áreas: **Hoje** (resumo do dia + atrasadas), **Quadro** (board agrupável), **Compras** (índice de
listas + lista aberta + modo mercado), **Nossa casa** (pessoas, avisos, aparência, marca).

## About the Design Files
Os arquivos deste pacote são **referências de design feitas em HTML** — protótipos que mostram aparência e
comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar estes designs no
ambiente do codebase alvo** (React Native, React web/PWA, SwiftUI…) usando seus padrões e bibliotecas. O
repositório `lermuller/tiny-home` está vazio; se for ele o destino, escolha o stack (recomendação em
`ARQUITETURA.md`) e implemente ali.

O protótipo é um único componente com estado local e dados fake em memória. Nenhuma chamada de rede.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamento, raios, sombras e microinterações são finais e vêm do
design system **Organic** (tokens listados em *Design Tokens*). Recrie a UI fielmente usando os
equivalentes do codebase.

## Files
- `Casa.dc.html` — protótipo principal (versão com moldura de iPhone, para revisão em desktop).
- `Tiny Home mobile.dc.html` — mesma UI em tela cheia, com safe-area e persistência em `localStorage`.
- `Tiny Home.html` — build único autocontido (o que os usuários instalam na tela de início hoje).
- `ARQUITETURA.md` — plano técnico do app publicado (sync, login, push, histórico).
- `styles.css` — folha do design system Organic (tokens + classes).

Para abrir os `.dc.html` desta pasta, use `Tiny Home.html` (autocontido) — os `.dc.html` esperam
`styles.css` no caminho `_ds/organic-.../styles.css` do projeto original e carregam React/Babel de CDN.

Toda a lógica está na classe `Component` do arquivo `.dc.html` (bloco `<script data-dc-script>`); a marcação
fica entre `<x-dc>` e `</x-dc>`.

---

## Modelo de dados (protótipo)

```
Task   { id, title, freq:'diaria'|'semanal'|'mensal'|'pontual', owner:'rafa'|'ju'|'nos',
         room:string, day:'seg'..'dom'|null, monthDay:1..31|null,
         status:'todo'|'doing'|'done', remind:boolean, late?:number }
List   { id, name, tone:'accent'|'accent2'|'neutral', sections:boolean, items:Item[] }
Item   { id, name, sec:string, done:boolean }
People { rafa:{name:'Evelyn', initial:'E', bg:#c67139, fg:#fff8ef},
         ju:{name:'Leo', initial:'L', bg:#7a8a5e, fg:#fbfdf5},
         nos:{name:'Os dois', initial:'2', bg:#a19786, fg:#f9f4ed} }
```
As chaves `rafa`/`ju` são internas (histórico); os nomes exibidos vêm de `PEOPLE`. Em produção troque por
`users[]` com id real.

`owner:'nos'` (Os dois) aparece em **todos** os filtros de pessoa — é a regra de "tarefa compartilhada".

`late` é contador de atraso: em semanais conta semanas (`1` → "Era pra ontem", `2` → "Há 2 semanas"), em
mensais conta meses ("Era pra este mês" / "Há N meses"). Marcar como feita zera `late`.

---

## Screens / Views

### 1. Hoje
**Purpose:** ver o que é de cada um hoje e resolver rápido.
**Layout:** coluna única, `padding: calc(env(safe-area-inset-top) + 22px) 20px 120px`, `gap: 22px`.
1. **Cabeçalho** — kicker "SEXTA, 21 DE AGOSTO" (11px/700, `letter-spacing:.12em`, uppercase,
   `--color-accent-700`); H1 "Hoje em casa" (Caprasimo 38px, `line-height:1.05`); à direita dois avatares
   34px sobrepostos (`margin-left:-10px`, borda 2px na cor do fundo).
2. **Filtro de pessoa** — três pills: "Nós dois" (ativo = fundo `#201e1d`), "Evelyn" (ativo `#c67139`),
   "Leo" (ativo `#7a8a5e`); inativo = borda `rgba(32,30,29,.16)`, fundo transparente. Altura 33px
   (`padding:7px 15px`), `border-radius:999px`, 13px. Filtra atrasadas, lista do dia e o progresso.
3. **Card de progresso** — `--color-surface`, radius 28px, padding 18/20. Título "2 de 5 feitas"
   (Caprasimo 22px) + `40%` (12px `--color-neutral-700`); barra 10px radius 999 (trilho
   `--color-neutral-300`, preenchimento `#7a8a5e`, `transition: width .4s cubic-bezier(.2,.8,.3,1)`);
   linha de aviso 12.5px — "Faltam 3. Aviso às 19:00 se sobrar alguma." / "Falta 1. Aviso às 19:00 se ela
   sobrar." / "Dia zerado. Vão descansar." (concordância obrigatória).
4. **Passou da hora** (só se houver atrasadas) — ícone relógio Lucide 15px stroke 2.75 `#b2622d` + label
   uppercase; linhas com fundo `--color-accent-100`, borda `--color-accent-300`, radius 22px, subtítulo em
   `--color-accent-700`.
5. **Para hoje** — label "PARA HOJE" ou "PARA HOJE · EVELYN" quando filtrado; linhas `--color-surface`,
   radius 22px, `padding:13px 15px`, `gap:13px`: círculo de check 27px + título 15px/600 + meta 11.5px +
   avatar 28px.
6. **Atalho da feira** — `--color-accent-2-200`, radius 26px, círculo 42px `--color-accent-2` com ícone de
   carrinho, "Feira do sábado" (Caprasimo 17px) + "N itens na lista do mercado", chevron à direita. Vai
   para Compras.

Regra de "hoje": `freq === 'diaria' || day === TODAY` (TODAY = `'sex'`), excluindo as atrasadas (que sobem
para a seção própria).

**Check circle (padrão em todo o app):** 27px, radius 999; aberto = borda 2px `#c0b6a5`, transparente;
feito = borda e fundo `#7a8a5e` com ✓ Lucide 14px `#fff8ef` (`opacity` 0→1, `transition .18s`). Título de
tarefa feita: `#a19786` + `line-through`. Clique no círculo alterna; clique na linha abre a ficha
(`stopPropagation` no círculo).

### 2. Quadro
**Purpose:** ver e reorganizar tudo.
1. **Cabeçalho** — H1 "Quadro" + botão de layout à direita (pill com ícone colunas/linhas + texto
   "Colunas"/"Lista").
2. **Chips de agrupamento** (scroll horizontal, sangram até a borda): Frequência · Status · Dia da semana ·
   Pessoa. Ativo = fundo `#c67139`, texto `#fff8ef`.
3. **Chips de pessoa** (Todos/Evelyn/Leo) + botão "Ocultar feitas" à direita (ativo = fundo `#201e1d`,
   texto `#f5ead8`, rótulo vira "Feitas ocultas").
4. **Colunas** conforme agrupamento:
   - Frequência → Diárias (`#c67139`) · Semanais (`#7a8a5e`) · **Mensais (`#8f4d21`)** · Pontuais (`#a19786`)
   - Status → A fazer (`#a19786`) · Fazendo (`#c67139`) · Feito (`#7a8a5e`)
   - Dia → Todo dia · Segunda…Domingo (hoje em `#c67139`) · Sem dia fixo — colunas vazias são omitidas;
     mensais e pontuais caem em "Sem dia fixo"
   - Pessoa → Evelyn · Leo · Os dois
   Cabeçalho da coluna: bolinha 10px na cor + nome (Caprasimo 19px) + contagem ("3 abertas" / "1 aberta").

**Layout Colunas:** faixa horizontal, `overflow-x:auto`, `scroll-snap-type:x mandatory`, colunas de 268px,
`gap:14px`, `padding:18px 20px 8px`. Cartão: `--color-surface`, radius 24px, `padding:14px 15px`,
`gap:10px`, `box-shadow: var(--shadow-sm)`, `border-left: 4px solid #c67139` quando `status==='doing'`
(senão transparente), `opacity:.7` quando feita. Rodapé do cartão: tag do cômodo (`.tag.tag-neutral`) +
quando (11.5px; se atrasada `#b2622d` + 700) + avatar 24px. Cada coluna termina em botão tracejado
"Nova tarefa" (borda 1.5px dashed `--color-neutral-400`, radius 22px) que **pré-preenche** o campo
correspondente ao grupo.

**Layout Lista:** coluna única, grupos empilhados; cabeçalho do grupo é `position:sticky; top:0` com fundo
`--color-bg`; linhas iguais às da Hoje (radius 22px) com a mesma borda esquerda de "Fazendo"; meta inclui
"· fazendo".

### 3. Compras (índice)
H1 "Compras" + subtítulo. Grid `1fr 1fr`, `gap:12px`. **Card de lista:** radius 28px, `min-height:132px`,
`padding:18px 16px 16px`, fundo pela tonalidade (`accent` #ffe1d0 · `accent2` #e1eecc · `neutral` #eee7db),
blob decorativo 84px `border-radius:999px` em `top:-26px; right:-26px` com `opacity:.18` na cor forte
(#c67139 / #7a8a5e / #a19786), nome em Caprasimo 20px, subtítulo ("3 itens abertos" / "1 item aberto" /
"Tudo comprado" / "Lista vazia"), barra de progresso 6px feita com `linear-gradient` até `pct%` + `pct`.
Último tile do grid = **"Nova lista"** tracejado.

**Compra sempre:** card `--color-surface` radius 26px com chips dos itens frequentes (Leite, Ovos, Café,
Papel toalha, Sabão em pó, Cebola). Chip com o item já na lista fica verde (fundo #e1eecc, borda #7a8a5e,
texto #3d472b). Tocar adiciona no Mercado e dispara o toast.

### 4. Lista aberta
**Header colorido** com a tonalidade da lista, cantos inferiores `border-radius: 0 0 34px 34px`: botão
voltar "‹ Compras", H1 (Caprasimo 34px), "5 de 8 faltando" e o botão **"Estou no mercado"** (ativo = fundo
`#201e1d`, texto `#f5ead8`, rótulo "Saindo do mercado").
**Itens** agrupados por seção quando `list.sections` (Hortifruti, Padaria, Mercearia, Limpeza,
Adicionados); label uppercase 11px. Linha: checkbox quadrado 24px radius 8px (aberto borda `#c0b6a5`,
feito fundo `#7a8a5e`), nome 15px/600; comprado = fundo transparente, borda `rgba(32,30,29,.10)`,
`line-through`, `#a19786`.
**Modo mercado:** esconde os comprados, sobe a linha para `padding:17px 16px` e o nome para 17px (uso de
uma mão com o carrinho). Vazio: "Tudo comprado. Podem ir embora." / "Lista vazia. Adicione o primeiro item
aí embaixo."
**Barra de adicionar:** fixa acima da navegação (`bottom: 96px` abas / `92px` pílula), pill
`--color-bg` com borda `--color-neutral-400` e `--shadow-md`, input transparente 15px + botão redondo 38px
`--color-accent` com "+". Enter também adiciona.

### 5. Nossa casa (perfil/configurações)
1. **Cabeçalho de marca** — tile do logo 52px radius 16px + "Tiny Home" (Caprasimo 32px) + "A casa da
   Evelyn e do Leo."
2. **Dois cards de pessoa** — `--color-accent-200` / `--color-accent-2-200`, radius 26px, avatar 38px,
   nome Caprasimo 19px, "N feitas esta semana".
3. **Avisos** — três linhas com switch (46×27, trilho `#7a8a5e` ligado / `#c0b6a5` desligado, knob 21px
   `#fff8ef`, `justify-content` alterna): *Resumo do dia* (8:00), *Cutucão de atraso* (semanal com 2 dias
   de atraso), *Item novo na lista*. Abaixo, **prévia da notificação** em `--color-neutral-200` radius 20px
   com o tile do logo 30px, "Tiny Home", hora e o texto gerado da atrasada mais antiga.
4. **Aparência** — escolhas Quadro (Colunas / Lista agrupada) e Navegação (Barra de abas / Pílula
   flutuante). Botão ativo: borda 2px `#c67139`, fundo `#ffe1d0`.
5. **Combinado da semana** — card `--color-accent-2-100`.
6. **A marca** — lockup (tile 76px radius 23px + "Tiny/Home" Caprasimo 30px `line-height:.95` + assinatura
   "CASA PEQUENA, CABEÇA LEVE") e as três variações do ícone (terracota, sálvia, escuro, creme).

### Navegação (duas variações — escolher uma em produção)
- **Barra de abas** (default): barra `--color-surface`, borda superior `--color-divider`,
  `padding:10px 12px 30px`, quatro itens em coluna (ícone Lucide 21px stroke 2.75 + label 10.5px/600),
  ativo `#c67139`, inativo `#82796a`. Abas: Hoje · Quadro · Compras · Casa.
- **Pílula flutuante:** pill `rgba(32,30,29,.94)` com `--shadow-lg`, `bottom:26px`, centralizada; item
  ativo ganha fundo `#c67139`, texto `#fff8ef` e mostra o label (os inativos ficam só com o ícone
  `#c0b6a5`).
- **FAB** "+": 58px, `--color-accent`, `--shadow-lg`, `right:18px`, `bottom:108px` (abas) / `100px`
  (pílula). Oculto na lista aberta, em sheets e na tela Nossa casa.

### Sheets (bottom sheets)
Backdrop `rgba(46,43,37,.45)` com `animation: fadeIn .18s`. Folha: `--color-bg`,
`border-radius: 34px 34px 0 0`, `padding: 14px 22px 40px`, `--shadow-lg`,
`animation: sheetUp .26s cubic-bezier(.2,.8,.3,1)`, alça 44×5 `--color-neutral-400`.

- **Ficha da tarefa** — tags (frequência + cômodo), H2 Caprasimo 27px, linha de recorrência com ícone
  Lucide "refresh": "Volta sozinha todo dia de manhã" / "…toda quinta" / "…todo dia 15 do mês" /
  "Não repete". Seções **Como está** (A fazer / Fazendo / Feito) e **De quem é** (Evelyn / Leo / Os dois),
  botões `flex:1` radius 999 (ativo borda `#c67139` + fundo `#ffe1d0`). Card "Me lembrar" com switch
  ("Notificação no dia, às 19:00" / "Sem notificação"). Ações: `.btn.btn-primary` "Marcar como feita" /
  "Desmarcar" + `.btn.btn-secondary` "Fechar".
- **Nova tarefa** — `.input` "O que precisa ser feito?"; frequência em grid 2×2 (Todo dia / Toda semana /
  Todo mês / Uma vez); se semanal, seletor de dia (Seg…Dom, 7 botões radius 14px); se mensal, seletor
  Dia 1/5/10/15/20/25; dono; "Adicionar ao quadro" → cria, vai para o Quadro e mostra o toast
  ("Tarefa criada. Volta sozinha toda sexta.").
- **Nova lista** — nome, três swatches de cor 52px radius 18px (borda 3px na cor quando ativa), switch
  "Separar por seções" e "Criar lista" → cria e abre a lista.

### Toast (notificação in-app)
`top:52px`, `left/right:14px`, fundo `rgba(250,244,235,.97)`, borda `--color-neutral-300`, radius 20px,
`--shadow-lg`, `animation: dropIn .22s cubic-bezier(.2,.8,.3,1)`, tile do logo 30px + "Tiny Home" +
"agora". Dura 2.6s. Disparado ao criar tarefa e ao adicionar item pelos chips frequentes.

---

## Interactions & Behavior
- Navegação: trocar de aba fecha a lista aberta (`openList: null`).
- Voltar da lista sai do modo mercado.
- Marcar feita: alterna `status` entre `done` e `todo` e zera `late`.
- A ficha permite os três status explicitamente; "Fazendo" é o que desenha a borda esquerda laranja.
- Filtros são independentes: `homeFilter` (Hoje) e `filter` (Quadro).
- Transições: cor/fundo `.16–.18s ease`; barra de progresso `.4s cubic-bezier(.2,.8,.3,1)`; sheets `.26s`.
- Estados de foco: `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` (vem do
  Organic; não substituir por foco padrão do browser).
- Alvos de toque nunca abaixo de 44px de área efetiva (a linha inteira é clicável).
- Não há drag-and-drop no protótipo. Em produção, arrastar cartão entre colunas deve alterar o campo do
  agrupamento vigente (status/dia/pessoa/frequência) — decisão de produto a confirmar.

## State Management
Estado local do protótipo: `tab`, `openList`, `sheet` (`'task'|'add'|'list'`), `sheetId`, `filter`,
`homeFilter`, `groupBy`, `layout`, `nav`, `hideDone`, `shopMode`, `draft`, `toast`, campos `new*` dos
formulários, `notifs{manha,atraso,mercado}`, `tasks[]`, `lists[]`.
`Tiny Home mobile.dc.html` persiste `tasks/lists/notifs/nav/layout/groupBy` em `localStorage['tinyhome.v1']`.
Em produção, `tasks` e `lists` viram dados remotos com sync em tempo real (ver `ARQUITETURA.md`); o resto é
preferência local.

## Design Tokens (design system Organic)
Fonte: `styles.css` (`_ds/organic-.../styles.css`). Use as variáveis, não os hex crus — a lista abaixo é
para conferência.

- Fundo `--color-bg` #f5ead8 · superfície `--color-surface` · texto `--color-text` #201e1d
- Acento (terracota) `--color-accent` #c67139; ramp usado: 100 #fff2ea?/200 #ffe1d0, 300, 700 #b2622d,
  800, 900 · escuro do "Mensais" #8f4d21
- Acento 2 (sálvia) `--color-accent-2` #7a8a5e; 100, 200 #e1eecc, 800, 900 · texto sobre sálvia #3d472b
- Neutros: 200, 300, 400 #c0b6a5, 600, 700 #82796a · desabilitado/feito #a19786 · divisor `--color-divider`
- Tipografia: `--font-heading` Caprasimo (H1 38px/1.05, H2 27px, títulos de card 17–22px);
  `--font-body` Figtree (corpo 15px/600 em títulos de linha, meta 11.5–13px, kicker 11px/700 uppercase
  `letter-spacing:.12em`)
- Raios: cartões 22–28px, sheets 34px, pills e avatares 999px, checkbox 8px, tiles do logo 10/14/16/23px
- Sombras: `--shadow-sm` (cartões do quadro), `--shadow-md` (barra de adicionar), `--shadow-lg` (FAB,
  sheets, toast, pílula)
- Ícones: **Lucide**, `stroke-width: 2.75`, 15–24px

## Assets
- **Logo Tiny Home** (SVG inline, sem arquivo externo): tile `rect 32×32 rx=10` na cor da marca + arco de
  porta `M8.5 24.5v-8.2a7.5 7.5 0 0 1 15 0v8.2a1.5 1.5 0 0 1-1.5 1.5h-3.6v-5.6a2.4 2.4 0 0 0-4.8 0V26h-3.6a1.5 1.5 0 0 1-1.5-1.5z`
  em creme. Variações: terracota/#fff8ef, sálvia/#fbfdf5, escuro/#f5ead8, creme/#c67139. Funciona a 30px.
  Exportar como PNG 1024 para ícone de app/PWA.
- Ícones de interface: Lucide (home, columns, shopping-cart, users, clock, bell, refresh-cw, plus,
  chevron-left/right, check).
- Fontes: Caprasimo + Figtree (Google Fonts, importadas por `styles.css`).
- Nenhuma fotografia é usada.
