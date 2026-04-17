import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({ employees: 0, leaves: 0, uptime: 0, orgs: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animate counters on mount
  useEffect(() => {
    const targets = { employees: 10000, leaves: 50000, uptime: 99, orgs: 500 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        employees: Math.round(targets.employees * ease),
        leaves:    Math.round(targets.leaves * ease),
        uptime:    Math.round(targets.uptime * ease * 10) / 10,
        orgs:      Math.round(targets.orgs * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  // Cycle features
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const FEATURES = [
    { icon: '⚡', title: 'Smart Conflict Detection', desc: 'Auto-flags when too many same-role colleagues apply simultaneously', color: '#F59E0B' },
    { icon: '📅', title: 'Carry Forward Policy', desc: 'Year-end unused leaves roll over with configurable limits', color: '#10B981' },
    { icon: '🔔', title: 'Role-Targeted Notifications', desc: 'Each user gets only relevant alerts — zero noise', color: '#6366F1' },
    { icon: '👥', title: '3-Role Architecture', desc: 'Employee · Manager · Admin with fine-grained access control', color: '#EC4899' },
    { icon: '📊', title: 'Analytics & Audit Logs', desc: 'Deep insights with complete action history across all users', color: '#14B8A6' },
  ];

  const TESTIMONIALS = [
    { name: 'Priya Mehta', role: 'HR Manager · TechCorp India', text: 'LeaveFlow transformed how we handle leaves. Conflict detection alone saved us dozens of awkward scheduling situations.', avatar: 'PM' },
    { name: 'Arjun Nair', role: 'Engineering Lead · StartupXYZ', text: 'The backup employee feature is brilliant. My team never has coverage gaps anymore.', avatar: 'AN' },
    { name: 'Sneha Reddy', role: 'Operations Director · FinServ Ltd', text: 'Role-targeted notifications mean our managers only see what they need. Clean, professional, efficient.', avatar: 'SR' },
  ];

  const ROLES = [
    {
      icon: '👤', role: 'Employee', color: '#2D5A27', bg: '#E8F2E6', border: '#B8DDB3',
      features: ['Apply leave with backup selection', 'View real-time balance (CL/SL/EL)', 'Track leave status & history', 'Personal analytics & trends', 'Carry-forward balance display'],
      quote: '"Finally, a leave system that makes sense for employees."',
    },
    {
      icon: '👨‍💼', role: 'Manager', color: '#1A5E9B', bg: '#E6F0FB', border: '#B8D4F5',
      features: ['One-click approve / reject with remarks', 'Smart conflict alerts per designation', 'Team availability heatmap', 'Create events & assign by dept', 'Department-level analytics'],
      quote: '"I can manage my entire team\'s leaves in under 2 minutes."',
    },
    {
      icon: '🧑‍💼', role: 'Admin', color: '#9A6B00', bg: '#FEF9E7', border: '#F0D07A',
      features: ['Full user CRUD with role assignment', 'Configure CL/SL/EL quotas & policies', 'Process year-end carry forward', 'Org-wide analytics with year filter', 'Complete audit log trail'],
      quote: '"Total control over company leave rules — exactly what we needed."',
    },
  ];

  const S = {
    nav: {
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      background: scrolled ? 'rgba(255,255,255,.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(232,230,220,.8)' : 'none',
      transition: 'all .3s ease', padding: '0 max(24px, calc(50% - 640px))',
      display: 'flex', alignItems: 'center', height: 68,
    },
    section: { padding: '100px max(24px, calc(50% - 680px))' },
    sectionAlt: { padding: '100px max(24px, calc(50% - 680px))', background: '#FAFBFE' },
    h2: { fontFamily: 'Fraunces, serif', fontSize: 'clamp(30px,4vw,46px)', fontWeight: 600, color: '#1C2B3A', lineHeight: 1.2, marginBottom: 16 },
    lead: { fontSize: 18, color: '#5A7082', lineHeight: 1.7, maxWidth: 560 },
    badge: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 30, background: '#E8F2E6', color: '#1E3D1B', fontSize: 12.5, fontWeight: 700, letterSpacing: .4, marginBottom: 20 },
  };

  return (
    <div style={{ fontFamily: 'Sora, sans-serif', color: '#1C2B3A', overflowX: 'hidden', overflowY: 'auto', height: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#2D5A27,#1E3D1B)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌿</div>
          <span style={{ fontFamily:'Fraunces,serif', fontSize:19, color:'#2D5A27' }}>Leave<em style={{ color:'#C04A2A', fontStyle:'italic' }}>Flow</em> <span style={{ fontSize:11, color:'#8EA4B4', fontWeight:400, fontStyle:'normal' }}>Pro</span></span>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:20 }}>
          {['Features','Roles','Testimonials'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize:13.5, fontWeight:600, color:'#5A7082', textDecoration:'none', transition:'color .14s' }}
              onMouseEnter={e=>e.target.style.color='#2D5A27'} onMouseLeave={e=>e.target.style.color='#5A7082'}>{l}</a>
          ))}
          <button onClick={() => navigate('/login')} style={{ padding:'8px 22px', borderRadius:9, background:'#2D5A27', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .14s', boxShadow:'0 2px 8px rgba(45,90,39,.25)' }}
            onMouseEnter={e=>{e.target.style.background='#1E3D1B';e.target.style.transform='translateY(-1px)'}}
            onMouseLeave={e=>{e.target.style.background='#2D5A27';e.target.style.transform='none'}}>
            Sign In →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', background:'linear-gradient(160deg, #0F2117 0%, #1E3D1B 35%, #2D5A27 65%, #3A7A32 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'100px 24px 80px', position:'relative', overflow:'hidden', textAlign:'center' }}>
        {/* Decorative bg circles */}
        {[[400,400,-150,-100,'rgba(163,217,119,.06)'],[300,300,'auto',-80,'rgba(255,255,255,.03)'],[200,200,-60,'auto','rgba(192,74,42,.08)']].map(([w,h,t,l,bg],i)=>(
          <div key={i} style={{ position:'absolute', width:w, height:h, borderRadius:'50%', background:bg, top:t, left:l, right:l==='auto'?-80:'auto', pointerEvents:'none' }} />
        ))}
        {/* Animated grid pattern */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(163,217,119,.08) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:780, margin:'0 auto' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px', borderRadius:30, background:'rgba(163,217,119,.15)', border:'1px solid rgba(163,217,119,.3)', color:'#A3D977', fontSize:13, fontWeight:700, marginBottom:28, letterSpacing:.4 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#A3D977', display:'inline-block', animation:'pulse 2s infinite' }} />
            Now with 3-Role Architecture
          </div>

          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(38px,6vw,72px)', fontWeight:600, color:'#fff', lineHeight:1.15, marginBottom:22 }}>
            Leave Management<br />
            <em style={{ color:'#A3D977', fontStyle:'italic' }}>Made Intelligent</em>
          </h1>

          <p style={{ fontSize:'clamp(15px,1.8vw,19px)', color:'rgba(255,255,255,.72)', lineHeight:1.75, marginBottom:44, maxWidth:580, margin:'0 auto 44px' }}>
            Streamline every leave request, prevent team conflicts automatically, carry forward balances, and give each role exactly the visibility they need.
          </p>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:56 }}>
            <button onClick={() => navigate('/login')} style={{ padding:'14px 36px', borderRadius:11, background:'#A3D977', color:'#1E3D1B', border:'none', fontSize:15, fontWeight:800, cursor:'pointer', transition:'all .15s', boxShadow:'0 4px 20px rgba(163,217,119,.35)' }}
              onMouseEnter={e=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 8px 28px rgba(163,217,119,.5)'}}
              onMouseLeave={e=>{e.target.style.transform='none';e.target.style.boxShadow='0 4px 20px rgba(163,217,119,.35)'}}>
              Get Started Free →
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}
              style={{ padding:'14px 36px', borderRadius:11, background:'rgba(255,255,255,.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,.2)', fontSize:15, fontWeight:700, cursor:'pointer', transition:'all .15s', backdropFilter:'blur(8px)' }}
              onMouseEnter={e=>e.target.style.background='rgba(255,255,255,.18)'}
              onMouseLeave={e=>e.target.style.background='rgba(255,255,255,.1)'}>
              See Features ↓
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'rgba(255,255,255,.08)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,.1)', backdropFilter:'blur(8px)' }}>
            {[
              [`${counters.employees.toLocaleString()}+`,'Employees Managed'],
              [`${counters.leaves.toLocaleString()}+`,'Leaves Processed'],
              [`${counters.uptime}%`,'Platform Uptime'],
              [`${counters.orgs}+`,'Organizations'],
            ].map(([val,lbl]) => (
              <div key={lbl} style={{ padding:'22px 16px', textAlign:'center', borderRight:'1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:600, color:'#A3D977', lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:6, fontWeight:500 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={S.section}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <div style={S.badge}>✨ Core Features</div>
          <h2 style={{ ...S.h2, textAlign:'center' }}>Everything your team needs<br />in one platform</h2>
          <p style={{ ...S.lead, textAlign:'center', margin:'0 auto' }}>Built for Indian IT companies with all the compliance, carry-forward policies, and role structures you expect.</p>
        </div>

        {/* Feature spotlight (auto-cycling) */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center', marginBottom:64 }}>
          <div>
            {FEATURES.map((f, i) => (
              <div key={i} onClick={() => setActiveFeature(i)} style={{ display:'flex', gap:16, padding:'18px 20px', borderRadius:12, marginBottom:10, cursor:'pointer', transition:'all .2s', background: activeFeature===i ? '#fff' : 'transparent', border: `1.5px solid ${activeFeature===i ? '#E8E6DC' : 'transparent'}`, boxShadow: activeFeature===i ? '0 4px 16px rgba(0,0,0,.06)' : 'none' }}>
                <div style={{ width:44, height:44, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, background: activeFeature===i ? f.color+'18' : '#F4F2EA', transition:'all .2s', flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize:14.5, fontWeight:700, color:'#1C2B3A', marginBottom:4 }}>{f.title}</div>
                  {activeFeature===i && <div style={{ fontSize:13, color:'#5A7082', lineHeight:1.6, animation:'fadeIn .2s ease' }}>{f.desc}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'linear-gradient(135deg,#F8FBF8,#EEF5EC)', borderRadius:20, padding:40, border:'1.5px solid #D4E8D0', minHeight:340, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center' }}>
            <div style={{ fontSize:56, marginBottom:20 }}>{FEATURES[activeFeature].icon}</div>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:24, fontWeight:600, color:'#1C2B3A', marginBottom:12 }}>{FEATURES[activeFeature].title}</div>
            <div style={{ fontSize:15, color:'#5A7082', lineHeight:1.7, maxWidth:300 }}>{FEATURES[activeFeature].desc}</div>
            <div style={{ display:'flex', gap:6, marginTop:24 }}>
              {FEATURES.map((_,i) => <div key={i} style={{ width:i===activeFeature?24:8, height:8, borderRadius:4, background:i===activeFeature?'#2D5A27':'#C8DEC5', transition:'all .3s' }} />)}
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {[
            { icon:'🗓️', title:'Smart Calendar', desc:'Unified team calendar showing leaves, events & holidays with dark/light views' },
            { icon:'🔄', title:'Carry Forward', desc:'Automated year-end processing with individual notifications for each employee' },
            { icon:'📋', title:'Audit Trail', desc:'Every approve, reject, policy change and login — fully logged and accessible' },
            { icon:'🔍', title:'Conflict Engine', desc:'Designation-based detection flags when too many teammates apply at once' },
            { icon:'🎯', title:'Backup Assignment', desc:'Dynamic backup dropdown shows only colleagues available for your chosen dates' },
            { icon:'📱', title:'Real-Time Alerts', desc:'Role-targeted notifications ensure zero noise — relevant alerts only' },
          ].map(f => (
            <div key={f.title} style={{ padding:'26px 24px', borderRadius:14, border:'1.5px solid #E8E6DC', background:'#fff', transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#2D5A27';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.07)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8E6DC';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
              <div style={{ fontSize:28, marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontSize:14.5, fontWeight:700, color:'#1C2B3A', marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'#5A7082', lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ ...S.sectionAlt }}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <div style={S.badge}>👥 Three Roles</div>
          <h2 style={{ ...S.h2, textAlign:'center' }}>One platform, three powerful perspectives</h2>
          <p style={{ ...S.lead, textAlign:'center', margin:'0 auto' }}>Each role gets a tailored interface with exactly the tools and data they need — nothing more, nothing less.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {ROLES.map(r => (
            <div key={r.role} style={{ background:'#fff', borderRadius:18, border:`1.5px solid ${r.border}`, overflow:'hidden', transition:'all .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,.09)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
              <div style={{ padding:'28px 24px 22px', background:r.bg, borderBottom:`1.5px solid ${r.border}` }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{r.icon}</div>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:22, fontWeight:600, color:r.color, marginBottom:8 }}>{r.role}</div>
                <p style={{ fontSize:13, color:'#5A7082', fontStyle:'italic', lineHeight:1.5 }}>{r.quote}</p>
              </div>
              <div style={{ padding:'24px' }}>
                {r.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:r.bg, border:`1.5px solid ${r.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:r.color, fontWeight:800, flexShrink:0, marginTop:1 }}>✓</div>
                    <span style={{ fontSize:13, color:'#354C5F', lineHeight:1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={S.section}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <div style={S.badge}>💬 Testimonials</div>
          <h2 style={{ ...S.h2, textAlign:'center' }}>Teams love LeaveFlow Pro</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ padding:'28px 26px', borderRadius:16, border:'1.5px solid #E8E6DC', background:'#fff', position:'relative' }}>
              <div style={{ fontSize:32, color:'#D4E8D0', fontFamily:'Georgia,serif', lineHeight:.8, marginBottom:14 }}>"</div>
              <p style={{ fontSize:14, color:'#354C5F', lineHeight:1.75, marginBottom:20, fontStyle:'italic' }}>{t.text}</p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#2D5A27,#3A7A32)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:'#1C2B3A' }}>{t.name}</div>
                  <div style={{ fontSize:11.5, color:'#8EA4B4' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'80px 24px', background:'linear-gradient(135deg,#0F2117,#1E3D1B)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(163,217,119,.06) 1px, transparent 1px)', backgroundSize:'36px 36px', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:600, color:'#fff', marginBottom:16, lineHeight:1.3 }}>
            Ready to modernize<br />your leave management?
          </div>
          <p style={{ fontSize:16, color:'rgba(255,255,255,.65)', marginBottom:36, lineHeight:1.7 }}>
            Join organizations already using LeaveFlow Pro. Set up takes under 5 minutes.
          </p>
          <button onClick={() => navigate('/login')} style={{ padding:'15px 48px', borderRadius:11, background:'#A3D977', color:'#1E3D1B', border:'none', fontSize:16, fontWeight:800, cursor:'pointer', transition:'all .15s', boxShadow:'0 4px 24px rgba(163,217,119,.4)' }}
            onMouseEnter={e=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 8px 32px rgba(163,217,119,.55)'}}
            onMouseLeave={e=>{e.target.style.transform='none';e.target.style.boxShadow='0 4px 24px rgba(163,217,119,.4)'}}>
            Start Managing Leaves →
          </button>
          <div style={{ marginTop:20, fontSize:13, color:'rgba(255,255,255,.4)' }}>No credit card required · Free to use</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'24px max(24px,calc(50% - 680px))', background:'#0A1610', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:26, height:26, background:'#1E3D1B', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🌿</div>
          <span style={{ fontFamily:'Fraunces,serif', fontSize:15, color:'rgba(255,255,255,.6)' }}>Leave<em style={{ color:'#A3D977', fontStyle:'italic' }}>Flow</em> Pro</span>
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>© 2025 LeaveFlow Pro · Built for modern HR teams</div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
