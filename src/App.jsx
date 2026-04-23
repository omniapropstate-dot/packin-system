import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return <div style={{padding:40, textAlign:'center'}}>Cargando...</div>

  if (!session) return <Login />

  return <Dashboard session={session} />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fdf6f0'}}>
      <div style={{background:'white',padding:32,borderRadius:16,width:320,boxShadow:'0 2px 16px rgba(0,0,0,0.08)'}}>
        <p style={{fontSize:22,fontWeight:600,marginBottom:4}}>📦 Pack'in</p>
        <p style={{fontSize:13,color:'#888',marginBottom:24}}>Sistema de gestión</p>
        {error && <p style={{color:'red',fontSize:13,marginBottom:12}}>{error}</p>}
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
          style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #ddd',marginBottom:10,fontSize:14,boxSizing:'border-box'}}/>
        <input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&login()}
          style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #ddd',marginBottom:16,fontSize:14,boxSizing:'border-box'}}/>
        <button onClick={login}
          style={{width:'100%',padding:'11px',borderRadius:8,background:'#e8845a',color:'white',border:'none',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          Ingresar
        </button>
      </div>
    </div>
  )
}

function Dashboard({ session }) {
  return (
    <div style={{padding:32}}>
      <p style={{fontSize:20,fontWeight:600}}>📦 Pack'in System</p>
      <p style={{color:'#888'}}>Bienvenida, {session.user.email}</p>
      <button onClick={()=>supabase.auth.signOut()}
        style={{marginTop:16,padding:'8px 16px',borderRadius:8,border:'1px solid #ddd',cursor:'pointer'}}>
        Cerrar sesión
      </button>
    </div>
  )
}
