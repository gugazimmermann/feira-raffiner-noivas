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
  - **Instagram** (opcional)
  - **WhatsApp** (obrigatório)
  - **Data do casamento** — máscara `DD/MM/AA` (opcional)
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

Isso cria a tabela `leads-feiras-noivas` com RLS permitindo insert para `anon` e `authenticated`.

#### Colunas

| Coluna | Tipo | Obrigatório |
| --- | --- | --- |
| `id` | `uuid` | gerado automaticamente |
| `nome` | `text` | sim |
| `instagram` | `text` | não |
| `whatsapp` | `text` | sim (somente dígitos) |
| `data_casamento` | `date` | não (enviada como `YYYY-MM-DD`) |
| `created_at` | `timestamptz` | gerado automaticamente |

Se a tabela já existir com o schema antigo, use os comentários de migração no final de `schema.sql`.

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

- A logo do **Ponto Napê** está temporariamente como texto tipográfico; substitua por imagem em `LogoPair.tsx` quando a arte final estiver pronta.
- WhatsApp e data do casamento ficam na mesma linha para aproveitar melhor o espaço vertical do totem.
