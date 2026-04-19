import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim())    { setError('Please enter your email address'); return; }
    if (!form.password.trim()) { setError('Please enter your password'); return; }
    setError(''); setLoading(true);
    const res = await login(form.email.trim().toLowerCase(), form.password);
    setLoading(false);
    if (res.success) navigate('/home');
    else setError(res.message || 'Invalid email or password. Please try again.');
  };

  const inp = (focus) => ({
    width:'100%', padding:'11px 14px', border:`1.5px solid ${focus?'#2D5A27':'#E8E6DC'}`,
    borderRadius:10, fontFamily:'Sora,sans-serif', fontSize:14, color:'#1C2B3A', background:'#fff',
    outline:'none', boxShadow: focus ? '0 0 0 3px #E8F2E6' : 'none', transition:'all .14s'
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', overflow:'auto', fontFamily:'Sora,sans-serif' }}>

      {/* LEFT BRANDING PANEL */}
      <div style={{ flex:'0 0 48%', background:'linear-gradient(160deg,#0F2117 0%,#1A3318 30%,#2D5A27 70%,#3A7A32 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 80px 100px 150px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(163,217,119,.06) 1px, transparent 1px)', backgroundSize:'36px 36px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'rgba(255,255,255,.03)', top:-100, right:-120, pointerEvents:'none' }} />
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:13, marginBottom:52 }}>
            <div style={{ width:48, height:48, background:'rgba(255,255,255,.12)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,.18)' }}>🌿</div>
            <div>
              <div style={{ fontFamily:'Fraunces,serif', fontSize:26, color:'#fff', lineHeight:1 }}>Leave<em style={{ color:'#A3D977', fontStyle:'italic' }}>Flow</em> Pro</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:500, marginTop:3, letterSpacing:.5 }}>Enterprise Leave Management</div>
            </div>
          </div>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(26px,3vw,38px)', color:'#fff', lineHeight:1.25, marginBottom:18, fontWeight:600 }}>
            Your team's leaves,<br /><em style={{ color:'#A3D977', fontStyle:'italic' }}>intelligently managed</em>
          </div>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.65)', lineHeight:1.8, marginBottom:44, maxWidth:400 }}>
            The modern leave management platform built for tech teams — with smart conflict detection, carry-forward policies, and role-based access.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:44 }}>
            {[['⚡','Smart conflict detection by designation'],['📅','Year-end carry forward processing'],['🔔','Role-targeted notifications only'],['📊','Analytics for all three roles'],['🗓️','Unified calendar — leaves, events, holidays']].map(([ico,text])=>(
              <div key={text} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'rgba(163,217,119,.15)', border:'1px solid rgba(163,217,119,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{ico}</div>
                <span style={{ fontSize:13.5, color:'rgba(255,255,255,.78)', fontWeight:500 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:9, flexWrap:'wrap' }}>
            {[['👤 Employee','rgba(255,255,255,.1)','rgba(255,255,255,.5)'],['👨‍💼 Manager','rgba(163,217,119,.15)','#A3D977'],['🧑‍💼 Admin','rgba(255,200,100,.15)','#FFCA64']].map(([l,bg,c])=>(
              <div key={l} style={{ padding:'6px 15px', borderRadius:20, background:bg, color:c, fontSize:12, fontWeight:700 }}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px', background:'#FAF9F5' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div style={{ marginBottom:36 }}>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:30, color:'#1C2B3A', fontWeight:600, marginBottom:8 }}>Sign in</div>
            <div style={{ fontSize:14.5, color:'#5A7082', lineHeight:1.6 }}>Enter your company email and password to access your workspace.</div>
          </div>

          {error && (
            <div style={{ background:'#FFF5F5', border:'1.5px solid #FECACA', borderRadius:10, padding:'12px 16px', fontSize:13.5, color:'#B91C1C', fontWeight:600, marginBottom:20, display:'flex', alignItems:'center', gap:9 }}>
              <span>⚠️</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:700, color:'#354C5F', marginBottom:7 }}>Work Email</label>
              <FocusInput type="email" placeholder="you@company.com" value={form.email} autoComplete="email" autoFocus
                onChange={e=>{ setForm(p=>({...p,email:e.target.value})); setError(''); }} />
            </div>
            <div style={{ marginBottom:28 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:700, color:'#354C5F', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <FocusInput type={showPw?'text':'password'} placeholder="Enter your password" value={form.password} autoComplete="current-password"
                  style={{ paddingRight:44 }} onChange={e=>{ setForm(p=>({...p,password:e.target.value})); setError(''); }} />
                <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:17, color:'#8EA4B4', display:'flex', alignItems:'center' }}>
                  {showPw?'🙈':'👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'13px', borderRadius:10, background:loading?'#5A8A56':'#2D5A27', color:'#fff', fontFamily:'Sora,sans-serif', fontSize:14.5, fontWeight:700, border:'none', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:9, boxShadow:'0 3px 12px rgba(45,90,39,.3)', letterSpacing:.2, transition:'all .15s' }}
              onMouseEnter={e=>{ if(!loading){e.target.style.background='#1E3D1B';} }}
              onMouseLeave={e=>{ if(!loading){e.target.style.background='#2D5A27';} }}>
              {loading ? <><SpinIcon />Signing in…</> : '🔐 Sign In to LeaveFlow'}
            </button>
          </form>

          <div style={{ marginTop:28, padding:'14px 16px', background:'#fff', borderRadius:11, border:'1.5px solid #E8E6DC', display:'flex', alignItems:'flex-start', gap:11 }}>
            <span style={{ fontSize:18, flexShrink:0 }}>🔒</span>
            <div style={{ fontSize:12.5, color:'#5A7082', lineHeight:1.65 }}>
              <span style={{ fontWeight:700, color:'#354C5F' }}>Secure Access</span> — Your credentials are encrypted. Contact your system administrator if you need access or have forgotten your password.
            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:28 }}>
            <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', fontSize:13, color:'#8EA4B4', cursor:'pointer', fontFamily:'Sora,sans-serif' }}
              onMouseEnter={e=>e.target.style.color='#2D5A27'} onMouseLeave={e=>e.target.style.color='#8EA4B4'}>
              ← Back to LeaveFlow Home
            </button>
          </div>
          <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#B8CEDA' }}>© 2025 LeaveFlow Pro</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function FocusInput({ style={}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${focused?'#2D5A27':'#E8E6DC'}`, borderRadius:10, fontFamily:'Sora,sans-serif', fontSize:14, color:'#1C2B3A', background:'#fff', outline:'none', boxShadow:focused?'0 0 0 3px #E8F2E6':'none', transition:'all .14s', ...style }}
      onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
    />
  );
}
function SpinIcon() { return <div style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .8s linear infinite' }} />; }
