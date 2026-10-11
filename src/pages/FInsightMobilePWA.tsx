import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight, Menu, RefreshCw, TrendingDown, TrendingUp
} from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { runLifePlan, runRadarAgent, type LifePlanResponse, type RadarAgentResponse } from '@/services/finsightAgentApi';

type Tab = 'hoje' | 'futuro' | 'radar' | 'mercado' | 'conta' | 'mais';
type LocalAccount = { name: string; email: string; plan: 'free' | 'premium' };
type Indicator = { symbol: string; lastPrice: number; changePercent: number; fetchedAt?: string };
type MacroItem = { id?: string; label: string; value: number; unit: string; source?: string; interpretation?: string };

const ACCOUNT_KEY='finsight-pwa-account-v1';
const objectives=['Sair do vermelho','Montar reserva','Acumular patrimônio','Aposentar com renda','Comprar imóvel','Organizar família'];
const stages=['Falta dinheiro','Não sobra','Sobra e não guardo','Guardo, mas sem plano','Invisto sem objetivo','Tenho patrimônio'];
const quickRadarPrompts=['Analise BTC nos últimos 6 meses sem recomendar compra.','Compare Selic, dólar e Ibovespa para uma pessoa de longo prazo.','Simule aportes mensais no IBOV de forma educativa.'];
const fallbackIndicators: Indicator[]=[
  {symbol:'PETR4.SA',lastPrice:38.42,changePercent:.72},{symbol:'VALE3.SA',lastPrice:61.18,changePercent:-.35},
  {symbol:'ITUB4.SA',lastPrice:34.9,changePercent:.41},{symbol:'BBAS3.SA',lastPrice:29.8,changePercent:.22},
  {symbol:'WEGE3.SA',lastPrice:42.75,changePercent:1.12},{symbol:'BBDC4.SA',lastPrice:14.62,changePercent:-.18}
];
const fallbackMacro:MacroItem[]=[
  {id:'selic',label:'Selic Meta',value:14,unit:'% a.a.',source:'fallback educativo'},
  {id:'ipca',label:'IPCA Mensal',value:.38,unit:'% m/m',source:'fallback educativo'},
  {id:'usdbrl',label:'Dólar Comercial',value:5.1,unit:'BRL',source:'fallback educativo'}
];

function brl(value:number){return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2})}
function pct(value:number){return (value>=0?'+':'')+value.toFixed(2).replace('.',',')+'%'}
function numeric(value:string){const n=Number(value.replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0}
function clean(symbol:string){return symbol.replace('.SA','')}
function loadAccount():LocalAccount|null{try{const raw=localStorage.getItem(ACCOUNT_KEY);return raw?JSON.parse(raw):null}catch{return null}}

function Card({children,tone='normal'}:{children:React.ReactNode;tone?:'normal'|'highlight'|'warning'}){
  return <section className={'fi-pwa-card '+tone}>{children}</section>
}
function Button({children,onClick,secondary=false,disabled=false}:{children:React.ReactNode;onClick:()=>void;secondary?:boolean;disabled?:boolean}){
  return <button className={'fi-pwa-button '+(secondary?'secondary':'')} onClick={onClick} disabled={disabled}>{children}</button>
}
function Pills({value,onChange}:{value:string;onChange:(v:string)=>void}){
  return <div className="fi-pwa-pills">{objectives.map(item=><button key={item} className={value===item?'active':''} onClick={()=>onChange(item)}>{item}</button>)}</div>
}

function Header({account,onMenu}:{account:LocalAccount|null;onMenu:()=>void}){
  return <header className="fi-pwa-header">
    <img src="/finsight-app-icon.svg" alt="F-Insight"/>
    <div className="fi-pwa-header-copy"><strong>F-Insight</strong><span>{account?account.name+' · '+account.plan:'mercado, futuro e IA'}</span></div>
    <button className="fi-pwa-menu" onClick={onMenu} aria-label="Mais"><Menu/></button>
  </header>
}

function Today({account,indicators,live,macroLive,agentOnline,setTab}:{account:LocalAccount|null;indicators:Indicator[];live:boolean;macroLive:boolean;agentOnline:boolean;setTab:(t:Tab)=>void}){
  const avg=indicators.reduce((s,i)=>s+i.changePercent,0)/Math.max(1,indicators.length);
  const mood=avg>.6?['Mercado construtivo','A amostra acompanhada está positiva. Confirme fundamento, fluxo e notícia antes de decidir.']:avg<-.6?['Mercado pressionado','A amostra está negativa. Foque em risco, liquidez e qualidade.']:['Mercado misto','Sem direção única. Separe empresas, setores, valuation e cenário macro.'];
  return <div className="fi-pwa-stack">
    <Card tone="highlight">
      <span className="fi-pwa-kicker">F-INSIGHT</span><h1>Mercado, Futuro IA e Radar IA em um só app.</h1>
      <p>Agora o F-Insight conecta objetivos de vida, diagnóstico financeiro e análise educativa de mercado.</p>
      <div className="fi-pwa-badges"><span>{live?'Cotações online':'Cotações demo'}</span><span>{macroLive?'Macro online':'Macro fallback'}</span><span>{agentOnline?'Agent online':'Agent fallback'}</span></div>
      {account?<div className="fi-pwa-account-pill">{account.plan==='premium'?'Premium ativo':'Conta grátis ativa'} · {account.name}</div>:<div className="fi-pwa-row"><Button onClick={()=>setTab('conta')}>Criar conta grátis</Button><Button secondary onClick={()=>setTab('conta')}>Entrar</Button></div>}
    </Card>
    <Card tone="warning"><h2>Meu Futuro IA</h2><p>Descubra se seu dinheiro financia seus objetivos ou sabota sua vida. Perfil, a real, vazamentos e plano de 90 dias.</p><Button onClick={()=>setTab('futuro')}>Começar Futuro IA</Button></Card>
    <Card><h2>Radar IA</h2><p>Digite o que quer analisar em linguagem natural. O agente devolve roteiro educativo, riscos e simulação sem recomendar compra ou venda.</p><Button secondary onClick={()=>setTab('radar')}>Abrir Radar IA</Button></Card>
    <Card><h2>{mood[0]}</h2><p>{mood[1]}</p></Card>
  </div>
}

function Future({account,setAccount}:{account:LocalAccount|null;setAccount:(a:LocalAccount|null)=>void}){
  const [objective,setObjective]=useState(objectives[1]),[stage,setStage]=useState(stages[3]);
  const [age,setAge]=useState('35'),[income,setIncome]=useState('8000'),[expenses,setExpenses]=useState('6800'),[savings,setSavings]=useState('300'),[debt,setDebt]=useState('0'),[target,setTarget]=useState('300000'),[years,setYears]=useState('15'),[dependents,setDependents]=useState('0'),[statement,setStatement]=useState('');
  const [result,setResult]=useState<LifePlanResponse|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');

  async function analyze(){
    setLoading(true);setError('');
    try{
      const data=await runLifePlan({objective: objective+' · realidade: '+stage,age:Math.max(0,numeric(age)),income:numeric(income),expenses:numeric(expenses),savings:numeric(savings),debt:numeric(debt),targetAmount:numeric(target),years:Math.max(1,numeric(years)),dependents:Math.max(0,numeric(dependents)),statementText:statement});
      setResult(data);
    }catch{setError('O agente online não respondeu agora. Tente novamente em instantes.');}finally{setLoading(false)}
  }
  function premium(){if(!account)return;const next={...account,plan:'premium' as const};localStorage.setItem(ACCOUNT_KEY,JSON.stringify(next));setAccount(next)}
  return <div className="fi-pwa-stack">
    <Card tone="highlight"><span className="fi-pwa-kicker">MEU FUTURO IA</span><h1>Seu extrato precisa virar consciência.</h1><p>Agora conectado ao F-Insight Agent quando o backend estiver publicado; se estiver offline, o app usa fallback local.</p>{account&&account.plan!=='premium'?<Button onClick={premium}>Liberar demo Premium</Button>:null}</Card>
    <Card><h2>1. Objetivo principal</h2><Pills value={objective} onChange={setObjective}/></Card>
    <Card><h2>2. Realidade de hoje</h2><p>Escolha a opção mais honesta. O app precisa mandar a real, não agradar.</p><div className="fi-pwa-pills">{stages.map(item=><button key={item} className={stage===item?'active':''} onClick={()=>setStage(item)}>{item}</button>)}</div></Card>
    <Card><h2>3. Números básicos</h2><div className="fi-pwa-grid2">
      <label>Idade<input value={age} onChange={e=>setAge(e.target.value)} inputMode="numeric"/></label>
      <label>Dependentes<input value={dependents} onChange={e=>setDependents(e.target.value)} inputMode="numeric"/></label>
      <label>Renda líquida mensal<input value={income} onChange={e=>setIncome(e.target.value)} inputMode="decimal"/></label>
      <label>Gastos mensais<input value={expenses} onChange={e=>setExpenses(e.target.value)} inputMode="decimal"/></label>
      <label>Guarda/mês<input value={savings} onChange={e=>setSavings(e.target.value)} inputMode="decimal"/></label>
      <label>Dívidas totais<input value={debt} onChange={e=>setDebt(e.target.value)} inputMode="decimal"/></label>
      <label>Meta R$<input value={target} onChange={e=>setTarget(e.target.value)} inputMode="decimal"/></label>
      <label>Prazo anos<input value={years} onChange={e=>setYears(e.target.value)} inputMode="decimal"/></label>
    </div></Card><Card><h2>4. Extrato/fatura opcional</h2><p>Cole linhas de extrato ou fatura. Futuramente entra upload PDF/CSV/OFX e Open Finance consentido.</p><label>Extrato/fatura em texto<textarea value={statement} onChange={e=>setStatement(e.target.value)} placeholder="Ex.: iFood R$ 82,90..."/></label><Button onClick={analyze} disabled={loading}>{loading?'Analisando...':'Gerar meu diagnóstico'}</Button>{error&&<p className="fi-pwa-error">{error}</p>}</Card>
    {result&&<><Card tone="highlight"><span className="fi-pwa-kicker">SEU PERFIL ATUAL</span><h1>{result.diagnosis.persona}</h1><p>{result.diagnosis.stage}</p><div className="fi-pwa-score"><strong>{result.diagnosis.freedomScore}</strong><span>Índice de liberdade / 100</span></div><div className="fi-pwa-real"><b>A Real</b><p>{result.diagnosis.realTalk}</p></div></Card>
      <div className="fi-pwa-metrics"><Card><small>Folga mensal</small><strong>{brl(result.diagnosis.monthlyBalance)}</strong></Card><Card><small>Vazamento potencial</small><strong>{brl(result.diagnosis.leakPotential)}</strong></Card></div>
      <Card><h2>Oportunidades detectadas</h2>{result.opportunities.map(x=><p key={x}>• {x}</p>)}</Card>
      <Card tone="warning"><h2>Missão dos próximos 7 dias</h2><p>{result.missions.sevenDays}</p>{result.missions.ninetyDays.map(x=><p key={x}>• {x}</p>)}</Card>
      <p className="fi-pwa-disclaimer">{result.riskNotice}</p>
    </>}
  </div>
}

function RadarIA(){
  const [query,setQuery]=useState('Analise PETR4 nos últimos 12 meses sem recomendar compra.'),[symbol,setSymbol]=useState('PETR4.SA'),[result,setResult]=useState<RadarAgentResponse|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  async function analyze(){setLoading(true);setError('');try{setResult(await runRadarAgent({query,symbol,horizon:'12 meses'}))}catch{setError('O agente online não respondeu agora. Tente novamente em instantes.')}finally{setLoading(false)}}
  return <div className="fi-pwa-stack"><Card tone="highlight"><span className="fi-pwa-kicker">RADAR IA</span><h1>Digite o que quer analisar em linguagem natural.</h1><p>O agente entrega pesquisa, simulação e riscos. Não recomenda compra, venda nem executa ordens.</p></Card>
    <Card><h2>Pergunta</h2><label>Sua pergunta<textarea value={query} onChange={e=>setQuery(e.target.value)}/></label><label>Ativo opcional<input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} placeholder="PETR4.SA, BTC, IBOV..."/></label><div className="fi-pwa-pills">{quickRadarPrompts.map(item=><button key={item} className={query===item?'active':''} onClick={()=>setQuery(item)}>{item}</button>)}</div><Button onClick={analyze} disabled={loading}>{loading?'Analisando...':'Gerar Radar IA'}</Button>{error&&<p className="fi-pwa-error">{error}</p>}</Card>
    {result&&<><Card><span className="fi-pwa-kicker">{result.normalized.symbol}</span><h2>{result.answer.headline}</h2><p>{result.answer.summary}</p><h3>O que observar</h3>{result.answer.whatToCheck.map(x=><p key={x}>✓ {x}</p>)}</Card><Card><h2>Plano da análise</h2>{result.answer.simulationPlan.map((x,i)=><p key={x}>{i+1}. {x}</p>)}</Card><p className="fi-pwa-disclaimer">{result.riskNotice}</p></>}
  </div>
}

function Market({indicators,macro,live,onRefresh}:{indicators:Indicator[];macro:MacroItem[];live:boolean;onRefresh:()=>void}){
  return <div className="fi-pwa-stack"><Card tone="highlight"><div className="fi-pwa-title-row"><div><span className="fi-pwa-kicker">MERCADO</span><h1>Radar de ativos</h1></div><button className="fi-pwa-refresh" onClick={onRefresh}><RefreshCw/></button></div><p>{live?'Dados online da API F-Insight.':'Fallback educativo enquanto o feed não responde.'}</p></Card>
    <Card><h2>Cotações</h2>{indicators.map(item=><div className="fi-pwa-market-row" key={item.symbol}><div><strong>{clean(item.symbol)}</strong><span>{item.symbol}</span></div><div><b>{brl(item.lastPrice)}</b><em className={item.changePercent>=0?'up':'down'}>{item.changePercent>=0?<TrendingUp/>:<TrendingDown/>}{pct(item.changePercent)}</em></div></div>)}</Card>
    <Card><h2>Macro</h2>{macro.map(item=><div className="fi-pwa-market-row" key={item.id||item.label}><div><strong>{item.label}</strong><span>{item.source||'F-Insight'}</span></div><div><b>{item.unit==='BRL'?brl(item.value):item.value.toFixed(2).replace('.',',')+'%'}</b></div></div>)}</Card>
  </div>
}

function Account({account,setAccount}:{account:LocalAccount|null;setAccount:(a:LocalAccount|null)=>void}){
  const [mode,setMode]=useState<'login'|'signup'>('signup'),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState('');
  function save(){
    if(!email.trim()||password.length<6||(mode==='signup'&&!name.trim())){setMessage('Preencha os dados e use uma senha com pelo menos 6 caracteres.');return}
    const next={name:mode==='signup'?name.trim():(account?.name||email.split('@')[0]),email:email.trim().toLowerCase(),plan:account?.plan||'free'} as LocalAccount;
    localStorage.setItem(ACCOUNT_KEY,JSON.stringify(next));setAccount(next);setMessage(mode==='signup'?'Conta gratuita criada neste navegador.':'Sessão local ativada.');
  }
  function logout(){localStorage.removeItem(ACCOUNT_KEY);setAccount(null);setMessage('Sessão encerrada.')}
  return <div className="fi-pwa-stack"><Card tone="highlight"><span className="fi-pwa-kicker">CONTA DO INVESTIDOR</span><h1>{account?'Sua conta F-Insight.':mode==='signup'?'Crie seu acesso grátis.':'Entre com sua conta.'}</h1>{account?<div className="fi-pwa-account-pill">{account.name} · {account.email} · {account.plan}</div>:null}</Card>
    {!account?<Card><div className="fi-pwa-segment"><button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Entrar</button><button className={mode==='signup'?'active':''} onClick={()=>setMode('signup')}>Criar grátis</button></div>{mode==='signup'?<label>Nome completo<input value={name} onChange={e=>setName(e.target.value)}/></label>:null}<label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><Button onClick={save}>{mode==='signup'?'Criar conta':'Entrar'}</Button>{message&&<p className="fi-pwa-message">{message}</p>}</Card>:<Card><h2>Sessão</h2><p>{account.name} · {account.email}</p><Button secondary onClick={logout}>Sair</Button></Card>}
  </div>
}

function More(){
  return <div className="fi-pwa-stack"><Card><h2>Área logada institucional</h2><p>Cliente assessorado, assessor e escritório/admin ficam separados da conta comum.</p><div className="fi-pwa-linklist"><a href="/cliente">Cliente <ChevronRight/></a><a href="/assessor">Assessor <ChevronRight/></a><a href="/admin">Escritório <ChevronRight/></a></div></Card><Card><h2>Privacidade</h2><div className="fi-pwa-linklist"><a href="/privacidade">Política de Privacidade <ChevronRight/></a><a href="/excluir-conta">Excluir conta <ChevronRight/></a><a href="/aviso-educacional">Aviso educacional <ChevronRight/></a></div></Card></div>
}

export default function FInsightMobilePWA(){
  const initialTab=(()=>{const value=new URLSearchParams(window.location.search).get('tab');return ['hoje','futuro','radar','mercado','conta','mais'].includes(String(value))?value as Tab:'hoje'})();
  const [tab,setTab]=useState<Tab>(initialTab),[account,setAccount]=useState<LocalAccount|null>(()=>loadAccount()),[indicators,setIndicators]=useState<Indicator[]>(fallbackIndicators),[macro,setMacro]=useState<MacroItem[]>(fallbackMacro),[live,setLive]=useState(false),[macroLive,setMacroLive]=useState(false),[agentOnline,setAgentOnline]=useState(false),[loading,setLoading]=useState(true);
  async function refresh(){
    setLoading(true);
    const [quotes,macroRes,agent]=await Promise.allSettled([fetch(API_ENDPOINTS.live.indicators,{cache:'no-store'}),fetch(API_ENDPOINTS.macro.overview+'?refresh=true',{cache:'no-store'}),fetch(API_ENDPOINTS.baseUrl+'/api/agent/health',{cache:'no-store'})]);
    if(quotes.status==='fulfilled'&&quotes.value.ok){const p=await quotes.value.json().catch(()=>({}));const rows=Array.isArray(p?.data)?p.data:[];if(rows.length){setIndicators(rows);setLive(true)}}
    if(macroRes.status==='fulfilled'&&macroRes.value.ok){const p=await macroRes.value.json().catch(()=>({}));const rows=Array.isArray(p?.indicators)?p.indicators:[];if(rows.length){setMacro(rows);setMacroLive(true)}}
    setAgentOnline(agent.status==='fulfilled'&&agent.value.ok);setLoading(false);
  }
  useEffect(()=>{void refresh()},[]);
  const body=useMemo(()=>tab==='hoje'?<Today account={account} indicators={indicators} live={live} macroLive={macroLive} agentOnline={agentOnline} setTab={setTab}/>:tab==='futuro'?<Future account={account} setAccount={setAccount}/>:tab==='radar'?<RadarIA/>:tab==='mercado'?<Market indicators={indicators} macro={macro} live={live} onRefresh={refresh}/>:tab==='conta'?<Account account={account} setAccount={setAccount}/>:<More/>,[tab,account,indicators,live,macroLive,agentOnline,macro]);
  const tabs:[Tab,string][]=[['hoje','Hoje'],['futuro','Futuro IA'],['radar','Radar IA'],['mercado','Mercado'],['conta',account?'Conta':'Entrar'],['mais','Mais']];
  return <div className="fi-pwa-shell"><Header account={account} onMenu={()=>setTab('mais')}/>{loading&&tab==='hoje'?<div className="fi-pwa-loading">Atualizando sinais...</div>:null}<main>{body}</main><nav className="fi-pwa-tabbar">{tabs.map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><span>{label}</span></button>)}</nav></div>
}
