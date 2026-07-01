import React, { useState, useEffect, useMemo, useRef } from "react";

/* ============================================================
   CONTROLE FINANCEIRO — RAFAEL RADAELLI · v2
   Pessoal × Trabalho · Fixo × Variável · Microcategorias
   Orçamento (previsto × realizado) · Evolução multi-mês
   Import de PDF com pré-categorização por IA
   Funciona no Claude (window.storage) e no Vercel (localStorage)
   ============================================================ */

const TAXONOMY = {
  pessoal: {
    Moradia: ["Condomínio", "Energia", "Internet", "Celular", "Manutenção"],
    Alimentação: ["Mercado", "Restaurante", "Delivery", "Padaria/Café"],
    Saúde: ["Farmácia", "Terapia", "Academia", "Consultas/Exames"],
    Transporte: ["Combustível", "Lavagem/Manutenção", "Estacionamento/Pedágio"],
    Assinaturas: ["Streaming", "Apple", "Google", "Outras"],
    Compras: ["Vestuário", "Casa", "Eletrônicos/Acessórios"],
    Doações: ["Igreja", "Caridade"],
    Lazer: ["Viagens", "Eventos", "Hobbies"],
    Outros: ["Parcelamentos antigos", "Serviços", "Diversos"],
  },
  trabalho: {
    "IA & Software": ["Assinatura Claude", "API Anthropic", "Outras ferramentas"],
    "Produção de Conteúdo": ["Vídeo (HeyGen)", "Voz (ElevenLabs)", "Design (Canva)", "Outros"],
    "Pesquisa & Dados": ["Dados de mercado", "Research/Assinaturas"],
    Infraestrutura: ["Hospedagem/Domínio", "Supabase/Backend", "Outros"],
    Marketing: ["Tráfego pago", "Materiais/Produção"],
    Administrativo: ["Contabilidade", "Taxas/CNPJ", "Outros"],
  },
};

const SEED = [
  ["2026-06-05","Suno Research (9/12)",11.90,"trabalho","Pesquisa & Dados","Research/Assinaturas","fixo"],
  ["2026-06-05","Suno Research (9/12)",11.90,"trabalho","Pesquisa & Dados","Research/Assinaturas","fixo"],
  ["2026-06-05","Fat2023 (8/10)",92.74,"pessoal","Outros","Parcelamentos antigos","fixo"],
  ["2026-06-05","Havan (6/10)",26.88,"pessoal","Compras","Casa","variavel"],
  ["2026-06-05","Havan (5/10)",28.49,"pessoal","Compras","Casa","variavel"],
  ["2026-06-05","Farmácias Brava (4/5)",56.77,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-05","Farmácias Brava (3/4)",70.14,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-05","Snake Pato Branco (3/6)",66.42,"pessoal","Compras","Vestuário","variavel"],
  ["2026-05-31","Pizzaria Sabore",126.00,"pessoal","Alimentação","Restaurante","variavel"],
  ["2026-06-02","Anthropic (API)",26.66,"trabalho","IA & Software","API Anthropic","variavel"],
  ["2026-06-04","Droga Raia (1/3)",91.30,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-05","HeyGen",163.53,"trabalho","Produção de Conteúdo","Vídeo (HeyGen)","fixo"],
  ["2026-06-05","ElevenLabs",58.78,"trabalho","Produção de Conteúdo","Voz (ElevenLabs)","fixo"],
  ["2026-06-07","Anthropic Claude Sub",585.72,"trabalho","IA & Software","Assinatura Claude","fixo"],
  ["2026-06-08","Farmácias Brava",28.34,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-08","Anthropic (API)",54.32,"trabalho","IA & Software","API Anthropic","variavel"],
  ["2026-06-11","Zenklub",70.00,"pessoal","Saúde","Terapia","fixo"],
  ["2026-06-11","Wellhub — Rafael",91.70,"pessoal","Saúde","Academia","fixo"],
  ["2026-06-12","Farmácias Brava",18.99,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-12","Restaurante Cantchero",49.50,"pessoal","Alimentação","Restaurante","variavel"],
  ["2026-06-13","Ampernet (internet)",109.90,"pessoal","Moradia","Internet","fixo"],
  ["2026-06-13","Farmácias Brava (1/2)",55.33,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-13","Super Muffato",57.04,"pessoal","Alimentação","Mercado","variavel"],
  ["2026-06-14","Saint Honore",40.00,"pessoal","Alimentação","Padaria/Café","variavel"],
  ["2026-06-15","Apple",99.90,"pessoal","Assinaturas","Apple","fixo"],
  ["2026-06-15","Pericles Natan Bogio D",55.00,"pessoal","Outros","Serviços","variavel"],
  ["2026-06-15","Super Muffato",66.07,"pessoal","Alimentação","Mercado","variavel"],
  ["2026-06-15","Vivo",50.00,"pessoal","Moradia","Celular","fixo"],
  ["2026-06-16","Legião da Boa Vontade",5.00,"pessoal","Doações","Caridade","variavel"],
  ["2026-06-16","Morningstar",186.83,"trabalho","Pesquisa & Dados","Dados de mercado","fixo"],
  ["2026-06-16","Posto Alabama",8.00,"pessoal","Transporte","Combustível","variavel"],
  ["2026-06-18","Anthropic (API)",53.68,"trabalho","IA & Software","API Anthropic","variavel"],
  ["2026-06-19","Google One",96.99,"pessoal","Assinaturas","Google","fixo"],
  ["2026-06-19","Netflix",20.90,"pessoal","Assinaturas","Streaming","fixo"],
  ["2026-06-19","Aiqfome",161.00,"pessoal","Alimentação","Delivery","variavel"],
  ["2026-06-22","Restaurante Cantchero",27.80,"pessoal","Alimentação","Restaurante","variavel"],
  ["2026-06-22","Vicofarma",122.00,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-23","Wellhub — Maria Eduarda",91.70,"pessoal","Saúde","Academia","fixo"],
  ["2026-06-23","Zenklub",70.00,"pessoal","Saúde","Terapia","fixo"],
  ["2026-06-23","Lava Car TG",70.00,"pessoal","Transporte","Lavagem/Manutenção","variavel"],
  ["2026-06-23","Super Polo",60.79,"pessoal","Alimentação","Mercado","variavel"],
  ["2026-06-26","Posto Alabama",26.00,"pessoal","Transporte","Combustível","variavel"],
  ["2026-06-27","Farmácias Brava",14.99,"pessoal","Saúde","Farmácia","variavel"],
  ["2026-06-27","Posto Alabama",10.00,"pessoal","Transporte","Combustível","variavel"],
  ["2026-06-27","Canva",49.00,"trabalho","Produção de Conteúdo","Design (Canva)","fixo"],
  ["2026-06-28","Tigrão Comércio",100.00,"pessoal","Outros","Diversos","variavel"],
  ["2026-06-28","Kingcasematri (1/3)",115.68,"pessoal","Compras","Eletrônicos/Acessórios","variavel"],
  ["2026-06-29","Apple",5.90,"pessoal","Assinaturas","Apple","fixo"],
  ["2026-06-29","Paróquia Pedro Apóstolo",43.00,"pessoal","Doações","Igreja","variavel"],
  ["2026-06-30","Condomínio",700.00,"pessoal","Moradia","Condomínio","fixo"],
  ["2026-06-30","Luz (Copel)",200.00,"pessoal","Moradia","Energia","fixo"],
].map((t, i) => ({
  id: "seed-" + i, date: t[0], desc: t[1], valor: t[2],
  escopo: t[3], categoria: t[4], sub: t[5], natureza: t[6],
  origem: i >= 49 ? "manual" : "Fatura BTG jun/26",
}));

/* ---------------- Storage adapter (Claude ↔ Vercel) ---------------- */
const KEY = "radaelli-fin-v2";
const KEY_V1 = "radaelli-fin-v1";
const KEY_API = "radaelli-fin-apikey";
const memFallback = {};
const IS_CLAUDE = typeof window !== "undefined" && !!window.storage;

const store = {
  async get(k) {
    if (IS_CLAUDE) {
      try { const r = await window.storage.get(k); return r ? r.value : null; }
      catch (e) { return null; }
    }
    try { return window.localStorage.getItem(k); } catch (e) { return memFallback[k] || null; }
  },
  async set(k, v) {
    if (IS_CLAUDE) { try { await window.storage.set(k, v); return true; } catch (e) { return false; } }
    try { window.localStorage.setItem(k, v); return true; } catch (e) { memFallback[k] = v; return false; }
  },
};

/* ---------------- Chamada à API Anthropic ---------------- */
async function callClaude(body, apiKey) {
  const headers = { "Content-Type": "application/json" };
  if (!IS_CLAUDE) {
    if (!apiKey) { const e = new Error("no-key"); e.code = "no-key"; throw e; }
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers, body: JSON.stringify(body),
  });
  const data = await r.json();
  if (data.error) {
    const e = new Error(data.error.message || "Erro na API");
    if (r.status === 401) e.code = "auth";
    throw e;
  }
  return data;
}

/* ---------------- Helpers ---------------- */
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmt0 = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const monthOf = (d) => (d || "").slice(0, 7);
const NAMES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const monthLabel = (m) => m ? NAMES[parseInt(m.split("-")[1], 10) - 1] + "/" + m.split("-")[0].slice(2) : "";
const uid = () => "t-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
const sum = (arr) => arr.reduce((s, t) => s + t.valor, 0);

const C = {
  paper: "#F6F5F1", card: "#FFFFFF", ink: "#1B2420", inkSoft: "#5A6660",
  line: "#E3E1D9",
  pessoal: "#33658A", pessoalBg: "#EAF0F5",
  trabalho: "#3D6B4F", trabalhoBg: "#EAF2ED",
  fixo: "#7A6A4F", alert: "#B4552D", alertBg: "#F8ECE5", ok: "#3D6B4F",
};
const scopeColor = (e) => (e === "trabalho" ? C.trabalho : C.pessoal);
const scopeBg = (e) => (e === "trabalho" ? C.trabalhoBg : C.pessoalBg);
const scopeLabel = (e) => (e === "trabalho" ? "Trabalho" : "Pessoal");

const emptyBudget = () => {
  const b = { pessoal: {}, trabalho: {} };
  Object.keys(TAXONOMY.pessoal).forEach((c) => (b.pessoal[c] = 0));
  Object.keys(TAXONOMY.trabalho).forEach((c) => (b.trabalho[c] = 0));
  return b;
};

/* ================= App ================= */
export default function App() {
  const [state, setState] = useState(null); // {txs, budget, month}
  const [tab, setTab] = useState("dashboard");
  const [scope, setScope] = useState("todos");
  const [saveState, setSaveState] = useState("ok");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    (async () => {
      let parsed = null;
      const raw = await store.get(KEY);
      if (raw) { try { parsed = JSON.parse(raw); } catch (e) {} }
      if (!parsed) {
        const rawV1 = await store.get(KEY_V1); // migração da v1
        if (rawV1) { try { const p1 = JSON.parse(rawV1); parsed = { txs: p1.txs, month: p1.month }; } catch (e) {} }
      }
      const k = await store.get(KEY_API);
      if (k) setApiKey(k);
      setState({
        txs: (parsed && parsed.txs) || SEED,
        budget: (parsed && parsed.budget) || emptyBudget(),
        month: (parsed && parsed.month) || "2026-06",
      });
    })();
  }, []);

  const persist = async (next) => {
    setSaveState("saving");
    const ok = await store.set(KEY, JSON.stringify(next));
    setSaveState(ok ? "ok" : "error");
  };
  const patchState = (changes) => {
    setState((prev) => { const next = { ...prev, ...changes }; persist(next); return next; });
  };
  const saveApiKey = async (k) => { setApiKey(k); await store.set(KEY_API, k); };

  const months = useMemo(() => {
    if (!state) return [];
    return [...new Set(state.txs.map((t) => monthOf(t.date)).filter(Boolean))].sort().reverse();
  }, [state]);

  if (!state)
    return <div style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Georgia,serif", color: C.inkSoft }}>Carregando seus dados…</div>;

  const { txs, budget, month } = state;
  const monthTxs = txs.filter((t) => monthOf(t.date) === month);
  const viewTxs = scope === "todos" ? monthTxs : monthTxs.filter((t) => t.escopo === scope);

  const TABS = [["dashboard","Dashboard"],["dados","Lançamentos"],["orcamento","Orçamento"],["evolucao","Evolução"],["importar","Importar"],["insights","Insights"]];

  return (
    <div style={{ minHeight: "100vh", background: C.paper, color: C.ink, fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        select, input, button { font-family: inherit; font-size: 13px; }
        select { border: 1px solid ${C.line}; border-radius: 6px; padding: 4px 6px; background: #fff; color: ${C.ink}; max-width: 100%; }
        button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid ${C.pessoal}; outline-offset: 1px; }
        table { border-collapse: collapse; }
        @media (max-width: 640px) { .hide-sm { display: none; } }
      `}</style>

      <header style={{ borderBottom: `1px solid ${C.line}`, background: C.card }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Controle Financeiro</div>
              <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Pessoal × Trabalho · Previsto × Realizado</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: saveState === "error" ? C.alert : C.inkSoft }}>
                {saveState === "saving" ? "salvando…" : saveState === "error" ? "erro ao salvar" : "salvo ✓"}
              </span>
              <select value={month} onChange={(e) => patchState({ month: e.target.value })}>
                {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </select>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 2, marginTop: 14, overflowX: "auto" }}>
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{ padding: "9px 14px", border: "none", cursor: "pointer", background: "transparent",
                  fontSize: 13, fontWeight: tab === k ? 600 : 400, color: tab === k ? C.ink : C.inkSoft,
                  borderBottom: tab === k ? `2px solid ${C.ink}` : "2px solid transparent", whiteSpace: "nowrap" }}>
                {l}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: 20 }}>
        {(tab === "dashboard" || tab === "dados") && (
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {[["todos","Tudo"],["pessoal","Pessoal"],["trabalho","Trabalho"]].map(([k, l]) => (
              <button key={k} onClick={() => setScope(k)}
                style={{ padding: "6px 14px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 500,
                  border: `1px solid ${scope === k ? (k === "todos" ? C.ink : scopeColor(k)) : C.line}`,
                  background: scope === k ? (k === "todos" ? C.ink : scopeColor(k)) : C.card,
                  color: scope === k ? "#fff" : C.inkSoft }}>{l}</button>
            ))}
          </div>
        )}

        {tab === "dashboard" && <Dashboard txs={monthTxs} scope={scope} budget={budget} goBudget={() => setTab("orcamento")} />}
        {tab === "dados" && <Dados txs={viewTxs} all={txs} update={(t) => patchState({ txs: t })} month={month} />}
        {tab === "orcamento" && <Orcamento budget={budget} setBudget={(b) => patchState({ budget: b })} monthTxs={monthTxs} month={month} />}
        {tab === "evolucao" && <Evolucao txs={txs} budget={budget} />}
        {tab === "importar" && <Importar txs={txs} update={(t, m) => patchState({ txs: t, ...(m ? { month: m } : {}) })} setTab={setTab} apiKey={apiKey} saveApiKey={saveApiKey} />}
        {tab === "insights" && <Insights txs={monthTxs} allTxs={txs} budget={budget} month={month} apiKey={apiKey} saveApiKey={saveApiKey} />}
      </main>
    </div>
  );
}

/* ---------------- Componentes básicos ---------------- */
function Kpi({ label, value, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 16px", flex: "1 1 150px", minWidth: 140 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.inkSoft }}>{label}</div>
      <div className="num" style={{ fontSize: 21, fontWeight: 500, marginTop: 4, color: color || C.ink }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Card({ title, children, right }) {
  return (
    <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, fontWeight: 600 }}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Bars({ items, total, colorFor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map(([name, val, meta]) => (
        <div key={name}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
            <span style={{ fontWeight: 500 }}>{name}{meta && <span style={{ color: C.inkSoft, fontWeight: 400 }}> · {meta}</span>}</span>
            <span className="num">{fmt(val)} <span style={{ color: C.inkSoft }}>({total ? Math.round((val / total) * 100) : 0}%)</span></span>
          </div>
          <div style={{ height: 7, background: "#EEECE5", borderRadius: 4 }}>
            <div style={{ height: "100%", width: `${total ? Math.min(100, (val / total) * 100) : 0}%`, background: colorFor ? colorFor(name) : C.ink, borderRadius: 4 }} />
          </div>
        </div>
      ))}
      {items.length === 0 && <div style={{ fontSize: 13, color: C.inkSoft }}>Sem lançamentos neste recorte.</div>}
    </div>
  );
}

/* ---------------- Previsto × Realizado (barra dupla) ---------------- */
function BudgetRow({ name, prev, real }) {
  const pct = prev > 0 ? (real / prev) * 100 : real > 0 ? 999 : 0;
  const over = prev > 0 && real > prev;
  const saldo = prev - real;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3, gap: 8 }}>
        <span style={{ fontWeight: 500 }}>{name}</span>
        <span className="num" style={{ whiteSpace: "nowrap" }}>
          {fmt(real)} <span style={{ color: C.inkSoft }}>/ {fmt(prev)}</span>{" "}
          <span style={{ color: over ? C.alert : C.ok, fontWeight: 500 }}>
            {prev > 0 ? (over ? `+${fmt0(-saldo)}` : `${fmt0(saldo)} livre`) : real > 0 ? "sem previsto" : "—"}
          </span>
        </span>
      </div>
      <div style={{ height: 8, background: "#EEECE5", borderRadius: 4, position: "relative" }}>
        <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: over ? C.alert : "#8B9389", borderRadius: 4 }} />
        {over && <div style={{ position: "absolute", right: 0, top: -2, bottom: -2, width: 2, background: C.alert }} />}
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ txs, scope, budget, goBudget }) {
  const data = scope === "todos" ? txs : txs.filter((t) => t.escopo === scope);
  const total = sum(data);
  const fixo = sum(data.filter((t) => t.natureza === "fixo"));
  const variavel = total - fixo;
  const pTotal = sum(txs.filter((t) => t.escopo === "pessoal"));
  const tTotal = sum(txs.filter((t) => t.escopo === "trabalho"));

  const budgetTotal = ["pessoal", "trabalho"]
    .filter((e) => scope === "todos" || scope === e)
    .reduce((s, e) => s + Object.values(budget[e]).reduce((a, b) => a + Number(b || 0), 0), 0);
  const hasBudget = budgetTotal > 0;

  const byCat = useMemo(() => {
    const m = {};
    data.forEach((t) => { const k = t.escopo + "|" + t.categoria; m[k] = (m[k] || 0) + t.valor; });
    return Object.entries(m).map(([k, v]) => { const [e, c] = k.split("|"); return [c, v, scopeLabel(e), e]; }).sort((a, b) => b[1] - a[1]);
  }, [data]);

  const bySub = useMemo(() => {
    const m = {};
    data.forEach((t) => { m[t.sub] = (m[t.sub] || 0) + t.valor; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [data]);

  // maiores estouros vs orçamento (no recorte atual)
  const estouros = useMemo(() => {
    const rows = [];
    ["pessoal", "trabalho"].forEach((e) => {
      if (scope !== "todos" && scope !== e) return;
      Object.keys(TAXONOMY[e]).forEach((c) => {
        const prev = Number(budget[e][c] || 0);
        const real = sum(txs.filter((t) => t.escopo === e && t.categoria === c));
        if (prev > 0 && real > prev) rows.push({ e, c, prev, real, diff: real - prev });
      });
    });
    return rows.sort((a, b) => b.diff - a.diff).slice(0, 3);
  }, [txs, budget, scope]);

  const top = [...data].sort((a, b) => b.valor - a.valor).slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Kpi label={scope === "todos" ? "Total do mês" : `Total ${scopeLabel(scope)}`} value={fmt(total)} sub={`${data.length} lançamentos`} />
        {hasBudget && (
          <Kpi label="Previsto × realizado" value={`${Math.round((total / budgetTotal) * 100)}%`}
            sub={`${fmt0(total)} de ${fmt0(budgetTotal)} previstos`}
            color={total > budgetTotal ? C.alert : C.ok} />
        )}
        <Kpi label="Custos fixos" value={fmt(fixo)} sub={total ? `${Math.round((fixo / total) * 100)}% do total` : ""} color={C.fixo} />
        <Kpi label="Custos variáveis" value={fmt(variavel)} />
        {scope === "todos" && (<>
          <Kpi label="Pessoal" value={fmt(pTotal)} color={C.pessoal} />
          <Kpi label="Trabalho" value={fmt(tTotal)} color={C.trabalho} />
        </>)}
      </div>

      {hasBudget && estouros.length > 0 && (
        <div style={{ background: C.alertBg, border: `1px solid #EAD3C4`, borderRadius: 10, padding: "12px 16px", fontSize: 13 }}>
          <strong style={{ color: C.alert }}>Acima do previsto:</strong>{" "}
          {estouros.map((x, i) => (
            <span key={i}>{i > 0 && " · "}{x.c} ({scopeLabel(x.e)}) <span className="num" style={{ color: C.alert }}>+{fmt0(x.diff)}</span></span>
          ))}
        </div>
      )}
      {!hasBudget && (
        <div style={{ background: C.card, border: `1px dashed ${C.line}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.inkSoft }}>
          Você ainda não definiu o orçamento previsto.{" "}
          <button onClick={goBudget} style={{ border: "none", background: "none", color: C.pessoal, cursor: "pointer", fontWeight: 600, padding: 0 }}>
            Definir agora →
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18 }}>
        <Card title="Por categoria">
          <Bars items={byCat.map(([c, v, lbl]) => [c, v, scope === "todos" ? lbl : null])} total={total}
            colorFor={(name) => { const r = byCat.find((x) => x[0] === name); return r ? scopeColor(r[3]) : C.ink; }} />
        </Card>
        <Card title="Maiores microcategorias">
          <Bars items={bySub} total={total} colorFor={() => "#8B9389"} />
        </Card>
      </div>

      <Card title="Maiores lançamentos do mês">
        <table style={{ width: "100%", fontSize: 13 }}>
          <tbody>
            {top.map((t) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${C.line}` }}>
                <td style={{ padding: "8px 8px 8px 0" }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: scopeColor(t.escopo), marginRight: 8 }} />
                  {t.desc}
                </td>
                <td className="hide-sm" style={{ color: C.inkSoft }}>{t.categoria} › {t.sub}</td>
                <td style={{ color: C.inkSoft, fontSize: 12 }}>{t.natureza === "fixo" ? "fixo" : "variável"}</td>
                <td className="num" style={{ textAlign: "right", fontWeight: 500 }}>{fmt(t.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------- Orçamento (previsto × realizado) ---------------- */
function Orcamento({ budget, setBudget, monthTxs, month }) {
  const setVal = (esc, cat, v) => {
    const num = parseFloat(String(v).replace(",", "."));
    setBudget({ ...budget, [esc]: { ...budget[esc], [cat]: isNaN(num) ? 0 : num } });
  };
  const fillFromMonth = () => {
    const b = emptyBudget();
    ["pessoal", "trabalho"].forEach((e) => {
      Object.keys(TAXONOMY[e]).forEach((c) => {
        b[e][c] = Math.round(sum(monthTxs.filter((t) => t.escopo === e && t.categoria === c)));
      });
    });
    setBudget(b);
  };

  const totalPrev = (e) => Object.values(budget[e]).reduce((a, b) => a + Number(b || 0), 0);
  const totalReal = (e) => sum(monthTxs.filter((t) => t.escopo === e));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: C.inkSoft, maxWidth: 560 }}>
          Defina quanto pretende gastar por categoria a cada mês. O comparativo abaixo usa o mês selecionado ({monthLabel(month)}) como realizado.
        </div>
        <button onClick={fillFromMonth}
          style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", fontSize: 12.5, color: C.ink }}>
          Preencher com o realizado de {monthLabel(month)}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18 }}>
        {["pessoal", "trabalho"].map((esc) => {
          const prev = totalPrev(esc), real = totalReal(esc);
          return (
            <Card key={esc}
              title={<span style={{ color: scopeColor(esc) }}>{scopeLabel(esc)}</span>}
              right={<span className="num" style={{ fontSize: 13 }}>
                previsto <strong>{fmt0(prev)}</strong> · realizado <strong style={{ color: real > prev && prev > 0 ? C.alert : C.ink }}>{fmt0(real)}</strong>
              </span>}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.keys(TAXONOMY[esc]).map((cat) => {
                  const p = Number(budget[esc][cat] || 0);
                  const r = sum(monthTxs.filter((t) => t.escopo === esc && t.categoria === cat));
                  return (
                    <div key={cat} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>{cat}</div>
                        <input className="num" value={budget[esc][cat] || ""} placeholder="0" inputMode="decimal"
                          onChange={(e) => setVal(esc, cat, e.target.value)}
                          style={{ width: 96, border: `1px solid ${C.line}`, borderRadius: 6, padding: "5px 8px", textAlign: "right" }} />
                      </div>
                      <BudgetRow name="" prev={p} real={r} />
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Evolução (multi-mês) ---------------- */
function Evolucao({ txs, budget }) {
  const months = useMemo(() => [...new Set(txs.map((t) => monthOf(t.date)))].sort(), [txs]);
  const byMonth = useMemo(() => months.map((m) => {
    const mt = txs.filter((t) => monthOf(t.date) === m);
    return {
      m,
      total: sum(mt),
      pessoal: sum(mt.filter((t) => t.escopo === "pessoal")),
      trabalho: sum(mt.filter((t) => t.escopo === "trabalho")),
      fixo: sum(mt.filter((t) => t.natureza === "fixo")),
      variavel: sum(mt.filter((t) => t.natureza === "variavel")),
    };
  }), [txs, months]);

  const maxTotal = Math.max(...byMonth.map((x) => x.total), 1);
  const last = byMonth[byMonth.length - 1];
  const last3 = byMonth.slice(-3);
  const media3 = last3.reduce((s, x) => s + x.total, 0) / (last3.length || 1);
  const mediaFixo3 = last3.reduce((s, x) => s + x.fixo, 0) / (last3.length || 1);
  const budgetTotal = ["pessoal", "trabalho"].reduce((s, e) => s + Object.values(budget[e]).reduce((a, b) => a + Number(b || 0), 0), 0);

  // matriz categoria × mês
  const catMatrix = useMemo(() => {
    const cats = {};
    txs.forEach((t) => {
      const k = t.escopo + "|" + t.categoria;
      if (!cats[k]) cats[k] = {};
      const m = monthOf(t.date);
      cats[k][m] = (cats[k][m] || 0) + t.valor;
    });
    return Object.entries(cats)
      .map(([k, vals]) => {
        const [e, c] = k.split("|");
        const totalCat = Object.values(vals).reduce((a, b) => a + b, 0);
        return { e, c, vals, totalCat };
      })
      .sort((a, b) => b.totalCat - a.totalCat);
  }, [txs]);

  const trend = (row) => {
    if (months.length < 2) return null;
    const cur = row.vals[months[months.length - 1]] || 0;
    const prevMonths = months.slice(0, -1);
    const avg = prevMonths.reduce((s, m) => s + (row.vals[m] || 0), 0) / prevMonths.length;
    if (avg === 0) return cur > 0 ? { dir: "up", pct: null } : null;
    const pct = ((cur - avg) / avg) * 100;
    if (Math.abs(pct) < 8) return { dir: "flat", pct };
    return { dir: pct > 0 ? "up" : "down", pct };
  };

  if (months.length === 0) return <div style={{ color: C.inkSoft }}>Sem dados ainda.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Kpi label={`Média mensal (últ. ${last3.length}m)`} value={fmt(media3)}
          sub={last ? `${monthLabel(last.m)}: ${fmt0(last.total)} (${last.total >= media3 ? "+" : ""}${Math.round(((last.total - media3) / (media3 || 1)) * 100)}% vs média)` : ""} />
        <Kpi label="Fixo médio (ponto de equilíbrio)" value={fmt(mediaFixo3)} color={C.fixo}
          sub="o mínimo que a receita precisa cobrir todo mês" />
        {budgetTotal > 0 && (
          <Kpi label="Previsto mensal" value={fmt(budgetTotal)}
            sub={`média realizada ${media3 <= budgetTotal ? "dentro" : "acima"} do previsto`}
            color={media3 > budgetTotal ? C.alert : C.ok} />
        )}
        <Kpi label="Meses registrados" value={String(months.length)} sub="quanto mais histórico, melhores as análises" />
      </div>

      <Card title="Gasto total por mês (Pessoal + Trabalho)">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {byMonth.map((x) => (
            <div key={x.m}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span style={{ fontWeight: 500 }}>{monthLabel(x.m)}</span>
                <span className="num">{fmt(x.total)}{" "}
                  <span style={{ color: C.pessoal }}>{fmt0(x.pessoal)}</span> ·{" "}
                  <span style={{ color: C.trabalho }}>{fmt0(x.trabalho)}</span>
                </span>
              </div>
              <div style={{ height: 14, background: "#EEECE5", borderRadius: 4, display: "flex", overflow: "hidden", position: "relative" }}>
                <div style={{ width: `${(x.pessoal / maxTotal) * 100}%`, background: C.pessoal }} />
                <div style={{ width: `${(x.trabalho / maxTotal) * 100}%`, background: C.trabalho }} />
                {budgetTotal > 0 && budgetTotal <= maxTotal && (
                  <div title="previsto" style={{ position: "absolute", left: `${(budgetTotal / maxTotal) * 100}%`, top: -2, bottom: -2, width: 2, background: C.alert, opacity: 0.7 }} />
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkSoft, marginTop: 2 }}>
                <span>fixo {fmt0(x.fixo)} · variável {fmt0(x.variavel)}</span>
                <span>{Math.round((x.fixo / (x.total || 1)) * 100)}% fixo</span>
              </div>
            </div>
          ))}
        </div>
        {budgetTotal > 0 && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 10 }}>Linha vertical = total previsto no orçamento.</div>}
      </Card>

      <Card title="Categorias mês a mês">
        {months.length < 2 && (
          <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 12 }}>
            Com um único mês, a tabela mostra os valores base. A partir do 2º mês entram as setas de tendência (mês atual vs média dos anteriores).
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 12.5, minWidth: 480 }}>
            <thead>
              <tr style={{ textAlign: "right", color: C.inkSoft, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 500 }}>Categoria</th>
                {months.map((m) => <th key={m} style={{ padding: "8px 10px", fontWeight: 500 }}>{monthLabel(m)}</th>)}
                <th style={{ padding: "8px 10px", fontWeight: 500 }}>Tend.</th>
              </tr>
            </thead>
            <tbody>
              {catMatrix.map((row) => {
                const tr = trend(row);
                return (
                  <tr key={row.e + row.c} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td style={{ padding: "7px 10px" }}>
                      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 4, background: scopeColor(row.e), marginRight: 7 }} />
                      {row.c}
                    </td>
                    {months.map((m) => (
                      <td key={m} className="num" style={{ padding: "7px 10px", textAlign: "right", color: row.vals[m] ? C.ink : "#C6C2B6" }}>
                        {row.vals[m] ? fmt0(row.vals[m]) : "—"}
                      </td>
                    ))}
                    <td style={{ padding: "7px 10px", textAlign: "right", fontSize: 12, fontWeight: 600,
                      color: !tr ? C.inkSoft : tr.dir === "up" ? C.alert : tr.dir === "down" ? C.ok : C.inkSoft }}>
                      {!tr ? "" : tr.dir === "up" ? `▲${tr.pct !== null ? " " + Math.round(tr.pct) + "%" : ""}` : tr.dir === "down" ? `▼ ${Math.round(Math.abs(tr.pct))}%` : "="}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Lançamentos ---------------- */
function Dados({ txs, all, update, month }) {
  const [filtCat, setFiltCat] = useState("");
  const [busca, setBusca] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const cats = useMemo(() => [...new Set(txs.map((t) => t.categoria))].sort(), [txs]);
  const rows = txs
    .filter((t) => !filtCat || t.categoria === filtCat)
    .filter((t) => !busca || t.desc.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const patch = (id, changes) => update(all.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  const remove = (id) => update(all.filter((t) => t.id !== id));
  const setScopeTx = (t, escopo) => {
    const cat = Object.keys(TAXONOMY[escopo])[0];
    patch(t.id, { escopo, categoria: cat, sub: TAXONOMY[escopo][cat][0] });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <input placeholder="Buscar descrição…" value={busca} onChange={(e) => setBusca(e.target.value)}
          style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 10px", background: "#fff", flex: "1 1 160px", maxWidth: 240 }} />
        <select value={filtCat} onChange={(e) => setFiltCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div style={{ marginLeft: "auto", fontSize: 12.5, color: C.inkSoft }}>
          {rows.length} itens · <span className="num" style={{ color: C.ink }}>{fmt(sum(rows))}</span>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: C.ink, color: "#fff", cursor: "pointer", fontWeight: 500 }}>
          + Lançamento
        </button>
      </div>

      {showAdd && <AddForm month={month} onAdd={(t) => { update([...all, t]); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />}

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: 13, minWidth: 760 }}>
          <thead>
            <tr style={{ textAlign: "left", color: C.inkSoft, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {["Data","Descrição","Escopo","Categoria › Micro","Natureza","Valor",""].map((h, i) => (
                <th key={i} style={{ padding: "10px 12px", fontWeight: 500, textAlign: h === "Valor" ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="num" style={{ padding: "8px 12px", whiteSpace: "nowrap", color: C.inkSoft }}>
                  {t.date.slice(8, 10)}/{t.date.slice(5, 7)}
                </td>
                <td style={{ padding: "8px 12px", maxWidth: 220 }}>
                  {t.desc}{t.origem === "manual" && <span style={{ fontSize: 10, color: C.inkSoft }}> · manual</span>}
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <button onClick={() => setScopeTx(t, t.escopo === "pessoal" ? "trabalho" : "pessoal")}
                    title="Alternar Pessoal/Trabalho"
                    style={{ padding: "3px 10px", borderRadius: 999, border: "none", cursor: "pointer",
                      fontSize: 11.5, fontWeight: 500, background: scopeBg(t.escopo), color: scopeColor(t.escopo) }}>
                    {scopeLabel(t.escopo)}
                  </button>
                </td>
                <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
                  <select value={t.categoria} onChange={(e) => {
                    const cat = e.target.value;
                    patch(t.id, { categoria: cat, sub: TAXONOMY[t.escopo][cat][0] });
                  }}>
                    {Object.keys(TAXONOMY[t.escopo]).map((c) => <option key={c}>{c}</option>)}
                  </select>{" "}
                  <select value={t.sub} onChange={(e) => patch(t.id, { sub: e.target.value })}>
                    {(TAXONOMY[t.escopo][t.categoria] || [t.sub]).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <button onClick={() => patch(t.id, { natureza: t.natureza === "fixo" ? "variavel" : "fixo" })}
                    style={{ padding: "3px 10px", borderRadius: 999, cursor: "pointer", fontSize: 11.5,
                      border: `1px solid ${C.line}`, background: t.natureza === "fixo" ? "#F3EFE6" : "#fff",
                      color: t.natureza === "fixo" ? C.fixo : C.inkSoft }}>
                    {t.natureza === "fixo" ? "Fixo" : "Variável"}
                  </button>
                </td>
                <td className="num" style={{ padding: "8px 12px", textAlign: "right", fontWeight: 500, whiteSpace: "nowrap" }}>{fmt(t.valor)}</td>
                <td style={{ padding: "8px 8px" }}>
                  <button onClick={() => remove(t.id)} title="Excluir"
                    style={{ border: "none", background: "transparent", color: "#B9B4A7", cursor: "pointer", fontSize: 14 }}>×</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: C.inkSoft }}>
                Nenhum lançamento neste recorte. Use "+ Lançamento" ou importe um extrato.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddForm({ month, onAdd, onCancel }) {
  const [f, setF] = useState({
    date: month + "-15", desc: "", valor: "",
    escopo: "pessoal", categoria: "Moradia", sub: "Condomínio", natureza: "fixo",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setEscopo = (e) => {
    const cat = Object.keys(TAXONOMY[e])[0];
    setF((p) => ({ ...p, escopo: e, categoria: cat, sub: TAXONOMY[e][cat][0] }));
  };
  const setCat = (cat) => setF((p) => ({ ...p, categoria: cat, sub: TAXONOMY[p.escopo][cat][0] }));
  const ok = f.desc.trim() && parseFloat(String(f.valor).replace(",", ".")) > 0;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 14,
      display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
      <label style={{ fontSize: 11, color: C.inkSoft }}>Data<br />
        <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)}
          style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "5px 8px" }} /></label>
      <label style={{ fontSize: 11, color: C.inkSoft, flex: "1 1 150px" }}>Descrição<br />
        <input value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Ex.: Aluguel"
          style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "5px 8px", width: "100%" }} /></label>
      <label style={{ fontSize: 11, color: C.inkSoft }}>Valor (R$)<br />
        <input value={f.valor} onChange={(e) => set("valor", e.target.value)} placeholder="0,00" inputMode="decimal"
          style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "5px 8px", width: 90 }} /></label>
      <label style={{ fontSize: 11, color: C.inkSoft }}>Escopo<br />
        <select value={f.escopo} onChange={(e) => setEscopo(e.target.value)}>
          <option value="pessoal">Pessoal</option><option value="trabalho">Trabalho</option>
        </select></label>
      <label style={{ fontSize: 11, color: C.inkSoft }}>Categoria<br />
        <select value={f.categoria} onChange={(e) => setCat(e.target.value)}>
          {Object.keys(TAXONOMY[f.escopo]).map((c) => <option key={c}>{c}</option>)}
        </select></label>
      <label style={{ fontSize: 11, color: C.inkSoft }}>Micro<br />
        <select value={f.sub} onChange={(e) => set("sub", e.target.value)}>
          {(TAXONOMY[f.escopo][f.categoria] || []).map((s) => <option key={s}>{s}</option>)}
        </select></label>
      <label style={{ fontSize: 11, color: C.inkSoft }}>Natureza<br />
        <select value={f.natureza} onChange={(e) => set("natureza", e.target.value)}>
          <option value="fixo">Fixo</option><option value="variavel">Variável</option>
        </select></label>
      <button disabled={!ok}
        onClick={() => onAdd({ id: uid(), ...f, valor: parseFloat(String(f.valor).replace(",", ".")), origem: "manual" })}
        style={{ padding: "7px 14px", borderRadius: 6, border: "none", cursor: ok ? "pointer" : "default",
          background: ok ? C.ink : "#C9C5BA", color: "#fff", fontWeight: 500 }}>Salvar</button>
      <button onClick={onCancel}
        style={{ padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", color: C.inkSoft }}>Cancelar</button>
    </div>
  );
}

/* ---------------- Campo de chave da API (deploy externo) ---------------- */
function ApiKeyBox({ apiKey, saveApiKey, onDone }) {
  const [v, setV] = useState(apiKey || "");
  return (
    <div style={{ background: "#FDF9F0", border: `1px solid #EAE0C8`, borderRadius: 10, padding: 16, fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Chave da API Anthropic necessária</div>
      <div style={{ color: C.inkSoft, marginBottom: 10 }}>
        Fora do Claude.ai, os recursos de IA usam a sua chave da API (console.anthropic.com). Ela fica salva apenas neste navegador.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="password" value={v} onChange={(e) => setV(e.target.value)} placeholder="sk-ant-…"
          style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", flex: "1 1 220px" }} />
        <button onClick={async () => { await saveApiKey(v.trim()); if (onDone) onDone(); }}
          disabled={!v.trim()}
          style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: C.ink, color: "#fff", cursor: "pointer", fontWeight: 500 }}>
          Salvar chave
        </button>
      </div>
    </div>
  );
}

/* ---------------- Importar (PDF → IA → validação) ---------------- */
function Importar({ txs, update, setTab, apiKey, saveApiKey }) {
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [needKey, setNeedKey] = useState(false);
  const [pending, setPending] = useState([]);
  const fileRef = useRef(null);

  const taxonomyText = Object.entries(TAXONOMY)
    .map(([esc, cats]) => `${esc.toUpperCase()}:\n` +
      Object.entries(cats).map(([c, subs]) => `  - ${c}: ${subs.join(", ")}`).join("\n")).join("\n");

  const handleFile = async (file) => {
    if (!file) return;
    setStatus("reading"); setErrMsg(""); setNeedKey(false);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Falha ao ler o arquivo"));
        r.readAsDataURL(file);
      });
      setStatus("ai");

      const prompt = `Você é o assistente de categorização financeira do Rafael, consultor de investimentos (Radaelli Consultoria) e fundador do app Quita.

Extraia TODAS as transações de despesa deste extrato/fatura e pré-categorize cada uma usando EXATAMENTE esta taxonomia (escopo → categoria → microcategoria):

${taxonomyText}

Regras de contexto:
- Anthropic/Claude, HeyGen, ElevenLabs, Canva, Morningstar, Suno Research, Vercel, Supabase, domínios, hospedagem, tráfego pago = TRABALHO.
- Assinaturas recorrentes de trabalho = "fixo". Uso de API = "variavel".
- Condomínio, luz, internet, celular, academia, terapia, streamings = pessoal fixo.
- Mercado, restaurantes, farmácia, combustível, compras = pessoal variável.
- Ignore pagamentos de fatura, estornos e créditos (valores negativos).

Responda APENAS com JSON válido, sem markdown, sem texto extra:
{"transacoes":[{"date":"AAAA-MM-DD","desc":"...","valor":123.45,"escopo":"pessoal|trabalho","categoria":"...","sub":"...","natureza":"fixo|variavel"}]}
Se a data não tiver ano, infira pelo contexto do documento. Use ponto como separador decimal.`;

      const data = await callClaude({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: prompt },
          ],
        }],
      }, apiKey);

      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const items = (parsed.transacoes || []).filter((t) => t.valor > 0).map((t) => {
        const esc = t.escopo === "trabalho" ? "trabalho" : "pessoal";
        const cats = TAXONOMY[esc];
        const cat = cats[t.categoria] ? t.categoria : Object.keys(cats)[Object.keys(cats).length - 1];
        const sub = (cats[cat] || []).includes(t.sub) ? t.sub : cats[cat][0];
        return { id: uid(), date: t.date, desc: t.desc, valor: Number(t.valor),
          escopo: esc, categoria: cat, sub, natureza: t.natureza === "fixo" ? "fixo" : "variavel", origem: "import" };
      });
      if (!items.length) throw new Error("Nenhuma transação identificada no documento.");
      setPending(items); setStatus("review");
    } catch (e) {
      if (e.code === "no-key" || e.code === "auth") { setNeedKey(true); setStatus("idle"); }
      else { setErrMsg(e.message || "Erro ao processar. Tente novamente."); setStatus("error"); }
    } finally { if (fileRef.current) fileRef.current.value = ""; }
  };

  const patchP = (id, changes) => setPending((p) => p.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  const removeP = (id) => setPending((p) => p.filter((t) => t.id !== id));
  const confirm = () => {
    const m = pending.map((t) => t.date.slice(0, 7)).sort().pop();
    update([...txs, ...pending], m);
    setPending([]); setStatus("idle"); setTab("dados");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {needKey && <ApiKeyBox apiKey={apiKey} saveApiKey={saveApiKey} onDone={() => setNeedKey(false)} />}

      {status !== "review" && (
        <div style={{ background: C.card, border: `1.5px dashed ${C.line}`, borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 17, fontWeight: 600 }}>Importar extrato ou fatura (PDF)</div>
          <p style={{ fontSize: 13, color: C.inkSoft, maxWidth: 440, margin: "8px auto 18px" }}>
            Anexe o PDF. A IA extrai as transações e pré-categoriza em Pessoal/Trabalho, fixo/variável e microcategorias — você só valida e ajusta.
          </p>
          <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
          <button onClick={() => fileRef.current && fileRef.current.click()}
            disabled={status === "reading" || status === "ai"}
            style={{ padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer",
              background: C.ink, color: "#fff", fontWeight: 500, fontSize: 14 }}>
            {status === "reading" ? "Lendo o arquivo…" : status === "ai" ? "Categorizando com IA…" : "Escolher PDF"}
          </button>
          {status === "error" && (
            <div style={{ marginTop: 14, fontSize: 13, color: C.alert, background: C.alertBg,
              display: "inline-block", padding: "8px 14px", borderRadius: 8 }}>{errMsg}</div>
          )}
          <div style={{ marginTop: 22, fontSize: 12, color: C.inkSoft }}>
            Dica: extratos muito longos podem vir incompletos — se faltar algo, adicione manualmente em Lançamentos.
          </div>
        </div>
      )}

      {status === "review" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 17, fontWeight: 600 }}>Revisar antes de salvar</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft }}>
                {pending.length} transações · <span className="num" style={{ color: C.ink }}>{fmt(sum(pending))}</span> — clique nos chips para corrigir.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setPending([]); setStatus("idle"); }}
                style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", color: C.inkSoft }}>Descartar</button>
              <button onClick={confirm}
                style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: C.trabalho, color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirmar e salvar</button>
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, minWidth: 720 }}>
              <tbody>
                {pending.map((t) => (
                  <tr key={t.id} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="num" style={{ padding: "8px 12px", color: C.inkSoft, whiteSpace: "nowrap" }}>
                      {t.date.slice(8, 10)}/{t.date.slice(5, 7)}
                    </td>
                    <td style={{ padding: "8px 8px", maxWidth: 200 }}>{t.desc}</td>
                    <td style={{ padding: "8px 6px" }}>
                      <button onClick={() => {
                        const esc = t.escopo === "pessoal" ? "trabalho" : "pessoal";
                        const cat = Object.keys(TAXONOMY[esc])[0];
                        patchP(t.id, { escopo: esc, categoria: cat, sub: TAXONOMY[esc][cat][0] });
                      }}
                        style={{ padding: "3px 10px", borderRadius: 999, border: "none", cursor: "pointer",
                          fontSize: 11.5, fontWeight: 500, background: scopeBg(t.escopo), color: scopeColor(t.escopo) }}>
                        {scopeLabel(t.escopo)}
                      </button>
                    </td>
                    <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
                      <select value={t.categoria} onChange={(e) => {
                        const cat = e.target.value;
                        patchP(t.id, { categoria: cat, sub: TAXONOMY[t.escopo][cat][0] });
                      }}>
                        {Object.keys(TAXONOMY[t.escopo]).map((c) => <option key={c}>{c}</option>)}
                      </select>{" "}
                      <select value={t.sub} onChange={(e) => patchP(t.id, { sub: e.target.value })}>
                        {(TAXONOMY[t.escopo][t.categoria] || []).map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "8px 6px" }}>
                      <button onClick={() => patchP(t.id, { natureza: t.natureza === "fixo" ? "variavel" : "fixo" })}
                        style={{ padding: "3px 10px", borderRadius: 999, cursor: "pointer", fontSize: 11.5,
                          border: `1px solid ${C.line}`, background: t.natureza === "fixo" ? "#F3EFE6" : "#fff",
                          color: t.natureza === "fixo" ? C.fixo : C.inkSoft }}>
                        {t.natureza === "fixo" ? "Fixo" : "Variável"}
                      </button>
                    </td>
                    <td className="num" style={{ padding: "8px 12px", textAlign: "right", fontWeight: 500 }}>{fmt(t.valor)}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <button onClick={() => removeP(t.id)} title="Remover"
                        style={{ border: "none", background: "transparent", color: "#B9B4A7", cursor: "pointer", fontSize: 14 }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Insights ---------------- */
function Insights({ txs, allTxs, budget, month, apiKey, saveApiKey }) {
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiErr, setAiErr] = useState("");
  const [needKey, setNeedKey] = useState(false);

  const total = sum(txs);
  const fixoP = sum(txs.filter((t) => t.escopo === "pessoal" && t.natureza === "fixo"));
  const varP = sum(txs.filter((t) => t.escopo === "pessoal" && t.natureza === "variavel"));
  const fixoT = sum(txs.filter((t) => t.escopo === "trabalho" && t.natureza === "fixo"));
  const varT = sum(txs.filter((t) => t.escopo === "trabalho" && t.natureza === "variavel"));
  const totalFixo = fixoP + fixoT;
  const sumWhere = (fn) => sum(txs.filter(fn));

  const budgetTotal = ["pessoal", "trabalho"].reduce((s, e) => s + Object.values(budget[e]).reduce((a, b) => a + Number(b || 0), 0), 0);

  const months = [...new Set(allTxs.map((t) => monthOf(t.date)))].sort();

  const rules = [];
  if (total > 0) rules.push({
    t: "Estrutura de custos",
    d: `Custos fixos somam ${fmt(totalFixo)} (${Math.round((totalFixo / total) * 100)}% do mês): ${fmt(fixoP)} pessoais + ${fmt(fixoT)} de operação. Na fase de reconstrução de receita, esse é o número que define quantos meses sua reserva sustenta — é o seu ponto de equilíbrio mínimo.`,
  });
  if (budgetTotal > 0) {
    const diff = total - budgetTotal;
    rules.push({
      t: "Previsto × realizado",
      d: diff > 0
        ? `O mês fechou ${fmt(diff)} acima do orçamento (${fmt(total)} vs ${fmt(budgetTotal)} previstos). Veja na aba Dashboard quais categorias estouraram — estouro recorrente na mesma categoria significa orçamento irreal, não indisciplina: ajuste o previsto ou ataque a causa.`
        : `O mês fechou ${fmt(-diff)} abaixo do orçamento (${fmt(total)} de ${fmt(budgetTotal)} previstos). Disciplina boa — considere direcionar a sobra para a reserva que banca a fase pré-receita da Radaelli.`,
    });
  }
  const ia = sumWhere((t) => t.escopo === "trabalho" && t.categoria === "IA & Software");
  if (ia > 400) rules.push({
    t: "Stack de IA",
    d: `IA & Software custou ${fmt(ia)}. É o motor da Radaelli e do Quita, então não corte cegamente — mas revise se a assinatura Claude está no plano certo e se o consumo de API (${fmt(sumWhere((t) => t.sub === "API Anthropic"))}) tem picos evitáveis.`,
  });
  const rest = sumWhere((t) => t.categoria === "Alimentação" && t.sub !== "Mercado");
  if (rest > 200) rules.push({
    t: "Alimentação fora de casa",
    d: `Restaurantes + delivery + café somaram ${fmt(rest)}, contra ${fmt(sumWhere((t) => t.sub === "Mercado"))} de mercado. É o corte variável de menor dor: substituir 2–3 pedidos/mês libera R$ 100–200 sem mudar padrão de vida.`,
  });
  const farm = sumWhere((t) => t.sub === "Farmácia");
  if (farm > 300) rules.push({
    t: "Farmácia recorrente",
    d: `${fmt(farm)} em farmácia em várias compras pequenas — padrão de medicação contínua. Programas de laboratório e genéricos dão 20–30% de desconto permanente em uso contínuo.`,
  });
  if (months.length >= 2) {
    const prevM = months[months.length - 2];
    const prevTotal = sum(allTxs.filter((t) => monthOf(t.date) === prevM));
    if (prevTotal > 0) rules.push({
      t: "Comparação com o mês anterior",
      d: `${monthLabel(month)} vs ${monthLabel(prevM)}: ${fmt(total)} vs ${fmt(prevTotal)} (${total >= prevTotal ? "+" : ""}${Math.round(((total - prevTotal) / prevTotal) * 100)}%). A aba Evolução mostra qual categoria puxou a variação.`,
    });
  } else {
    rules.push({
      t: "Construa o histórico",
      d: `Com 1 mês registrado, as análises são um retrato. A partir do 3º mês entram média móvel, tendência por categoria e sazonalidade — importe as faturas de meses anteriores na aba Importar para acelerar isso.`,
    });
  }

  const askAI = async () => {
    setLoading(true); setAiErr(""); setNeedKey(false);
    try {
      const resumo = {};
      txs.forEach((t) => {
        const k = `${t.escopo}/${t.categoria}/${t.sub}/${t.natureza}`;
        resumo[k] = Math.round(((resumo[k] || 0) + t.valor) * 100) / 100;
      });
      const orc = {};
      ["pessoal", "trabalho"].forEach((e) => Object.entries(budget[e]).forEach(([c, v]) => { if (v > 0) orc[`${e}/${c}`] = v; }));
      const hist = months.map((m) => `${m}: ${Math.round(sum(allTxs.filter((t) => monthOf(t.date) === m)))}`).join("; ");

      const data = await callClaude({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Você é um consultor financeiro sênior analisando os gastos de ${monthLabel(month)} do Rafael — consultor de investimentos CNPI que saiu do emprego para tocar a própria consultoria (Radaelli) e um app (Quita). Receita em construção; preservação de caixa importa.

Gastos do mês (escopo/categoria/micro/natureza: R$): ${JSON.stringify(resumo)}
Orçamento previsto (escopo/categoria: R$): ${JSON.stringify(orc)}
Histórico mensal total (R$): ${hist || "apenas este mês"}

Dê de 3 a 5 recomendações objetivas e acionáveis, em português, direto ao ponto, sem elogios. Compare previsto x realizado onde houver orçamento. Ferramentas de trabalho têm ROI — não corte cegamente. Formato: parágrafos curtos, cada um começando com um título em maiúsculas seguido de dois-pontos. Sem markdown.`,
        }],
      }, apiKey);
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      if (!text) throw new Error("Resposta vazia");
      setAi(text);
    } catch (e) {
      if (e.code === "no-key" || e.code === "auth") setNeedKey(true);
      else setAiErr("Não consegui gerar a análise agora. Tente novamente.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Kpi label="Custo de vida (pessoal)" value={fmt(fixoP + varP)} sub={`${fmt0(fixoP)} fixo · ${fmt0(varP)} variável`} color={C.pessoal} />
        <Kpi label="Custo da operação (trabalho)" value={fmt(fixoT + varT)} sub={`${fmt0(fixoT)} fixo · ${fmt0(varT)} variável`} color={C.trabalho} />
        <Kpi label="Ponto de equilíbrio mensal" value={fmt(totalFixo)} sub="soma dos fixos — o mínimo que a receita precisa cobrir" color={C.fixo} />
      </div>

      {rules.map((r, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 18px" }}>
          <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>{r.t}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#333B36" }}>{r.d}</div>
        </div>
      ))}

      {needKey && <ApiKeyBox apiKey={apiKey} saveApiKey={saveApiKey} onDone={() => setNeedKey(false)} />}

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 15, fontWeight: 600 }}>Análise da IA sobre o mês</div>
            <div style={{ fontSize: 12, color: C.inkSoft }}>Envia o resumo agregado (gastos + orçamento + histórico mensal) para gerar recomendações.</div>
          </div>
          <button onClick={askAI} disabled={loading || txs.length === 0}
            style={{ padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", background: C.ink, color: "#fff", fontWeight: 500 }}>
            {loading ? "Analisando…" : ai ? "Gerar novamente" : "Gerar análise"}
          </button>
        </div>
        {aiErr && <div style={{ marginTop: 10, fontSize: 13, color: C.alert }}>{aiErr}</div>}
        {ai && (
          <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap",
            borderTop: `1px solid ${C.line}`, paddingTop: 14, color: "#333B36" }}>{ai}</div>
        )}
      </div>
    </div>
  );
}
