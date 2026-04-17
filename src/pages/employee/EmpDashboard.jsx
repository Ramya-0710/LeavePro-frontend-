// ═══════════════════════════════════════════════
// src/pages/employee/EmpDashboard.jsx
// ═══════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leaveAPI, eventAPI, holidayAPI } from '../../utils/api';
import { StatCard, RingChart, InsightCard, Loading, TLItem } from '../../components/shared/index';
import { fmtDate } from '../../utils/helpers';

export default function EmpDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves,   setLeaves]   = useState([]);
  const [events,   setEvents]   = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const yr = new Date().getFullYear();
    Promise.all([
      leaveAPI.getAll(),
      eventAPI.getAll({ year: yr }),
      holidayAPI.getAll({ year: yr })
    ]).then(([lR, eR, hR]) => {
      setLeaves(lR.data.data || []);
      setEvents(eR.data.data || []);
      setHolidays(hR.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  const bal = user?.leaveBalance || {};
  const cf  = user?.carryForwardBalance || 0;
  const today = new Date().toISOString().split('T')[0];
  const todayStatus = leaves.some(l => l.status === 'approved' && l.fromDate?.slice(0,10) <= today && l.toDate?.slice(0,10) >= today);
  const myDept = user?.department;

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>My Dashboard</h1><p>{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })} · Status: <b style={{ color: todayStatus ? 'var(--brick)' : 'var(--forest)' }}>{todayStatus ? '🏖️ On Leave' : '✅ Available'}</b></p></div>
        <button className="btn btn-primary" onClick={() => navigate('/apply')}>＋ Apply Leave</button>
      </div>

      <div className="g4 mb20">
        <StatCard label="CL Remaining" value={bal.cl ?? '—'} sub="Casual Leave"   icon="📅" accent="var(--forest)" />
        <StatCard label="SL Remaining" value={bal.sl ?? '—'} sub="Sick Leave"     icon="🤒" accent="var(--ocean)"  />
        <StatCard label="EL Remaining" value={bal.el ?? '—'} sub={cf > 0 ? `+${cf} carry-fwd` : 'Earned Leave'} icon="🌴" accent="var(--gold)" />
        <StatCard label="Pending"      value={leaves.filter(l=>l.status==='pending').length} sub="awaiting approval" icon="⏳" accent="var(--brick)" />
      </div>

      <div className="g2 mb20">
        <div className="card">
          <div className="stitle">📊 Leave Balance Overview</div>
          <RingChart current={bal.cl||0} total={6}  color="var(--forest)" label="Casual Leave (CL)" sub={`${6-(bal.cl||0)} used · ${bal.cl||0} remaining`} />
          <RingChart current={bal.sl||0} total={12} color="var(--ocean)"  label="Sick Leave (SL)"   sub={`${12-(bal.sl||0)} used · ${bal.sl||0} remaining`} />
          <RingChart current={bal.el||0} total={24} color="var(--gold)"   label="Earned Leave (EL)"  sub={`${24-(bal.el||0)} used · ${bal.el||0} remaining${cf > 0 ? ` · +${cf} carry-fwd` : ''}`} />
        </div>
        <div className="card">
          <div className="stitle">🕐 Leave History</div>
          <div className="tl">
            {leaves.slice(0, 6).map(l => (
              <TLItem key={l._id} date={fmtDate(l.fromDate) + (l.fromDate !== l.toDate ? ' – ' + fmtDate(l.toDate) : '')} text={`${l.leaveType} — ${l.reason}`} status={l.status} color={l.status==='pending'?'var(--gold)':l.status==='approved'?'var(--forest)':'var(--red)'} />
            ))}
            {leaves.length === 0 && <p className="text-sm text-muted">No leave history yet.</p>}
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="stitle">🎊 Upcoming Holidays</div>
          {holidays.filter(h => h.date >= today).slice(0,4).map(h => (
            <div key={h._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--cream3)' }}>
              <div><div className="fw7 text-sm">{h.name}</div><div className="text-xs text-muted">{h.type}</div></div>
              <span className="badge b-role">{fmtDate(h.date)}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="stitle">📣 Upcoming Events</div>
          {events.filter(e => e.date >= today && (e.assignedTo === 'all' || e.assignedTo === myDept)).slice(0,3).map(ev => {
            const d = new Date(ev.date);
            const mon = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()];
            return (
              <div key={ev._id} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--cream3)' }}>
                <div style={{ minWidth:38, textAlign:'center', background:'var(--gl)', borderRadius:8, padding:'6px 4px', flexShrink:0, border:'1px solid #FDE68A' }}>
                  <div style={{ fontSize:15, fontWeight:800, color:'var(--gold)', lineHeight:1 }}>{d.getDate()}</div>
                  <div style={{ fontSize:9, color:'var(--gold)', fontWeight:800 }}>{mon}</div>
                </div>
                <div><div className="fw7 text-sm">{ev.title}</div><div className="text-xs text-muted mt8">{ev.time} · {ev.assignedTo === 'all' ? 'All' : ev.assignedTo}</div></div>
              </div>
            );
          })}
          {events.filter(e=>e.date>=today).length===0 && <p className="text-sm text-muted">No upcoming events.</p>}
        </div>
      </div>
    </div>
  );
}
