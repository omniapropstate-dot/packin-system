import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase.js";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const C = {
  bg:"#0f0a0d",sb:"#160d13",card:"#1e1118",cb:"#3d2535",cb2:"#5a3548",
  ac:"#e8607a",ac2:"#d4537e",gr:"#52c4a0",re:"#f87171",am:"#fbbf24",
  bl:"#60a5fa",pu:"#c084fc",tx:"#fce8f0",mu:"#9a7080",wh:"#fff5f8",
};
const ESTADOS=["cotizacion","confirmado","produccion","listo","entregado"];
const ESTADOS_LABEL=["💬 Cotización","✅ Confirmado","🔧 Producción","🎁 Listo","📬 Entregado"];
const ESTADOS_COLOR=["#c084fc","#60a5fa","#fbbf24","#f4956a","#52c4a0"];
const MESES=["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MESES_L=["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const NAV=[{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"pedidos",label:"Pedidos",icon:"📦"},{id:"clientes",label:"Clientes",icon:"👥"},{id:"finanzas",label:"Finanzas",icon:"💰"},{id:"cotizador",label:"Cotizador",icon:"🧮"},{id:"materiales",label:"Materiales",icon:"🎨"}];
const PIE_COLORS=[C.ac,C.bl,C.am,C.pu,C.gr,"#fb923c","#34d399","#f472b6"];

const css=`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.tx};-webkit-font-smoothing:antialiased}
input,select,textarea{font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.cb2};border-radius:4px}
.app-shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.sidebar{width:200px;background:${C.sb};border-right:1px solid ${C.cb};display:flex;flex-direction:column;padding:16px 10px;flex-shrink:0;height:100vh;overflow-y:auto}
.app-body{display:flex;flex:1;overflow:hidden}
.main-content{flex:1;overflow-y:auto;padding:24px 24px}
.mobile-header{display:none}.bottom-nav{display:none}
@media(max-width:768px){
  .mobile-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:${C.sb};border-bottom:1px solid ${C.cb};flex-shrink:0}
  .sidebar{display:none!important}.main-content{padding:12px 12px 88px}
  .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:200;background:${C.sb};border-top:1px solid ${C.cb};padding:6px 0 10px}
  .bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 2px;cursor:pointer;border:none;background:none}
  .bottom-nav-item .nav-icon{font-size:20px}.bottom-nav-item .nav-label{font-size:10px;font-weight:500;color:${C.mu}}
  .bottom-nav-item.active .nav-label{color:${C.ac}}
  .g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr 1fr!important}.g4{grid-template-columns:1fr 1fr!important}
  .hide-mobile{display:none!important}
}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:${C.mu};transition:all 0.15s;margin-bottom:2px}
.nav-item:hover{background:rgba(232,96,122,0.06);color:${C.tx}}.nav-item.active{background:rgba(232,96,122,0.1);color:${C.ac}}
.btn{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all 0.15s;display:inline-flex;align-items:center;gap:6px}
.btn:hover{opacity:0.85}.btn:disabled{opacity:0.4;cursor:not-allowed}
.btn-sm{padding:5px 11px;font-size:12px}
.btn-primary{background:${C.ac};color:white;font-weight:600}.btn-secondary{background:${C.cb};color:${C.tx}}
.btn-ghost{background:transparent;color:${C.mu};border:1px solid ${C.cb}}.btn-ghost:hover{border-color:${C.cb2};color:${C.tx}}
.btn-success{background:rgba(82,196,160,0.1);color:${C.gr};border:1px solid rgba(82,196,160,0.2)}
.btn-danger{background:rgba(248,113,113,0.08);color:${C.re};border:1px solid rgba(248,113,113,0.15)}
.form-group{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
.form-label{font-size:10px;color:${C.mu};font-weight:600;text-transform:uppercase;letter-spacing:0.6px}
.form-input{background:${C.bg};border:1px solid ${C.cb};border-radius:8px;padding:9px 12px;color:${C.tx};font-size:13px;outline:none;transition:border-color 0.15s;width:100%}
.form-input:focus{border-color:${C.ac2}}
.card{background:${C.card};border:1px solid ${C.cb};border-radius:14px;padding:18px 20px}
.card-sm{background:${C.card};border:1px solid ${C.cb};border-radius:10px;padding:14px 16px}
.table-wrapper{overflow-x:auto;background:${C.card};border-radius:12px;border:1px solid ${C.cb}}
.data-table{width:100%;border-collapse:collapse}
.data-table th{font-size:10px;text-transform:uppercase;letter-spacing:0.7px;color:${C.mu};padding:11px 14px;text-align:left;font-weight:600;border-bottom:1px solid ${C.cb};white-space:nowrap}
.data-table td{padding:11px 14px;font-size:13px;border-bottom:1px solid rgba(61,37,53,0.7)}
.data-table tr:last-child td{border-bottom:none}.table-row:hover{background:rgba(232,96,122,0.02)}
.badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.modal-box{background:${C.card};border:1px solid ${C.cb};border-radius:16px;padding:26px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto}
.toast{position:fixed;top:20px;right:20px;background:${C.card};border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;z-index:2000;box-shadow:0 4px 24px rgba(0,0,0,0.6);border:1px solid ${C.cb};font-size:13px;max-width:320px;animation:slideIn 0.25s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.login-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${C.bg};padding:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.gkpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.section-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:${C.wh};letter-spacing:-0.3px}
.section-sub{color:${C.mu};font-size:13px;margin-top:3px}
.tab-bar{display:flex;gap:4px;background:${C.card};border-radius:10px;padding:4px;border:1px solid ${C.cb};margin-bottom:16px;flex-wrap:wrap}
.tab-btn{flex:1;padding:7px;border-radius:7px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;white-space:nowrap;font-family:'DM Sans',sans-serif}
.progress-bar{background:${C.bg};border-radius:4px;height:6px;overflow:hidden}
.progress-fill{height:100%;border-radius:4px;transition:width 0.5s ease}
.period-selector{display:flex;align-items:center;gap:8px;background:${C.card};border:1px solid ${C.cb};border-radius:10px;padding:6px 10px}
.period-selector select{background:transparent;border:none;color:${C.tx};font-size:13px;outline:none;cursor:pointer;font-family:'DM Sans',sans-serif}
.trend-up{color:#52c4a0;font-size:11px;font-weight:600}
.trend-down{color:#f87171;font-size:11px;font-weight:600}
.trend-neutral{color:#9a7080;font-size:11px}
.chart-card{background:${C.card};border:1px solid ${C.cb};border-radius:14px;padding:18px 20px;margin-bottom:14px}
.chart-title{font-size:13px;font-weight:600;color:${C.wh};margin-bottom:2px}
.chart-sub{font-size:11px;color:${C.mu};margin-bottom:16px}
`;

const hoy=()=>new Date().toISOString().split("T")[0];
const fmt=(n)=>Number(n||0).toLocaleString("es-BO");
const fmtF=(f)=>f?new Date(f+"T12:00:00").toLocaleDateString("es-BO",{day:"2-digit",month:"short",year:"numeric"}):"—";
const diff=(f)=>f?Math.round((new Date(f+"T12:00:00")-new Date())/86400000):null;

const getBadge=(t)=>{
  const m={cotizacion:{bg:"rgba(192,132,252,0.12)",c:"#c084fc"},confirmado:{bg:"rgba(96,165,250,0.12)",c:"#60a5fa"},produccion:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},listo:{bg:"rgba(244,149,106,0.12)",c:"#f4956a"},entregado:{bg:"rgba(82,196,160,0.12)",c:"#52c4a0"},pagado:{bg:"rgba(82,196,160,0.12)",c:"#52c4a0"},pendiente:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"}};
  return m[t]||{bg:"rgba(154,112,128,0.12)",c:"#9a7080"};
};
const Badge=({type,label})=>{const s=getBadge(type);return <span className="badge" style={{background:s.bg,color:s.c}}>{label||type||"—"}</span>;};

const CustomTooltip=({active,payload,label,prefix="Bs. "})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:C.card,border:`1px solid ${C.cb2}`,borderRadius:10,padding:"10px 14px",fontSize:12}}>
    <p style={{color:C.mu,marginBottom:6,fontSize:11}}>{label}</p>
    {payload.map((p,i)=><p key={i} style={{color:p.color,fontWeight:600}}>{p.name}: {prefix}{fmt(p.value)}</p>)}
  </div>);
};

const KPI=({label,value,color,sub,icon,trend,trendLabel})=>(
  <div className="card-sm" style={{position:"relative",overflow:"hidden"}}>
    {icon&&<div style={{position:"absolute",top:10,right:14,fontSize:22,opacity:0.1}}>{icon}</div>}
    <p style={{fontSize:10,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6}}>{label}</p>
    <p style={{fontSize:22,fontWeight:800,color:color||C.wh,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.5px"}}>{value}</p>
    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
      {trend!=null&&<span className={trend>0?"trend-up":trend<0?"trend-down":"trend-neutral"}>{trend>0?"↑":trend<0?"↓":"→"} {Math.abs(trend).toFixed(1)}%</span>}
      {sub&&<p style={{fontSize:11,color:C.mu}}>{sub}</p>}
    </div>
  </div>
);

const Modal=({title,onClose,children,wide})=>(
  <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal-box" style={wide?{maxWidth:700}:{}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <p style={{fontSize:16,fontWeight:600,color:C.wh,fontFamily:"'Syne',sans-serif"}}>{title}</p>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Confirm=({msg,onOk,onCancel})=>(
  <div className="modal-overlay">
    <div className="modal-box" style={{maxWidth:360}}>
      <p style={{fontSize:15,color:C.wh,marginBottom:8,fontWeight:500}}>¿Confirmar?</p>
      <p style={{fontSize:13,color:C.mu,marginBottom:24}}>{msg}</p>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-danger btn-sm" onClick={onOk}>Confirmar</button>
      </div>
    </div>
  </div>
);

const Toast=({toast,onClose})=>{
  if(!toast)return null;
  const color=toast.type==="error"?C.re:toast.type==="warn"?C.am:C.gr;
  return(<div className="toast"><span style={{color,fontWeight:700}}>{toast.type==="error"?"✕":"✓"}</span><span>{toast.message}</span><button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:C.mu,cursor:"pointer"}}>✕</button></div>);
};

// Period selector component
const PeriodSelector=({mes,anio,onChange})=>{
  const now=new Date();
  const años=[2025,2026];
  return(
    <div className="period-selector">
      <span style={{fontSize:11,color:C.mu,textTransform:"uppercase",letterSpacing:"0.5px"}}>Período</span>
      <select value={mes} onChange={e=>onChange(Number(e.target.value),anio)}>
        {MESES_L.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
      </select>
      <select value={anio} onChange={e=>onChange(mes,Number(e.target.value))}>
        {años.map(a=><option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────────────
function Dashboard({pedidos,clientes,materiales,gastos}){
  const now=new Date();
  const [mes,setMes]=useState(now.getMonth()+1);
  const [anio,setAnio]=useState(now.getFullYear());

  const getPeriodoData=(m,a)=>{
    const desde=`${a}-${String(m).padStart(2,"0")}-01`;
    const hasta=`${a}-${String(m).padStart(2,"0")}-31`;
    const peds=pedidos.filter(p=>{const d=new Date(p.fecha_pedido);return d.getMonth()+1===m&&d.getFullYear()===a&&p.estado!=="cotizacion";});
    const anticipos=peds.reduce((acc,b)=>acc+Number(b.anticipo||0),0);
    const saldos=peds.filter(p=>p.saldo_cobrado).reduce((acc,b)=>acc+Number(b.precio_total||0)-Number(b.anticipo||0),0);
    const ingresos=anticipos+saldos;
    const gasts=gastos.filter(g=>g.fecha>=desde&&g.fecha<=hasta).reduce((acc,b)=>acc+Number(b.monto||0),0);
    return{ingresos,gastos:gasts,neto:ingresos-gasts,pedidos:peds.length};
  };

  const curr=getPeriodoData(mes,anio);
  const prevMes=mes===1?12:mes-1;
  const prevAnio=mes===1?anio-1:anio;
  const prev=getPeriodoData(prevMes,prevAnio);

  const trend=(curr,prev)=>prev>0?((curr-prev)/prev*100):null;

  // Últimos 12 meses para el gráfico de evolución
  const evolucion=useMemo(()=>{
    const data=[];
    for(let i=11;i>=0;i--){
      let m=mes-i,a=anio;
      while(m<=0){m+=12;a--;}
      while(m>12){m-=12;a++;}
      const d=getPeriodoData(m,a);
      data.push({label:`${MESES[m]} ${a}`,mes:m,anio:a,...d});
    }
    return data;
  },[pedidos,gastos,mes,anio]);

  // Por cobrar total
  const porCobrar=pedidos.filter(p=>p.estado!=="cotizacion"&&!p.saldo_cobrado).reduce((a,b)=>a+(Number(b.precio_total||0)-Number(b.anticipo||0)),0);

  // Activos
  const activos=pedidos.filter(p=>p.estado!=="entregado"&&p.estado!=="cotizacion");
  const vencidos=activos.filter(p=>{const d=diff(p.fecha_entrega);return d!==null&&d<0;});
  const enSemana=activos.filter(p=>{const d=diff(p.fecha_entrega);return d!==null&&d>=0&&d<=7;});

  // Distribución por estado
  const porEstado=ESTADOS.map((e,i)=>({name:ESTADOS_LABEL[i].split(" ")[1],value:pedidos.filter(p=>p.estado===e).length,color:ESTADOS_COLOR[i]})).filter(e=>e.value>0);

  // Top clientes del período
  const topClientes=useMemo(()=>{
    const pMes=pedidos.filter(p=>{const d=new Date(p.fecha_pedido);return d.getMonth()+1===mes&&d.getFullYear()===anio&&p.estado!=="cotizacion";});
    const map={};
    pMes.forEach(p=>{
      const cli=clientes.find(c=>c.id===p.cliente_id);
      const key=cli?.nombre||"Sin cliente";
      map[key]=(map[key]||0)+Number(p.precio_total||0);
    });
    return Object.entries(map).map(([nombre,total])=>({nombre,total})).sort((a,b)=>b.total-a.total).slice(0,6);
  },[pedidos,clientes,mes,anio]);

  // Stock bajo
  const stockBajo=materiales.filter(m=>Number(m.stock_actual)<=Number(m.stock_minimo||0));

  // Próximas entregas
  const proximas=[...activos].filter(p=>p.fecha_entrega).sort((a,b)=>new Date(a.fecha_entrega)-new Date(b.fecha_entrega)).slice(0,5);

  const maxCliente=topClientes[0]?.total||1;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <p className="section-title">📊 Business Intelligence</p>
          <p className="section-sub">Pack'in with Niki · Vista ejecutiva</p>
        </div>
        <PeriodSelector mes={mes} anio={anio} onChange={(m,a)=>{setMes(m);setAnio(a);}}/>
      </div>

      {/* KPIs del período */}
      <div className="gkpi" style={{marginBottom:16}}>
        <KPI label="Cobrado" value={`Bs. ${fmt(curr.ingresos)}`} color={C.gr} icon="💵" trend={trend(curr.ingresos,prev.ingresos)} sub={`vs ${MESES[prevMes]}`}/>
        <KPI label="Gastos" value={`Bs. ${fmt(curr.gastos)}`} color={C.re} icon="💸" trend={trend(curr.gastos,prev.gastos)*-1} sub={`vs ${MESES[prevMes]}`}/>
        <KPI label="Neto del mes" value={`Bs. ${fmt(curr.neto)}`} color={curr.neto>=0?C.gr:C.re} icon="📊" trend={trend(curr.neto,prev.neto)}/>
        <KPI label="Por cobrar" value={`Bs. ${fmt(porCobrar)}`} color={C.am} icon="💳" sub="total acumulado"/>
        <KPI label="Pedidos activos" value={activos.length} color={C.bl} icon="📦" sub={`${vencidos.length} vencidos · ${enSemana.length} esta semana`}/>
        <KPI label="Pedidos del mes" value={curr.pedidos} color={C.pu} icon="📋" trend={trend(curr.pedidos,prev.pedidos)} sub={`vs ${MESES[prevMes]}`}/>
      </div>

      {/* Gráfico evolución 12 meses */}
      <div className="chart-card">
        <p className="chart-title">Evolución de ingresos y gastos</p>
        <p className="chart-sub">Últimos 12 meses · Bs.</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={evolucion}>
            <defs>
              <linearGradient id="gIng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gr} stopOpacity={0.25}/><stop offset="95%" stopColor={C.gr} stopOpacity={0}/></linearGradient>
              <linearGradient id="gGas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.re} stopOpacity={0.2}/><stop offset="95%" stopColor={C.re} stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false}/>
            <XAxis dataKey="label" tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={C.gr} fill="url(#gIng)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="gastos" name="Gastos" stroke={C.re} fill="url(#gGas)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="neto" name="Neto" stroke={C.ac} fill="none" strokeWidth={2} strokeDasharray="4 2" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="g2" style={{marginBottom:14}}>
        {/* Top clientes */}
        <div className="chart-card" style={{margin:0}}>
          <p className="chart-title">Top clientes del mes</p>
          <p className="chart-sub">{MESES_L[mes]} {anio}</p>
          {topClientes.length===0?<p style={{color:C.mu,fontSize:13}}>Sin pedidos este mes</p>:
          topClientes.map((c,i)=>(
            <div key={i} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13}}>{["🥇","🥈","🥉","④","⑤","⑥"][i]}</span>
                  <span style={{fontSize:12,color:C.tx}}>{c.nombre}</span>
                </div>
                <span style={{fontSize:12,fontWeight:600,color:C.ac}}>Bs. {fmt(c.total)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${(c.total/maxCliente)*100}%`,background:PIE_COLORS[i%PIE_COLORS.length]}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Distribución por estado */}
        <div className="chart-card" style={{margin:0}}>
          <p className="chart-title">Pedidos por estado</p>
          <p className="chart-sub">Total histórico</p>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={porEstado} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {porEstado.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={(v)=>[`${v} pedidos`,"Cantidad"]} contentStyle={{background:C.card,border:`1px solid ${C.cb2}`,borderRadius:10,fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {porEstado.map((e,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.cb}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:e.color}}/>
                    <span style={{fontSize:11,color:C.mu}}>{e.name}</span>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:C.wh}}>{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="g2" style={{marginBottom:14}}>
        {/* Próximas entregas */}
        <div className="card">
          <p style={{fontSize:13,fontWeight:600,color:C.wh,marginBottom:14}}>📅 Próximas entregas</p>
          {proximas.length===0?<p style={{color:C.mu,fontSize:13}}>Sin pedidos activos</p>:
          proximas.map(p=>{
            const cli=clientes.find(c=>c.id===p.cliente_id);
            const d=diff(p.fecha_entrega);
            const color=d<0?C.re:d===0?C.am:d<=3?C.gr:C.mu;
            const s=getBadge(p.estado);
            return(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.cb}`}}>
                <div style={{width:36,height:36,borderRadius:8,background:`${color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{d<0?"⏰":d===0?"🔔":"📦"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:600,color:C.wh,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cli?.nombre||"—"}</p>
                  <p style={{fontSize:11,color:C.mu}}>Bs. {fmt(p.precio_total)}</p>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <p style={{fontSize:12,fontWeight:700,color}}>{d<0?`Venc. ${Math.abs(d)}d`:d===0?"¡Hoy!":d===1?"Mañana":`${d}d`}</p>
                  <p style={{fontSize:10,color:C.mu}}>{fmtF(p.fecha_entrega)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stock bajo */}
        <div className="card">
          <p style={{fontSize:13,fontWeight:600,color:C.wh,marginBottom:14}}>🎨 Estado del stock</p>
          {materiales.length===0?<p style={{color:C.mu,fontSize:13}}>Sin materiales</p>:
          materiales.slice(0,6).map(m=>{
            const bajo=Number(m.stock_actual)<=Number(m.stock_minimo||0);
            const pct=m.stock_minimo>0?Math.min(Math.round((Number(m.stock_actual)/Number(m.stock_minimo))*100),200):100;
            const color=bajo?C.re:pct>150?C.gr:C.am;
            return(
              <div key={m.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {bajo&&<span style={{fontSize:10}}>⚠️</span>}
                    <span style={{fontSize:12,color:bajo?C.re:C.tx}}>{m.nombre}</span>
                  </div>
                  <span style={{fontSize:11,color,fontWeight:600}}>{m.stock_actual} {m.presentacion}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${Math.min(pct/2,100)}%`,background:color}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PEDIDOS ───────────────────────────────────────────────────────────
function Pedidos({pedidos,clientes,tipos,reload,showToast}){
  const [tab,setTab]=useState("activos");
  const [modal,setModal]=useState(null);
  const [detalle,setDetalle]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [items,setItems]=useState([]);
  const [detalleItems,setDetalleItems]=useState([]);
  const [filtroCliente,setFiltroCliente]=useState("");
  const [fp,setFp]=useState({cliente_id:"",fecha_pedido:hoy(),fecha_entrega:"",estado:"confirmado",precio_total:"",anticipo:"",saldo_cobrado:false,canal_origen:"WhatsApp",notas:""});

  const activos=pedidos.filter(p=>p.estado!=="entregado"&&p.estado!=="cotizacion");
  const cotizaciones=pedidos.filter(p=>p.estado==="cotizacion");
  const entregados=pedidos.filter(p=>p.estado==="entregado");

  useEffect(()=>{if(!detalle)return;supabase.from("pedido_items").select("*").eq("pedido_id",detalle.id).then(({data})=>setDetalleItems(data||[]));},[detalle]);

  const openNuevo=()=>{
    setFp({cliente_id:"",fecha_pedido:hoy(),fecha_entrega:"",estado:"confirmado",precio_total:"",anticipo:"",saldo_cobrado:false,canal_origen:"WhatsApp",notas:""});
    setItems([{tipo_caja:"",medidas:"",cantidad:1,unidad:"docena",decoracion:"",precio_unitario:""}]);
    setModal("nuevo");
  };

  const save=async()=>{
    if(!fp.cliente_id)return showToast("Seleccioná un cliente","error");
    if(!fp.fecha_entrega)return showToast("Ingresá la fecha de entrega","error");
    if(!fp.precio_total)return showToast("Ingresá el precio total","error");
    setSaving(true);
    const data={...fp,precio_total:Number(fp.precio_total),anticipo:Number(fp.anticipo||0)};
    let pid;
    if(modal==="nuevo"){const{data:d}=await supabase.from("pedidos").insert([data]).select();pid=d[0].id;}
    else{await supabase.from("pedidos").update(data).eq("id",fp.id);pid=fp.id;await supabase.from("pedido_items").delete().eq("pedido_id",pid);}
    const its=items.filter(it=>it.tipo_caja||it.medidas).map(it=>({...it,pedido_id:pid,cantidad:Number(it.cantidad||1),precio_unitario:Number(it.precio_unitario||0)}));
    if(its.length>0)await supabase.from("pedido_items").insert(its);
    setModal(null);reload();showToast(modal==="nuevo"?"Pedido registrado":"Actualizado");setSaving(false);
  };

  const avanzar=async(p)=>{
    const idx=ESTADOS.indexOf(p.estado);if(idx>=ESTADOS.length-1)return;
    await supabase.from("pedidos").update({estado:ESTADOS[idx+1]}).eq("id",p.id);
    reload();showToast(`→ ${ESTADOS_LABEL[idx+1]}`);setDetalle(prev=>prev?{...prev,estado:ESTADOS[idx+1]}:null);
  };
  const cobrarSaldo=async(p)=>{await supabase.from("pedidos").update({saldo_cobrado:true,estado:"entregado"}).eq("id",p.id);reload();showToast("Saldo cobrado ✓");setDetalle(null);};
  const eliminar=async()=>{await supabase.from("pedidos").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");setDetalle(null);};

  const filtrar=(lista)=>filtroCliente?lista.filter(p=>{const cli=clientes.find(c=>c.id===p.cliente_id);return cli?.nombre?.toLowerCase().includes(filtroCliente.toLowerCase());}) : lista;

  const PedidoCard=({p})=>{
    const cli=clientes.find(c=>c.id===p.cliente_id);
    const d=diff(p.fecha_entrega);
    const s=getBadge(p.estado);
    const urgente=d!==null&&d<=2&&p.estado!=="entregado";
    const saldo=Number(p.precio_total||0)-Number(p.anticipo||0);
    const estadoIdx=ESTADOS.indexOf(p.estado);
    return(
      <div onClick={()=>setDetalle(p)} style={{background:C.card,border:`1px solid ${urgente?"rgba(248,113,113,0.4)":C.cb}`,borderLeft:`4px solid ${ESTADOS_COLOR[estadoIdx]||C.mu}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",marginBottom:10,transition:"all 0.15s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <p style={{fontSize:13,fontWeight:700,color:C.wh}}>{cli?.nombre||"Sin cliente"}</p>
            {cli?.marca&&<p style={{fontSize:11,color:C.ac}}>{cli.marca}</p>}
          </div>
          <span className="badge" style={{background:s.bg,color:s.c}}>{p.estado}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:p.saldo_cobrado?0:6}}>
          <p style={{fontSize:16,fontWeight:700,color:C.ac}}>Bs. {fmt(p.precio_total)}</p>
          <div style={{textAlign:"right"}}>
            {p.fecha_entrega&&<p style={{fontSize:11,fontWeight:600,color:d<0?C.re:d<=3?C.am:C.mu}}>{d<0?`Venc. ${Math.abs(d)}d`:d===0?"¡Hoy!":d===1?"Mañana":`${d}d`}</p>}
            <p style={{fontSize:10,color:C.mu}}>{fmtF(p.fecha_entrega)}</p>
          </div>
        </div>
        {!p.saldo_cobrado&&p.estado!=="cotizacion"&&(
          <div style={{display:"flex",justifyContent:"space-between",background:C.bg,borderRadius:6,padding:"6px 10px"}}>
            <span style={{fontSize:11,color:C.mu}}>Anticipo: Bs. {fmt(p.anticipo)}</span>
            <span style={{fontSize:11,color:C.am,fontWeight:600}}>Saldo: Bs. {fmt(saldo)}</span>
          </div>
        )}
        {p.saldo_cobrado&&<p style={{fontSize:11,color:C.gr}}>✓ Cobrado completo</p>}
      </div>
    );
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">📦 Pedidos</p><p className="section-sub">{activos.length} activos · {entregados.length} entregados</p></div>
        <button className="btn btn-primary btn-sm" onClick={openNuevo}>+ Nuevo pedido</button>
      </div>

      {/* Filtro */}
      <input className="form-input" placeholder="🔍 Buscar por cliente..." value={filtroCliente} onChange={e=>setFiltroCliente(e.target.value)} style={{marginBottom:12}}/>

      {/* Pipeline visual */}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {ESTADOS.map((e,i)=>{
          const count=pedidos.filter(p=>p.estado===e).length;
          return(
            <div key={e} style={{flex:1,minWidth:80,background:C.card,border:`1px solid ${C.cb}`,borderTop:`3px solid ${ESTADOS_COLOR[i]}`,borderRadius:8,padding:"10px",textAlign:"center"}}>
              <p style={{fontSize:18,marginBottom:4}}>{ESTADOS_LABEL[i].split(" ")[0]}</p>
              <p style={{fontSize:20,fontWeight:800,color:ESTADOS_COLOR[i],fontFamily:"'Syne',sans-serif"}}>{count}</p>
              <p style={{fontSize:9,color:C.mu,textTransform:"uppercase",letterSpacing:"0.5px"}}>{e}</p>
            </div>
          );
        })}
      </div>

      <div className="tab-bar">
        {[["activos",`Activos (${activos.length})`],["cotizaciones",`Cotizaciones (${cotizaciones.length})`],["entregados",`Entregados (${entregados.length})`]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?C.cb:"transparent",color:tab===id?C.wh:C.mu}}>{label}</button>
        ))}
      </div>

      {tab==="activos"&&(filtrar(activos).length===0?<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin pedidos activos</div>:filtrar(activos).sort((a,b)=>new Date(a.fecha_entrega||"9999")-new Date(b.fecha_entrega||"9999")).map(p=><PedidoCard key={p.id} p={p}/>))}
      {tab==="cotizaciones"&&(filtrar(cotizaciones).length===0?<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin cotizaciones</div>:filtrar(cotizaciones).map(p=><PedidoCard key={p.id} p={p}/>))}
      {tab==="entregados"&&(filtrar(entregados).length===0?<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin pedidos entregados</div>:filtrar(entregados).sort((a,b)=>new Date(b.fecha_pedido)-new Date(a.fecha_pedido)).map(p=><PedidoCard key={p.id} p={p}/>))}

      {confirm&&<Confirm msg="¿Eliminar este pedido?" onOk={eliminar} onCancel={()=>setConfirm(null)}/>}

      {detalle&&(()=>{
        const cli=clientes.find(c=>c.id===detalle.cliente_id);
        const s=getBadge(detalle.estado);
        const saldo=Number(detalle.precio_total||0)-Number(detalle.anticipo||0);
        return(
          <Modal title="Detalle del pedido" onClose={()=>setDetalle(null)} wide>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div><p style={{fontSize:18,fontWeight:700,color:C.wh}}>{cli?.nombre||"Sin cliente"}</p>{cli?.marca&&<p style={{fontSize:13,color:C.ac}}>{cli.marca}</p>}</div>
              <span className="badge" style={{background:s.bg,color:s.c,fontSize:13,padding:"4px 12px"}}>{detalle.estado}</span>
            </div>
            <div className="g2" style={{marginBottom:16}}>
              <div className="card-sm"><p style={{fontSize:10,color:C.mu}}>TOTAL</p><p style={{fontSize:22,fontWeight:700,color:C.ac}}>Bs. {fmt(detalle.precio_total)}</p></div>
              <div className="card-sm"><p style={{fontSize:10,color:C.mu}}>ANTICIPO</p><p style={{fontSize:22,fontWeight:700,color:C.gr}}>Bs. {fmt(detalle.anticipo)}</p></div>
              <div className="card-sm"><p style={{fontSize:10,color:C.mu}}>SALDO</p><p style={{fontSize:22,fontWeight:700,color:detalle.saldo_cobrado?C.gr:C.am}}>Bs. {fmt(saldo)}{detalle.saldo_cobrado?" ✓":""}</p></div>
              <div className="card-sm"><p style={{fontSize:10,color:C.mu}}>ENTREGA</p><p style={{fontSize:14,fontWeight:600,color:C.wh}}>{fmtF(detalle.fecha_entrega)}</p></div>
            </div>
            {detalle.notas&&<div style={{background:C.bg,borderRadius:8,padding:"10px 12px",marginBottom:16}}><p style={{fontSize:13,color:C.mu}}>{detalle.notas}</p></div>}
            {detalleItems.length>0&&(
              <div style={{marginBottom:16}}>
                <p style={{fontSize:11,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:10}}>Cajas del pedido</p>
                {detalleItems.map((it,i)=>(
                  <div key={i} style={{background:C.bg,borderRadius:8,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><p style={{fontSize:13,fontWeight:600,color:C.wh}}>{it.tipo_caja||"Caja"}</p><p style={{fontSize:11,color:C.mu}}>{it.medidas&&`${it.medidas} · `}{it.cantidad} {it.unidad}{it.decoracion&&` · ${it.decoracion}`}</p></div>
                    <p style={{fontSize:13,fontWeight:600,color:C.ac}}>Bs. {fmt(it.precio_unitario)}</p>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {detalle.estado!=="entregado"&&<button className="btn btn-success btn-sm" onClick={()=>avanzar(detalle)}>⬆ Avanzar</button>}
              {!detalle.saldo_cobrado&&detalle.estado!=="cotizacion"&&<button className="btn btn-primary btn-sm" onClick={()=>cobrarSaldo(detalle)}>💰 Cobrar saldo</button>}
              <button className="btn btn-ghost btn-sm" onClick={()=>{setFp(detalle);supabase.from("pedido_items").select("*").eq("pedido_id",detalle.id).then(({data})=>setItems(data||[]));setDetalle(null);setModal("editar");}}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(detalle.id)}>Eliminar</button>
            </div>
          </Modal>
        );
      })()}

      {(modal==="nuevo"||modal==="editar")&&(
        <Modal title={modal==="nuevo"?"Nuevo pedido":"Editar pedido"} onClose={()=>setModal(null)} wide>
          <div className="g2">
            <div className="form-group" style={{gridColumn:"1/-1"}}><label className="form-label">Cliente *</label>
              <select className="form-input" value={fp.cliente_id} onChange={e=>setFp(p=>({...p,cliente_id:e.target.value}))}>
                <option value="">Seleccionar...</option>
                {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}{c.marca?` — ${c.marca}`:""}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Fecha pedido</label><input className="form-input" type="date" value={fp.fecha_pedido} onChange={e=>setFp(p=>({...p,fecha_pedido:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fecha entrega *</label><input className="form-input" type="date" value={fp.fecha_entrega} onChange={e=>setFp(p=>({...p,fecha_entrega:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Estado</label>
              <select className="form-input" value={fp.estado} onChange={e=>setFp(p=>({...p,estado:e.target.value}))}>
                {ESTADOS.map((e,i)=><option key={e} value={e}>{ESTADOS_LABEL[i]}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Canal</label>
              <select className="form-input" value={fp.canal_origen} onChange={e=>setFp(p=>({...p,canal_origen:e.target.value}))}>
                {["WhatsApp","Instagram","TikTok","Presencial","Otro"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Precio total (Bs.) *</label><input className="form-input" type="number" value={fp.precio_total} onChange={e=>setFp(p=>({...p,precio_total:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Anticipo (Bs.)</label><input className="form-input" type="number" value={fp.anticipo} onChange={e=>setFp(p=>({...p,anticipo:e.target.value}))}/></div>
            <div className="form-group" style={{gridColumn:"1/-1"}}><label className="form-label">Notas</label><input className="form-input" value={fp.notas||""} onChange={e=>setFp(p=>({...p,notas:e.target.value}))} placeholder="Instrucciones especiales..."/></div>
          </div>
          {/* Items */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{fontSize:11,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px"}}>Cajas del pedido</p>
              <button className="btn btn-ghost btn-sm" type="button" onClick={()=>setItems(p=>[...p,{tipo_caja:"",medidas:"",cantidad:1,unidad:"docena",decoracion:"",precio_unitario:""}])}>+ Agregar</button>
            </div>
            {items.map((it,i)=>(
              <ItemRow key={i} item={it} index={i} tipos={tipos}
                onUpd={(idx,f,v)=>setItems(p=>p.map((x,j)=>j===idx?{...x,[f]:v}:x))}
                onDel={(idx)=>setItems(p=>p.filter((_,j)=>j!==idx))}
                showDel={items.length>1}/>
            ))}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ItemRow({item,index,onUpd,onDel,showDel,tipos}){
  const calcPrecio=(nombre)=>{
    const t=tipos?.find(x=>x.nombre===nombre);
    if(!t)return"";
    const cb=Number(t.bases_por_resma)>0?Number(t.costo_triplex)/Number(t.bases_por_resma):0;
    const ct=Number(t.tapas_por_resma)>0?Number(t.costo_duplex)/Number(t.tapas_por_resma):0;
    return((12*(cb+ct)+Number(t.costo_silicon)+Number(t.costo_bolsa)+Number(t.costo_sticker))*Number(t.margen)).toFixed(2);
  };
  return(
    <div style={{background:C.bg,borderRadius:8,padding:12,marginBottom:8,border:`1px solid ${C.cb}`}}>
      <div className="g2" style={{marginBottom:8}}>
        <div className="form-group" style={{marginBottom:0}}><label className="form-label">Tipo</label>
          {tipos?.length>0?(
            <select className="form-input" value={item.tipo_caja} onChange={e=>{const v=e.target.value;onUpd(index,"tipo_caja",v);const p=calcPrecio(v);if(p)onUpd(index,"precio_unitario",p);}}>
              <option value="">Personalizado...</option>
              {tipos.map(t=><option key={t.id} value={t.nombre}>{t.nombre}</option>)}
            </select>
          ):(
            <input className="form-input" value={item.tipo_caja} onChange={e=>onUpd(index,"tipo_caja",e.target.value)} placeholder="Cuadrada, circular..."/>
          )}
        </div>
        <div className="form-group" style={{marginBottom:0}}><label className="form-label">Medidas (cm)</label><input className="form-input" value={item.medidas} onChange={e=>onUpd(index,"medidas",e.target.value)} placeholder="15×18×5"/></div>
        <div className="form-group" style={{marginBottom:0}}><label className="form-label">Cantidad</label><input className="form-input" type="number" value={item.cantidad} onChange={e=>onUpd(index,"cantidad",e.target.value)}/></div>
        <div className="form-group" style={{marginBottom:0}}><label className="form-label">Unidad</label><select className="form-input" value={item.unidad} onChange={e=>onUpd(index,"unidad",e.target.value)}><option value="docena">Docena</option><option value="unidad">Unidad</option></select></div>
        <div className="form-group" style={{marginBottom:0}}><label className="form-label">Precio (Bs.)</label><input className="form-input" type="number" value={item.precio_unitario} onChange={e=>onUpd(index,"precio_unitario",e.target.value)}/></div>
        <div className="form-group" style={{marginBottom:0}}><label className="form-label">Decoración</label><input className="form-input" value={item.decoracion} onChange={e=>onUpd(index,"decoracion",e.target.value)} placeholder="Vinilo, cinta razo..."/></div>
      </div>
      {showDel&&<button className="btn btn-danger btn-sm" type="button" onClick={()=>onDel(index)}>Quitar</button>}
    </div>
  );
}

// ── CLIENTES ──────────────────────────────────────────────────────────
function Clientes({clientes,pedidos,reload,showToast}){
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [detalle,setDetalle]=useState(null);
  const [saving,setSaving]=useState(false);
  const [busqueda,setBusqueda]=useState("");
  const [fc,setFc]=useState({nombre:"",marca:"",ciudad:"",departamento:"",whatsapp:"",instagram:"",canal_preferido:"WhatsApp",notas:""});

  const save=async()=>{
    if(!fc.nombre)return showToast("Completá el nombre","error");setSaving(true);
    if(modal==="nuevo")await supabase.from("clientes").insert([fc]);
    else await supabase.from("clientes").update(fc).eq("id",fc.id);
    setModal(null);reload();showToast("Cliente guardado");setSaving(false);
  };
  const eliminar=async()=>{await supabase.from("clientes").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");};

  const clientesConStats=useMemo(()=>clientes.map(c=>{
    const peds=pedidos.filter(p=>p.cliente_id===c.id);
    const total=peds.reduce((a,b)=>a+Number(b.precio_total||0),0);
    const pendiente=peds.filter(p=>!p.saldo_cobrado&&p.estado!=="cotizacion").reduce((a,b)=>a+(Number(b.precio_total||0)-Number(b.anticipo||0)),0);
    return{...c,totalPedidos:peds.length,montoTotal:total,pendiente};
  }).sort((a,b)=>b.montoTotal-a.montoTotal),[clientes,pedidos]);

  const filtrados=busqueda?clientesConStats.filter(c=>c.nombre.toLowerCase().includes(busqueda.toLowerCase())||c.marca?.toLowerCase().includes(busqueda.toLowerCase())):clientesConStats;
  const maxMonto=clientesConStats[0]?.montoTotal||1;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">👥 Clientes</p><p className="section-sub">{clientes.length} registrados</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>{setFc({nombre:"",marca:"",ciudad:"",departamento:"",whatsapp:"",instagram:"",canal_preferido:"WhatsApp",notas:""});setModal("nuevo");}}>+ Nuevo</button>
      </div>

      {/* Ranking visual */}
      <div className="chart-card" style={{marginBottom:16}}>
        <p className="chart-title">Ranking por volumen histórico</p>
        <p className="chart-sub">Total de pedidos en Bs.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={clientesConStats.slice(0,8)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.cb} horizontal={false}/>
            <XAxis type="number" tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <YAxis type="category" dataKey="nombre" tick={{fill:C.mu,fontSize:11}} axisLine={false} tickLine={false} width={100}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="montoTotal" name="Total" fill={C.ac} radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <input className="form-input" placeholder="🔍 Buscar cliente o marca..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={{marginBottom:12}}/>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {filtrados.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:C.mu,gridColumn:"1/-1"}}>Sin clientes</div>}
        {filtrados.map(c=>{
          const ini=c.nombre.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
          const pct=Math.round((c.montoTotal/maxMonto)*100);
          return(
            <div key={c.id} style={{background:C.card,border:`1px solid ${C.cb}`,borderRadius:14,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${C.ac}30,${C.pu}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:C.ac}}>{ini}</div>
                {c.pendiente>0&&<span style={{fontSize:10,background:"rgba(251,191,36,0.12)",color:C.am,padding:"2px 8px",borderRadius:6,fontWeight:600}}>💳 Bs. {fmt(c.pendiente)}</span>}
              </div>
              <p style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:2}}>{c.nombre}</p>
              {c.marca&&<p style={{fontSize:12,color:C.ac,marginBottom:6}}>{c.marca}</p>}
              {c.ciudad&&<p style={{fontSize:11,color:C.mu,marginBottom:2}}>📍 {c.ciudad}{c.departamento?`, ${c.departamento}`:""}</p>}
              {c.whatsapp&&<p style={{fontSize:11,color:C.mu,marginBottom:2}}>📱 {c.whatsapp}</p>}
              <div style={{margin:"10px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,color:C.mu}}>{c.totalPedidos} pedidos</span>
                  <span style={{fontSize:11,fontWeight:600,color:C.ac}}>Bs. {fmt(c.montoTotal)}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`,background:C.ac}}/></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="btn btn-ghost btn-sm" style={{flex:1,justifyContent:"center"}} onClick={()=>{setFc(c);setModal("editar");}}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(c.id)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {confirm&&<Confirm msg="¿Eliminar este cliente?" onOk={eliminar} onCancel={()=>setConfirm(null)}/>}
      {(modal==="nuevo"||modal==="editar")&&(
        <Modal title={modal==="nuevo"?"Nuevo cliente":"Editar cliente"} onClose={()=>setModal(null)}>
          <div className="g2">
            <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={fc.nombre} onChange={e=>setFc(p=>({...p,nombre:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Marca</label><input className="form-input" value={fc.marca||""} onChange={e=>setFc(p=>({...p,marca:e.target.value}))} placeholder="Ej: Aleli, Chez Levy"/></div>
            <div className="form-group"><label className="form-label">Ciudad</label><input className="form-input" value={fc.ciudad||""} onChange={e=>setFc(p=>({...p,ciudad:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Departamento</label>
              <select className="form-input" value={fc.departamento||""} onChange={e=>setFc(p=>({...p,departamento:e.target.value}))}>
                <option value="">—</option>
                {["Cochabamba","La Paz","Santa Cruz","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">WhatsApp</label><input className="form-input" value={fc.whatsapp||""} onChange={e=>setFc(p=>({...p,whatsapp:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" value={fc.instagram||""} onChange={e=>setFc(p=>({...p,instagram:e.target.value}))} placeholder="@usuario"/></div>
            <div className="form-group"><label className="form-label">Canal preferido</label>
              <select className="form-input" value={fc.canal_preferido} onChange={e=>setFc(p=>({...p,canal_preferido:e.target.value}))}>
                {["WhatsApp","Instagram","TikTok","Presencial"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fc.notas||""} onChange={e=>setFc(p=>({...p,notas:e.target.value}))} placeholder="Preferencias, medidas habituales..."/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FINANZAS ─────────────────────────────────────────────────────────
function Finanzas({pedidos,gastos,clientes,reload,showToast}){
  const now=new Date();
  const [mes,setMes]=useState(now.getMonth()+1);
  const [anio,setAnio]=useState(now.getFullYear());
  const [tab,setTab]=useState("resumen");
  const [modal,setModal]=useState(false);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fg,setFg]=useState({categoria:"",descripcion:"",monto:"",fecha:hoy()});

  const saveGasto=async()=>{
    if(!fg.categoria||!fg.monto)return showToast("Completá categoría y monto","error");setSaving(true);
    await supabase.from("gastos").insert([{...fg,monto:Number(fg.monto)}]);
    setModal(false);reload();showToast("Gasto registrado");setSaving(false);
  };
  const eliminarGasto=async()=>{await supabase.from("gastos").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");};

  const desde=`${anio}-${String(mes).padStart(2,"0")}-01`;
  const hasta=`${anio}-${String(mes).padStart(2,"0")}-31`;

  const pedidosMes=pedidos.filter(p=>{const d=new Date(p.fecha_pedido);return d.getMonth()+1===mes&&d.getFullYear()===anio&&p.estado!=="cotizacion";});
  const gastosMes=gastos.filter(g=>g.fecha>=desde&&g.fecha<=hasta);
  const anticiposMes=pedidosMes.reduce((a,b)=>a+Number(b.anticipo||0),0);
  const saldosMes=pedidosMes.filter(p=>p.saldo_cobrado).reduce((a,b)=>a+Number(b.precio_total||0)-Number(b.anticipo||0),0);
  const ingresosMes=anticiposMes+saldosMes;
  const totalGastosMes=gastosMes.reduce((a,b)=>a+Number(b.monto||0),0);
  const netoMes=ingresosMes-totalGastosMes;
  const saldoPorCobrar=pedidos.filter(p=>p.estado!=="cotizacion"&&!p.saldo_cobrado).reduce((a,b)=>a+(Number(b.precio_total||0)-Number(b.anticipo||0)),0);

  // Mes anterior para trends
  const pm=mes===1?12:mes-1;const pa=mes===1?anio-1:anio;
  const pDesde=`${pa}-${String(pm).padStart(2,"0")}-01`;const pHasta=`${pa}-${String(pm).padStart(2,"0")}-31`;
  const pPeds=pedidos.filter(p=>{const d=new Date(p.fecha_pedido);return d.getMonth()+1===pm&&d.getFullYear()===pa&&p.estado!=="cotizacion";});
  const pIngresos=pPeds.reduce((a,b)=>a+Number(b.anticipo||0),0)+pPeds.filter(p=>p.saldo_cobrado).reduce((a,b)=>a+Number(b.precio_total||0)-Number(b.anticipo||0),0);
  const pGastos=gastos.filter(g=>g.fecha>=pDesde&&g.fecha<=pHasta).reduce((a,b)=>a+Number(b.monto||0),0);

  const trendIng=pIngresos>0?((ingresosMes-pIngresos)/pIngresos*100):null;
  const trendGas=pGastos>0?((totalGastosMes-pGastos)/pGastos*100)*-1:null;

  // Gastos por categoría
  const porCat=useMemo(()=>{
    const map={};gastosMes.forEach(g=>{map[g.categoria]=(map[g.categoria]||0)+Number(g.monto||0);});
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  },[gastosMes]);

  // Evolución 6 meses
  const evolucion6=useMemo(()=>{
    const data=[];
    for(let i=5;i>=0;i--){
      let m=mes-i,a=anio;while(m<=0){m+=12;a--;}
      const d=`${a}-${String(m).padStart(2,"0")}-01`;const h=`${a}-${String(m).padStart(2,"0")}-31`;
      const pM=pedidos.filter(p=>{const dd=new Date(p.fecha_pedido);return dd.getMonth()+1===m&&dd.getFullYear()===a&&p.estado!=="cotizacion";});
      const ing=pM.reduce((acc,b)=>acc+Number(b.anticipo||0),0)+pM.filter(p=>p.saldo_cobrado).reduce((acc,b)=>acc+Number(b.precio_total||0)-Number(b.anticipo||0),0);
      const gas=gastos.filter(g=>g.fecha>=d&&g.fecha<=h).reduce((acc,b)=>acc+Number(b.monto||0),0);
      data.push({label:MESES[m],ingresos:ing,gastos:gas,neto:ing-gas});
    }
    return data;
  },[pedidos,gastos,mes,anio]);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">💰 Finanzas</p><p className="section-sub">{MESES_L[mes]} {anio}</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <PeriodSelector mes={mes} anio={anio} onChange={(m,a)=>{setMes(m);setAnio(a);}}/>
          <button className="btn btn-ghost btn-sm" onClick={()=>{setFg({categoria:"",descripcion:"",monto:"",fecha:hoy()});setModal(true);}}>+ Gasto</button>
        </div>
      </div>

      <div className="g4" style={{marginBottom:16}}>
        <div className="card-sm" style={{borderTop:`3px solid ${C.gr}`}}>
          <p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Cobrado</p>
          <p style={{fontSize:22,fontWeight:800,color:C.gr,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(ingresosMes)}</p>
          {trendIng!=null&&<span className={trendIng>=0?"trend-up":"trend-down"}>{trendIng>=0?"↑":"↓"} {Math.abs(trendIng).toFixed(1)}% vs {MESES[pm]}</span>}
        </div>
        <div className="card-sm" style={{borderTop:`3px solid ${C.re}`}}>
          <p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Gastos</p>
          <p style={{fontSize:22,fontWeight:800,color:C.re,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(totalGastosMes)}</p>
          {trendGas!=null&&<span className={trendGas>=0?"trend-up":"trend-down"}>{trendGas>=0?"↑":"↓"} {Math.abs(trendGas).toFixed(1)}% eficiencia</span>}
        </div>
        <div className="card-sm" style={{borderTop:`3px solid ${netoMes>=0?C.gr:C.re}`}}>
          <p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Neto</p>
          <p style={{fontSize:22,fontWeight:800,color:netoMes>=0?C.gr:C.re,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(netoMes)}</p>
          <span style={{fontSize:11,color:netoMes>=0?C.gr:C.re}}>{netoMes>=0?"Rentable ✓":"Déficit"}</span>
        </div>
        <div className="card-sm" style={{borderTop:`3px solid ${C.am}`}}>
          <p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Por cobrar</p>
          <p style={{fontSize:22,fontWeight:800,color:C.am,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(saldoPorCobrar)}</p>
          <span style={{fontSize:11,color:C.mu}}>total acumulado</span>
        </div>
      </div>

      {/* Gráfico barras 6 meses */}
      <div className="chart-card">
        <p className="chart-title">Comparativo 6 meses</p>
        <p className="chart-sub">Ingresos vs Gastos en Bs.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={evolucion6} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false}/>
            <XAxis dataKey="label" tick={{fill:C.mu,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="ingresos" name="Ingresos" fill={C.gr} radius={[3,3,0,0]}/>
            <Bar dataKey="gastos" name="Gastos" fill={C.re} radius={[3,3,0,0]}/>
            <Bar dataKey="neto" name="Neto" fill={C.ac} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="tab-bar">
        {[["resumen","Resumen"],["ingresos","Ingresos"],["gastos","Gastos"]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?C.cb:"transparent",color:tab===id?C.wh:C.mu}}>{label}</button>
        ))}
      </div>

      {tab==="resumen"&&(
        <div className="g2">
          <div className="card">
            <p style={{fontSize:13,fontWeight:600,color:C.wh,marginBottom:12}}>Desglose del mes</p>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.cb}`}}><span style={{fontSize:13,color:C.mu}}>Anticipos cobrados</span><span style={{fontSize:13,fontWeight:600,color:C.gr}}>Bs. {fmt(anticiposMes)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.cb}`}}><span style={{fontSize:13,color:C.mu}}>Saldos cobrados</span><span style={{fontSize:13,fontWeight:600,color:C.gr}}>Bs. {fmt(saldosMes)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.cb}`}}><span style={{fontSize:13,color:C.mu}}>Total gastos</span><span style={{fontSize:13,fontWeight:600,color:C.re}}>Bs. {fmt(totalGastosMes)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0"}}><span style={{fontSize:13,fontWeight:600,color:C.wh}}>Neto</span><span style={{fontSize:14,fontWeight:700,color:netoMes>=0?C.gr:C.re}}>Bs. {fmt(netoMes)}</span></div>
          </div>
          <div className="card">
            <p style={{fontSize:13,fontWeight:600,color:C.wh,marginBottom:12}}>Gastos por categoría</p>
            {porCat.length===0?<p style={{color:C.mu,fontSize:13}}>Sin gastos</p>:
            porCat.map((c,i)=>(
              <div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,color:C.tx}}>{c.name}</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.mu}}>Bs. {fmt(c.value)}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.round((c.value/Math.max(totalGastosMes,1))*100)}%`,background:PIE_COLORS[i%PIE_COLORS.length]}}/></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="ingresos"&&(
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Cliente</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Anticipo</th><th>Saldo</th></tr></thead>
            <tbody>
              {pedidosMes.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:C.mu,padding:28}}>Sin pedidos este mes</td></tr>}
              {pedidosMes.sort((a,b)=>new Date(b.fecha_pedido)-new Date(a.fecha_pedido)).map(p=>{
                const cli=clientes.find(c=>c.id===p.cliente_id);
                return(<tr key={p.id} className="table-row">
                  <td style={{fontWeight:500}}>{cli?.nombre||"—"}</td>
                  <td style={{color:C.mu,fontSize:12}}>{fmtF(p.fecha_pedido)}</td>
                  <td><Badge type={p.estado}/></td>
                  <td style={{fontWeight:600,color:C.ac}}>Bs. {fmt(p.precio_total)}</td>
                  <td style={{color:C.gr}}>Bs. {fmt(p.anticipo)}</td>
                  <td style={{color:p.saldo_cobrado?C.gr:C.am}}>{p.saldo_cobrado?"✓ Cobrado":`Bs. ${fmt(Number(p.precio_total)-Number(p.anticipo))}`}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab==="gastos"&&(
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {gastosMes.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:C.mu,padding:28}}>Sin gastos este mes</td></tr>}
              {gastosMes.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(g=>(
                <tr key={g.id} className="table-row">
                  <td style={{color:C.mu,fontSize:12}}>{fmtF(g.fecha)}</td>
                  <td style={{fontWeight:500}}>{g.categoria}</td>
                  <td style={{color:C.mu,fontSize:12}}>{g.descripcion||"—"}</td>
                  <td style={{fontWeight:600,color:C.re}}>Bs. {fmt(g.monto)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>setConfirm(g.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm&&<Confirm msg="¿Eliminar este gasto?" onOk={eliminarGasto} onCancel={()=>setConfirm(null)}/>}
      {modal&&(
        <Modal title="Registrar gasto" onClose={()=>setModal(false)}>
          <div className="form-group"><label className="form-label">Categoría *</label>
            <select className="form-input" value={fg.categoria} onChange={e=>setFg(p=>({...p,categoria:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {["Materiales","Herramientas","Transporte","Servicios","Embalaje","Publicidad","Otro"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" value={fg.descripcion} onChange={e=>setFg(p=>({...p,descripcion:e.target.value}))}/></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Monto (Bs.) *</label><input className="form-input" type="number" value={fg.monto} onChange={e=>setFg(p=>({...p,monto:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={fg.fecha} onChange={e=>setFg(p=>({...p,fecha:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveGasto} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── COTIZADOR ─────────────────────────────────────────────────────────
function Cotizador({tipos,reload,showToast}){
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [sel,setSel]=useState("");
  const [docenas,setDocenas]=useState(1);
  const [ft,setFt]=useState({nombre:"",familia:"cuadrada",bases_por_resma:12,tapas_por_resma:15,costo_triplex:450,costo_duplex:325,costo_silicon:1,costo_bolsa:1,costo_sticker:2,margen:3.2});

  const calcCosto=(t)=>{
    const cb=Number(t.bases_por_resma)>0?Number(t.costo_triplex)/Number(t.bases_por_resma):0;
    const ct=Number(t.tapas_por_resma)>0?Number(t.costo_duplex)/Number(t.tapas_por_resma):0;
    return 12*(cb+ct)+Number(t.costo_silicon)+Number(t.costo_bolsa)+Number(t.costo_sticker);
  };

  const save=async()=>{
    if(!ft.nombre)return showToast("Completá el nombre","error");setSaving(true);
    const data={...ft,bases_por_resma:Number(ft.bases_por_resma),tapas_por_resma:Number(ft.tapas_por_resma),costo_triplex:Number(ft.costo_triplex),costo_duplex:Number(ft.costo_duplex),costo_silicon:Number(ft.costo_silicon),costo_bolsa:Number(ft.costo_bolsa),costo_sticker:Number(ft.costo_sticker),margen:Number(ft.margen)};
    if(modal==="nuevo")await supabase.from("tipos_caja").insert([data]);
    else await supabase.from("tipos_caja").update(data).eq("id",ft.id);
    setModal(null);reload();showToast("Guardado");setSaving(false);
  };
  const eliminar=async()=>{await supabase.from("tipos_caja").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");};

  const tipoSel=sel?tipos.find(t=>t.nombre===sel):tipos[0];
  const costo=tipoSel?calcCosto(tipoSel):0;
  const precioDoc=tipoSel?costo*Number(tipoSel.margen):0;
  const precioCaja=precioDoc/12;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">🧮 Cotizador</p><p className="section-sub">Tipos de caja y parámetros editables</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>{setFt({nombre:"",familia:"cuadrada",bases_por_resma:12,tapas_por_resma:15,costo_triplex:450,costo_duplex:325,costo_silicon:1,costo_bolsa:1,costo_sticker:2,margen:3.2});setModal("nuevo");}}>+ Nuevo tipo</button>
      </div>

      {tipos.length>0&&(
        <div className="card" style={{marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:600,color:C.wh,marginBottom:14}}>Calculadora rápida</p>
          <div className="form-group"><label className="form-label">Tipo de caja</label>
            <select className="form-input" value={sel||tipos[0]?.nombre||""} onChange={e=>setSel(e.target.value)}>
              {tipos.map(t=><option key={t.id} value={t.nombre}>{t.nombre}</option>)}
            </select>
          </div>
          {tipoSel&&(
            <>
              <div style={{background:C.bg,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.mu,display:"flex",gap:20,flexWrap:"wrap"}}>
                <span>Costo/doc: <strong style={{color:C.wh}}>Bs. {costo.toFixed(2)}</strong></span>
                <span>Margen: <strong style={{color:C.ac}}>{tipoSel.margen}x</strong></span>
                <span>Precio/caja: <strong style={{color:C.wh}}>Bs. {precioCaja.toFixed(2)}</strong></span>
              </div>
              <div className="g2">
                <div className="card-sm">
                  <p style={{fontSize:11,color:C.mu,marginBottom:8}}>DOCENAS</p>
                  <input className="form-input" type="number" min="1" value={docenas} onChange={e=>setDocenas(Number(e.target.value)||1)} style={{marginBottom:10}}/>
                  <p style={{fontSize:11,color:C.mu,marginBottom:4}}>Precio de venta</p>
                  <p style={{fontSize:28,fontWeight:800,color:C.ac,fontFamily:"'Syne',sans-serif"}}>Bs. {(precioDoc*docenas).toFixed(2)}</p>
                  <p style={{fontSize:11,color:C.mu,marginTop:4}}>{docenas*12} cajas en total</p>
                </div>
                <div className="card-sm">
                  <p style={{fontSize:11,color:C.mu,marginBottom:8}}>POR UNIDAD</p>
                  <p style={{fontSize:28,fontWeight:800,color:C.pu,fontFamily:"'Syne',sans-serif",marginTop:10}}>Bs. {precioCaja.toFixed(2)}</p>
                  <p style={{fontSize:11,color:C.mu,marginTop:4}}>por caja individual</p>
                  <p style={{fontSize:12,color:C.mu,marginTop:12}}>Costo real: Bs. {(costo/12).toFixed(2)}/u</p>
                  <p style={{fontSize:12,color:C.gr}}>Ganancia: Bs. {(precioCaja-costo/12).toFixed(2)}/u</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {tipos.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin tipos de caja. Creá el primero.</div>}
        {tipos.map(t=>{
          const c=calcCosto(t);const pd=c*Number(t.margen);
          return(
            <div key={t.id} style={{background:C.card,border:`1px solid ${C.cb}`,borderRadius:12,padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div><p style={{fontSize:14,fontWeight:600,color:C.wh}}>{t.nombre}</p><p style={{fontSize:11,color:C.mu}}>{t.familia}</p></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:12,background:"rgba(232,96,122,0.1)",color:C.ac,padding:"3px 10px",borderRadius:20,fontWeight:600}}>Bs. {pd.toFixed(2)}/doc · Bs. {(pd/12).toFixed(2)}/u</span>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{setFt({...t});setModal("editar");}}>✏</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(t.id)}>✕</button>
                </div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:12,fontSize:12,color:C.mu}}>
                <span>Bases/resma: <strong style={{color:C.tx}}>{t.bases_por_resma}</strong></span>
                <span>Tapas/resma: <strong style={{color:C.tx}}>{t.tapas_por_resma}</strong></span>
                <span>Triplex: <strong style={{color:C.tx}}>Bs. {t.costo_triplex}</strong></span>
                <span>Duplex: <strong style={{color:C.tx}}>Bs. {t.costo_duplex}</strong></span>
                <span>Silicón: <strong style={{color:C.tx}}>Bs. {t.costo_silicon}</strong></span>
                <span>Bolsa: <strong style={{color:C.tx}}>Bs. {t.costo_bolsa}</strong></span>
                <span>Sticker: <strong style={{color:C.tx}}>Bs. {t.costo_sticker}</strong></span>
                <span>Margen: <strong style={{color:C.ac}}>{t.margen}x</strong></span>
                <span>Costo/doc: <strong style={{color:C.tx}}>Bs. {c.toFixed(2)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {confirm&&<Confirm msg="¿Eliminar este tipo de caja?" onOk={eliminar} onCancel={()=>setConfirm(null)}/>}
      {(modal==="nuevo"||modal==="editar")&&(
        <Modal title={modal==="nuevo"?"Nuevo tipo de caja":"Editar tipo de caja"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={ft.nombre} onChange={e=>setFt(p=>({...p,nombre:e.target.value}))} placeholder="Ej: Cuadrada mediana"/></div>
          <div className="form-group"><label className="form-label">Familia</label>
            <select className="form-input" value={ft.familia} onChange={e=>setFt(p=>({...p,familia:e.target.value}))}>
              {["cuadrada","rectangular","circular","base","especial"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <p style={{fontSize:11,color:C.mu,marginBottom:8,marginTop:4,textTransform:"uppercase",letterSpacing:"0.6px"}}>Parámetros de materiales</p>
          <div className="g2">
            <div className="form-group"><label className="form-label">Bases por resma</label><input className="form-input" type="number" value={ft.bases_por_resma} onChange={e=>setFt(p=>({...p,bases_por_resma:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Tapas por resma</label><input className="form-input" type="number" value={ft.tapas_por_resma} onChange={e=>setFt(p=>({...p,tapas_por_resma:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Costo Triplex (Bs.)</label><input className="form-input" type="number" value={ft.costo_triplex} onChange={e=>setFt(p=>({...p,costo_triplex:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Costo Duplex (Bs.)</label><input className="form-input" type="number" value={ft.costo_duplex} onChange={e=>setFt(p=>({...p,costo_duplex:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Silicón/doc (Bs.)</label><input className="form-input" type="number" value={ft.costo_silicon} onChange={e=>setFt(p=>({...p,costo_silicon:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Bolsa/doc (Bs.)</label><input className="form-input" type="number" value={ft.costo_bolsa} onChange={e=>setFt(p=>({...p,costo_bolsa:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Sticker/doc (Bs.)</label><input className="form-input" type="number" value={ft.costo_sticker} onChange={e=>setFt(p=>({...p,costo_sticker:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Margen (x)</label><input className="form-input" type="number" step="0.1" value={ft.margen} onChange={e=>setFt(p=>({...p,margen:e.target.value}))}/></div>
          </div>
          {ft.bases_por_resma&&ft.costo_triplex&&(
            <div style={{background:C.bg,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.mu}}>
              Preview: Costo/doc = <strong style={{color:C.wh}}>Bs. {calcCosto(ft).toFixed(2)}</strong> · Precio/doc = <strong style={{color:C.ac}}>Bs. {(calcCosto(ft)*Number(ft.margen||1)).toFixed(2)}</strong>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MATERIALES ────────────────────────────────────────────────────────
function Materiales({materiales,reload,showToast}){
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fm,setFm]=useState({nombre:"",categoria:"base",presentacion:"",costo_presentacion:"",stock_actual:"",stock_minimo:""});

  const save=async()=>{
    if(!fm.nombre)return showToast("Completá el nombre","error");setSaving(true);
    const data={...fm,costo_presentacion:Number(fm.costo_presentacion||0),stock_actual:Number(fm.stock_actual||0),stock_minimo:Number(fm.stock_minimo||0)};
    if(modal==="nuevo")await supabase.from("materiales").insert([data]);
    else await supabase.from("materiales").update(data).eq("id",fm.id);
    setModal(null);reload();showToast("Guardado");setSaving(false);
  };
  const eliminar=async()=>{await supabase.from("materiales").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");};
  const bajo=materiales.filter(m=>Number(m.stock_actual)<=Number(m.stock_minimo||0));

  // Data para gráfico
  const stockData=materiales.slice(0,8).map(m=>({
    name:m.nombre.split(" ").slice(0,2).join(" "),
    actual:Number(m.stock_actual),
    minimo:Number(m.stock_minimo||0)
  }));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">🎨 Materiales</p><p className="section-sub">{materiales.length} materiales · {bajo.length} alertas</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>{setFm({nombre:"",categoria:"base",presentacion:"",costo_presentacion:"",stock_actual:"",stock_minimo:""});setModal("nuevo");}}>+ Agregar</button>
      </div>

      {/* Gráfico stock */}
      {materiales.length>0&&(
        <div className="chart-card" style={{marginBottom:16}}>
          <p className="chart-title">Stock actual vs mínimo</p>
          <p className="chart-sub">Por material</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stockData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.cb} horizontal={false}/>
              <XAxis type="number" tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false} width={90}/>
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.cb2}`,borderRadius:10,fontSize:12}}/>
              <Bar dataKey="actual" name="Stock actual" fill={C.gr} radius={[0,4,4,0]}/>
              <Bar dataKey="minimo" name="Mínimo" fill={C.cb2} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {bajo.length>0&&<div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><span>⚠️</span><p style={{fontSize:13,color:C.am}}>Stock bajo: {bajo.map(m=>m.nombre).join(", ")}</p></div>}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {materiales.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin materiales. Agregá los que usás.</div>}
        {materiales.map(m=>{
          const esBajo=Number(m.stock_actual)<=Number(m.stock_minimo||0);
          const pct=m.stock_minimo>0?Math.min(Math.round((Number(m.stock_actual)/Number(m.stock_minimo))*100),200):100;
          const barColor=esBajo?C.re:pct>150?C.gr:C.am;
          return(
            <div key={m.id} style={{background:C.card,border:`1px solid ${esBajo?"rgba(248,113,113,0.3)":C.cb}`,borderRadius:12,padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <p style={{fontSize:13,fontWeight:600,color:C.wh}}>{m.nombre}</p>
                    {esBajo&&<span style={{fontSize:10,background:"rgba(248,113,113,0.12)",color:C.re,padding:"2px 7px",borderRadius:5,fontWeight:600}}>⚠ BAJO</span>}
                  </div>
                  <p style={{fontSize:11,color:C.mu}}>{m.categoria} · {m.presentacion} · Bs. {fmt(m.costo_presentacion)}/u</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:18,fontWeight:700,color:barColor,fontFamily:"'Syne',sans-serif"}}>{fmt(m.stock_actual)} <span style={{fontSize:11,fontWeight:400,color:C.mu}}>{m.presentacion}</span></p>
                    <p style={{fontSize:11,color:C.mu}}>mín: {m.stock_minimo||0}</p>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{setFm(m);setModal("editar");}}>✏</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(m.id)}>✕</button>
                  </div>
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10,color:C.mu}}>Stock vs mínimo ({fmt(m.stock_minimo||0)} {m.presentacion})</span>
                  <span style={{fontSize:10,color:barColor,fontWeight:600}}>{esBajo?"Bajo el mínimo":"OK ✓"}</span>
                </div>
                <div className="progress-bar" style={{height:8}}>
                  <div className="progress-fill" style={{width:`${Math.min(pct/2,100)}%`,background:barColor}}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {confirm&&<Confirm msg="¿Eliminar este material?" onOk={eliminar} onCancel={()=>setConfirm(null)}/>}
      {(modal==="nuevo"||modal==="editar")&&(
        <Modal title={modal==="nuevo"?"Nuevo material":"Editar material"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={fm.nombre} onChange={e=>setFm(p=>({...p,nombre:e.target.value}))} placeholder="Ej: Cartulina Triplex Blanca"/></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Categoría</label>
              <select className="form-input" value={fm.categoria} onChange={e=>setFm(p=>({...p,categoria:e.target.value}))}>
                {["base","decoracion","embalaje","herramienta","otro"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Presentación</label><input className="form-input" value={fm.presentacion||""} onChange={e=>setFm(p=>({...p,presentacion:e.target.value}))} placeholder="Resma, rollo, paquete..."/></div>
            <div className="form-group"><label className="form-label">Costo (Bs.)</label><input className="form-input" type="number" value={fm.costo_presentacion||""} onChange={e=>setFm(p=>({...p,costo_presentacion:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Stock actual</label><input className="form-input" type="number" value={fm.stock_actual||""} onChange={e=>setFm(p=>({...p,stock_actual:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Stock mínimo</label><input className="form-input" type="number" value={fm.stock_minimo||""} onChange={e=>setFm(p=>({...p,stock_minimo:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────
function Login(){
  const [f,setF]=useState({email:"",password:""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const go=async()=>{setLoading(true);setErr("");const{error}=await supabase.auth.signInWithPassword(f);if(error)setErr("Email o contraseña incorrectos");setLoading(false);};
  return(
    <div className="login-bg">
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:72,height:72,background:`linear-gradient(135deg,${C.ac},${C.pu})`,borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:34}}>📦</div>
          <p style={{fontSize:28,fontWeight:800,color:C.wh,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.5px"}}>Pack'in</p>
          <p style={{fontSize:13,color:C.mu,marginTop:4}}>Sistema de gestión · with Niki</p>
        </div>
        <div className="card">
          {err&&<div style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:8,padding:"10px 14px",marginBottom:16}}><p style={{color:C.re,fontSize:13}}>{err}</p></div>}
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div className="form-group" style={{marginBottom:20}}><label className="form-label">Contraseña</label><input className="form-input" type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={go} disabled={loading}>{loading?"Ingresando...":"Ingresar"}</button>
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────
export default function App(){
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const [data,setData]=useState({pedidos:[],clientes:[],materiales:[],gastos:[],tipos:[]});

  const showToast=(message,type="success")=>{setToast({message,type});setTimeout(()=>setToast(null),3000);};

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setLoading(false);});
    supabase.auth.onAuthStateChange((_,s)=>setSession(s));
  },[]);

  const load=async()=>{
    const[p,c,m,g,t]=await Promise.all([
      supabase.from("pedidos").select("*").order("fecha_entrega").limit(10000),
      supabase.from("clientes").select("*").order("nombre"),
      supabase.from("materiales").select("*").order("nombre"),
      supabase.from("gastos").select("*").order("fecha").limit(10000),
      supabase.from("tipos_caja").select("*").order("nombre"),
    ]);
    setData({pedidos:p.data||[],clientes:c.data||[],materiales:m.data||[],gastos:g.data||[],tipos:t.data||[]});
  };

  useEffect(()=>{if(session)load();},[session]);

  if(loading)return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,gap:16}}>
      <div style={{fontSize:40}}>📦</div>
      <p style={{color:C.mu,fontSize:13}}>Cargando Pack'in...</p>
    </div>
  );

  return(
    <>
      <style>{css}</style>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
      {!session?<Login/>:(
        <div className="app-shell">
          <div className="mobile-header">
            <span style={{fontSize:14,fontWeight:700,color:C.wh,fontFamily:"'Syne',sans-serif"}}>📦 Pack'in</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>supabase.auth.signOut()} style={{fontSize:11,padding:"4px 10px"}}>Salir</button>
          </div>
          <div className="app-body">
            <div className="sidebar">
              <div style={{padding:"8px 6px 20px",borderBottom:`1px solid ${C.cb}`,marginBottom:12}}>
                <p style={{fontSize:16,fontWeight:700,color:C.wh,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.3px"}}>📦 Pack'in</p>
                <p style={{fontSize:11,color:C.mu,marginTop:2}}>with Niki · BI System</p>
              </div>
              {NAV.map(n=>(
                <div key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
                  <span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span>
                </div>
              ))}
              <div style={{marginTop:"auto",padding:"12px 6px",borderTop:`1px solid ${C.cb}`}}>
                <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>supabase.auth.signOut()}>Cerrar sesión</button>
              </div>
            </div>
            <div className="main-content">
              {tab==="dashboard"&&<Dashboard pedidos={data.pedidos} clientes={data.clientes} materiales={data.materiales} gastos={data.gastos}/>}
              {tab==="pedidos"&&<Pedidos pedidos={data.pedidos} clientes={data.clientes} tipos={data.tipos} reload={load} showToast={showToast}/>}
              {tab==="clientes"&&<Clientes clientes={data.clientes} pedidos={data.pedidos} reload={load} showToast={showToast}/>}
              {tab==="finanzas"&&<Finanzas pedidos={data.pedidos} gastos={data.gastos} clientes={data.clientes} reload={load} showToast={showToast}/>}
              {tab==="cotizador"&&<Cotizador tipos={data.tipos} reload={load} showToast={showToast}/>}
              {tab==="materiales"&&<Materiales materiales={data.materiales} reload={load} showToast={showToast}/>}
            </div>
          </div>
          <div className="bottom-nav">
            {NAV.map(n=>(
              <button key={n.id} className={`bottom-nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span className="nav-label">{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
