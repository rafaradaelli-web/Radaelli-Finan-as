# Finanças Radaelli — Controle Pessoal × Trabalho

App de controle financeiro com orçamento previsto × realizado, consolidação multi-mês
e importação de faturas/extratos PDF com pré-categorização por IA (API Anthropic).

## Deploy (GitHub Desktop → Vercel)

1. Crie um repositório novo no GitHub (ex.: `radaelli-financas`) e copie estes arquivos
   para a pasta do repositório, mantendo a estrutura:

   ```
   package.json
   vite.config.js
   index.html
   src/main.jsx
   src/App.jsx
   ```

2. Commit + push pelo GitHub Desktop.

3. No Vercel: **Add New → Project → importe o repositório**. O Vercel detecta Vite
   automaticamente (build `vite build`, output `dist`). Deploy.

## Importante sobre os dados

- Os lançamentos, o orçamento e a chave da API ficam salvos no **localStorage do navegador**.
  Ou seja: os dados ficam no aparelho onde você usa o app. Se limpar o cache/dados do
  navegador, eles são apagados — e celular e desktop não compartilham dados entre si.
- Próximo passo natural (quando quiser): trocar o localStorage por uma tabela no Supabase,
  no mesmo padrão dos seus outros projetos, para sincronizar entre dispositivos.

## Recursos de IA fora do Claude.ai

A importação de PDF e a análise de insights usam a API da Anthropic. No primeiro uso,
o app pede sua chave (`sk-ant-...`, criada em console.anthropic.com). A chave fica
salva apenas no seu navegador e as chamadas vão direto do browser para a API.
Custo por importação de fatura: centavos (modelo Sonnet).

## Rodar localmente (opcional)

```
npm install
npm run dev
```
