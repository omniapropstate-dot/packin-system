import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

const C = {
  bg:"#0f0a0d",sb:"#160d13",card:"#1e1118",cb:"#3d2535",cb2:"#5a3548",
  ac:"#e8607a",ac2:"#d4537e",gr:"#52c4a0",re:"#f87171",am:"#fbbf24",
  bl:"#60a5fa",pu:"#c084fc",tx:"#fce8f0",mu:"#9a7080",wh:"#fff5f8",
};
const ESTADOS=["cotizacion","confirmado","produccion","listo","entregado"];
const ESTADOS_LABEL=["💬 Cotización","✅ Confirmado","🔧 En producción","🎁 Listo","📬 Entregado"];
const ESTADOS_COLOR=["#c084fc","#60a5fa","#fbbf24","#f4956a","#52c4a0"];
const MESES_L=["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const NAV=[{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"pedidos",label:"Pedidos",icon:"📦"},{id:"clientes",label:"Clientes",icon:"👥"},{id:"materiales",label:"Materiales",icon:"🎨"},{id:"finanzas",label:"Finanzas",icon:"💰"}];

const css=`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.tx};-webkit-font-smoothing:antialiased}
input,select,textarea{font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.cb2};border-radius:4px}
.app-shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.sidebar{width:210px;background:${C.sb};border-right:1px solid ${C.cb};display:flex;flex-direction:column;padding:18px 10px;flex-shrink:0;height:100vh;overflow-y:auto}
.app-body{display:flex;flex:1;overflow:hidden}
.main-content{flex:1;overflow-y:auto;padding:22px 20px}
.mobile-header{display:none}.bottom-nav{display:none}
@media(max-width:768px){
  .mobile-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:${C.sb};border-bottom:1px solid ${C.cb};flex-shrink:0}
  .sidebar{display:none!important}.main-content{padding:12px 12px 88px}
  .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:200;background:${C.sb};border-top:1px solid ${C.cb};padding:6px 0 10px}
  .bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 2px;cursor:pointer;border:none;background:none}
  .bottom-nav-item .nav-icon{font-size:20px}.bottom-nav-item .nav-label{font-size:10px;font-weight:500;color:${C.mu}}
  .bottom-nav-item.active .nav-label{color:${C.ac}}
  .g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr 1fr!important}.g4{grid-template-columns:1fr 1fr!important}
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
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.modal-box{background:${C.card};border:1px solid ${C.cb};border-radius:16px;padding:26px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto}
.toast{position:fixed;top:20px;right:20px;background:${C.card};border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;z-index:2000;box-shadow:0 4px 24px rgba(0,0,0,0.6);border:1px solid ${C.cb};font-size:13px;max-width:320px;animation:slideIn 0.25s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.login-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${C.bg};padding:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.gkpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.section-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:${C.wh};letter-spacing:-0.3px}
.section-sub{color:${C.mu};font-size:13px;margin-top:3px}
.tab-bar{display:flex;gap:4px;background:${C.card};border-radius:10px;padding:4px;border:1px solid ${C.cb};margin-bottom:16px;flex-wrap:wrap}
.tab-btn{flex:1;padding:7px;border-radius:7px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;white-space:nowrap;font-family:'DM Sans',sans-serif}
.progress-bar{background:${C.bg};border-radius:4px;height:6px;overflow:hidden}
.progress-fill{height:100%;border-radius:4px;transition:width 0.5s ease}
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
const KPI=({label,value,color,sub,icon})=>(
  <div className="card-sm" style={{position:"relative",overflow:"hidden"}}>
    {icon&&<div style={{position:"absolute",top:10,right:14,fontSize:22,opacity:0.12}}>{icon}</div>}
    <p style={{fontSize:10,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6}}>{label}</p>
    <p style={{fontSize:22,fontWeight:800,color:color||C.wh,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.5px"}}>{value}</p>
    {sub&&<p style={{fontSize:11,color:C.mu,marginTop:4}}>{sub}</p>}
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
  return(<div className="toast"><span style={{color,fontWeight:700}}>{toast.type==="error"?"✕":toast.type==="warn"?"⚠":"✓"}</span><span>{toast.message}</span><button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:C.mu,cursor:"pointer"}}>✕</button></div>);
};

function Dashboard({pedidos,clientes,materiales,gastos}){
  const now=new Date(),mes=now.getMonth()+1,anio=now.getFullYear();
  const activos=pedidos.filter(p=>p.estado!=="entregado"&&p.estado!=="cotizacion");
  const vencidos=activos.filter(p=>{const d=diff(p.fecha_entrega);return d!==null&&d<0;});
  const enSemana=activos.filter(p=>{const d=diff(p.fecha_entrega);return d!==null&&d>=0&&d<=7;});
  const pedidosMes=pedidos.filter(p=>{const d=new Date(p.fecha_pedido);return d.getMonth()+1===mes&&d.getFullYear()===anio&&p.estado!=="cotizacion";});
  const anticiposMes=pedidosMes.reduce((a,b)=>a+Number(b.anticipo||0),0);
  const saldosMes=pedidosMes.filter(p=>p.saldo_cobrado).reduce((a,b)=>a+Number(b.precio_total||0)-Number(b.anticipo||0),0);
  const ingresosMes=anticiposMes+saldosMes;
  const gastosMes=gastos.filter(g=>{const d=new Date(g.fecha);return d.getMonth()+1===mes&&d.getFullYear()===anio;}).reduce((a,b)=>a+Number(b.monto||0),0);
  const netoMes=ingresosMes-gastosMes;
  const saldoPorCobrar=pedidos.filter(p=>p.estado!=="cotizacion"&&!p.saldo_cobrado).reduce((a,b)=>a+(Number(b.precio_total||0)-Number(b.anticipo||0)),0);
  const stockBajo=materiales.filter(m=>Number(m.stock_actual)<=Number(m.stock_minimo||0)).length;
  const proximas=[...activos].filter(p=>p.fecha_entrega).sort((a,b)=>new Date(a.fecha_entrega)-new Date(b.fecha_entrega)).slice(0,5);
  return(
    <div>
      <div style={{marginBottom:24}}><p className="section-title">📦 Dashboard</p><p className="section-sub">Pack'in with Niki · {MESES_L[mes]} {anio}</p></div>
      <div className="gkpi" style={{marginBottom:16}}>
        <KPI label="Pedidos activos" value={activos.length} color={C.bl} icon="📦" sub={`${enSemana.length} esta semana`}/>
        <KPI label="Entregas vencidas" value={vencidos.length} color={vencidos.length>0?C.re:C.gr} icon="🚨" sub={vencidos.length>0?"Atención urgente":"Al día ✓"}/>
        <KPI label="Cobrado este mes" value={`Bs. ${fmt(ingresosMes)}`} color={C.gr} icon="💵"/>
        <KPI label="Gastos del mes" value={`Bs. ${fmt(gastosMes)}`} color={C.re} icon="💸"/>
        <KPI label="Neto del mes" value={`Bs. ${fmt(netoMes)}`} color={netoMes>=0?C.gr:C.re} icon="📊"/>
        <KPI label="Por cobrar" value={`Bs. ${fmt(saldoPorCobrar)}`} color={C.am} icon="💳" sub="saldo pendiente"/>
        <KPI label="Clientes" value={clientes.length} color={C.pu} icon="👥"/>
        <KPI label="Stock bajo" value={stockBajo} color={stockBajo>0?C.am:C.gr} icon="⚠️" sub={stockBajo>0?"Revisar":"OK ✓"}/>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <p style={{fontSize:13,fontWeight:600,color:C.wh,marginBottom:14}}>📅 Próximas entregas</p>
        {proximas.length===0&&<p style={{color:C.mu,fontSize:13}}>Sin pedidos activos</p>}
        {proximas.map(p=>{
          const cli=clientes.find(c=>c.id===p.cliente_id);
          const d=diff(p.fecha_entrega);
          const color=d<0?C.re:d===0?C.am:d<=3?C.gr:C.mu;
          const s=getBadge(p.estado);
          return(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.cb}`}}>
              <div style={{width:40,height:40,borderRadius:10,background:`${color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{d<0?"⏰":d===0?"🔔":"📦"}</div>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:600,color:C.wh}}>{cli?.nombre||"Cliente"}{cli?.marca?` — ${cli.marca}`:""}</p>
                <p style={{fontSize:11,color:C.mu}}>Bs. {fmt(p.precio_total)} · <span className="badge" style={{background:s.bg,color:s.c,fontSize:10}}>{p.estado}</span></p>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <p style={{fontSize:13,fontWeight:700,color}}>{d<0?`Hace ${Math.abs(d)}d`:d===0?"¡Hoy!":d===1?"Mañana":`En ${d}d`}</p>
                <p style={{fontSize:11,color:C.mu}}>{fmtF(p.fecha_entrega)}</p>
              </div>
            </div>
          );
        })}
      </div>
      {stockBajo>0&&<div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}><span>⚠️</span><p style={{fontSize:13,color:C.am}}>{stockBajo} material{stockBajo>1?"es":""} bajo el stock mínimo — revisá Materiales</p></div>}
    </div>
  );
}

function Pedidos({pedidos,clientes,reload,showToast}){
  const [tab,setTab]=useState("activos");
  const [modal,setModal]=useState(null);
  const [detalle,setDetalle]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [items,setItems]=useState([]);
  const [detalleItems,setDetalleItems]=useState([]);
  const [fp,setFp]=useState({cliente_id:"",fecha_pedido:hoy(),fecha_entrega:"",estado:"confirmado",precio_total:"",anticipo:"",saldo_cobrado:false,canal_origen:"WhatsApp",notas:""});

  const activos=pedidos.filter(p=>p.estado!=="entregado"&&p.estado!=="cotizacion");
  const cotizaciones=pedidos.filter(p=>p.estado==="cotizacion");
  const entregados=pedidos.filter(p=>p.estado==="entregado");

  useEffect(()=>{
    if(!detalle)return;
    supabase.from("pedido_items").select("*").eq("pedido_id",detalle.id).then(({data})=>setDetalleItems(data||[]));
  },[detalle]);

  const addItem=()=>setItems(p=>[...p,{tipo_caja:"",medidas:"",cantidad:1,unidad:"docena",decoracion:"",precio_unitario:""}]);
  const updItem=(i,f,v)=>setItems(p=>p.map((it,idx)=>idx===i?{...it,[f]:v}:it));
  const delItem=(i)=>setItems(p=>p.filter((_,idx)=>idx!==i));

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
    const idx=ESTADOS.indexOf(p.estado);
    if(idx>=ESTADOS.length-1)return;
    await supabase.from("pedidos").update({estado:ESTADOS[idx+1]}).eq("id",p.id);
    reload();showToast(`→ ${ESTADOS_LABEL[idx+1]}`);
    setDetalle(prev=>prev?{...prev,estado:ESTADOS[idx+1]}:null);
  };
  const cobrarSaldo=async(p)=>{await supabase.from("pedidos").update({saldo_cobrado:true,estado:"entregado"}).eq("id",p.id);reload();showToast("Saldo cobrado ✓");setDetalle(null);};
  const eliminar=async()=>{await supabase.from("pedidos").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");setDetalle(null);};

  const Card=({p})=>{
    const cli=clientes.find(c=>c.id===p.cliente_id);
    const d=diff(p.fecha_entrega);
    const s=getBadge(p.estado);
    const urgente=d!==null&&d<=2&&p.estado!=="entregado";
    return(
      <div onClick={()=>setDetalle(p)} style={{background:C.card,border:`1px solid ${urgente?"rgba(248,113,113,0.4)":C.cb}`,borderLeft:`4px solid ${ESTADOS_COLOR[ESTADOS.indexOf(p.estado)]||C.mu}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><p style={{fontSize:13,fontWeight:700,color:C.wh}}>{cli?.nombre||"Sin cliente"}</p>{cli?.marca&&<p style={{fontSize:11,color:C.mu}}>{cli.marca}</p>}</div>
          <span className="badge" style={{background:s.bg,color:s.c}}>{p.estado}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{fontSize:14,fontWeight:700,color:C.ac}}>Bs. {fmt(p.precio_total)}</p>
          <div style={{textAlign:"right"}}>
            {p.fecha_entrega&&<p style={{fontSize:11,color:d<0?C.re:d<=3?C.am:C.mu}}>{d<0?`Vencido ${Math.abs(d)}d`:d===0?"¡Hoy!":d===1?"Mañana":`${d}d`}</p>}
            <p style={{fontSize:11,color:C.mu}}>{fmtF(p.fecha_entrega)}</p>
          </div>
        </div>
        {!p.saldo_cobrado&&p.estado!=="cotizacion"&&<p style={{fontSize:11,color:C.am,marginTop:4}}>Saldo: Bs. {fmt(Number(p.precio_total)-Number(p.anticipo||0))}</p>}
      </div>
    );
  };

  const FormItems=()=>(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p style={{fontSize:11,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px"}}>Cajas del pedido</p>
        <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Agregar caja</button>
      </div>
      {items.map((it,i)=>(
        <div key={i} style={{background:C.bg,borderRadius:8,padding:12,marginBottom:8}}>
          <div className="g2" style={{marginBottom:8}}>
            <div className="form-group" style={{marginBottom:0}}><label className="form-label">Tipo</label><input className="form-input" value={it.tipo_caja} onChange={e=>updItem(i,"tipo_caja",e.target.value)} placeholder="Cuadrada, circular..."/></div>
            <div className="form-group" style={{marginBottom:0}}><label className="form-label">Medidas (cm)</label><input className="form-input" value={it.medidas} onChange={e=>updItem(i,"medidas",e.target.value)} placeholder="15×18×5"/></div>
            <div className="form-group" style={{marginBottom:0}}><label className="form-label">Cantidad</label><input className="form-input" type="number" value={it.cantidad} onChange={e=>updItem(i,"cantidad",e.target.value)}/></div>
            <div className="form-group" style={{marginBottom:0}}><label className="form-label">Unidad</label><select className="form-input" value={it.unidad} onChange={e=>updItem(i,"unidad",e.target.value)}><option value="docena">Docena</option><option value="unidad">Unidad</option></select></div>
            <div className="form-group" style={{marginBottom:0}}><label className="form-label">Precio (Bs.)</label><input className="form-input" type="number" value={it.precio_unitario} onChange={e=>updItem(i,"precio_unitario",e.target.value)}/></div>
            <div className="form-group" style={{marginBottom:0}}><label className="form-label">Decoración</label><input className="form-input" value={it.decoracion} onChange={e=>updItem(i,"decoracion",e.target.value)} placeholder="Vinilo, cinta razo..."/></div>
          </div>
          {items.length>1&&<button className="btn btn-danger btn-sm" onClick={()=>delItem(i)}>Quitar</button>}
        </div>
      ))}
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">📦 Pedidos</p><p className="section-sub">{activos.length} activos</p></div>
        <button className="btn btn-primary btn-sm" onClick={openNuevo}>+ Nuevo pedido</button>
      </div>
      <div className="tab-bar">
        {[["activos",`Activos (${activos.length})`],["cotizaciones",`Cotizaciones (${cotizaciones.length})`],["entregados","Entregados"]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?C.cb:"transparent",color:tab===id?C.wh:C.mu}}>{label}</button>
        ))}
      </div>
      {tab==="activos"&&(activos.length===0?<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin pedidos activos</div>:activos.sort((a,b)=>new Date(a.fecha_entrega||"9999")-new Date(b.fecha_entrega||"9999")).map(p=><Card key={p.id} p={p}/>))}
      {tab==="cotizaciones"&&(cotizaciones.length===0?<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin cotizaciones</div>:cotizaciones.map(p=><Card key={p.id} p={p}/>))}
      {tab==="entregados"&&(entregados.length===0?<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin pedidos entregados</div>:entregados.sort((a,b)=>new Date(b.fecha_pedido)-new Date(a.fecha_pedido)).map(p=><Card key={p.id} p={p}/>))}
      {confirm&&<Confirm msg="¿Eliminar este pedido?" onOk={eliminar} onCancel={()=>setConfirm(null)}/>}
      {detalle&&(
        <Modal title="Detalle del pedido" onClose={()=>setDetalle(null)} wide>
          {(()=>{
            const cli=clientes.find(c=>c.id===detalle.cliente_id);
            const s=getBadge(detalle.estado);
            const saldo=Number(detalle.precio_total||0)-Number(detalle.anticipo||0);
            return(<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
                <div><p style={{fontSize:18,fontWeight:700,color:C.wh}}>{cli?.nombre||"Sin cliente"}</p>{cli?.marca&&<p style={{fontSize:13,color:C.mu}}>{cli.marca}</p>}</div>
                <span className="badge" style={{background:s.bg,color:s.c,fontSize:13,padding:"4px 12px"}}>{detalle.estado}</span>
              </div>
              <div className="g2" style={{marginBottom:16}}>
                <div><p style={{fontSize:10,color:C.mu}}>TOTAL</p><p style={{fontSize:20,fontWeight:700,color:C.ac}}>Bs. {fmt(detalle.precio_total)}</p></div>
                <div><p style={{fontSize:10,color:C.mu}}>ANTICIPO</p><p style={{fontSize:20,fontWeight:700,color:C.gr}}>Bs. {fmt(detalle.anticipo)}</p></div>
                <div><p style={{fontSize:10,color:C.mu}}>SALDO</p><p style={{fontSize:20,fontWeight:700,color:detalle.saldo_cobrado?C.gr:C.am}}>Bs. {fmt(saldo)}{detalle.saldo_cobrado?" ✓":""}</p></div>
                <div><p style={{fontSize:10,color:C.mu}}>ENTREGA</p><p style={{fontSize:14,fontWeight:600,color:C.wh}}>{fmtF(detalle.fecha_entrega)}</p></div>
              </div>
              {detalle.notas&&<div style={{background:C.bg,borderRadius:8,padding:"10px 12px",marginBottom:16}}><p style={{fontSize:13,color:C.mu}}>{detalle.notas}</p></div>}
              {detalleItems.length>0&&(
                <div style={{marginBottom:16}}>
                  <p style={{fontSize:11,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:10}}>Cajas</p>
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
            </>);
          })()}
        </Modal>
      )}
      {(modal==="nuevo"||modal==="editar")&&(
        <Modal title={modal==="nuevo"?"Nuevo pedido":"Editar pedido"} onClose={()=>setModal(null)} wide>
          <div className="g2">
            <div className="form-group" style={{gridColumn:"1/-1"}}><label className="form-label">Cliente *</label><select className="form-input" value={fp.cliente_id} onChange={e=>setFp(p=>({...p,cliente_id:e.target.value}))}><option value="">Seleccionar...</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}{c.marca?` — ${c.marca}`:""}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Fecha pedido</label><input className="form-input" type="date" value={fp.fecha_pedido} onChange={e=>setFp(p=>({...p,fecha_pedido:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fecha entrega *</label><input className="form-input" type="date" value={fp.fecha_entrega} onChange={e=>setFp(p=>({...p,fecha_entrega:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Estado</label><select className="form-input" value={fp.estado} onChange={e=>setFp(p=>({...p,estado:e.target.value}))}>{ESTADOS.map((e,i)=><option key={e} value={e}>{ESTADOS_LABEL[i]}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Canal origen</label><select className="form-input" value={fp.canal_origen} onChange={e=>setFp(p=>({...p,canal_origen:e.target.value}))}>{["WhatsApp","Instagram","TikTok","Presencial","Otro"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Precio total (Bs.) *</label><input className="form-input" type="number" value={fp.precio_total} onChange={e=>setFp(p=>({...p,precio_total:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Anticipo (Bs.)</label><input className="form-input" type="number" value={fp.anticipo} onChange={e=>setFp(p=>({...p,anticipo:e.target.value}))}/></div>
            <div className="form-group" style={{gridColumn:"1/-1"}}><label className="form-label">Notas</label><input className="form-input" value={fp.notas||""} onChange={e=>setFp(p=>({...p,notas:e.target.value}))} placeholder="Instrucciones especiales..."/></div>
          </div>
          <FormItems/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Clientes({clientes,pedidos,reload,showToast}){
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fc,setFc]=useState({nombre:"",marca:"",ciudad:"",departamento:"",whatsapp:"",instagram:"",canal_preferido:"WhatsApp",notas:""});
  const save=async()=>{
    if(!fc.nombre)return showToast("Completá el nombre","error");
    setSaving(true);
    if(modal==="nuevo")await supabase.from("clientes").insert([fc]);
    else await supabase.from("clientes").update(fc).eq("id",fc.id);
    setModal(null);reload();showToast("Cliente guardado");setSaving(false);
  };
  const eliminar=async()=>{await supabase.from("clientes").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">👥 Clientes</p><p className="section-sub">{clientes.length} registrados</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>{setFc({nombre:"",marca:"",ciudad:"",departamento:"",whatsapp:"",instagram:"",canal_preferido:"WhatsApp",notas:""});setModal("nuevo");}}>+ Nuevo</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
        {clientes.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:C.mu,gridColumn:"1/-1"}}>Sin clientes aún</div>}
        {clientes.map(c=>{
          const peds=pedidos.filter(p=>p.cliente_id===c.id);
          const total=peds.reduce((a,b)=>a+Number(b.precio_total||0),0);
          const ini=c.nombre.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
          return(
            <div key={c.id} style={{background:C.card,border:`1px solid ${C.cb}`,borderRadius:14,padding:18}}>
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.ac}30,${C.pu}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:C.ac,marginBottom:12}}>{ini}</div>
              <p style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:2}}>{c.nombre}</p>
              {c.marca&&<p style={{fontSize:12,color:C.ac,marginBottom:4}}>{c.marca}</p>}
              {c.ciudad&&<p style={{fontSize:11,color:C.mu,marginBottom:2}}>📍 {c.ciudad}{c.departamento?`, ${c.departamento}`:""}</p>}
              {c.whatsapp&&<p style={{fontSize:11,color:C.mu,marginBottom:2}}>📱 {c.whatsapp}</p>}
              <p style={{fontSize:11,color:C.mu,marginTop:8,marginBottom:12}}>{peds.length} pedidos · Bs. {fmt(total)}</p>
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
            <div className="form-group"><label className="form-label">Departamento</label><select className="form-input" value={fc.departamento||""} onChange={e=>setFc(p=>({...p,departamento:e.target.value}))}><option value="">—</option>{["Cochabamba","La Paz","Santa Cruz","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
            <div className="form-group"><label className="form-label">WhatsApp</label><input className="form-input" value={fc.whatsapp||""} onChange={e=>setFc(p=>({...p,whatsapp:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" value={fc.instagram||""} onChange={e=>setFc(p=>({...p,instagram:e.target.value}))} placeholder="@usuario"/></div>
            <div className="form-group"><label className="form-label">Canal preferido</label><select className="form-input" value={fc.canal_preferido} onChange={e=>setFc(p=>({...p,canal_preferido:e.target.value}))}>{["WhatsApp","Instagram","TikTok","Presencial"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fc.notas||""} onChange={e=>setFc(p=>({...p,notas:e.target.value}))} placeholder="Medidas habituales, preferencias..."/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Materiales({materiales,reload,showToast}){
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fm,setFm]=useState({nombre:"",categoria:"base",presentacion:"",costo_presentacion:"",stock_actual:"",stock_minimo:""});
  const save=async()=>{
    if(!fm.nombre)return showToast("Completá el nombre","error");
    setSaving(true);
    const data={...fm,costo_presentacion:Number(fm.costo_presentacion||0),stock_actual:Number(fm.stock_actual||0),stock_minimo:Number(fm.stock_minimo||0)};
    if(modal==="nuevo")await supabase.from("materiales").insert([data]);
    else await supabase.from("materiales").update(data).eq("id",fm.id);
    setModal(null);reload();showToast("Guardado");setSaving(false);
  };
  const eliminar=async()=>{await supabase.from("materiales").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");};
  const bajo=materiales.filter(m=>Number(m.stock_actual)<=Number(m.stock_minimo||0));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">🎨 Materiales</p><p className="section-sub">{materiales.length} materiales · {bajo.length} alertas</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>{setFm({nombre:"",categoria:"base",presentacion:"",costo_presentacion:"",stock_actual:"",stock_minimo:""});setModal("nuevo");}}>+ Agregar</button>
      </div>
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
                  <div style={{display:"flex",alignItems:"center",gap:8}}><p style={{fontSize:13,fontWeight:600,color:C.wh}}>{m.nombre}</p>{esBajo&&<span style={{fontSize:10,background:"rgba(248,113,113,0.12)",color:C.re,padding:"2px 7px",borderRadius:5,fontWeight:600}}>⚠ BAJO</span>}</div>
                  <p style={{fontSize:11,color:C.mu}}>{m.categoria} · {m.presentacion}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{textAlign:"right"}}><p style={{fontSize:18,fontWeight:700,color:barColor,fontFamily:"'Syne',sans-serif"}}>{fmt(m.stock_actual)}<span style={{fontSize:11,fontWeight:400,color:C.mu}}> {m.presentacion}</span></p><p style={{fontSize:11,color:C.mu}}>Bs. {fmt(m.costo_presentacion)}/u</p></div>
                  <div style={{display:"flex",gap:4}}><button className="btn btn-ghost btn-sm" onClick={()=>{setFm(m);setModal("editar");}}>✏</button><button className="btn btn-danger btn-sm" onClick={()=>setConfirm(m.id)}>✕</button></div>
                </div>
              </div>
              <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:C.mu}}>vs mínimo ({fmt(m.stock_minimo||0)} {m.presentacion})</span><span style={{fontSize:10,color:barColor,fontWeight:600}}>{esBajo?"Bajo el mínimo":"OK ✓"}</span></div><div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(pct/2,100)}%`,background:barColor}}/></div></div>
            </div>
          );
        })}
      </div>
      {confirm&&<Confirm msg="¿Eliminar este material?" onOk={eliminar} onCancel={()=>setConfirm(null)}/>}
      {(modal==="nuevo"||modal==="editar")&&(
        <Modal title={modal==="nuevo"?"Nuevo material":"Editar material"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={fm.nombre} onChange={e=>setFm(p=>({...p,nombre:e.target.value}))} placeholder="Ej: Cartulina Triplex Blanca"/></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Categoría</label><select className="form-input" value={fm.categoria} onChange={e=>setFm(p=>({...p,categoria:e.target.value}))}>{["base","decoracion","embalaje","herramienta","otro"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Presentación</label><input className="form-input" value={fm.presentacion||""} onChange={e=>setFm(p=>({...p,presentacion:e.target.value}))} placeholder="Resma, rollo, paquete..."/></div>
            <div className="form-group"><label className="form-label">Costo (Bs.)</label><input className="form-input" type="number" value={fm.costo_presentacion||""} onChange={e=>setFm(p=>({...p,costo_presentacion:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Stock actual</label><input className="form-input" type="number" value={fm.stock_actual||""} onChange={e=>setFm(p=>({...p,stock_actual:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Stock mínimo</label><input className="form-input" type="number" value={fm.stock_minimo||""} onChange={e=>setFm(p=>({...p,stock_minimo:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button></div>
        </Modal>
      )}
    </div>
  );
}

function Finanzas({pedidos,gastos,reload,showToast}){
  const now=new Date(),mes=now.getMonth()+1,anio=now.getFullYear();
  const [tab,setTab]=useState("resumen");
  const [modal,setModal]=useState(false);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fg,setFg]=useState({categoria:"",descripcion:"",monto:"",fecha:hoy()});
  const saveGasto=async()=>{
    if(!fg.categoria||!fg.monto)return showToast("Completá categoría y monto","error");
    setSaving(true);
    await supabase.from("gastos").insert([{...fg,monto:Number(fg.monto)}]);
    setModal(false);reload();showToast("Gasto registrado");setSaving(false);
  };
  const eliminarGasto=async()=>{await supabase.from("gastos").delete().eq("id",confirm);setConfirm(null);reload();showToast("Eliminado");};
  const pedidosMes=pedidos.filter(p=>{const d=new Date(p.fecha_pedido);return d.getMonth()+1===mes&&d.getFullYear()===anio&&p.estado!=="cotizacion";});
  const anticiposMes=pedidosMes.reduce((a,b)=>a+Number(b.anticipo||0),0);
  const saldosMes=pedidosMes.filter(p=>p.saldo_cobrado).reduce((a,b)=>a+Number(b.precio_total||0)-Number(b.anticipo||0),0);
  const ingresosMes=anticiposMes+saldosMes;
  const gastosMes=gastos.filter(g=>{const d=new Date(g.fecha);return d.getMonth()+1===mes&&d.getFullYear()===anio;}).reduce((a,b)=>a+Number(b.monto||0),0);
  const netoMes=ingresosMes-gastosMes;
  const saldoPorCobrar=pedidos.filter(p=>p.estado!=="cotizacion"&&!p.saldo_cobrado).reduce((a,b)=>a+(Number(b.precio_total||0)-Number(b.anticipo||0)),0);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">💰 Finanzas</p><p className="section-sub">{MESES_L[mes]} {anio}</p></div>
        <button className="btn btn-ghost btn-sm" onClick={()=>{setFg({categoria:"",descripcion:"",monto:"",fecha:hoy()});setModal(true);}}>+ Gasto</button>
      </div>
      <div className="g4" style={{marginBottom:16}}>
        <div className="card-sm" style={{borderTop:`3px solid ${C.gr}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Cobrado</p><p style={{fontSize:20,fontWeight:800,color:C.gr,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(ingresosMes)}</p></div>
        <div className="card-sm" style={{borderTop:`3px solid ${C.re}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Gastos</p><p style={{fontSize:20,fontWeight:800,color:C.re,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(gastosMes)}</p></div>
        <div className="card-sm" style={{borderTop:`3px solid ${netoMes>=0?C.gr:C.re}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Neto</p><p style={{fontSize:20,fontWeight:800,color:netoMes>=0?C.gr:C.re,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(netoMes)}</p></div>
        <div className="card-sm" style={{borderTop:`3px solid ${C.am}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Por cobrar</p><p style={{fontSize:20,fontWeight:800,color:C.am,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(saldoPorCobrar)}</p></div>
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
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0"}}><span style={{fontSize:13,fontWeight:600,color:C.wh}}>Total cobrado</span><span style={{fontSize:13,fontWeight:700,color:C.gr}}>Bs. {fmt(ingresosMes)}</span></div>
          </div>
          <div className="card">
            <p style={{fontSize:13,fontWeight:600,color:C.wh,marginBottom:12}}>Saldos pendientes</p>
            {pedidos.filter(p=>p.estado!=="cotizacion"&&!p.saldo_cobrado).slice(0,5).map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.cb}`}}>
                <span style={{fontSize:12,color:C.mu}}>{p.notas?.slice(0,22)||"Pedido"}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.am}}>Bs. {fmt(Number(p.precio_total||0)-Number(p.anticipo||0))}</span>
              </div>
            ))}
            {pedidos.filter(p=>p.estado!=="cotizacion"&&!p.saldo_cobrado).length===0&&<p style={{fontSize:13,color:C.gr}}>Todo cobrado ✓</p>}
          </div>
        </div>
      )}
      {tab==="ingresos"&&(
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Estado</th><th>Total</th><th>Anticipo</th><th>Saldo</th></tr></thead>
            <tbody>
              {pedidosMes.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:C.mu,padding:28}}>Sin pedidos este mes</td></tr>}
              {pedidosMes.sort((a,b)=>new Date(b.fecha_pedido)-new Date(a.fecha_pedido)).map(p=>(
                <tr key={p.id} className="table-row">
                  <td style={{color:C.mu,fontSize:12}}>{fmtF(p.fecha_pedido)}</td>
                  <td><Badge type={p.estado}/></td>
                  <td style={{fontWeight:600,color:C.ac}}>Bs. {fmt(p.precio_total)}</td>
                  <td style={{color:C.gr}}>Bs. {fmt(p.anticipo)}</td>
                  <td style={{color:p.saldo_cobrado?C.gr:C.am}}>{p.saldo_cobrado?"Cobrado ✓":`Bs. ${fmt(Number(p.precio_total)-Number(p.anticipo))}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab==="gastos"&&(
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {gastos.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:C.mu,padding:28}}>Sin gastos</td></tr>}
              {gastos.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(g=>(
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
          <div className="form-group"><label className="form-label">Categoría *</label><select className="form-input" value={fg.categoria} onChange={e=>setFg(p=>({...p,categoria:e.target.value}))}><option value="">Seleccionar...</option>{["Materiales","Herramientas","Transporte","Servicios","Embalaje","Publicidad","Otro"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" value={fg.descripcion} onChange={e=>setFg(p=>({...p,descripcion:e.target.value}))}/></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Monto (Bs.) *</label><input className="form-input" type="number" value={fg.monto} onChange={e=>setFg(p=>({...p,monto:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={fg.fecha} onChange={e=>setFg(p=>({...p,fecha:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button className="btn btn-secondary btn-sm" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={saveGasto} disabled={saving}>{saving?"Guardando...":"Guardar"}</button></div>
        </Modal>
      )}
    </div>
  );
}

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
          <p style={{fontSize:13,color:C.mu,marginTop:4}}>Sistema de gestión · Niki</p>
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

export default function App(){
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const [data,setData]=useState({pedidos:[],clientes:[],materiales:[],gastos:[]});
  const showToast=(message,type="success")=>{setToast({message,type});setTimeout(()=>setToast(null),3000);};
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setLoading(false);});supabase.auth.onAuthStateChange((_,s)=>setSession(s));},[]);
  const load=async()=>{
    const[p,c,m,g]=await Promise.all([supabase.from("pedidos").select("*").order("fecha_entrega"),supabase.from("clientes").select("*").order("nombre"),supabase.from("materiales").select("*").order("nombre"),supabase.from("gastos").select("*").order("fecha").limit(1000)]);
    setData({pedidos:p.data||[],clientes:c.data||[],materiales:m.data||[],gastos:g.data||[]});
  };
  useEffect(()=>{if(session)load();},[session]);
  if(loading)return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,gap:16}}><div style={{fontSize:40}}>📦</div><p style={{color:C.mu,fontSize:13}}>Cargando Pack'in...</p></div>);
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
                <p style={{fontSize:11,color:C.mu,marginTop:2}}>with Niki</p>
              </div>
              {NAV.map(n=><div key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}><span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span></div>)}
              <div style={{marginTop:"auto",padding:"12px 6px",borderTop:`1px solid ${C.cb}`}}><button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>supabase.auth.signOut()}>Cerrar sesión</button></div>
            </div>
            <div className="main-content">
              {tab==="dashboard"&&<Dashboard pedidos={data.pedidos} clientes={data.clientes} materiales={data.materiales} gastos={data.gastos}/>}
              {tab==="pedidos"&&<Pedidos pedidos={data.pedidos} clientes={data.clientes} reload={load} showToast={showToast}/>}
              {tab==="clientes"&&<Clientes clientes={data.clientes} pedidos={data.pedidos} reload={load} showToast={showToast}/>}
              {tab==="materiales"&&<Materiales materiales={data.materiales} reload={load} showToast={showToast}/>}
              {tab==="finanzas"&&<Finanzas pedidos={data.pedidos} gastos={data.gastos} reload={load} showToast={showToast}/>}
            </div>
          </div>
          <div className="bottom-nav">
            {NAV.map(n=><button key={n.id} className={`bottom-nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}><span className="nav-icon">{n.icon}</span><span className="nav-label">{n.label}</span></button>)}
          </div>
        </div>
      )}
    </>
  );
}
