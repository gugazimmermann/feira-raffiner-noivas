# Feira — Raffiner Noivas

Aplicação de captura de leads para **totem touchscreen** na feira Raffiner Noivas (parceria Raffiner × Ponto Napê).

Visitantes preenchem os dados pelo teclado virtual na tela; os registros são salvos no Supabase.

## Stack

- React 19 + TypeScript
- Vite 8
- Supabase (`@supabase/supabase-js`)
- Oxlint

## Funcionalidades

- Formulário touch com teclado virtual (texto e numérico)
- Campos:
  - **Nome** (obrigatório)
  - **WhatsApp** (obrigatório)
  - **Data do casamento** — máscara `DD/MM/AA` (opcional)
  - **Local do casamento** (opcional)
  - **Nº convidados** (opcional)
- Layout em 3 linhas: Nome; WhatsApp + Data; Local + Nº Convidados
- Tela de confirmação com resumo dos dados enviados
- Logos Raffiner + Ponto Napê
- QR codes das marcas (Raffiner e [Ponto Napê no Instagram](https://www.instagram.com/ponto.nape/))

## Pré-requisitos

- Node.js 20+ (recomendado)
- Conta e projeto no [Supabase](https://supabase.com)

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Copie o exemplo e preencha com as credenciais do projeto Supabase:

```bash
cp .env.example .env
```

| Variável | Descrição |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (anon / public) |

A chave anônima é segura para o frontend **desde que** as políticas RLS estejam corretas (apenas insert, sem leitura pública).

### 3. Banco de dados (Supabase)

No Dashboard do Supabase → **SQL** → **New query**, execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).

O script é **idempotente** (pode rodar de novo sem erro): cria a tabela se necessário, alinha colunas antigas (`instagram` / `empresa` removidas; `local_casamento` / `num_convidados` adicionadas) e recria a política RLS de insert para `anon` e `authenticated`.

#### Colunas

| Coluna | Tipo | Obrigatório |
| --- | --- | --- |
| `id` | `uuid` | gerado automaticamente |
| `nome` | `text` | sim |
| `whatsapp` | `text` | sim (somente dígitos) |
| `data_casamento` | `date` | não (enviada como `YYYY-MM-DD`) |
| `local_casamento` | `text` | não |
| `num_convidados` | `integer` | não |
| `created_at` | `timestamptz` | gerado automaticamente |

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção (tsc + vite)
npm run preview   # preview do build
npm run lint      # oxlint
```

## Estrutura

```
src/
  App.tsx                    # layout, tela de sucesso
  components/
    LeadForm.tsx             # formulário + validação + insert
    VirtualKeyboard.tsx      # teclado touch
    LogoPair.tsx             # logos das marcas
    QrLinks.tsx              # QR codes
  lib/
    supabase.ts              # client Supabase
public/
  raffiner2.png
  ponto-nape.png              # logo recortada (mesma proporção da Raffiner)
  ponto_nape.jpg              # arte original
  qr-raffiner.svg
  qr-ponto-nape.svg
supabase/
  schema.sql                 # DDL + RLS
```

## Uso no totem

1. Abra a app em tela cheia no navegador do totem.
2. O visitante toca nos campos e digita pelo teclado virtual.
3. Ao enviar, os dados vão para `leads-feiras-noivas`.
4. A tela de sucesso volta sozinha após ~30s (ou pelo botão Voltar).

## Deploy

Qualquer host estático serve o build:

```bash
npm run build
```

Publique a pasta `dist/` (Vercel, Netlify, Cloudflare Pages, S3, etc.) e configure as mesmas variáveis `VITE_*` no ambiente de build.

## Notas

- A logo do **Ponto Napê** (`public/ponto-nape.png`) foi recortada a partir de `ponto_nape.jpg` na mesma proporção da Raffiner (`1778×335`) e entra em `LogoPair.tsx` junto com `raffiner2.png`.
- WhatsApp/Data e Local/Nº Convidados ficam em rows de dois campos para aproveitar o espaço vertical do totem.
