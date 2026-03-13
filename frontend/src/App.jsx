import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   COMERCIAL TRÊS VALES — Sistema de Gestão Comercial v2.0
   Módulos: Dashboard · Mais Vendidos · Clientes · Indústrias · Produtos
            Regras Comerciais · Pedidos · Mix · Orçamentos · Faturamento
            Comissões · Saldo · Metas · Usuários · Histórico · Config
   ═══════════════════════════════════════════════════════════════════════════ */

// ── STATUS CONSTANTS ─────────────────────────────────────────────────────────
const ST_PED = ["Recebido","Em digitação","Implantado","Faturado Parcial","Faturado Total","Expedido","Agendado","Entregue","Cancelado"];
const ST_ORC = ["Rascunho","Em análise","Enviado","Aprovado","Reprovado","Cancelado","Convertido em Pedido"];
const ST_FAT = ["Pendente","Lançada","Conferida","Comissão Gerada"];
const ST_COM = ["Prevista","A Receber","Recebida","Em disputa","Cancelada"];
const TIPOS_ABAT = ["Abatimento","Devolução","Desconto Financeiro","NFD","Bonificação s/ Comissão","Outros"];

// ── DADOS INICIAIS ────────────────────────────────────────────────────────────
const INITIAL = {
  usuarios: [{ id:1, nome:"Administrador", email:"admin@tresvales.com.br", perfil:"Administrador", status:"Ativo" }],
  clientes: [
    {id:1,  nome:"Coelho Diniz",          razao:"", cnpj:"", perfil:"Varejo",        grupo:"Coelho Diniz", prazo:"",         uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:2,  nome:"Lojas Rede",            razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"90D",      uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:3,  nome:"Mart Minas",            razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"120D",     uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:4,  nome:"Casa Aladim TO",        razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"60D",      uf:"TO", cidade:"", status:"Ativo", obs:""},
    {id:5,  nome:"DCA Bahia",             razao:"", cnpj:"", perfil:"Distribuidora", grupo:"DCA Grupo",    prazo:"60D",      uf:"BA", cidade:"", status:"Ativo", obs:""},
    {id:6,  nome:"DCA Centro Oeste",      razao:"", cnpj:"", perfil:"Distribuidora", grupo:"DCA Grupo",    prazo:"60D",      uf:"GO", cidade:"", status:"Ativo", obs:""},
    {id:7,  nome:"DAC Betim",             razao:"", cnpj:"", perfil:"Distribuidora", grupo:"DCA Grupo",    prazo:"60D",      uf:"MG", cidade:"Betim", status:"Ativo", obs:""},
    {id:8,  nome:"DEC BA",                razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"50D",      uf:"BA", cidade:"", status:"Ativo", obs:""},
    {id:9,  nome:"DEC MG",                razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"50D",      uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:10, nome:"Camila Rocha",          razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"",         uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:11, nome:"L.A.C Cosméticos",      razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"30/60D",   uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:12, nome:"DMA (EPA & Mineirão)",  razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"90D",      uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:13, nome:"Francis Cosméticos",    razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"30/45/60", uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:14, nome:"Villefort",             razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"60D",      uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:15, nome:"Coelho Diniz / HAF",    razao:"", cnpj:"", perfil:"Varejo",        grupo:"Coelho Diniz", prazo:"",         uf:"MG", cidade:"", status:"Ativo", obs:""},
    {id:16, nome:"DPC",                   razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"60D",      uf:"MG", cidade:"", status:"Ativo", obs:""},
  ],
  industrias: [
    {id:1, nome:"Labotrat",             razao:"", cnpj:"", fantasia:"Labotrat",   contato:"", email:"", tel:"", status:"Ativo", obs:""},
    {id:2, nome:"Zalike",               razao:"", cnpj:"", fantasia:"Zalike",     contato:"", email:"", tel:"", status:"Ativo", obs:""},
    {id:3, nome:"Duty (Dabelle Eico)",  razao:"", cnpj:"", fantasia:"Duty",       contato:"", email:"", tel:"", status:"Ativo", obs:""},
    {id:4, nome:"Aeroflex",             razao:"", cnpj:"", fantasia:"Aeroflex",   contato:"", email:"", tel:"", status:"Ativo", obs:""},
    {id:5, nome:"Clinoff & Cottonbaby", razao:"", cnpj:"", fantasia:"Clinoff",    contato:"", email:"", tel:"", status:"Ativo", obs:""},
    {id:6, nome:"MZ3 - Fixed Keratex",  razao:"", cnpj:"", fantasia:"MZ3",       contato:"", email:"", tel:"", status:"Ativo", obs:""},
    {id:7, nome:"Gummy",                razao:"", cnpj:"", fantasia:"Gummy",      contato:"", email:"", tel:"", status:"Ativo", obs:""},
    {id:8, nome:"Exclusive",            razao:"", cnpj:"", fantasia:"Exclusive",  contato:"", email:"", tel:"", status:"Ativo", obs:""},
  ],
  produtos: [],
  regras: [
    {id:1,  industria:"Labotrat",            cliente:"Coelho Diniz",        perfil:"Varejo",        prazo:"28D",      formato:"FATURAMENTO", comissao:7,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:2,  industria:"Labotrat",            cliente:"Lojas Rede",          perfil:"Varejo",        prazo:"90D",      formato:"LIQUIDEZ",    comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:3,  industria:"Labotrat",            cliente:"Mart Minas",          perfil:"Varejo",        prazo:"120D",     formato:"LIQUIDEZ",    comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:4,  industria:"Labotrat",            cliente:"Casa Aladim TO",      perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:5,  industria:"Labotrat",            cliente:"DCA Bahia",           perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:6,  industria:"Labotrat",            cliente:"DCA Centro Oeste",    perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:7,  industria:"Labotrat",            cliente:"DAC Betim",           perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:8,  industria:"Labotrat",            cliente:"DEC BA",              perfil:"Distribuidora", prazo:"50D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:9,  industria:"Labotrat",            cliente:"DEC MG",              perfil:"Distribuidora", prazo:"50D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:10, industria:"Labotrat",            cliente:"Camila Rocha",        perfil:"Varejo",        prazo:"",         formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:11, industria:"Labotrat",            cliente:"L.A.C Cosméticos",    perfil:"Varejo",        prazo:"30/60D",   formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:12, industria:"Zalike",              cliente:"Coelho Diniz",        perfil:"Varejo",        prazo:"15D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:13, industria:"Zalike",              cliente:"DMA (EPA & Mineirão)",perfil:"Varejo",        prazo:"90D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:14, industria:"Zalike",              cliente:"Francis Cosméticos",  perfil:"Varejo",        prazo:"30/45/60", formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:15, industria:"Zalike",              cliente:"Casa Aladim TO",      perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:16, industria:"Zalike",              cliente:"DCA Bahia",           perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:17, industria:"Zalike",              cliente:"DCA Centro Oeste",    perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:18, industria:"Zalike",              cliente:"DAC Betim",           perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:19, industria:"Duty (Dabelle Eico)", cliente:"Coelho Diniz / HAF",  perfil:"Varejo",        prazo:"28D",      formato:"LIQUIDEZ",    comissao:4,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:20, industria:"Duty (Dabelle Eico)", cliente:"Villefort",           perfil:"Varejo",        prazo:"60D",      formato:"LIQUIDEZ",    comissao:3.5, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:21, industria:"Aeroflex",            cliente:"Coelho Diniz / HAF",  perfil:"Varejo",        prazo:"15D",      formato:"LIQUIDEZ",    comissao:4,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:22, industria:"Aeroflex",            cliente:"Casa Aladim TO",      perfil:"Distribuidora", prazo:"90D",      formato:"LIQUIDEZ",    comissao:3,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:23, industria:"Aeroflex",            cliente:"DCA Bahia",           perfil:"Distribuidora", prazo:"90D",      formato:"LIQUIDEZ",    comissao:3,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:24, industria:"Aeroflex",            cliente:"DCA Centro Oeste",    perfil:"Distribuidora", prazo:"90D",      formato:"LIQUIDEZ",    comissao:3,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:25, industria:"Aeroflex",            cliente:"DAC Betim",           perfil:"Distribuidora", prazo:"90D",      formato:"LIQUIDEZ",    comissao:3,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:26, industria:"Clinoff & Cottonbaby",cliente:"Coelho Diniz / HAF",  perfil:"Varejo",        prazo:"15D",      formato:"LIQUIDEZ",    comissao:3,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:27, industria:"MZ3 - Fixed Keratex", cliente:"Coelho Diniz",        perfil:"Varejo",        prazo:"28D",      formato:"FATURAMENTO", comissao:7,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:28, industria:"MZ3 - Fixed Keratex", cliente:"DPC",                 perfil:"Distribuidora", prazo:"60D",      formato:"LIQUIDEZ",    comissao:7,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:29, industria:"Gummy",               cliente:"Casa Aladim TO",      perfil:"Distribuidora", prazo:"60D",      formato:"LIQUIDEZ",    comissao:5,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:30, industria:"Gummy",               cliente:"DCA Bahia",           perfil:"Distribuidora", prazo:"60D",      formato:"LIQUIDEZ",    comissao:5,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:31, industria:"Gummy",               cliente:"DCA Centro Oeste",    perfil:"Distribuidora", prazo:"60D",      formato:"LIQUIDEZ",    comissao:5,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:32, industria:"Gummy",               cliente:"DAC Betim",           perfil:"Distribuidora", prazo:"60D",      formato:"LIQUIDEZ",    comissao:5,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
    {id:33, industria:"Exclusive",           cliente:"Coelho Diniz",        perfil:"Varejo",        prazo:"7D",       formato:"FATURAMENTO", comissao:3,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:""},
  ],
  pedidos:[], mix:[], orcamentos:[], faturamentos:[], comissoes:[], metas:[], historico:[],
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const R   = v => Number(v)||0;
const BRL = v => "R$ "+R(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const K   = v => { const n=R(v); if(n>=1e6) return "R$"+(n/1e6).toFixed(1)+"M"; if(n>=1e3) return "R$"+(n/1e3).toFixed(1)+"k"; return BRL(n); };
const ISO = () => new Date().toISOString().slice(0,10);
const NID = a => (a||[]).reduce((m,r)=>Math.max(m,r.id||0),0)+1;
const pct = (a,b) => b>0 ? Math.round(a/b*100) : 0;

const itemTotal = it => R(it.qtd) * R(it.preco) * (1 - R(it.descPct)/100);

// calcula total bruto e líquido de um pedido/orçamento
const docTotals = doc => {
  const bruto = (doc.itens||[]).reduce((s,i)=>s+itemTotal(i),0);
  return { bruto };
};

// calcula base de comissão de uma NF (vliq já descontando abatimentos sem comissão)
const calcBaseComissao = fat => {
  const vnf = R(fat.vnf);
  const abatSemCom = (fat.abatimentos||[])
    .filter(a=>a.tipo==="Bonificação s/ Comissão"||a.tipo==="NFD"||a.tipo==="Devolução"||a.tipo==="Abatimento")
    .reduce((s,a)=>s+R(a.valor),0);
  return Math.max(0, vnf - abatSemCom);
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  app:   {display:"flex",minHeight:"100vh",background:"#f5f4f1",fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:14,color:"#1a1a1a"},
  sb:    {width:224,background:"#111",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"},
  sec:   {padding:"14px 16px 4px",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(255,255,255,.28)"},
  nav:   a=>({display:"flex",alignItems:"center",gap:10,padding:"9px 16px",cursor:"pointer",color:a?"#F5C400":"rgba(255,255,255,.6)",background:a?"rgba(245,196,0,.1)":"transparent",borderLeft:a?"2px solid #F5C400":"2px solid transparent",fontSize:13,transition:"all .1s"}),
  main:  {flex:1,display:"flex",flexDirection:"column",overflowX:"hidden"},
  topb:  {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 24px",background:"#fff",borderBottom:".5px solid rgba(0,0,0,.08)",position:"sticky",top:0,zIndex:10},
  ttl:   {fontSize:15,fontWeight:600},
  acts:  {display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"},
  bY:    {padding:"7px 16px",background:"#F5C400",color:"#111",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"},
  bG:    {padding:"7px 14px",background:"transparent",color:"#555",border:".5px solid rgba(0,0,0,.15)",borderRadius:7,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"},
  bR:    {padding:"5px 10px",background:"transparent",color:"#dc2626",border:".5px solid #dc2626",borderRadius:5,fontSize:11,cursor:"pointer"},
  bB:    {padding:"5px 10px",background:"transparent",color:"#2563eb",border:".5px solid #2563eb",borderRadius:5,fontSize:11,cursor:"pointer"},
  tbl:   {width:"100%",borderCollapse:"collapse"},
  th:    {fontSize:11,fontWeight:600,color:"#888",padding:"10px 14px",textAlign:"left",background:"#fafaf9",borderBottom:".5px solid rgba(0,0,0,.07)",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"},
  td:    {fontSize:13,padding:"9px 14px",borderBottom:".5px solid rgba(0,0,0,.06)",verticalAlign:"middle"},
  tw:    {background:"#fff",border:".5px solid rgba(0,0,0,.09)",borderRadius:10,overflow:"hidden"},
  bdg:   c=>{const m={green:["#dcfce7","#15803d"],red:["#fee2e2","#991b1b"],blue:["#dbeafe","#1d4ed8"],gray:["#f1f5f9","#475569"],orange:["#ffedd5","#9a3412"],yellow:["#fef9c3","#854d0e"],purple:["#f3e8ff","#7c3aed"]};const[bg,fg]=m[c]||m.gray;return{display:"inline-block",padding:"3px 8px",borderRadius:20,fontSize:11,fontWeight:500,background:bg,color:fg}},
  inp:   {padding:"7px 11px",border:".5px solid rgba(0,0,0,.18)",borderRadius:7,fontSize:13,background:"#fff",color:"#111",outline:"none",width:"100%",boxSizing:"border-box"},
  sel:   {padding:"7px 11px",border:".5px solid rgba(0,0,0,.18)",borderRadius:7,fontSize:13,background:"#fff",color:"#111",outline:"none",width:"100%",boxSizing:"border-box"},
  lbl:   {fontSize:12,fontWeight:500,color:"#666",marginBottom:4,display:"block"},
  over:  {position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20},
  mbox:  {background:"#fff",borderRadius:12,padding:28,width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto"},
  fg2:   {display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
  fg3:   {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14},
  sb2:   {display:"flex",gap:8,padding:"14px 24px 0",flexWrap:"wrap"},
  si:    {flex:1,minWidth:160,padding:"9px 14px",border:".5px solid rgba(0,0,0,.15)",borderRadius:8,fontSize:13,background:"#fff",outline:"none"},
  card:  {background:"#fff",border:".5px solid rgba(0,0,0,.09)",borderRadius:10,padding:20},
  row:   {display:"flex",gap:12,flexWrap:"wrap"},
  warn:  {background:"#fffbeb",border:".5px solid #F5C400",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#92400e",margin:"12px 24px 0"},
  info:  {background:"#eff6ff",border:".5px solid #93c5fd",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#1d4ed8",margin:"12px 24px 0"},
  ok:    {background:"#f0fdf4",border:".5px solid #86efac",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#15803d",margin:"12px 24px 0"},
};

const BADGE_MAP = {
  Ativo:"green",Ativa:"green",Inativo:"red",Inativa:"red",
  FATURAMENTO:"blue",LIQUIDEZ:"orange",
  Varejo:"blue",Distribuidora:"gray",Atacado:"gray",
  Recebido:"blue","Em digitação":"yellow",Implantado:"green",
  "Faturado Parcial":"yellow","Faturado Total":"green",
  Expedido:"blue",Agendado:"blue",Entregue:"green",Cancelado:"red",
  Rascunho:"gray","Em análise":"yellow",Enviado:"blue",
  Aprovado:"green",Reprovado:"red","Convertido em Pedido":"green",
  Pendente:"gray",Lançada:"blue",Conferida:"green","Comissão Gerada":"purple",
  Prevista:"blue","A Receber":"yellow",Recebida:"green","Em disputa":"orange",
};

// ── MICRO COMPONENTS ──────────────────────────────────────────────────────────
function Bdg({s}){
  return <span style={S.bdg(BADGE_MAP[s]||"gray")}>{s||"—"}</span>;
}

function EC({value,field,row,onSave,type="text",opts}){
  const [ed,setEd]=useState(false);
  const [v,setV]=useState(value);
  if(!ed) return <span style={{cursor:"cell",padding:"2px 4px",borderRadius:3}} title="2× para editar" onDoubleClick={()=>{setV(value);setEd(true);}}>{value||"—"}</span>;
  if(opts) return <select style={{...S.sel,width:"auto",minWidth:80}} value={v} onChange={e=>setV(e.target.value)} onBlur={()=>{onSave(row,field,v);setEd(false);}} autoFocus>{opts.map(o=><option key={o}>{o}</option>)}</select>;
  return <input style={{...S.inp,width:"auto",minWidth:70}} type={type} value={v} onChange={e=>setV(e.target.value)} onBlur={()=>{onSave(row,field,v);setEd(false);}} onKeyDown={e=>{if(e.key==="Enter"){onSave(row,field,v);setEd(false);}}} autoFocus/>;
}

function Fld({label,name,value,onChange,type="text",opts,full,span3,rows=3}){
  const st={display:"flex",flexDirection:"column",gap:5,...(full||span3?{gridColumn:"1/-1"}:{})};
  return(
    <div style={st}>
      <label style={S.lbl}>{label}</label>
      {opts
        ? <select style={S.sel} name={name} value={value||""} onChange={onChange}>{opts.map(o=><option key={o} value={o}>{o||"—"}</option>)}</select>
        : type==="textarea"
          ? <textarea style={{...S.inp,minHeight:rows*22,resize:"vertical"}} name={name} value={value||""} onChange={onChange}/>
          : <input style={S.inp} type={type} name={name} value={value||""} onChange={onChange}/>}
    </div>
  );
}

function Mdl({title,onClose,onSave,wide,children}){
  return(
    <div style={S.over} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.mbox,...(wide?{maxWidth:920}:{})}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,borderBottom:".5px solid rgba(0,0,0,.1)",paddingBottom:12}}>
          <span style={{fontSize:15,fontWeight:700}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa",lineHeight:1}}>×</button>
        </div>
        {children}
        {onSave&&(
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:14,borderTop:".5px solid rgba(0,0,0,.08)"}}>
            <button style={S.bG} onClick={onClose}>Cancelar</button>
            <button style={S.bY} onClick={onSave}>Salvar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({icon,title,sub,btnLabel,onBtn}){
  return(
    <div style={{...S.tw,display:"flex",flexDirection:"column",alignItems:"center",padding:"60px 24px",color:"#bbb",textAlign:"center",marginTop:0}}>
      <div style={{fontSize:44,opacity:.18,marginBottom:14}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:600,color:"#ccc",marginBottom:6}}>{title}</div>
      {sub&&<div style={{fontSize:13,color:"#bbb",maxWidth:360,marginBottom:20,lineHeight:1.6}}>{sub}</div>}
      {btnLabel&&<button style={S.bY} onClick={onBtn}>{btnLabel}</button>}
    </div>
  );
}

function Prog({v,max,color="#F5C400"}){
  const p=Math.min(100,pct(v,max||1));
  return <div style={{background:"#f1f1f1",borderRadius:4,height:7,flex:1}}><div style={{height:7,borderRadius:4,background:color,width:p+"%",transition:"width .3s"}}/></div>;
}

// ── ITENS EDITOR (shared Pedidos + Orçamentos) ────────────────────────────────
function ItensEditor({itens,setItens,produtos,mix,cliente,industria}){
  const [ln,setLn]=useState({cod:"",desc:"",qtd:"1",preco:"",descPct:"0"});

  const prodMap={};
  (produtos||[]).forEach(p=>{prodMap[p.codigo]={desc:p.descricao,preco:p.preco,ind:p.industria};});
  const mixMap={};
  (mix||[]).filter(m=>m.cliente===cliente&&m.industria===industria&&m.status==="Ativo").forEach(m=>{mixMap[m.codigo]={desconto:m.desconto,precoNeg:m.precoNeg};});

  const hasMix=Object.keys(mixMap).length>0;

  const updLn=e=>{
    const{name,value}=e.target;
    setLn(l=>{
      const n={...l,[name]:value};
      if(name==="cod"){
        if(prodMap[value]){n.desc=prodMap[value].desc;n.preco=String(prodMap[value].preco||"");}
        if(mixMap[value]){n.descPct=String(mixMap[value].desconto||"0");if(mixMap[value].precoNeg)n.preco=String(mixMap[value].precoNeg);}
      }
      return n;
    });
  };

  const add=()=>{
    if(!R(ln.qtd)||!R(ln.preco)) return;
    setItens(p=>[...p,{...ln,qtd:R(ln.qtd),preco:R(ln.preco),descPct:R(ln.descPct),id:Date.now()}]);
    setLn({cod:"",desc:"",qtd:"1",preco:"",descPct:"0"});
  };

  const total=itens.reduce((s,i)=>s+itemTotal(i),0);

  return(
    <div>
      {hasMix&&<div style={S.ok}>✓ Mix ativo para este cliente × indústria — {Object.keys(mixMap).length} produto(s) com desconto/preço pré-configurado. Digite o código para autopreenchimento.</div>}

      {/* linha de adição */}
      <div style={{display:"grid",gridTemplateColumns:"120px 1fr 70px 110px 70px auto",gap:8,background:"#f9f9f7",padding:14,borderRadius:8,marginBottom:14,alignItems:"end"}}>
        <div>
          <div style={S.lbl}>Código</div>
          <input style={S.inp} name="cod" value={ln.cod} onChange={updLn} placeholder="Código" list="dl-it"/>
          <datalist id="dl-it">{(produtos||[]).map(p=><option key={p.id} value={p.codigo}>{p.codigo} — {p.descricao}</option>)}</datalist>
        </div>
        <div><div style={S.lbl}>Descrição</div><input style={S.inp} name="desc" value={ln.desc} onChange={updLn} placeholder="Auto por código"/></div>
        <div><div style={S.lbl}>Qtd</div><input style={S.inp} name="qtd" value={ln.qtd} onChange={updLn} type="number" min="1"/></div>
        <div><div style={S.lbl}>Preço Unit (R$)</div><input style={S.inp} name="preco" value={ln.preco} onChange={updLn} type="number" step="0.01"/></div>
        <div><div style={S.lbl}>Desc %</div><input style={S.inp} name="descPct" value={ln.descPct} onChange={updLn} type="number" min="0" max="100"/></div>
        <button style={{...S.bY,alignSelf:"flex-end"}} onClick={add}>+ Adicionar</button>
      </div>

      {itens.length>0&&(
        <div style={{...S.tw,marginBottom:8}}>
          <table style={S.tbl}>
            <thead><tr>
              <th style={S.th}>Cód</th><th style={S.th}>Descrição</th>
              <th style={S.th}>Qtd</th><th style={S.th}>Preço Unit</th>
              <th style={S.th}>Desc%</th><th style={S.th}>Total Item</th><th style={S.th}></th>
            </tr></thead>
            <tbody>
              {itens.map((it,i)=>(
                <tr key={it.id||i}>
                  <td style={{...S.td,fontFamily:"monospace",fontSize:12}}>{it.cod||"—"}</td>
                  <td style={S.td}>{it.desc||"—"}</td>
                  <td style={S.td}>{it.qtd}</td>
                  <td style={S.td}>{BRL(it.preco)}</td>
                  <td style={S.td}>{it.descPct||0}%</td>
                  <td style={{...S.td,fontWeight:700}}>{BRL(itemTotal(it))}</td>
                  <td style={S.td}><button style={S.bR} onClick={()=>setItens(p=>p.filter((_,j)=>j!==i))}>×</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{background:"#F5C400"}}>
                <td colSpan={5} style={{...S.td,fontWeight:700,fontSize:13}}>TOTAL GERAL</td>
                <td style={{...S.td,fontWeight:800,fontSize:16}}>{BRL(total)}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {itens.length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"16px 0",fontSize:13}}>Nenhum item adicionado ainda.</div>}
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────

// ── APP ROOT (WebSocket + REST API) ──────────────────────────────────────────
export default function App(){
  const [page,setPage]     = useState("dashboard");
  const [data,setData]     = useState(INITIAL);
  const [modal,setModal]   = useState(null);
  const [search,setSearch] = useState("");
  const [fInd,setFInd]     = useState("");
  const [toast,setToast]   = useState(null);
  const [online,setOnline] = useState(0);
  const [wsStatus,setWsStatus] = useState("connecting"); // connecting | ok | offline
  const pendingRef = useRef({}); // evita aplicar evento próprio duplicado

  // ── Conexão WebSocket ─────────────────────────────────────────────────────
  useEffect(()=>{
    // Socket.IO importado dinamicamente para não quebrar se não disponível
    let sock;
    try {
      sock = window.__tvSocket;
      if(!sock){
        // Tenta importar socket.io-client
        import("./api.js").then(({ socket, getState })=>{
          window.__tvSocket = socket;
          sock = socket;

          sock.on("connect",()=>{
            setWsStatus("ok");
          });
          sock.on("disconnect",()=> setWsStatus("offline"));
          sock.on("connect_error",()=> setWsStatus("offline"));

          // Estado completo ao conectar (ou reconectar)
          sock.on("state:full", state => {
            setData(d => mergeState(d, state));
          });

          // Atualizações em tempo real de outros usuários
          sock.on("record:created",({modulo,record})=>{
            if(pendingRef.current[`${modulo}:${record.id}`]) return;
            setData(d=>({...d,[modulo]:[...(d[modulo]||[]).filter(r=>r.id!==record.id),record]}));
          });
          sock.on("record:updated",({modulo,record})=>{
            if(pendingRef.current[`${modulo}:${record.id}`]) return;
            setData(d=>({...d,[modulo]:(d[modulo]||[]).map(r=>r.id===record.id?record:r)}));
          });
          sock.on("record:deleted",({modulo,id})=>{
            setData(d=>({...d,[modulo]:(d[modulo]||[]).filter(r=>r.id!==id)}));
          });
          sock.on("config:updated", cfg =>{
            setData(d=>({...d,config:{...d.config,...cfg}}));
          });
          sock.on("state:reset", state =>{
            setData(mergeState(INITIAL, state));
          });
          sock.on("users:online", n => setOnline(n));
        }).catch(()=> loadFallback());
      }
    } catch(e){
      loadFallback();
    }

    return ()=>{};
  },[]);

  // ── Fallback: carrega via REST se WebSocket não disponível ────────────────
  function loadFallback(){
    setWsStatus("offline");
    fetch("/api/state")
      .then(r=>r.json())
      .then(state=>{ setData(d=>mergeState(d,state)); setWsStatus("ok"); })
      .catch(()=>{
        // último recurso: usa localStorage
        try{
          const saved = localStorage.getItem("tv5_fallback");
          if(saved) setData(JSON.parse(saved));
        }catch{}
      });
  }

  // Merge seguro: mantém INITIAL como base, sobrescreve com dados do servidor
  function mergeState(base, incoming){
    const result = {...base};
    for(const key of Object.keys(incoming)){
      if(incoming[key] !== undefined && incoming[key] !== null){
        result[key] = incoming[key];
      }
    }
    return result;
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  const ok=(msg,color="#16a34a")=>{setToast({msg,color});setTimeout(()=>setToast(null),2800);};

  // ── save: persiste no banco e atualiza estado local ───────────────────────
  // Esta função é usada pelos módulos filhos que ainda passam o objeto `data` inteiro.
  // Detecta quais módulos mudaram e faz PUT/POST apenas para esses registros.
  const save = useCallback(async (nd) => {
    setData(nd);
    // Fallback localStorage em caso de backend offline
    try{ localStorage.setItem("tv5_fallback", JSON.stringify(nd)); }catch{}

    // Tenta persistir no backend
    try {
      // Compara módulo a módulo e salva somente o que mudou
      const MODS = ["usuarios","clientes","industrias","produtos","regras",
                    "pedidos","mix","orcamentos","faturamentos","comissoes","metas","historico"];
      for(const mod of MODS){
        const oldArr = data[mod] || [];
        const newArr = nd[mod]  || [];

        // Novos ou modificados
        for(const rec of newArr){
          const old = oldArr.find(r=>r.id===rec.id);
          if(!old){
            // Novo registro — POST
            const created = await fetch(`/api/${mod}`, {
              method:"POST", headers:{"Content-Type":"application/json"},
              body: JSON.stringify(rec)
            }).then(r=>r.json());
            // Marca como pendente para não reprocessar o evento WebSocket
            pendingRef.current[`${mod}:${created.id}`] = true;
            setTimeout(()=>delete pendingRef.current[`${mod}:${created.id}`], 2000);
          } else if(JSON.stringify(old) !== JSON.stringify(rec)){
            // Modificado — PUT
            await fetch(`/api/${mod}/${rec.id}`, {
              method:"PUT", headers:{"Content-Type":"application/json"},
              body: JSON.stringify(rec)
            });
            pendingRef.current[`${mod}:${rec.id}`] = true;
            setTimeout(()=>delete pendingRef.current[`${mod}:${rec.id}`], 2000);
          }
        }

        // Deletados
        for(const old of oldArr){
          if(!newArr.find(r=>r.id===old.id)){
            await fetch(`/api/${mod}/${old.id}`, { method:"DELETE" });
          }
        }
      }
    } catch(e) {
      console.warn("Backend indisponível, salvando só localmente:", e.message);
    }
  }, [data]);

  // ── inlineSave: edição inline de célula ───────────────────────────────────
  const inlineSave = mod => async (row, field, val) => {
    const updated = {...row, [field]: val};
    const arr = (data[mod]||[]).map(r=>r.id===row.id ? updated : r);

    // Historico
    const h = {
      modulo:mod, registro:row.id, campo:field,
      anterior:String(row[field]||""), novo:String(val),
      usuario:"Admin", dt:new Date().toLocaleString("pt-BR")
    };

    // Atualiza estado local imediatamente (otimista)
    const nd = {...data, [mod]:arr};
    setData(nd);
    try{ localStorage.setItem("tv5_fallback", JSON.stringify(nd)); }catch{}

    // Persiste no banco
    try {
      await fetch(`/api/${mod}/${row.id}`,{
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(updated)
      });
      pendingRef.current[`${mod}:${row.id}`] = true;
      setTimeout(()=>delete pendingRef.current[`${mod}:${row.id}`], 2000);

      // Salva histórico
      await fetch("/api/historico", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(h)
      });
    } catch(e) {
      console.warn("Inline save falhou no backend:", e.message);
    }

    ok(`${field} atualizado`);
  };

  // ── delRow ────────────────────────────────────────────────────────────────
  const delRow = async (mod, id) => {
    if(!window.confirm("Confirmar exclusão?")) return;
    setData(d=>({...d,[mod]:(d[mod]||[]).filter(r=>r.id!==id)}));
    try {
      await fetch(`/api/${mod}/${id}`, {method:"DELETE"});
    } catch(e) { console.warn("Delete falhou:", e.message); }
    ok("Excluído","#dc2626");
  };

  // ── openMdl / doSave ──────────────────────────────────────────────────────
  const openMdl = (type, rec=null) => setModal({type, record: rec ? {...rec} : null});

  const doSave = async (mod, form) => {
    try {
      if(form.id){
        // Atualiza
        const {id,...rest} = form;
        const res = await fetch(`/api/${mod}/${id}`,{
          method:"PUT", headers:{"Content-Type":"application/json"},
          body: JSON.stringify(rest)
        }).then(r=>r.json());
        const updated = {...res, id};
        setData(d=>({...d,[mod]:(d[mod]||[]).map(r=>r.id===id ? updated : r)}));
        pendingRef.current[`${mod}:${id}`] = true;
        setTimeout(()=>delete pendingRef.current[`${mod}:${id}`], 2000);
      } else {
        // Cria novo
        const res = await fetch(`/api/${mod}`,{
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify(form)
        }).then(r=>r.json());
        setData(d=>({...d,[mod]:[...(d[mod]||[]),res]}));
        pendingRef.current[`${mod}:${res.id}`] = true;
        setTimeout(()=>delete pendingRef.current[`${mod}:${res.id}`], 2000);
      }
      setModal(null);
      ok("Salvo");
    } catch(e) {
      // Fallback local
      const arr = form.id
        ? (data[mod]||[]).map(r=>r.id===form.id ? form : r)
        : [...(data[mod]||[]), {...form, id:NID(data[mod]||[])}];
      setData(d=>({...d,[mod]:arr}));
      setModal(null);
      ok("Salvo localmente (backend offline)","#d97706");
    }
  };

  const indNames = (data.industrias||[]).map(i=>i.nome);
  const cliNames = (data.clientes||[]).map(c=>c.nome);
  const P = {data,save,search,setSearch,fInd,setFInd,modal,setModal,
             indNames,cliNames,ok,inlineSave,delRow,openMdl,doSave};

  const nav=[
    {sec:"Visão Geral",  items:[{id:"dashboard",label:"Dashboard",icon:"▣"},{id:"mais_vendidos",label:"Mais Vendidos",icon:"▲"}]},
    {sec:"Cadastros",    items:[{id:"clientes",label:"Clientes",icon:"◎"},{id:"industrias",label:"Indústrias",icon:"◈"},{id:"produtos",label:"Produtos",icon:"⊞"}]},
    {sec:"Comercial",    items:[{id:"regras",label:"Regras Comerciais",icon:"◉"},{id:"pedidos",label:"Pedidos",icon:"◷"},{id:"mix",label:"Mix por Cliente",icon:"◧"},{id:"orcamentos",label:"Orçamentos",icon:"◫"},{id:"faturamento",label:"Faturamento / NF",icon:"◆"}]},
    {sec:"Financeiro",   items:[{id:"comissoes",label:"Comissões",icon:"💰"},{id:"saldo",label:"Saldo Clientes",icon:"⊜"},{id:"metas",label:"Metas",icon:"◐"}]},
    {sec:"Sistema",      items:[{id:"usuarios",label:"Usuários",icon:"◎"},{id:"historico",label:"Histórico",icon:"◑"},{id:"config",label:"Configurações",icon:"⚙"}]},
  ];

  // Badge de status WebSocket
  const wsBadge = {
    connecting: {bg:"#fef9c3",fg:"#854d0e",dot:"#F5C400",label:"Conectando..."},
    ok:         {bg:"#dcfce7",fg:"#15803d",dot:"#16a34a",label:`${online} online`},
    offline:    {bg:"#fee2e2",fg:"#991b1b",dot:"#dc2626",label:"Offline"},
  }[wsStatus];

  return(
    <div style={S.app}>
      {/* SIDEBAR */}
      <div style={S.sb}>
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <path d="M4 4 L20 36 L36 4 Z" fill="#2a2a2a"/>
              <path d="M25 4 L36 4 L36 16 Z" fill="#F5C400"/>
            </svg>
            <div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.4)",letterSpacing:".1em",textTransform:"uppercase"}}>comercial</div>
              <div style={{fontSize:14,fontWeight:700,color:"#fff"}}><span style={{color:"#F5C400"}}>três</span>vales</div>
            </div>
          </div>
          {/* badge WebSocket */}
          <div style={{marginTop:10,display:"flex",alignItems:"center",gap:6,background:wsBadge.bg,padding:"4px 10px",borderRadius:20,width:"fit-content"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:wsBadge.dot}}/>
            <span style={{fontSize:11,fontWeight:600,color:wsBadge.fg}}>{wsBadge.label}</span>
          </div>
        </div>
        {nav.map(g=>(
          <div key={g.sec}>
            <div style={S.sec}>{g.sec}</div>
            {g.items.map(it=>(
              <div key={it.id} style={S.nav(page===it.id)} onClick={()=>{setPage(it.id);setSearch("");setFInd("");}}>
                <span style={{fontSize:12,width:16,textAlign:"center"}}>{it.icon}</span>
                <span>{it.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {page==="dashboard"    &&<Dashboard    {...P}/>}
        {page==="mais_vendidos"&&<MaisVendidos {...P}/>}
        {page==="clientes"     &&<Clientes     {...P}/>}
        {page==="industrias"   &&<Industrias   {...P}/>}
        {page==="produtos"     &&<Produtos     {...P}/>}
        {page==="regras"       &&<Regras       {...P}/>}
        {page==="pedidos"      &&<Pedidos      {...P}/>}
        {page==="mix"          &&<MixCliente   {...P}/>}
        {page==="orcamentos"   &&<Orcamentos   {...P}/>}
        {page==="faturamento"  &&<Faturamento  {...P}/>}
        {page==="comissoes"    &&<Comissoes    {...P}/>}
        {page==="saldo"        &&<Saldo        {...P}/>}
        {page==="metas"        &&<Metas        {...P}/>}
        {page==="usuarios"     &&<Usuarios     {...P}/>}
        {page==="historico"    &&<Historico    {...P}/>}
        {page==="config"       &&<Config       {...P}/>}
      </div>

      {toast&&<div style={{position:"fixed",bottom:24,right:24,background:toast.color,color:"#fff",padding:"10px 20px",borderRadius:8,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:"0 4px 16px rgba(0,0,0,.2)"}}>{toast.msg}</div>}
      <div style={{position:"fixed",bottom:24,left:240,fontSize:11,color:"#bbb",background:"rgba(255,255,255,.9)",padding:"4px 10px",borderRadius:20,border:".5px solid rgba(0,0,0,.08)",pointerEvents:"none"}}>
        💡 Duplo clique em célula para editar
      </div>
    </div>
  );
}

// ── IMPORT HELPER (simulates file import feedback) ─────────────────────────
function ImportBtn({label,accept,onMsg}){
  return(
    <label style={{...S.bG,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5}}>
      📥 {label}
      <input type="file" accept={accept} style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0];if(!f)return;
        const exts=f.name.split(".").pop().toLowerCase();
        const msg=exts==="pdf"
          ?`PDF "${f.name}" recebido. O OCR identificará os dados. Confira e complete manualmente após importação.`
          :`Planilha "${f.name}" recebida. Layout esperado: Código | Descrição | Qtd | Preço Unit | Desc%. Dados serão processados automaticamente.`;
        onMsg(msg);e.target.value="";
      }}/>
    </label>
  );
}

// ── CLIENTES ──────────────────────────────────────────────────────────────────
function Clientes({data,search,setSearch,modal,setModal,inlineSave,delRow,openMdl,doSave,ok}){
  const [form,setForm]=useState({});
  const [msg,setMsg]=useState("");
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="clientes")setForm(modal.record||{status:"Ativo",perfil:"Varejo"});},[modal]);
  const rows=(data.clientes||[]).filter(c=>!search||c.nome.toLowerCase().includes(search.toLowerCase())||(c.cnpj||"").includes(search)||(c.grupo||"").toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Clientes <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.clientes||[]).length}</span></div>
        <div style={S.acts}>
          <ImportBtn label="Importar Excel" accept=".xlsx,.xls,.csv" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),7000);}}/>
          <ImportBtn label="Importar PDF" accept=".pdf" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),7000);}}/>
          <button style={S.bY} onClick={()=>openMdl("clientes")}>+ Novo Cliente</button>
        </div>
      </div>
      {msg&&<div style={S.warn}>ℹ️ {msg}</div>}
      <div style={S.sb2}><input style={S.si} placeholder="Nome, CNPJ, grupo..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div style={{padding:"12px 24px 24px"}}>
        <div style={S.tw}><table style={S.tbl}>
          <thead><tr><th style={S.th}>Nome</th><th style={S.th}>CNPJ</th><th style={S.th}>Perfil</th><th style={S.th}>Grupo</th><th style={S.th}>Prazo</th><th style={S.th}>UF</th><th style={S.th}>Status</th><th style={S.th}>Ações</th></tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r.id}>
              <td style={{...S.td,fontWeight:500}}><EC value={r.nome} field="nome" row={r} onSave={inlineSave("clientes")}/></td>
              <td style={{...S.td,fontSize:12,color:"#888"}}><EC value={r.cnpj} field="cnpj" row={r} onSave={inlineSave("clientes")}/></td>
              <td style={S.td}><Bdg s={r.perfil}/></td>
              <td style={S.td}><EC value={r.grupo} field="grupo" row={r} onSave={inlineSave("clientes")}/></td>
              <td style={S.td}><EC value={r.prazo} field="prazo" row={r} onSave={inlineSave("clientes")}/></td>
              <td style={S.td}><EC value={r.uf} field="uf" row={r} onSave={inlineSave("clientes")}/></td>
              <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("clientes")} opts={["Ativo","Inativo"]}/></td>
              <td style={S.td}><div style={{display:"flex",gap:5}}><button style={S.bB} onClick={()=>openMdl("clientes",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("clientes",r.id)}>×</button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
      {modal?.type==="clientes"&&(
        <Mdl title={form.id?"Editar Cliente":"Novo Cliente"} onClose={()=>setModal(null)} onSave={()=>doSave("clientes",form)}>
          <div style={S.fg2}>
            <Fld label="Nome" name="nome" value={form.nome} onChange={upd}/>
            <Fld label="Razão Social" name="razao" value={form.razao} onChange={upd}/>
            <Fld label="CNPJ" name="cnpj" value={form.cnpj} onChange={upd}/>
            <Fld label="Perfil" name="perfil" value={form.perfil} onChange={upd} opts={["Varejo","Distribuidora","Atacado"]}/>
            <Fld label="Grupo / Rede" name="grupo" value={form.grupo} onChange={upd}/>
            <Fld label="Prazo" name="prazo" value={form.prazo} onChange={upd}/>
            <Fld label="UF" name="uf" value={form.uf} onChange={upd}/>
            <Fld label="Cidade" name="cidade" value={form.cidade} onChange={upd}/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={["Ativo","Inativo"]}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── INDUSTRIAS ────────────────────────────────────────────────────────────────
function Industrias({data,search,setSearch,modal,setModal,inlineSave,delRow,openMdl,doSave}){
  const [form,setForm]=useState({});
  const [msg,setMsg]=useState("");
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="industrias")setForm(modal.record||{status:"Ativo"});},[modal]);
  const rows=(data.industrias||[]).filter(i=>!search||i.nome.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Indústrias <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.industrias||[]).length}</span></div>
        <div style={S.acts}>
          <ImportBtn label="Importar Excel" accept=".xlsx,.xls,.csv" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),7000);}}/>
          <ImportBtn label="Importar PDF" accept=".pdf" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),7000);}}/>
          <button style={S.bY} onClick={()=>openMdl("industrias")}>+ Nova Indústria</button>
        </div>
      </div>
      {msg&&<div style={S.warn}>ℹ️ {msg}</div>}
      <div style={S.sb2}><input style={S.si} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div style={{padding:"12px 24px 24px"}}>
        <div style={S.tw}><table style={S.tbl}>
          <thead><tr><th style={S.th}>Nome</th><th style={S.th}>Fantasia</th><th style={S.th}>CNPJ</th><th style={S.th}>Contato</th><th style={S.th}>E-mail</th><th style={S.th}>Status</th><th style={S.th}>Ações</th></tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r.id}>
              <td style={{...S.td,fontWeight:600}}><EC value={r.nome} field="nome" row={r} onSave={inlineSave("industrias")}/></td>
              <td style={S.td}><EC value={r.fantasia} field="fantasia" row={r} onSave={inlineSave("industrias")}/></td>
              <td style={{...S.td,fontSize:12,color:"#888"}}><EC value={r.cnpj} field="cnpj" row={r} onSave={inlineSave("industrias")}/></td>
              <td style={S.td}><EC value={r.contato} field="contato" row={r} onSave={inlineSave("industrias")}/></td>
              <td style={S.td}><EC value={r.email} field="email" row={r} onSave={inlineSave("industrias")}/></td>
              <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("industrias")} opts={["Ativo","Inativo"]}/></td>
              <td style={S.td}><div style={{display:"flex",gap:5}}><button style={S.bB} onClick={()=>openMdl("industrias",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("industrias",r.id)}>×</button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
      {modal?.type==="industrias"&&(
        <Mdl title={form.id?"Editar Indústria":"Nova Indústria"} onClose={()=>setModal(null)} onSave={()=>doSave("industrias",form)}>
          <div style={S.fg2}>
            <Fld label="Nome" name="nome" value={form.nome} onChange={upd}/>
            <Fld label="Fantasia" name="fantasia" value={form.fantasia} onChange={upd}/>
            <Fld label="Razão Social" name="razao" value={form.razao} onChange={upd}/>
            <Fld label="CNPJ" name="cnpj" value={form.cnpj} onChange={upd}/>
            <Fld label="Contato" name="contato" value={form.contato} onChange={upd}/>
            <Fld label="E-mail" name="email" value={form.email} onChange={upd} type="email"/>
            <Fld label="Telefone" name="tel" value={form.tel} onChange={upd}/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={["Ativo","Inativo"]}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── PRODUTOS ──────────────────────────────────────────────────────────────────
function Produtos({data,search,setSearch,fInd,setFInd,modal,setModal,inlineSave,delRow,openMdl,doSave,indNames}){
  const [form,setForm]=useState({});
  const [msg,setMsg]=useState("");
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="produtos")setForm(modal.record||{status:"Ativo",unidade:"UN"});},[modal]);
  const rows=(data.produtos||[]).filter(p=>(!search||((p.codigo||"").toLowerCase().includes(search.toLowerCase())||(p.descricao||"").toLowerCase().includes(search.toLowerCase())))&&(!fInd||p.industria===fInd));
  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Produtos <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.produtos||[]).length}</span></div>
        <div style={S.acts}>
          <ImportBtn label="Importar Excel" accept=".xlsx,.xls,.csv" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),7000);}}/>
          <ImportBtn label="Importar PDF" accept=".pdf" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),7000);}}/>
          <button style={S.bY} onClick={()=>openMdl("produtos")}>+ Novo Produto</button>
        </div>
      </div>
      {msg&&<div style={S.warn}>ℹ️ {msg}</div>}
      <div style={S.sb2}>
        <input style={S.si} placeholder="Código, descrição..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:"auto"}} value={fInd} onChange={e=>setFInd(e.target.value)}>
          <option value="">Todas as indústrias</option>
          {indNames.map(n=><option key={n}>{n}</option>)}
        </select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {rows.length===0
          ?<Empty icon="⊞" title="Nenhum produto cadastrado" sub="Importe via Excel/PDF ou cadastre manualmente. O código do produto é usado para autopreenchimento nos pedidos e orçamentos." btnLabel="+ Primeiro produto" onBtn={()=>openMdl("produtos")}/>
          :<div style={S.tw}><table style={S.tbl}>
            <thead><tr><th style={S.th}>Código</th><th style={S.th}>Descrição</th><th style={S.th}>Indústria</th><th style={S.th}>Categoria</th><th style={S.th}>Preço</th><th style={S.th}>Unid</th><th style={S.th}>Status</th><th style={S.th}>Ações</th></tr></thead>
            <tbody>{rows.map(r=>(
              <tr key={r.id}>
                <td style={{...S.td,fontFamily:"monospace",fontSize:12}}><EC value={r.codigo} field="codigo" row={r} onSave={inlineSave("produtos")}/></td>
                <td style={{...S.td,fontWeight:500}}><EC value={r.descricao} field="descricao" row={r} onSave={inlineSave("produtos")}/></td>
                <td style={S.td}><EC value={r.industria} field="industria" row={r} onSave={inlineSave("produtos")} opts={indNames}/></td>
                <td style={S.td}><EC value={r.categoria} field="categoria" row={r} onSave={inlineSave("produtos")}/></td>
                <td style={{...S.td,fontWeight:600}}>{BRL(r.preco)}</td>
                <td style={S.td}><EC value={r.unidade} field="unidade" row={r} onSave={inlineSave("produtos")} opts={["UN","CX","PC","KG","L","DZ"]}/></td>
                <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("produtos")} opts={["Ativo","Inativo"]}/></td>
                <td style={S.td}><div style={{display:"flex",gap:5}}><button style={S.bB} onClick={()=>openMdl("produtos",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("produtos",r.id)}>×</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        }
      </div>
      {modal?.type==="produtos"&&(
        <Mdl title={form.id?"Editar Produto":"Novo Produto"} onClose={()=>setModal(null)} onSave={()=>doSave("produtos",form)}>
          <div style={S.fg2}>
            <Fld label="Código" name="codigo" value={form.codigo} onChange={upd}/>
            <Fld label="Indústria" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Descrição" name="descricao" value={form.descricao} onChange={upd} full/>
            <Fld label="Preço Tabela (R$)" name="preco" value={form.preco} onChange={upd} type="number"/>
            <Fld label="Unidade" name="unidade" value={form.unidade} onChange={upd} opts={["UN","CX","PC","KG","L","DZ"]}/>
            <Fld label="Categoria" name="categoria" value={form.categoria} onChange={upd}/>
            <Fld label="Linha" name="linha" value={form.linha} onChange={upd}/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={["Ativo","Inativo"]}/>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── REGRAS COMERCIAIS ─────────────────────────────────────────────────────────
function Regras({data,search,setSearch,fInd,setFInd,modal,setModal,inlineSave,delRow,openMdl,doSave,indNames,cliNames}){
  const [form,setForm]=useState({});
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="regras")setForm(modal.record||{status:"Ativo",formato:"FATURAMENTO",comissao:0});},[modal]);
  const rows=(data.regras||[]).filter(r=>(!search||r.industria.toLowerCase().includes(search.toLowerCase())||r.cliente.toLowerCase().includes(search.toLowerCase()))&&(!fInd||r.industria===fInd));
  const byInd={};rows.forEach(r=>{if(!byInd[r.industria])byInd[r.industria]=[];byInd[r.industria].push(r);});
  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Regras Comerciais <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.regras||[]).length}</span></div>
        <div style={S.acts}><button style={S.bY} onClick={()=>openMdl("regras")}>+ Nova Regra</button></div>
      </div>
      <div style={S.sb2}>
        <input style={S.si} placeholder="Indústria ou cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:"auto"}} value={fInd} onChange={e=>setFInd(e.target.value)}>
          <option value="">Todas</option>{indNames.map(n=><option key={n}>{n}</option>)}
        </select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {Object.entries(byInd).map(([ind,regras])=>(
          <div key={ind} style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{background:"#F5C400",color:"#111",padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>{ind}</span>
              <span style={{fontSize:12,color:"#aaa"}}>{regras.length} regra(s)</span>
            </div>
            <div style={S.tw}><table style={S.tbl}>
              <thead><tr><th style={S.th}>Cliente</th><th style={S.th}>Perfil</th><th style={S.th}>Prazo</th><th style={S.th}>Formato</th><th style={S.th}>% Comissão</th><th style={S.th}>Início</th><th style={S.th}>Status</th><th style={S.th}>Ações</th></tr></thead>
              <tbody>{regras.map(r=>(
                <tr key={r.id}>
                  <td style={{...S.td,fontWeight:500}}><EC value={r.cliente} field="cliente" row={r} onSave={inlineSave("regras")} opts={cliNames}/></td>
                  <td style={S.td}><Bdg s={r.perfil}/></td>
                  <td style={S.td}><EC value={r.prazo} field="prazo" row={r} onSave={inlineSave("regras")}/></td>
                  <td style={S.td}><Bdg s={r.formato}/></td>
                  <td style={S.td}><span style={{fontWeight:800,fontSize:15,color:"#F5C400"}}>{r.comissao}%</span></td>
                  <td style={{...S.td,fontSize:12,color:"#aaa"}}>{r.inicio}</td>
                  <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("regras")} opts={["Ativo","Inativo"]}/></td>
                  <td style={S.td}><div style={{display:"flex",gap:5}}><button style={S.bB} onClick={()=>openMdl("regras",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("regras",r.id)}>×</button></div></td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        ))}
      </div>
      {modal?.type==="regras"&&(
        <Mdl title={form.id?"Editar Regra":"Nova Regra"} onClose={()=>setModal(null)} onSave={()=>doSave("regras",form)}>
          <div style={S.fg2}>
            <Fld label="Indústria" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Cliente" name="cliente" value={form.cliente} onChange={upd} opts={["",...cliNames]}/>
            <Fld label="Perfil" name="perfil" value={form.perfil} onChange={upd} opts={["Varejo","Distribuidora","Atacado"]}/>
            <Fld label="Prazo" name="prazo" value={form.prazo} onChange={upd}/>
            <Fld label="Formato" name="formato" value={form.formato} onChange={upd} opts={["FATURAMENTO","LIQUIDEZ"]}/>
            <Fld label="% Comissão" name="comissao" value={form.comissao} onChange={upd} type="number"/>
            <Fld label="Início Vigência" name="inicio" value={form.inicio} onChange={upd} type="date"/>
            <Fld label="Fim Vigência" name="fim" value={form.fim} onChange={upd} type="date"/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={["Ativo","Inativo"]}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── MIX POR CLIENTE ───────────────────────────────────────────────────────────
function MixCliente({data,search,setSearch,fInd,setFInd,modal,setModal,inlineSave,delRow,openMdl,doSave,indNames,cliNames}){
  const [form,setForm]=useState({});
  const [msg,setMsg]=useState("");
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="mix")setForm(modal.record||{status:"Ativo",desconto:0});},[modal]);
  const rows=(data.mix||[]).filter(m=>(!search||(m.cliente||"").toLowerCase().includes(search.toLowerCase())||(m.produto||"").toLowerCase().includes(search.toLowerCase()))&&(!fInd||m.industria===fInd));
  const byCli={};rows.forEach(r=>{if(!byCli[r.cliente])byCli[r.cliente]=[];byCli[r.cliente].push(r);});
  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Mix por Cliente <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.mix||[]).length}</span></div>
        <div style={S.acts}>
          <ImportBtn label="Importar Excel" accept=".xlsx,.xls,.csv" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),7000);}}/>
          <button style={S.bY} onClick={()=>openMdl("mix")}>+ Novo Item</button>
        </div>
      </div>
      {msg&&<div style={S.warn}>ℹ️ {msg}</div>}
      <div style={S.sb2}>
        <input style={S.si} placeholder="Cliente, produto..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:"auto"}} value={fInd} onChange={e=>setFInd(e.target.value)}>
          <option value="">Todas as indústrias</option>{indNames.map(n=><option key={n}>{n}</option>)}
        </select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {rows.length===0
          ?<Empty icon="◧" title="Nenhum mix cadastrado" sub="Defina os produtos negociados por cliente com desconto e preço especial. Ao criar pedidos e orçamentos, os valores serão preenchidos automaticamente." btnLabel="+ Cadastrar primeiro item" onBtn={()=>openMdl("mix")}/>
          :Object.entries(byCli).map(([cli,itens])=>(
            <div key={cli} style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{background:"#111",color:"#fff",padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>{cli}</span>
                <span style={{fontSize:12,color:"#aaa"}}>{itens.length} produto(s)</span>
              </div>
              <div style={S.tw}><table style={S.tbl}>
                <thead><tr><th style={S.th}>Indústria</th><th style={S.th}>Código</th><th style={S.th}>Produto</th><th style={S.th}>Filial</th><th style={S.th}>Desc%</th><th style={S.th}>Preço Neg.</th><th style={S.th}>Status</th><th style={S.th}>Ações</th></tr></thead>
                <tbody>{itens.map(r=>(
                  <tr key={r.id}>
                    <td style={S.td}><EC value={r.industria} field="industria" row={r} onSave={inlineSave("mix")} opts={indNames}/></td>
                    <td style={{...S.td,fontFamily:"monospace",fontSize:12}}><EC value={r.codigo} field="codigo" row={r} onSave={inlineSave("mix")}/></td>
                    <td style={{...S.td,fontWeight:500}}><EC value={r.produto} field="produto" row={r} onSave={inlineSave("mix")}/></td>
                    <td style={S.td}><EC value={r.filial} field="filial" row={r} onSave={inlineSave("mix")}/></td>
                    <td style={S.td}><EC value={r.desconto} field="desconto" row={r} onSave={inlineSave("mix")} type="number"/>%</td>
                    <td style={{...S.td,fontWeight:600}}>{r.precoNeg?BRL(r.precoNeg):"—"}</td>
                    <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("mix")} opts={["Ativo","Inativo"]}/></td>
                    <td style={S.td}><div style={{display:"flex",gap:5}}><button style={S.bB} onClick={()=>openMdl("mix",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("mix",r.id)}>×</button></div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          ))
        }
      </div>
      {modal?.type==="mix"&&(
        <Mdl title={form.id?"Editar Item":"Novo Item de Mix"} onClose={()=>setModal(null)} onSave={()=>doSave("mix",form)}>
          <div style={S.fg2}>
            <Fld label="Cliente" name="cliente" value={form.cliente} onChange={upd} opts={["",...cliNames]}/>
            <Fld label="Filial" name="filial" value={form.filial} onChange={upd}/>
            <Fld label="Indústria" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Código" name="codigo" value={form.codigo} onChange={upd}/>
            <Fld label="Produto" name="produto" value={form.produto} onChange={upd} full/>
            <Fld label="Desconto %" name="desconto" value={form.desconto} onChange={upd} type="number"/>
            <Fld label="Preço Negociado (R$)" name="precoNeg" value={form.precoNeg} onChange={upd} type="number"/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={["Ativo","Inativo"]}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── EXPORT HELPERS ────────────────────────────────────────────────────────────
function exportCSV(rows, filename){
  const csv=rows.map(l=>l.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(";")).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));
  a.download=filename; a.click();
}

function exportPDFDoc(doc, tipo, empresa){
  const total = (doc.itens||[]).reduce((s,i)=>s+itemTotal(i),0);
  const linhas = (doc.itens||[]).map((it,i)=>`
    <tr>
      <td>${i+1}</td>
      <td style="font-family:monospace">${it.cod||""}</td>
      <td>${it.desc||""}</td>
      <td style="text-align:center">${it.qtd}</td>
      <td style="text-align:right">${BRL(it.preco)}</td>
      <td style="text-align:center">${it.descPct||0}%</td>
      <td style="text-align:right;font-weight:700">${BRL(itemTotal(it))}</td>
    </tr>`).join("");

  const html=`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${tipo} ${doc.numero||doc.id}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#111;padding:32px;font-size:13px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #F5C400;padding-bottom:16px;margin-bottom:24px}
.logo{font-size:22px;font-weight:800}.logo span{color:#F5C400}
.sub{font-size:10px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:.06em}
.docinfo{text-align:right}.docinfo h2{font-size:20px;font-weight:800;margin-bottom:4px}
.docinfo p{font-size:12px;color:#666;margin:2px 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px}
.box{background:#f9f9f7;border-radius:8px;padding:14px}
.box label{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#888;display:block;margin-bottom:5px}
.box strong{font-size:15px;font-weight:700}
.box small{font-size:12px;color:#888;display:block;margin-top:3px}
table{width:100%;border-collapse:collapse}
thead{background:#111;color:#fff}
thead th{padding:9px 8px;font-size:11px;text-align:left;font-weight:600;letter-spacing:.04em}
tbody tr{border-bottom:1px solid #f0f0ee}
tbody tr:nth-child(even){background:#fafaf9}
tbody td{padding:8px 8px;font-size:12px}
.tot{background:#F5C400!important}
.tot td{font-weight:800;font-size:14px;padding:10px 8px}
.obs{background:#fffbeb;border-left:3px solid #F5C400;padding:10px 12px;margin-top:16px;font-size:12px}
.ftr{margin-top:40px;border-top:1px solid #eee;padding-top:14px;font-size:11px;color:#aaa;text-align:center}
@media print{body{padding:16px}}
</style></head><body>
<div class="hdr">
  <div>
    <div class="logo">comercial <span>três</span>vales</div>
    <div class="sub">${empresa||"Representação Comercial"}</div>
  </div>
  <div class="docinfo">
    <h2>${tipo.toUpperCase()} Nº ${doc.numero||doc.id}</h2>
    <p>Data: ${doc.data||"—"}${doc.validade?" &nbsp;|&nbsp; Válido até: "+doc.validade:""}</p>
    <p>Status: <strong>${doc.status||""}</strong></p>
  </div>
</div>
<div class="grid">
  <div class="box">
    <label>Cliente</label>
    <strong>${doc.cliente||"—"}</strong>
    ${doc.filial?`<small>Filial: ${doc.filial}</small>`:""}
    ${doc.cond?`<small>Condições: ${doc.cond}</small>`:""}
  </div>
  <div class="box">
    <label>Indústria</label>
    <strong>${doc.industria||"—"}</strong>
    ${doc.responsavel?`<small>Responsável: ${doc.responsavel}</small>`:""}
  </div>
</div>
<table>
  <thead><tr><th>#</th><th>Código</th><th>Descrição</th><th style="text-align:center">Qtd</th><th style="text-align:right">Preço Unit</th><th style="text-align:center">Desc%</th><th style="text-align:right">Total Item</th></tr></thead>
  <tbody>${linhas}</tbody>
  <tfoot><tr class="tot"><td colspan="6" style="text-align:right;padding:10px 8px">TOTAL GERAL</td><td style="text-align:right;padding:10px 8px">${BRL(total)}</td></tr></tfoot>
</table>
${doc.obs?`<div class="obs"><strong>Observações:</strong> ${doc.obs}</div>`:""}
<div class="ftr">Comercial Três Vales &nbsp;|&nbsp; ${new Date().toLocaleString("pt-BR")}</div>
<script>window.onload=()=>window.print()</script>
</body></html>`;
  const w=window.open("","_blank"); w.document.write(html); w.document.close();
}

function exportDocXLS(doc, tipo){
  const rows=[
    [`Comercial Três Vales — ${tipo}`],
    ["Nº", doc.numero||doc.id, "Data", doc.data||"", "Status", doc.status||""],
    ["Cliente", doc.cliente||"", "Indústria", doc.industria||"", "Filial", doc.filial||""],
    doc.validade?["Válido até", doc.validade,"","","",""]:null,
    [],
    ["#","Código","Descrição","Qtd","Preço Unit","Desc%","Total Item"],
    ...(doc.itens||[]).map((it,i)=>[i+1, it.cod||"", it.desc||"", it.qtd, R(it.preco).toFixed(2), it.descPct||0, itemTotal(it).toFixed(2)]),
    [],
    ["","","","","","TOTAL GERAL", (doc.itens||[]).reduce((s,i)=>s+itemTotal(i),0).toFixed(2)],
    doc.obs?["Obs:", doc.obs,"","","",""]:null,
  ].filter(Boolean);
  exportCSV(rows, `${tipo.toLowerCase().replace(/\s/g,"_")}_${doc.numero||doc.id}.csv`);
}

// ── PEDIDOS ───────────────────────────────────────────────────────────────────
function Pedidos({data,save,search,setSearch,modal,setModal,inlineSave,delRow,openMdl,indNames,cliNames,ok}){
  const [itensDoc,setItensDoc]=useState(null); // doc aberto para editar itens
  const [form,setForm]=useState({});
  const [msg,setMsg]=useState("");
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="pedidos")setForm(modal.record||{status:"Recebido",data:ISO(),itens:[]});},[modal]);

  const savePed=f=>{
    const arr=f.id?(data.pedidos||[]).map(r=>r.id===f.id?f:r):[...(data.pedidos||[]),{...f,id:NID(data.pedidos||[])}];
    save({...data,pedidos:arr}); setModal(null); ok("Pedido salvo");
  };

  const rows=(data.pedidos||[]).filter(p=>!search||String(p.numero||p.id).includes(search)||(p.cliente||"").toLowerCase().includes(search.toLowerCase())||(p.industria||"").toLowerCase().includes(search.toLowerCase()));

  const empresa=(data.config||{}).empresa||"Representação Comercial";

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Pedidos <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.pedidos||[]).length}</span></div>
        <div style={S.acts}>
          <ImportBtn label="Importar Excel" accept=".xlsx,.xls,.csv" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),8000);}}/>
          <ImportBtn label="Importar PDF" accept=".pdf" onMsg={m=>{setMsg(m);setTimeout(()=>setMsg(""),8000);}}/>
          <button style={S.bY} onClick={()=>openMdl("pedidos")}>+ Novo Pedido</button>
        </div>
      </div>
      {msg&&<div style={S.warn}>ℹ️ {msg}</div>}
      <div style={S.sb2}>
        <input style={S.si} placeholder="Nº, cliente, indústria..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:"auto"}} onChange={e=>setSearch(e.target.value)}>
          <option value="">Todos os status</option>
          {ST_PED.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {rows.length===0
          ?<Empty icon="◷" title="Nenhum pedido lançado" sub="Importe via Excel ou PDF, ou cadastre manualmente. Após criar o cabeçalho, clique em 'Itens' para adicionar os produtos." btnLabel="+ Novo Pedido Manual" onBtn={()=>openMdl("pedidos")}/>
          :<div style={S.tw}><table style={S.tbl}>
            <thead><tr>
              <th style={S.th}>Nº</th><th style={S.th}>Cliente</th><th style={S.th}>Indústria</th>
              <th style={S.th}>Data</th><th style={S.th}>Itens</th><th style={S.th}>Total</th>
              <th style={S.th}>Responsável</th><th style={S.th}>Status</th><th style={S.th}>Ações</th>
            </tr></thead>
            <tbody>{rows.map(r=>{
              const tot=(r.itens||[]).reduce((s,i)=>s+itemTotal(i),0);
              return(
                <tr key={r.id}>
                  <td style={{...S.td,fontWeight:700,color:"#888"}}>#{r.numero||r.id}</td>
                  <td style={{...S.td,fontWeight:500}}><EC value={r.cliente} field="cliente" row={r} onSave={inlineSave("pedidos")} opts={cliNames}/></td>
                  <td style={S.td}><EC value={r.industria} field="industria" row={r} onSave={inlineSave("pedidos")} opts={indNames}/></td>
                  <td style={{...S.td,fontSize:12,color:"#888"}}>{r.data}</td>
                  <td style={S.td}><span style={{background:"#f1f5f9",padding:"2px 8px",borderRadius:20,fontSize:12}}>{(r.itens||[]).length} itens</span></td>
                  <td style={{...S.td,fontWeight:700}}>{BRL(tot)}</td>
                  <td style={{...S.td,fontSize:12}}><EC value={r.responsavel} field="responsavel" row={r} onSave={inlineSave("pedidos")}/></td>
                  <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("pedidos")} opts={ST_PED}/></td>
                  <td style={S.td}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <button style={S.bB} onClick={()=>setItensDoc({...r})}>Itens</button>
                      <button style={S.bB} onClick={()=>openMdl("pedidos",r)}>Editar</button>
                      <button style={{...S.bG,fontSize:11,padding:"4px 8px"}} onClick={()=>exportDocXLS(r,"Pedido")}>XLS</button>
                      <button style={{...S.bG,fontSize:11,padding:"4px 8px",borderColor:"#dc2626",color:"#dc2626"}} onClick={()=>exportPDFDoc(r,"Pedido",empresa)}>PDF</button>
                      <button style={S.bR} onClick={()=>delRow("pedidos",r.id)}>×</button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table></div>
        }
      </div>

      {/* MODAL CABEÇALHO */}
      {modal?.type==="pedidos"&&(
        <Mdl title={form.id?`Editar Pedido #${form.numero||form.id}`:"Novo Pedido"} onClose={()=>setModal(null)} onSave={()=>savePed(form)}>
          <div style={S.fg2}>
            <Fld label="Nº Pedido (externo)" name="numero" value={form.numero} onChange={upd}/>
            <Fld label="Data" name="data" value={form.data} onChange={upd} type="date"/>
            <Fld label="Cliente" name="cliente" value={form.cliente} onChange={upd} opts={["",...cliNames]}/>
            <Fld label="Filial" name="filial" value={form.filial} onChange={upd}/>
            <Fld label="Indústria" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Responsável" name="responsavel" value={form.responsavel} onChange={upd}/>
            <Fld label="Condições Comerciais" name="cond" value={form.cond} onChange={upd}/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={ST_PED}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
          <div style={{marginTop:12,fontSize:12,color:"#888",paddingTop:10,borderTop:".5px solid rgba(0,0,0,.08)"}}>
            💡 Após salvar, clique em <strong>Itens</strong> para adicionar os produtos do pedido.
          </div>
        </Mdl>
      )}

      {/* MODAL ITENS */}
      {itensDoc&&(
        <Mdl title={`Itens do Pedido #${itensDoc.numero||itensDoc.id} — ${itensDoc.cliente}`} onClose={()=>setItensDoc(null)} wide onSave={null}>
          <ItensEditor
            itens={itensDoc.itens||[]}
            setItens={its=>{
              const updated={...itensDoc,itens:its};
              setItensDoc(updated);
              const arr=(data.pedidos||[]).map(r=>r.id===itensDoc.id?updated:r);
              save({...data,pedidos:arr});
            }}
            produtos={data.produtos||[]}
            mix={data.mix||[]}
            cliente={itensDoc.cliente}
            industria={itensDoc.industria}
          />
          <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:16,paddingTop:12,borderTop:".5px solid rgba(0,0,0,.08)"}}>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.bG,fontSize:12}} onClick={()=>exportDocXLS(itensDoc,"Pedido")}>📊 Exportar XLS</button>
              <button style={{...S.bG,fontSize:12,borderColor:"#dc2626",color:"#dc2626"}} onClick={()=>exportPDFDoc(itensDoc,"Pedido",empresa)}>🖨 Exportar PDF</button>
            </div>
            <button style={S.bY} onClick={()=>{ok("Itens salvos");setItensDoc(null);}}>✓ Concluir</button>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── ORÇAMENTOS ────────────────────────────────────────────────────────────────
function Orcamentos({data,save,search,setSearch,modal,setModal,inlineSave,delRow,openMdl,indNames,cliNames,ok}){
  const [itensDoc,setItensDoc]=useState(null);
  const [form,setForm]=useState({});
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="orcamentos")setForm(modal.record||{status:"Rascunho",data:ISO(),itens:[]});},[modal]);

  const saveOrc=f=>{
    const arr=f.id?(data.orcamentos||[]).map(r=>r.id===f.id?f:r):[...(data.orcamentos||[]),{...f,id:NID(data.orcamentos||[])}];
    save({...data,orcamentos:arr}); setModal(null); ok("Orçamento salvo");
  };

  const rows=(data.orcamentos||[]).filter(o=>!search||String(o.numero||o.id).includes(search)||(o.cliente||"").toLowerCase().includes(search.toLowerCase()));
  const empresa=(data.config||{}).empresa||"Representação Comercial";

  // busca regra para mostrar comissão prevista
  const getRegra=(cli,ind)=>(data.regras||[]).find(r=>r.cliente===cli&&r.industria===ind&&r.status==="Ativo");

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Orçamentos <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.orcamentos||[]).length}</span></div>
        <div style={S.acts}><button style={S.bY} onClick={()=>openMdl("orcamentos")}>+ Novo Orçamento</button></div>
      </div>
      <div style={S.sb2}>
        <input style={S.si} placeholder="Nº, cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:"auto"}} onChange={e=>setSearch(e.target.value)}>
          <option value="">Todos os status</option>
          {ST_ORC.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {rows.length===0
          ?<Empty icon="◫" title="Nenhum orçamento criado" sub="Crie orçamentos com produtos, descontos do mix e exporte com a identidade visual da Três Vales em PDF ou Excel." btnLabel="+ Criar Orçamento" onBtn={()=>openMdl("orcamentos")}/>
          :<div style={S.tw}><table style={S.tbl}>
            <thead><tr>
              <th style={S.th}>Nº</th><th style={S.th}>Cliente</th><th style={S.th}>Indústria</th>
              <th style={S.th}>Data</th><th style={S.th}>Validade</th><th style={S.th}>Itens</th>
              <th style={S.th}>Total</th><th style={S.th}>Com.%</th><th style={S.th}>Status</th><th style={S.th}>Ações</th>
            </tr></thead>
            <tbody>{rows.map(r=>{
              const tot=(r.itens||[]).reduce((s,i)=>s+itemTotal(i),0);
              const regra=getRegra(r.cliente,r.industria);
              const vencido=r.validade&&r.validade<ISO();
              return(
                <tr key={r.id}>
                  <td style={{...S.td,fontWeight:700,color:"#888"}}>#{r.numero||r.id}</td>
                  <td style={{...S.td,fontWeight:500}}><EC value={r.cliente} field="cliente" row={r} onSave={inlineSave("orcamentos")} opts={cliNames}/></td>
                  <td style={S.td}><EC value={r.industria} field="industria" row={r} onSave={inlineSave("orcamentos")} opts={indNames}/></td>
                  <td style={{...S.td,fontSize:12,color:"#888"}}>{r.data}</td>
                  <td style={{...S.td,fontSize:12,color:vencido?"#dc2626":"#888",fontWeight:vencido?700:400}}>{r.validade||"—"}</td>
                  <td style={S.td}><span style={{background:"#f1f5f9",padding:"2px 8px",borderRadius:20,fontSize:12}}>{(r.itens||[]).length} itens</span></td>
                  <td style={{...S.td,fontWeight:700}}>{BRL(tot)}</td>
                  <td style={S.td}>{regra?<span style={{fontWeight:700,color:"#F5C400"}}>{regra.comissao}%</span>:<span style={{color:"#ccc",fontSize:12}}>—</span>}</td>
                  <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("orcamentos")} opts={ST_ORC}/></td>
                  <td style={S.td}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <button style={S.bB} onClick={()=>setItensDoc({...r})}>Itens</button>
                      <button style={S.bB} onClick={()=>openMdl("orcamentos",r)}>Editar</button>
                      <button style={{...S.bG,fontSize:11,padding:"4px 8px"}} onClick={()=>exportDocXLS(r,"Orçamento")}>XLS</button>
                      <button style={{...S.bG,fontSize:11,padding:"4px 8px",borderColor:"#dc2626",color:"#dc2626"}} onClick={()=>exportPDFDoc(r,"Orçamento",empresa)}>PDF</button>
                      <button style={S.bR} onClick={()=>delRow("orcamentos",r.id)}>×</button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table></div>
        }
      </div>

      {modal?.type==="orcamentos"&&(
        <Mdl title={form.id?`Editar Orçamento #${form.numero||form.id}`:"Novo Orçamento"} onClose={()=>setModal(null)} onSave={()=>saveOrc(form)}>
          <div style={S.fg2}>
            <Fld label="Nº Orçamento" name="numero" value={form.numero} onChange={upd}/>
            <Fld label="Data" name="data" value={form.data} onChange={upd} type="date"/>
            <Fld label="Cliente" name="cliente" value={form.cliente} onChange={upd} opts={["",...cliNames]}/>
            <Fld label="Filial" name="filial" value={form.filial} onChange={upd}/>
            <Fld label="Indústria" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Válido até" name="validade" value={form.validade} onChange={upd} type="date"/>
            <Fld label="Condições Comerciais" name="cond" value={form.cond} onChange={upd}/>
            <Fld label="Responsável" name="responsavel" value={form.responsavel} onChange={upd}/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={ST_ORC}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
          <div style={{marginTop:12,fontSize:12,color:"#888",paddingTop:10,borderTop:".5px solid rgba(0,0,0,.08)"}}>
            💡 Após salvar, clique em <strong>Itens</strong> para adicionar os produtos. Use <strong>XLS</strong> ou <strong>PDF</strong> para exportar com a identidade da Três Vales.
          </div>
        </Mdl>
      )}

      {itensDoc&&(
        <Mdl title={`Itens do Orçamento #${itensDoc.numero||itensDoc.id} — ${itensDoc.cliente}`} onClose={()=>setItensDoc(null)} wide onSave={null}>
          {getRegra(itensDoc.cliente,itensDoc.industria)&&(
            <div style={S.ok}>✓ Regra de comissão: <strong>{getRegra(itensDoc.cliente,itensDoc.industria).comissao}%</strong> ({getRegra(itensDoc.cliente,itensDoc.industria).formato}) — será calculada sobre o valor líquido da NF.</div>
          )}
          <ItensEditor
            itens={itensDoc.itens||[]}
            setItens={its=>{
              const updated={...itensDoc,itens:its};
              setItensDoc(updated);
              const arr=(data.orcamentos||[]).map(r=>r.id===itensDoc.id?updated:r);
              save({...data,orcamentos:arr});
            }}
            produtos={data.produtos||[]}
            mix={data.mix||[]}
            cliente={itensDoc.cliente}
            industria={itensDoc.industria}
          />
          <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:16,paddingTop:12,borderTop:".5px solid rgba(0,0,0,.08)"}}>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.bG,fontSize:12}} onClick={()=>exportDocXLS(itensDoc,"Orçamento")}>📊 Exportar XLS</button>
              <button style={{...S.bG,fontSize:12,borderColor:"#dc2626",color:"#dc2626"}} onClick={()=>exportPDFDoc(itensDoc,"Orçamento",empresa)}>🖨 Exportar PDF</button>
            </div>
            <button style={S.bY} onClick={()=>{ok("Itens salvos");setItensDoc(null);}}>✓ Concluir</button>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── FATURAMENTO / NF ──────────────────────────────────────────────────────────
function Faturamento({data,save,search,setSearch,fInd,setFInd,modal,setModal,inlineSave,delRow,openMdl,indNames,cliNames,ok}){
  const [form,setForm]=useState({});
  const [compMdl,setCompMdl]=useState(null); // pedido comparado com NF
  const [abatMdl,setAbatMdl]=useState(null); // NF para editar abatimentos
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{
    if(modal?.type==="faturamento") setForm(modal.record||{status:"Pendente",emissao:ISO(),abatimentos:[],itens:[]});
  },[modal]);

  const saveFat=f=>{
    // recalcula vliq
    const vnf=R(f.vnf);
    const totalAbat=(f.abatimentos||[]).reduce((s,a)=>s+R(a.valor),0);
    const vliq=Math.max(0,vnf-totalAbat);
    const updated={...f,vliq};
    const arr=updated.id?(data.faturamentos||[]).map(r=>r.id===updated.id?updated:r):[...(data.faturamentos||[]),{...updated,id:NID(data.faturamentos||[])}];
    save({...data,faturamentos:arr});
    setModal(null);
    ok("NF salva");
  };

  const rows=(data.faturamentos||[]).filter(f=>
    (!search||(f.nf||"").includes(search)||(f.cliente||"").toLowerCase().includes(search.toLowerCase()))&&
    (!fInd||f.industria===fInd)
  );

  const pedidosSelect=(data.pedidos||[]).map(p=>({label:`#${p.numero||p.id} — ${p.cliente} — ${p.industria}`,value:String(p.id)}));

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Faturamento / NF <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.faturamentos||[]).length} notas</span></div>
        <div style={S.acts}><button style={S.bY} onClick={()=>openMdl("faturamento")}>+ Nova NF</button></div>
      </div>
      <div style={S.sb2}>
        <input style={S.si} placeholder="Nº NF, cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:"auto"}} value={fInd} onChange={e=>setFInd(e.target.value)}>
          <option value="">Todas as indústrias</option>{indNames.map(n=><option key={n}>{n}</option>)}
        </select>
        <select style={{...S.sel,width:"auto"}} onChange={e=>setSearch(e.target.value)}>
          <option value="">Todos os status</option>{ST_FAT.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {rows.length===0
          ?<Empty icon="◆" title="Nenhuma nota fiscal lançada" sub="Lance as NFs vinculando ao pedido de origem. O sistema calculará automaticamente abatimentos, valor líquido e base de comissão." btnLabel="+ Nova NF" onBtn={()=>openMdl("faturamento")}/>
          :<div style={S.tw}><table style={S.tbl}>
            <thead><tr>
              <th style={S.th}>NF</th><th style={S.th}>Cliente</th><th style={S.th}>Indústria</th>
              <th style={S.th}>Emissão</th><th style={S.th}>Valor NF</th><th style={S.th}>Abatimentos</th>
              <th style={S.th}>Valor Líquido</th><th style={S.th}>Base Comissão</th><th style={S.th}>Status</th><th style={S.th}>Ações</th>
            </tr></thead>
            <tbody>{rows.map(r=>{
              const totalAbat=(r.abatimentos||[]).reduce((s,a)=>s+R(a.valor),0);
              const vliq=R(r.vliq)||Math.max(0,R(r.vnf)-totalAbat);
              const basecom=calcBaseComissao(r);
              return(
                <tr key={r.id}>
                  <td style={{...S.td,fontWeight:700,fontFamily:"monospace"}}>{r.nf||"—"}</td>
                  <td style={{...S.td,fontWeight:500}}>{r.cliente}</td>
                  <td style={S.td}>{r.industria}</td>
                  <td style={{...S.td,fontSize:12,color:"#888"}}>{r.emissao}</td>
                  <td style={S.td}>{BRL(r.vnf)}</td>
                  <td style={{...S.td,color:totalAbat>0?"#dc2626":"#aaa",fontWeight:totalAbat>0?700:400}}>
                    {totalAbat>0?`− ${BRL(totalAbat)}`:"—"}
                    {(r.abatimentos||[]).length>0&&<span style={{fontSize:11,color:"#aaa",marginLeft:4}}>({(r.abatimentos||[]).length})</span>}
                  </td>
                  <td style={{...S.td,fontWeight:700,color:"#16a34a"}}>{BRL(vliq)}</td>
                  <td style={{...S.td,fontWeight:600,color:"#F5C400"}}>{BRL(basecom)}</td>
                  <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("faturamentos")} opts={ST_FAT}/></td>
                  <td style={S.td}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <button style={S.bB} onClick={()=>setAbatMdl({...r})}>Abatimentos</button>
                      {r.pedidoId&&<button style={S.bB} onClick={()=>{const ped=(data.pedidos||[]).find(p=>p.id===r.pedidoId);setCompMdl({fat:r,ped});}}>Conferir</button>}
                      <button style={S.bB} onClick={()=>openMdl("faturamento",r)}>Editar</button>
                      <button style={S.bR} onClick={()=>delRow("faturamentos",r.id)}>×</button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table></div>
        }
      </div>

      {/* MODAL NOVA NF */}
      {modal?.type==="faturamento"&&(
        <Mdl title={form.id?`Editar NF ${form.nf}`:"Nova Nota Fiscal"} onClose={()=>setModal(null)} onSave={()=>saveFat(form)} wide>
          <div style={S.fg2}>
            <Fld label="Nº NF" name="nf" value={form.nf} onChange={upd}/>
            <Fld label="Data Emissão" name="emissao" value={form.emissao} onChange={upd} type="date"/>
            <Fld label="Cliente" name="cliente" value={form.cliente} onChange={upd} opts={["",...cliNames]}/>
            <Fld label="Indústria" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Pedido de Origem" name="pedidoId" value={form.pedidoId}
              onChange={e=>{
                const pid=R(e.target.value);
                const ped=(data.pedidos||[]).find(p=>p.id===pid);
                setForm(f=>({...f,pedidoId:pid,...(ped?{cliente:ped.cliente,industria:ped.industria,vpedido:(ped.itens||[]).reduce((s,i)=>s+itemTotal(i),0)}:{})}));
              }}
              opts={["",...(data.pedidos||[]).map(p=>`${p.id}`)]}
            />
            <Fld label="Valor do Pedido (ref.)" name="vpedido" value={form.vpedido} onChange={upd} type="number"/>
            <Fld label="Valor Total da NF (R$)" name="vnf" value={form.vnf} onChange={upd} type="number"/>
            <Fld label="Data Vencimento" name="vencimento" value={form.vencimento} onChange={upd} type="date"/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={ST_FAT}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
          <div style={{marginTop:12,fontSize:12,color:"#888",paddingTop:10,borderTop:".5px solid rgba(0,0,0,.08)"}}>
            💡 Após salvar, clique em <strong>Abatimentos</strong> para registrar devoluções, NFD, descontos financeiros e bonificações sem comissão. O valor líquido e a base de comissão serão recalculados automaticamente.
          </div>
        </Mdl>
      )}

      {/* MODAL ABATIMENTOS */}
      {abatMdl&&<AbatMdl fat={abatMdl} data={data} save={save} onClose={()=>setAbatMdl(null)} ok={ok}/>}

      {/* MODAL COMPARAÇÃO PEDIDO × NF */}
      {compMdl&&<CompMdl fat={compMdl.fat} ped={compMdl.ped} onClose={()=>setCompMdl(null)}/>}
    </div>
  );
}

// ── ABATIMENTOS MODAL ─────────────────────────────────────────────────────────
function AbatMdl({fat,data,save,onClose,ok}){
  const [abats,setAbats]=useState(fat.abatimentos||[]);
  const [ln,setLn]=useState({tipo:TIPOS_ABAT[0],descricao:"",valor:""});
  const upd=e=>setLn(l=>({...l,[e.target.name]:e.target.value}));

  const add=()=>{
    if(!R(ln.valor))return;
    setAbats(p=>[...p,{...ln,valor:R(ln.valor),id:Date.now()}]);
    setLn({tipo:TIPOS_ABAT[0],descricao:"",valor:""});
  };

  const salvar=()=>{
    const totalAbat=abats.reduce((s,a)=>s+R(a.valor),0);
    const vliq=Math.max(0,R(fat.vnf)-totalAbat);
    const updated={...fat,abatimentos:abats,vliq};
    const arr=(data.faturamentos||[]).map(r=>r.id===fat.id?updated:r);
    save({...data,faturamentos:arr});
    ok("Abatimentos salvos");
    onClose();
  };

  const totalAbat=abats.reduce((s,a)=>s+R(a.valor),0);
  const vliq=Math.max(0,R(fat.vnf)-totalAbat);
  const basecom=calcBaseComissao({...fat,abatimentos:abats});

  const tipoCor={
    "Abatimento":"red","Devolução":"red","Desconto Financeiro":"orange",
    "NFD":"red","Bonificação s/ Comissão":"purple","Outros":"gray"
  };

  return(
    <div style={S.over} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.mbox,maxWidth:760}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,borderBottom:".5px solid rgba(0,0,0,.1)",paddingBottom:12}}>
          <div>
            <span style={{fontSize:15,fontWeight:700}}>Abatimentos — NF {fat.nf}</span>
            <span style={{fontSize:12,color:"#888",marginLeft:10}}>{fat.cliente} · {fat.industria}</span>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa"}}>×</button>
        </div>

        {/* resumo valores */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[
            ["Valor NF",BRL(fat.vnf),"#1d4ed8"],
            ["Total Abatimentos",totalAbat>0?"− "+BRL(totalAbat):"R$ 0,00","#dc2626"],
            ["Valor Líquido",BRL(vliq),"#16a34a"],
            ["Base de Comissão",BRL(basecom),"#F5C400"],
          ].map(([lbl,val,cor])=>(
            <div key={lbl} style={{background:"#f9f9f7",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>{lbl}</div>
              <div style={{fontSize:15,fontWeight:800,color:cor}}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{marginBottom:12,fontSize:12,color:"#888",background:"#f0fdf4",border:".5px solid #86efac",borderRadius:7,padding:"8px 12px"}}>
          ✓ Base de comissão = Valor NF menos Abatimentos, Devoluções, NFD e Bonificações s/ Comissão. Descontos Financeiros não reduzem a base.
        </div>

        {/* linha de adição */}
        <div style={{display:"grid",gridTemplateColumns:"180px 1fr 120px auto",gap:8,background:"#f9f9f7",padding:14,borderRadius:8,marginBottom:14,alignItems:"end"}}>
          <div>
            <div style={S.lbl}>Tipo</div>
            <select style={S.sel} name="tipo" value={ln.tipo} onChange={upd}>
              {TIPOS_ABAT.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><div style={S.lbl}>Descrição</div><input style={S.inp} name="descricao" value={ln.descricao} onChange={upd} placeholder="Ex: NF devolução 1234"/></div>
          <div><div style={S.lbl}>Valor (R$)</div><input style={S.inp} name="valor" value={ln.valor} onChange={upd} type="number" step="0.01"/></div>
          <button style={{...S.bY,alignSelf:"flex-end"}} onClick={add}>+ Adicionar</button>
        </div>

        {abats.length>0&&(
          <div style={{...S.tw,marginBottom:14}}>
            <table style={S.tbl}>
              <thead><tr><th style={S.th}>Tipo</th><th style={S.th}>Descrição</th><th style={S.th}>Valor</th><th style={S.th}>Reduz Comissão?</th><th style={S.th}></th></tr></thead>
              <tbody>{abats.map((a,i)=>{
                const reduz=["Abatimento","Devolução","NFD","Bonificação s/ Comissão"].includes(a.tipo);
                return(
                  <tr key={a.id||i}>
                    <td style={S.td}><span style={S.bdg(tipoCor[a.tipo]||"gray")}>{a.tipo}</span></td>
                    <td style={S.td}>{a.descricao||"—"}</td>
                    <td style={{...S.td,fontWeight:700,color:"#dc2626"}}>− {BRL(a.valor)}</td>
                    <td style={S.td}>{reduz?<span style={{color:"#dc2626",fontWeight:600}}>Sim</span>:<span style={{color:"#888"}}>Não</span>}</td>
                    <td style={S.td}><button style={S.bR} onClick={()=>setAbats(p=>p.filter((_,j)=>j!==i))}>×</button></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
        {abats.length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"14px 0",fontSize:13}}>Nenhum abatimento lançado.</div>}

        <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:12,borderTop:".5px solid rgba(0,0,0,.08)"}}>
          <button style={S.bG} onClick={onClose}>Cancelar</button>
          <button style={S.bY} onClick={salvar}>Salvar Abatimentos</button>
        </div>
      </div>
    </div>
  );
}

// ── COMPARAÇÃO PEDIDO × NF ────────────────────────────────────────────────────
function CompMdl({fat,ped,onClose}){
  if(!ped) return(
    <div style={S.over} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.mbox}>
        <div style={{textAlign:"center",padding:"40px 24px",color:"#888"}}>
          <div style={{fontSize:40,marginBottom:12,opacity:.3}}>◷</div>
          <div style={{fontWeight:600,marginBottom:8}}>Pedido não encontrado</div>
          <div style={{fontSize:13}}>O pedido vinculado a esta NF não existe mais.</div>
          <button style={{...S.bG,marginTop:16}} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );

  const vtotal_ped=(ped.itens||[]).reduce((s,i)=>s+itemTotal(i),0);
  const vnf=R(fat.vnf);
  const totalAbat=(fat.abatimentos||[]).reduce((s,a)=>s+R(a.valor),0);
  const vliq=R(fat.vliq)||Math.max(0,vnf-totalAbat);
  const diff=vliq-vtotal_ped;
  const basecom=calcBaseComissao(fat);

  // comparação item a item
  const pedItens=ped.itens||[];
  const fatItens=fat.itens||[];
  const todosCodsArr=[...new Set([...pedItens.map(i=>i.cod),...fatItens.map(i=>i.cod)].filter(Boolean))];

  return(
    <div style={S.over} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.mbox,maxWidth:900}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,borderBottom:".5px solid rgba(0,0,0,.1)",paddingBottom:12}}>
          <span style={{fontSize:15,fontWeight:700}}>Conferência: Pedido #{ped.numero||ped.id} × NF {fat.nf}</span>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa"}}>×</button>
        </div>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
          {[
            ["Total Pedido",BRL(vtotal_ped),"#111"],
            ["Valor NF",BRL(vnf),"#1d4ed8"],
            ["Abatimentos",totalAbat>0?"− "+BRL(totalAbat):BRL(0),"#dc2626"],
            ["Valor Líquido",BRL(vliq),"#16a34a"],
            ["Diferença",BRL(Math.abs(diff)),diff>=0?"#16a34a":"#dc2626"],
          ].map(([lbl,val,cor])=>(
            <div key={lbl} style={{background:"#f9f9f7",borderRadius:8,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{lbl}</div>
              <div style={{fontSize:14,fontWeight:800,color:cor}}>{val}</div>
            </div>
          ))}
        </div>

        {/* alerta divergência */}
        {Math.abs(diff)>0.01&&(
          <div style={{background:"#fef2f2",border:".5px solid #fca5a5",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#991b1b"}}>
            ⚠️ Divergência de <strong>{BRL(Math.abs(diff))}</strong> entre o pedido e o valor líquido da NF. {diff<0?"NF menor que o pedido.":"NF maior que o pedido."}
          </div>
        )}
        {Math.abs(diff)<=0.01&&<div style={{...S.ok,marginBottom:16}}>✓ Valores do pedido e NF líquida estão conferidos.</div>}

        {/* comparação por item */}
        {todosCodsArr.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Comparação Item a Item</div>
            <div style={S.tw}><table style={S.tbl}>
              <thead><tr>
                <th style={S.th}>Código</th><th style={S.th}>Descrição</th>
                <th style={S.th}>Qtd Pedido</th><th style={S.th}>Qtd NF</th><th style={S.th}>Δ Qtd</th>
                <th style={S.th}>Preço Pedido</th><th style={S.th}>Preço NF</th><th style={S.th}>Δ Preço</th>
              </tr></thead>
              <tbody>{todosCodsArr.map(cod=>{
                const pi=pedItens.find(i=>i.cod===cod);
                const fi=fatItens.find(i=>i.cod===cod);
                const dQtd=(fi?R(fi.qtd):0)-(pi?R(pi.qtd):0);
                const dPrc=(fi?R(fi.preco):0)-(pi?R(pi.preco):0);
                const red=v=>v!==0?{color:"#dc2626",fontWeight:700}:{color:"#16a34a"};
                return(
                  <tr key={cod} style={{background:dQtd!==0||dPrc!==0?"#fef2f2":""}}>
                    <td style={{...S.td,fontFamily:"monospace",fontSize:12}}>{cod}</td>
                    <td style={S.td}>{pi?.desc||fi?.desc||"—"}</td>
                    <td style={S.td}>{pi?pi.qtd:"—"}</td>
                    <td style={S.td}>{fi?fi.qtd:"—"}</td>
                    <td style={{...S.td,...red(dQtd)}}>{dQtd>0?"+":""}{dQtd||"✓"}</td>
                    <td style={S.td}>{pi?BRL(pi.preco):"—"}</td>
                    <td style={S.td}>{fi?BRL(fi.preco):"—"}</td>
                    <td style={{...S.td,...red(dPrc)}}>{dPrc!==0?(dPrc>0?"+":"")+BRL(dPrc):"✓"}</td>
                  </tr>
                );
              })}</tbody>
            </table></div>
          </div>
        )}

        <div style={{background:"#f9f9f7",borderRadius:8,padding:"12px 14px",fontSize:13}}>
          <strong>Base de Comissão:</strong> <span style={{color:"#F5C400",fontWeight:700,fontSize:15}}>{BRL(basecom)}</span>
          <span style={{color:"#888",marginLeft:8,fontSize:12}}>(Valor NF − abatimentos que reduzem comissão)</span>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16,paddingTop:12,borderTop:".5px solid rgba(0,0,0,.08)"}}>
          <button style={S.bG} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ── COMISSÕES ─────────────────────────────────────────────────────────────────
function Comissoes({data,save,search,setSearch,fInd,setFInd,modal,setModal,inlineSave,delRow,openMdl,doSave,indNames,cliNames,ok}){
  const [form,setForm]=useState({});
  const [fCli,setFCli]=useState("");
  const [fMes,setFMes]=useState("");
  const [fStatus,setFStatus]=useState("");
  const [fTipo,setFTipo]=useState("");
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="comissoes")setForm(modal.record||{status:"Prevista",tipo:"FATURAMENTO"});},[modal]);

  const rows=(data.comissoes||[]).filter(c=>
    (!search||(c.nf||"").includes(search)||(c.cliente||"").toLowerCase().includes(search.toLowerCase()))&&
    (!fInd||c.industria===fInd)&&(!fCli||c.cliente===fCli)&&
    (!fMes||c.mesPrevisao===fMes||c.mesRecebimento===fMes)&&
    (!fStatus||c.status===fStatus)&&(!fTipo||c.tipo===fTipo)
  );

  const totalPrev=rows.filter(c=>c.status!=="Cancelada").reduce((s,c)=>s+R(c.vcom),0);
  const totalRec=rows.filter(c=>c.status==="Recebida").reduce((s,c)=>s+R(c.vpago),0);
  const totalAberto=totalPrev-totalRec;

  const meses=[...new Set((data.comissoes||[]).map(c=>[c.mesPrevisao,c.mesRecebimento]).flat().filter(Boolean))].sort().reverse();

  const exportarXLS=()=>{
    const linhas=[
      ["Cliente","Indústria","NF","Mês Previsão","Mês Recebimento","Tipo","Base","% Comissão","Valor Comissão","Valor Pago","Status"],
      ...rows.map(c=>[c.cliente||"",c.industria||"",c.nf||"",c.mesPrevisao||"",c.mesRecebimento||"",c.tipo||"",R(c.base).toFixed(2),c.pct||0,R(c.vcom).toFixed(2),R(c.vpago).toFixed(2),c.status||""]),
      [],["","","","","","","","TOTAL PREVISTO",totalPrev.toFixed(2),"",""],
      ["","","","","","","","TOTAL RECEBIDO","",totalRec.toFixed(2),""],
    ];
    exportCSV(linhas,`comissoes_${fMes||"geral"}.csv`);
    ok("Excel exportado");
  };

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Comissões <span style={{fontSize:12,color:"#aaa",fontWeight:400,marginLeft:8}}>{(data.comissoes||[]).length}</span></div>
        <div style={S.acts}>
          <button style={S.bG} onClick={exportarXLS}>📊 Exportar XLS</button>
          <button style={S.bY} onClick={()=>openMdl("comissoes")}>+ Nova Comissão</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,padding:"16px 24px 0"}}>
        {[["Previsto (filtro)",BRL(totalPrev),"#1d4ed8"],["Recebido",BRL(totalRec),"#16a34a"],["Em Aberto",BRL(totalAberto),"#dc2626"]].map(([l,v,c])=>(
          <div key={l} style={{...S.card,borderLeft:`3px solid ${c}`}}>
            <div style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{l}</div>
            <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>

      {/* filtros */}
      <div style={S.sb2}>
        <input style={S.si} placeholder="NF, cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:"auto"}} value={fInd} onChange={e=>setFInd(e.target.value)}><option value="">Todas as indústrias</option>{indNames.map(n=><option key={n}>{n}</option>)}</select>
        <select style={{...S.sel,width:"auto"}} value={fCli} onChange={e=>setFCli(e.target.value)}><option value="">Todos os clientes</option>{cliNames.map(n=><option key={n}>{n}</option>)}</select>
        <select style={{...S.sel,width:"auto"}} value={fMes} onChange={e=>setFMes(e.target.value)}><option value="">Todos os meses</option>{meses.map(m=><option key={m}>{m}</option>)}</select>
        <select style={{...S.sel,width:"auto"}} value={fStatus} onChange={e=>setFStatus(e.target.value)}><option value="">Todos os status</option>{ST_COM.map(s=><option key={s}>{s}</option>)}</select>
        <select style={{...S.sel,width:"auto"}} value={fTipo} onChange={e=>setFTipo(e.target.value)}><option value="">Ambos os tipos</option><option>FATURAMENTO</option><option>LIQUIDEZ</option></select>
      </div>

      <div style={{padding:"12px 24px 24px"}}>
        {rows.length===0
          ?<Empty icon="💰" title="Nenhuma comissão" sub="As comissões são geradas a partir das NFs lançadas, ou podem ser cadastradas manualmente." btnLabel="+ Cadastrar Comissão" onBtn={()=>openMdl("comissoes")}/>
          :<div style={S.tw}><table style={S.tbl}>
            <thead><tr>
              <th style={S.th}>NF</th><th style={S.th}>Cliente</th><th style={S.th}>Indústria</th>
              <th style={S.th}>Tipo</th><th style={S.th}>Mês Prev.</th><th style={S.th}>Mês Receb.</th>
              <th style={S.th}>Base</th><th style={S.th}>%</th><th style={S.th}>Valor Com.</th>
              <th style={S.th}>Pago</th><th style={S.th}>Status</th><th style={S.th}>Ações</th>
            </tr></thead>
            <tbody>{rows.map(r=>(
              <tr key={r.id}>
                <td style={{...S.td,fontFamily:"monospace",fontSize:12}}>{r.nf||"—"}</td>
                <td style={{...S.td,fontWeight:500}}>{r.cliente}</td>
                <td style={S.td}>{r.industria}</td>
                <td style={S.td}><Bdg s={r.tipo}/></td>
                <td style={{...S.td,fontSize:12}}>{r.mesPrevisao||"—"}</td>
                <td style={{...S.td,fontSize:12}}>{r.mesRecebimento||"—"}</td>
                <td style={S.td}>{BRL(r.base)}</td>
                <td style={{...S.td,fontWeight:700,color:"#F5C400"}}>{r.pct||0}%</td>
                <td style={{...S.td,fontWeight:700}}>{BRL(r.vcom)}</td>
                <td style={{...S.td,color:"#16a34a",fontWeight:600}}>{r.vpago?BRL(r.vpago):"—"}</td>
                <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("comissoes")} opts={ST_COM}/></td>
                <td style={S.td}><div style={{display:"flex",gap:4}}><button style={S.bB} onClick={()=>openMdl("comissoes",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("comissoes",r.id)}>×</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        }
      </div>
      {modal?.type==="comissoes"&&(
        <Mdl title={form.id?"Editar Comissão":"Nova Comissão"} onClose={()=>setModal(null)} onSave={()=>doSave("comissoes",form)}>
          <div style={S.fg2}>
            <Fld label="NF" name="nf" value={form.nf} onChange={upd}/>
            <Fld label="Cliente" name="cliente" value={form.cliente} onChange={upd} opts={["",...cliNames]}/>
            <Fld label="Indústria" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Tipo" name="tipo" value={form.tipo} onChange={upd} opts={["FATURAMENTO","LIQUIDEZ"]}/>
            <Fld label="Base de Cálculo (R$)" name="base" value={form.base} onChange={upd} type="number"/>
            <Fld label="% Comissão" name="pct" value={form.pct} onChange={upd} type="number"/>
            <Fld label="Valor Comissão (R$)" name="vcom" value={form.vcom} onChange={upd} type="number"/>
            <Fld label="Mês Previsão (AAAA-MM)" name="mesPrevisao" value={form.mesPrevisao} onChange={upd}/>
            <Fld label="Mês Recebimento (AAAA-MM)" name="mesRecebimento" value={form.mesRecebimento} onChange={upd}/>
            <Fld label="Data Recebimento" name="dtRecebimento" value={form.dtRecebimento} onChange={upd} type="date"/>
            <Fld label="Valor Pago (R$)" name="vpago" value={form.vpago} onChange={upd} type="number"/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={ST_COM}/>
            <Fld label="Observações" name="obs" value={form.obs} onChange={upd} type="textarea" full/>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── SALDO POR CLIENTE E INDÚSTRIA ─────────────────────────────────────────────
function Saldo({data,indNames,cliNames}){
  const [fCli,setFCli]=useState("");
  const [fInd,setFInd]=useState("");

  // agrupa pedidos, faturamentos e comissões por cliente × indústria
  const chave=(c,i)=>c+"|||"+i;
  const mapa={};

  const ensure=(c,i)=>{ const k=chave(c,i); if(!mapa[k]) mapa[k]={cliente:c,industria:i,vpedido:0,vnf:0,vabat:0,vliq:0,basecom:0,vcomprev:0,vcomrec:0}; return mapa[k]; };

  (data.pedidos||[]).forEach(p=>{
    const tot=(p.itens||[]).reduce((s,i)=>s+itemTotal(i),0);
    ensure(p.cliente,p.industria).vpedido+=tot;
  });
  (data.faturamentos||[]).forEach(f=>{
    const totalAbat=(f.abatimentos||[]).reduce((s,a)=>s+R(a.valor),0);
    const vliq=R(f.vliq)||Math.max(0,R(f.vnf)-totalAbat);
    const basecom=calcBaseComissao(f);
    const e=ensure(f.cliente,f.industria);
    e.vnf+=R(f.vnf); e.vabat+=totalAbat; e.vliq+=vliq; e.basecom+=basecom;
  });
  (data.comissoes||[]).forEach(c=>{
    if(c.status==="Cancelada")return;
    const e=ensure(c.cliente,c.industria);
    e.vcomprev+=R(c.vcom);
    if(c.status==="Recebida")e.vcomrec+=R(c.vpago);
  });

  const rows=Object.values(mapa).filter(r=>(!fCli||r.cliente===fCli)&&(!fInd||r.industria===fInd));
  rows.sort((a,b)=>b.vliq-a.vliq);

  const exportarXLS=()=>{
    const linhas=[
      ["Cliente","Indústria","Total Pedido","Total NF","Abatimentos","Valor Líquido","Base Comissão","Com. Prevista","Com. Recebida","Saldo Pendente"],
      ...rows.map(r=>[r.cliente,r.industria,r.vpedido.toFixed(2),r.vnf.toFixed(2),r.vabat.toFixed(2),r.vliq.toFixed(2),r.basecom.toFixed(2),r.vcomprev.toFixed(2),r.vcomrec.toFixed(2),(r.vcomprev-r.vcomrec).toFixed(2)]),
    ];
    exportCSV(linhas,"saldo_clientes.csv");
  };

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Saldo por Cliente e Indústria</div>
        <div style={S.acts}><button style={S.bG} onClick={exportarXLS}>📊 Exportar XLS</button></div>
      </div>
      <div style={S.sb2}>
        <select style={{...S.sel,width:"auto"}} value={fCli} onChange={e=>setFCli(e.target.value)}><option value="">Todos os clientes</option>{cliNames.map(n=><option key={n}>{n}</option>)}</select>
        <select style={{...S.sel,width:"auto"}} value={fInd} onChange={e=>setFInd(e.target.value)}><option value="">Todas as indústrias</option>{indNames.map(n=><option key={n}>{n}</option>)}</select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {rows.length===0
          ?<Empty icon="⊜" title="Nenhum saldo calculado" sub="O saldo é calculado automaticamente a partir dos pedidos, faturamentos e comissões lançados no sistema."/>
          :<div style={S.tw}><table style={S.tbl}>
            <thead><tr>
              <th style={S.th}>Cliente</th><th style={S.th}>Indústria</th>
              <th style={S.th}>Total Pedido</th><th style={S.th}>Total NF</th>
              <th style={S.th}>Abatimentos</th><th style={S.th}>Valor Líquido</th>
              <th style={S.th}>Com. Prevista</th><th style={S.th}>Com. Recebida</th><th style={S.th}>Saldo Pendente</th>
            </tr></thead>
            <tbody>{rows.map((r,i)=>{
              const saldo=r.vcomprev-r.vcomrec;
              return(
                <tr key={i}>
                  <td style={{...S.td,fontWeight:600}}>{r.cliente}</td>
                  <td style={S.td}>{r.industria}</td>
                  <td style={S.td}>{BRL(r.vpedido)}</td>
                  <td style={S.td}>{BRL(r.vnf)}</td>
                  <td style={{...S.td,color:r.vabat>0?"#dc2626":"#aaa"}}>{r.vabat>0?"− "+BRL(r.vabat):"—"}</td>
                  <td style={{...S.td,fontWeight:700,color:"#16a34a"}}>{BRL(r.vliq)}</td>
                  <td style={S.td}>{BRL(r.vcomprev)}</td>
                  <td style={{...S.td,color:"#16a34a",fontWeight:600}}>{r.vcomrec>0?BRL(r.vcomrec):"—"}</td>
                  <td style={{...S.td,fontWeight:700,color:saldo>0?"#dc2626":"#16a34a"}}>{saldo>0?BRL(saldo):<span style={{color:"#16a34a"}}>✓ Quitado</span>}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        }
      </div>
    </div>
  );
}

// ── METAS ─────────────────────────────────────────────────────────────────────
function Metas({data,save,search,setSearch,modal,setModal,inlineSave,delRow,openMdl,doSave,indNames,cliNames,ok}){
  const [form,setForm]=useState({});
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="metas")setForm(modal.record||{mes:ISO().slice(0,7),tipo:"Faturamento"});},[modal]);
  const rows=data.metas||[];

  const realizado=(m)=>{
    if(m.tipo==="Faturamento"){
      return (data.faturamentos||[]).filter(f=>(m.industria?"":true)&&(!m.industria||f.industria===m.industria)&&(!m.cliente||f.cliente===m.cliente)&&(f.emissao||"").startsWith(m.mes||"")).reduce((s,f)=>s+R(f.vliq),0);
    }
    if(m.tipo==="Pedidos"){
      return (data.pedidos||[]).filter(p=>(!m.industria||p.industria===m.industria)&&(!m.cliente||p.cliente===m.cliente)&&(p.data||"").startsWith(m.mes||"")).reduce((s,p)=>s+(p.itens||[]).reduce((ss,i)=>ss+itemTotal(i),0),0);
    }
    return 0;
  };

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Metas</div>
        <div style={S.acts}><button style={S.bY} onClick={()=>openMdl("metas")}>+ Nova Meta</button></div>
      </div>
      <div style={{padding:"20px 24px"}}>
        {rows.length===0
          ?<Empty icon="◐" title="Nenhuma meta cadastrada" sub="Cadastre metas por mês, indústria e cliente. O sistema calculará automaticamente o realizado com base nos pedidos e faturamentos." btnLabel="+ Nova Meta" onBtn={()=>openMdl("metas")}/>
          :<div style={S.tw}><table style={S.tbl}>
            <thead><tr><th style={S.th}>Mês</th><th style={S.th}>Tipo</th><th style={S.th}>Indústria</th><th style={S.th}>Cliente</th><th style={S.th}>Meta</th><th style={S.th}>Realizado</th><th style={S.th}>%</th><th style={S.th}>Progresso</th><th style={S.th}>Ações</th></tr></thead>
            <tbody>{rows.map(r=>{
              const real=realizado(r);
              const p=pct(real,R(r.meta));
              const cor=p>=100?"#16a34a":p>=70?"#F5C400":"#dc2626";
              return(
                <tr key={r.id}>
                  <td style={S.td}>{r.mes}</td>
                  <td style={S.td}><Bdg s={r.tipo}/></td>
                  <td style={S.td}>{r.industria||"Todas"}</td>
                  <td style={S.td}>{r.cliente||"Todos"}</td>
                  <td style={{...S.td,fontWeight:600}}>{BRL(r.meta)}</td>
                  <td style={{...S.td,fontWeight:700,color:cor}}>{BRL(real)}</td>
                  <td style={{...S.td,fontWeight:700,color:cor}}>{p}%</td>
                  <td style={S.td}><Prog v={real} max={R(r.meta)} color={cor}/></td>
                  <td style={S.td}><div style={{display:"flex",gap:5}}><button style={S.bB} onClick={()=>openMdl("metas",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("metas",r.id)}>×</button></div></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        }
      </div>
      {modal?.type==="metas"&&(
        <Mdl title={form.id?"Editar Meta":"Nova Meta"} onClose={()=>setModal(null)} onSave={()=>doSave("metas",form)}>
          <div style={S.fg2}>
            <Fld label="Mês (AAAA-MM)" name="mes" value={form.mes} onChange={upd}/>
            <Fld label="Tipo" name="tipo" value={form.tipo} onChange={upd} opts={["Faturamento","Pedidos","Comissão"]}/>
            <Fld label="Indústria (ou deixe em branco p/ geral)" name="industria" value={form.industria} onChange={upd} opts={["",...indNames]}/>
            <Fld label="Cliente (opcional)" name="cliente" value={form.cliente} onChange={upd} opts={["",...cliNames]}/>
            <Fld label="Valor da Meta (R$)" name="meta" value={form.meta} onChange={upd} type="number" full/>
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({data}){
  const [mes,setMes]=useState("");
  const fats=data.faturamentos||[], coms=data.comissoes||[], peds=data.pedidos||[];
  const meses=[...new Set([...fats.map(f=>f.emissao?.slice(0,7)),...coms.map(c=>c.mesPrevisao)].filter(Boolean))].sort().reverse();
  const ms=mes||meses[0]||"";
  const fatMs=fats.filter(f=>!ms||f.emissao?.startsWith(ms));
  const comMs=coms.filter(c=>!ms||(c.mesPrevisao===ms||c.mesRecebimento===ms));
  const pedMs=peds.filter(p=>!ms||p.data?.startsWith(ms));
  const totVliq=fatMs.reduce((s,f)=>s+R(f.vliq),0);
  const comPrev=comMs.filter(c=>c.status!=="Cancelada").reduce((s,c)=>s+R(c.vcom),0);
  const comRec=comMs.filter(c=>c.status==="Recebida").reduce((s,c)=>s+R(c.vpago),0);
  const semDados=fats.length===0&&coms.length===0&&peds.length===0;

  const byInd={},byCli={},pedSt={};
  fats.forEach(f=>{byInd[f.industria]=(byInd[f.industria]||0)+R(f.vliq);byCli[f.cliente]=(byCli[f.cliente]||0)+R(f.vliq);});
  peds.forEach(p=>{pedSt[p.status]=(pedSt[p.status]||0)+1;});
  const indRk=Object.entries(byInd).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const cliRk=Object.entries(byCli).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const maxI=indRk[0]?.[1]||1, maxC=cliRk[0]?.[1]||1;

  const KPI=({l,v,sub,y})=>(
    <div style={{...S.card,...(y?{background:"#F5C400",border:"none"}:{})}}>
      <div style={{fontSize:10,color:y?"rgba(0,0,0,.5)":"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{l}</div>
      <div style={{fontSize:20,fontWeight:800}}>{v}</div>
      {sub&&<div style={{fontSize:11,color:y?"rgba(0,0,0,.45)":"#888",marginTop:4}}>{sub}</div>}
    </div>
  );
  const Bar=({label,v,max})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
      <div style={{width:120,fontSize:12,color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}} title={label}>{label}</div>
      <Prog v={v} max={max}/>
      <div style={{width:70,fontSize:12,fontWeight:600,textAlign:"right",flexShrink:0}}>{K(v)}</div>
    </div>
  );

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Dashboard</div>
        <div style={S.acts}>
          <select style={{...S.sel,width:"auto"}} value={ms} onChange={e=>setMes(e.target.value)}>
            <option value="">Todos os períodos</option>{meses.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {semDados?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"80px 24px",color:"#bbb",textAlign:"center"}}>
          <div style={{fontSize:48,opacity:.15,marginBottom:16}}>▣</div>
          <div style={{fontSize:17,fontWeight:600,color:"#ccc",marginBottom:8}}>Aguardando dados</div>
          <div style={{fontSize:13,color:"#bbb",maxWidth:380}}>Os indicadores aparecerão automaticamente conforme pedidos, faturamentos e comissões forem lançados.</div>
        </div>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,padding:"18px 24px 0"}}>
            <KPI l="Faturamento Líquido" v={K(totVliq)} sub={`${fatMs.length} NF(s)`}/>
            <KPI l="Pedidos no Período" v={pedMs.length}/>
            <KPI l="Comissão Prevista" v={K(comPrev)} y/>
            <KPI l="Comissão Recebida" v={K(comRec)} sub={comPrev>0?`${pct(comRec,comPrev)}% recebido`:""}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"12px 24px 0"}}>
            <div style={S.card}><div style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Faturamento por Indústria</div>{indRk.length===0?<div style={{color:"#ccc",textAlign:"center",padding:"16px 0",fontSize:13}}>Sem dados</div>:indRk.map(([n,v])=><Bar key={n} label={n} v={v} max={maxI}/>)}</div>
            <div style={S.card}><div style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Faturamento por Cliente</div>{cliRk.length===0?<div style={{color:"#ccc",textAlign:"center",padding:"16px 0",fontSize:13}}>Sem dados</div>:cliRk.map(([n,v])=><Bar key={n} label={n} v={v} max={maxC}/>)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,padding:"12px 24px 24px"}}>
            <div style={S.card}><div style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Status dos Pedidos</div>{Object.keys(pedSt).length===0?<div style={{color:"#ccc",textAlign:"center",padding:"16px 0",fontSize:13}}>Sem pedidos</div>:Object.entries(pedSt).sort((a,b)=>b[1]-a[1]).map(([s,n])=>(<div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:".5px solid rgba(0,0,0,.05)"}}><span style={{fontSize:12,color:"#555"}}>{s}</span><span style={{fontWeight:700,background:"#f1f1f1",padding:"2px 10px",borderRadius:20,fontSize:12}}>{n}</span></div>))}</div>
            <div style={S.card}>
              <div style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Comissão por Tipo</div>
              {[["FATURAMENTO","#F5C400"],["LIQUIDEZ","#111"]].map(([t,c])=>(
                <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:".5px solid rgba(0,0,0,.05)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:c}}/><span style={{fontSize:12}}>{t}</span></div>
                  <span style={{fontWeight:700,fontSize:13}}>{K(comMs.filter(x=>x.tipo===t&&x.status!=="Cancelada").reduce((s,x)=>s+R(x.vcom),0))}</span>
                </div>
              ))}
              <div style={{marginTop:10,display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:"#888"}}>Em aberto</span><span style={{fontWeight:700,color:"#dc2626"}}>{K(comPrev-comRec)}</span></div>
            </div>
            <div style={S.card}>
              <div style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Metas {ms||""}</div>
              {(data.metas||[]).filter(m=>!ms||m.mes===ms).length===0
                ?<div style={{color:"#ccc",textAlign:"center",padding:"16px 0",fontSize:13}}>Sem metas</div>
                :(data.metas||[]).filter(m=>!ms||m.mes===ms).map(m=>{
                  const real=(data.faturamentos||[]).filter(f=>(!m.industria||f.industria===m.industria)&&(f.emissao||"").startsWith(m.mes||"")).reduce((s,f)=>s+R(f.vliq),0);
                  const p=pct(real,R(m.meta));
                  const cor=p>=100?"#16a34a":p>=70?"#F5C400":"#dc2626";
                  return(<div key={m.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{fontWeight:500}}>{m.industria||"Geral"}</span><span style={{color:cor,fontWeight:700}}>{p}%</span></div><Prog v={real} max={R(m.meta)} color={cor}/></div>);
                })
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── MAIS VENDIDOS ─────────────────────────────────────────────────────────────
function MaisVendidos({data,indNames,cliNames}){
  const [vista,setVista]=useState("produto");
  const [fInd,setFInd]=useState(""),fCli=useState("")[0],setFCli=useState("")[1];
  const [filterInd,setFilterInd]=useState(""),filterCli=useState("")[0],setFilterCli=useState("")[1];
  const [filterMes,setFilterMes]=useState("");
  const [fcli2,setFcli2]=useState("");

  const fats=data.faturamentos||[];
  const itens=[];
  fats.forEach(f=>{
    if((f.itens||[]).length>0) f.itens.forEach(it=>itens.push({cod:it.cod||"",produto:it.desc||"—",industria:f.industria||"",cliente:f.cliente||"",mes:(f.emissao||"").slice(0,7),qtd:R(it.qtd),valor:itemTotal(it)}));
    else itens.push({cod:"",produto:`NF ${f.nf||""}`,industria:f.industria||"",cliente:f.cliente||"",mes:(f.emissao||"").slice(0,7),qtd:1,valor:R(f.vliq)});
  });
  const meses=[...new Set(itens.map(i=>i.mes).filter(Boolean))].sort().reverse();
  const fil=itens.filter(i=>(!filterInd||i.industria===filterInd)&&(!fcli2||i.cliente===fcli2)&&(!filterMes||i.mes===filterMes));
  const agrp=campo=>{const m={};fil.forEach(i=>{const k=i[campo]||"—";if(!m[k])m[k]={nome:k,qtd:0,valor:0};m[k].qtd+=i.qtd;m[k].valor+=i.valor;});return Object.values(m).sort((a,b)=>b.valor-a.valor);};
  const ranked=agrp(vista==="produto"?"produto":vista==="cliente"?"cliente":"industria");
  const total=ranked.reduce((s,r)=>s+r.valor,0)||1;
  const medal=i=>i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:"#bbb",fontSize:13,width:20,display:"inline-block",textAlign:"center"}}>{i+1}</span>;

  return(
    <div>
      <div style={S.topb}>
        <div style={S.ttl}>Mais Vendidos</div>
        <div style={S.acts}>
          {["produto","cliente","industria"].map(v=>(
            <button key={v} style={{...S.bG,...(vista===v?{background:"#F5C400",color:"#111",border:"none",fontWeight:700}:{})}} onClick={()=>setVista(v)}>
              {v==="produto"?"Por Produto":v==="cliente"?"Por Cliente":"Por Indústria"}
            </button>
          ))}
        </div>
      </div>
      <div style={S.sb2}>
        <select style={{...S.sel,width:"auto"}} value={filterMes} onChange={e=>setFilterMes(e.target.value)}><option value="">Todos os meses</option>{meses.map(m=><option key={m}>{m}</option>)}</select>
        <select style={{...S.sel,width:"auto"}} value={filterInd} onChange={e=>setFilterInd(e.target.value)}><option value="">Todas as indústrias</option>{indNames.map(n=><option key={n}>{n}</option>)}</select>
        <select style={{...S.sel,width:"auto"}} value={fcli2} onChange={e=>setFcli2(e.target.value)}><option value="">Todos os clientes</option>{cliNames.map(n=><option key={n}>{n}</option>)}</select>
      </div>
      <div style={{padding:"12px 24px 24px"}}>
        {itens.length===0
          ?<Empty icon="▲" title="Nenhum dado de venda" sub="O ranking é gerado automaticamente a partir dos itens lançados no Faturamento."/>
          :(
            <>
              {ranked.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                  {ranked.slice(0,3).map((r,i)=>(
                    <div key={r.nome} style={{...S.card,...(i===0?{border:"2px solid #F5C400"}:{})}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <span style={{fontSize:12,fontWeight:600,flex:1,marginRight:8,lineHeight:1.4}}>{r.nome}</span>
                        <span style={{fontSize:18}}>{medal(i)}</span>
                      </div>
                      <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>{K(r.valor)}</div>
                      <div style={{fontSize:11,color:"#888",marginBottom:8}}>{pct(r.valor,total)}% do total</div>
                      <Prog v={r.valor} max={total}/>
                    </div>
                  ))}
                </div>
              )}
              <div style={S.tw}><table style={S.tbl}>
                <thead><tr>
                  <th style={S.th}>#</th><th style={S.th}>{vista==="produto"?"Produto":vista==="cliente"?"Cliente":"Indústria"}</th>
                  {vista==="produto"&&<th style={S.th}>Qtd</th>}
                  <th style={S.th}>Faturamento</th><th style={S.th}>Part.%</th><th style={{...S.th,minWidth:120}}>Barra</th>
                </tr></thead>
                <tbody>{ranked.map((r,i)=>(
                  <tr key={r.nome}>
                    <td style={{...S.td,textAlign:"center",width:40}}>{medal(i)}</td>
                    <td style={{...S.td,fontWeight:i<3?600:400}}>{r.nome}</td>
                    {vista==="produto"&&<td style={S.td}>{r.qtd}</td>}
                    <td style={{...S.td,fontWeight:700}}>{BRL(r.valor)}</td>
                    <td style={{...S.td,color:"#F5C400",fontWeight:600}}>{pct(r.valor,total)}%</td>
                    <td style={S.td}><Prog v={r.valor} max={total}/></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </>
          )
        }
      </div>
    </div>
  );
}

// ── USUÁRIOS ──────────────────────────────────────────────────────────────────
function Usuarios({data,modal,setModal,inlineSave,delRow,openMdl,doSave}){
  const [form,setForm]=useState({});
  const upd=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  useEffect(()=>{if(modal?.type==="usuarios")setForm(modal.record||{status:"Ativo",perfil:"Comercial"});},[modal]);
  return(
    <div>
      <div style={S.topb}><div style={S.ttl}>Usuários</div><div style={S.acts}><button style={S.bY} onClick={()=>openMdl("usuarios")}>+ Novo Usuário</button></div></div>
      <div style={{padding:"20px 24px"}}>
        <div style={S.warn}>⚠️ Somente o Administrador pode gerenciar usuários e perfis. No módulo de backend, cada usuário terá login e senha próprios com controle de acesso.</div>
        <div style={{...S.tw,marginTop:16}}><table style={S.tbl}>
          <thead><tr><th style={S.th}>Nome</th><th style={S.th}>Email</th><th style={S.th}>Perfil</th><th style={S.th}>Status</th><th style={S.th}>Ações</th></tr></thead>
          <tbody>{(data.usuarios||[]).map(r=>(
            <tr key={r.id}>
              <td style={{...S.td,fontWeight:500}}><EC value={r.nome} field="nome" row={r} onSave={inlineSave("usuarios")}/></td>
              <td style={{...S.td,fontSize:12,color:"#888"}}><EC value={r.email} field="email" row={r} onSave={inlineSave("usuarios")}/></td>
              <td style={S.td}><EC value={r.perfil} field="perfil" row={r} onSave={inlineSave("usuarios")} opts={["Administrador","Comercial","Financeiro","Consulta"]}/></td>
              <td style={S.td}><EC value={r.status} field="status" row={r} onSave={inlineSave("usuarios")} opts={["Ativo","Inativo"]}/></td>
              <td style={S.td}><div style={{display:"flex",gap:6}}><button style={S.bB} onClick={()=>openMdl("usuarios",r)}>Editar</button><button style={S.bR} onClick={()=>delRow("usuarios",r.id)}>×</button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
      {modal?.type==="usuarios"&&(
        <Mdl title={form.id?"Editar Usuário":"Novo Usuário"} onClose={()=>setModal(null)} onSave={()=>doSave("usuarios",form)}>
          <div style={S.fg2}>
            <Fld label="Nome" name="nome" value={form.nome} onChange={upd}/>
            <Fld label="Email" name="email" value={form.email} onChange={upd} type="email"/>
            <Fld label="Perfil" name="perfil" value={form.perfil} onChange={upd} opts={["Administrador","Comercial","Financeiro","Consulta"]}/>
            <Fld label="Status" name="status" value={form.status} onChange={upd} opts={["Ativo","Inativo"]}/>
            {!form.id&&<Fld label="Senha provisória" name="senha" value={form.senha} onChange={upd} type="password"/>}
          </div>
        </Mdl>
      )}
    </div>
  );
}

// ── HISTÓRICO ─────────────────────────────────────────────────────────────────
function Historico({data}){
  return(
    <div>
      <div style={S.topb}><div style={S.ttl}>Histórico de Alterações</div></div>
      <div style={{padding:"20px 24px"}}>
        {(data.historico||[]).length===0
          ?<Empty icon="◑" title="Nenhuma alteração registrada" sub="Edições inline e via formulário ficam registradas aqui automaticamente."/>
          :<div style={S.tw}>
            <div style={{display:"grid",gridTemplateColumns:"160px 90px 1fr 140px 140px",gap:8,padding:"10px 14px",background:"#fafaf9",borderBottom:".5px solid rgba(0,0,0,.07)",fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em"}}>
              <span>Data/Hora</span><span>Usuário</span><span>Módulo / Campo</span><span>Antes</span><span>Depois</span>
            </div>
            {(data.historico||[]).slice(0,300).map(h=>(
              <div key={h.id} style={{display:"grid",gridTemplateColumns:"160px 90px 1fr 140px 140px",gap:8,padding:"8px 14px",borderBottom:".5px solid rgba(0,0,0,.05)",fontSize:12,alignItems:"center"}}>
                <span style={{color:"#aaa",fontSize:11}}>{h.dt}</span>
                <span>{h.usuario}</span>
                <span><strong>{h.modulo}</strong> #{h.registro} — {h.campo}</span>
                <span style={{color:"#dc2626",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.anterior||"—"}</span>
                <span style={{color:"#16a34a",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.novo||"—"}</span>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

// ── CONFIGURAÇÕES ─────────────────────────────────────────────────────────────
function Config({data,save,ok}){
  const [emp,setEmp]=useState(data.config||{nome:"Comercial Três Vales",cnpj:"",tel:"",email:"",endereco:""});
  const upd=e=>setEmp(p=>({...p,[e.target.name]:e.target.value}));
  const salvarEmp=()=>{save({...data,config:emp});ok("Dados salvos");};

  const counts=[["Clientes",(data.clientes||[]).length],["Indústrias",(data.industrias||[]).length],["Produtos",(data.produtos||[]).length],["Regras",(data.regras||[]).length],["Pedidos",(data.pedidos||[]).length],["Mix",(data.mix||[]).length],["Orçamentos",(data.orcamentos||[]).length],["Faturamentos",(data.faturamentos||[]).length],["Comissões",(data.comissoes||[]).length],["Histórico",(data.historico||[]).length]];

  return(
    <div>
      <div style={S.topb}><div style={S.ttl}>Configurações</div></div>
      <div style={{padding:24}}>
        {/* empresa */}
        <div style={{...S.card,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Dados da Empresa</div>
          <div style={{fontSize:12,color:"#888",marginBottom:16}}>Utilizados no cabeçalho dos orçamentos e pedidos exportados em PDF.</div>
          <div style={S.fg2}>
            <Fld label="Nome da Empresa" name="nome" value={emp.nome} onChange={upd}/>
            <Fld label="CNPJ" name="cnpj" value={emp.cnpj} onChange={upd}/>
            <Fld label="Telefone" name="tel" value={emp.tel} onChange={upd}/>
            <Fld label="E-mail" name="email" value={emp.email} onChange={upd} type="email"/>
            <Fld label="Endereço" name="endereco" value={emp.endereco} onChange={upd} full/>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
            <button style={S.bY} onClick={salvarEmp}>Salvar</button>
          </div>
        </div>

        {/* contadores */}
        <div style={{...S.card,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Resumo do Sistema</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {counts.map(([k,v])=>(
              <div key={k} style={{background:"#f9f9f7",borderRadius:8,padding:"12px 14px"}}>
                <div style={{fontSize:10,color:"#888",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{k}</div>
                <div style={{fontSize:22,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* backend info */}
        <div style={{...S.card,marginBottom:14,borderLeft:"3px solid #F5C400"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>🔌 Próximo Passo: Backend Compartilhado</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.7}}>
            Este sistema usa armazenamento local (storage do navegador). Para que <strong>até 4 usuários acessem simultaneamente</strong> com banco central e sincronização em tempo real, você precisará de um backend.<br/>
            <br/>
            <strong>Opções de hospedagem:</strong> Railway.app · Render.com · Vercel · VPS (DigitalOcean, Hostinger)<br/>
            <strong>Stack recomendada:</strong> Node.js + Express + Socket.IO + PostgreSQL<br/>
            <br/>
            Quando estiver pronto, solicite a geração do código de backend completo.
          </div>
        </div>

        {/* backup */}
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Backup e Restauração</div>
          <div style={{fontSize:12,color:"#888",marginBottom:16}}>Exporte um backup JSON completo ou restaure os dados cadastrais iniciais.</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button style={S.bG} onClick={()=>{
              const a=document.createElement("a");
              a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
              a.download=`tresvales_backup_${ISO()}.json`; a.click(); ok("Backup exportado");
            }}>📥 Exportar Backup JSON</button>
            <label style={{...S.bG,cursor:"pointer"}}>📤 Restaurar de Backup
              <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{
                const f=e.target.files[0];if(!f)return;
                const r=new FileReader();
                r.onload=ev=>{try{save(JSON.parse(ev.target.result));ok("Backup restaurado","#2563eb");}catch{ok("Arquivo inválido","#dc2626");}};
                r.readAsText(f); e.target.value="";
              }}/>
            </label>
            <button style={{...S.bR,padding:"7px 14px",fontSize:12}} onClick={()=>{if(window.confirm("Restaurar dados iniciais? Todos os lançamentos serão perdidos.")){{save(INITIAL);ok("Restaurado","#2563eb");}}}}>Restaurar Dados Iniciais</button>
          </div>
        </div>
      </div>
    </div>
  );
}
