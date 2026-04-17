// ══════════════════════════════ CalendarPage ══════════════════════════════
import { useState, useEffect } from 'react';
import { leaveAPI, eventAPI, holidayAPI } from '../../utils/api';
import { Loading } from '../../components/shared/index';
import { fmtDate } from '../../utils/helpers';

const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CalendarPage=()=> {
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [leaves,   setLeaves]   = useState([]);
  const [events,   setEvents]   = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      leaveAPI.getAll({ status:'approved' }),
      eventAPI.getAll({ year, month: month+1 }),
      holidayAPI.getAll({ year })
    ]).then(([lR,eR,hR]) => {
      setLeaves(lR.data.data || []);
      setEvents(eR.data.data || []);
      setHolidays(hR.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [year, month]);

  const changeMonth = (dir) => {
    setMonth(prev => {
      let m = prev + dir;
      if (m < 0)  { setYear(y => y - 1); return 11; }
      if (m > 11) { setYear(y => y + 1); return 0; }
      return m;
    });
  };

  const ds = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const prevDays    = new Date(year, month, 0).getDate();
  const today       = new Date();
  const isThisMonth = today.getFullYear()===year && today.getMonth()===month;

  const getPills = (d) => {
    const s = ds(d);
    return {
      lv:  leaves.filter(l => l.fromDate?.slice(0,10) <= s && l.toDate?.slice(0,10) >= s),
      hol: holidays.filter(h => h.date?.slice(0,10) === s),
      ev:  events.filter(e => e.date?.slice(0,10) === s),
    };
  };

  // This-week items
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd   = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
  const fmt = d => d.toISOString().split('T')[0];
  const wLeaves   = leaves.filter(l => l.fromDate?.slice(0,10) <= fmt(weekEnd) && l.toDate?.slice(0,10) >= fmt(weekStart));
  const wHolidays = holidays.filter(h => { const d = h.date?.slice(0,10); return d >= fmt(weekStart) && d <= fmt(weekEnd); });
  const wEvents   = events.filter(e => { const d = e.date?.slice(0,10); return d >= fmt(weekStart) && d <= fmt(weekEnd); });

  if (loading) return <Loading />;

  return (
    <div className="page-anim">
      <div className="ph mb16"><h1>Team Calendar</h1><p>Leaves · Events · Holidays — unified view</p></div>
      <div className="cal-outer">
        <div className="cal-main">
          <div className="cal-topbar">
            <div className="cal-month-title">{MONTHS_LONG[month]} {year}</div>
            <div className="cal-navs">
              <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
              <button className="cal-nav-btn" onClick={() => changeMonth( 1)}>›</button>
            </div>
          </div>
          <div className="cal-weekdays">
            {['SU','MO','TU','WE','TH','FR','SA'].map(d => <div key={d} className="cal-wd">{d}</div>)}
          </div>
          <div className="cal-days">
            {Array(firstDay).fill(null).map((_,i) => (
              <div key={'p'+i} className="cal-day other"><span className="cal-dn">{prevDays - firstDay + 1 + i}</span></div>
            ))}
            {Array.from({length:daysInMonth},(_,i)=>i+1).map(d => {
              const isToday = isThisMonth && today.getDate() === d;
              const { lv, hol, ev } = getPills(d);
              return (
                <div key={d} className={`cal-day${isToday?' today':''}`}>
                  <span className="cal-dn">{d}</span>
                  {lv.slice(0,2).map(l => <span key={l._id} className="cal-pill lv">{l.employee?.name?.split(' ')[0]||'Leave'}</span>)}
                  {lv.length > 2 && <span className="cal-pill lv">+{lv.length-2}</span>}
                  {hol.map(h => <span key={h._id} className="cal-pill hol">{h.name.split(' ')[0]}</span>)}
                  {ev.map(e => <span key={e._id} className="cal-pill ev">{e.title.split(' ')[0]}</span>)}
                </div>
              );
            })}
            {Array(42-firstDay-daysInMonth).fill(null).map((_,i)=>(
              <div key={'n'+i} className="cal-day other"><span className="cal-dn">{i+1}</span></div>
            ))}
          </div>
        </div>
        <div className="cal-side">
          <div className="cal-panel">
            <div className="cal-panel-title">Legend</div>
            <div className="leg-item"><span className="leg-badge leg-lv">Leave</span><span className="leg-label">Employee on leave</span></div>
            <div className="leg-item"><span className="leg-badge leg-ev">Event</span><span className="leg-label">Team event</span></div>
            <div className="leg-item"><span className="leg-badge leg-hol">Holiday</span><span className="leg-label">Public holiday</span></div>
          </div>
          <div className="cal-panel">
            <div className="cal-panel-title">This Week</div>
            {wLeaves.length===0 && wHolidays.length===0 && wEvents.length===0
              ? <div style={{ color:'var(--s4)', fontSize:13 }}>No items this week</div>
              : null
            }
            {wLeaves.map(l=>(
              <div key={l._id} className="week-item lv">
                <div className="week-item-date">{fmtDate(l.fromDate)}</div>
                <div className="week-item-text">{l.employee?.name} — {l.leaveType}</div>
              </div>
            ))}
            {wHolidays.map(h=>(
              <div key={h._id} className="week-item hol">
                <div className="week-item-date">{fmtDate(h.date)}</div>
                <div className="week-item-text">{h.name}</div>
              </div>
            ))}
            {wEvents.map(e=>(
              <div key={e._id} className="week-item ev">
                <div className="week-item-date">{e.title}</div>
                <div className="week-item-text">{fmtDate(e.date)} · {e.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CalendarPage;

// ══════════════════════════════ EventsPage ══════════════════════════════
import { eventAPI as evAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/shared/index';

export function EventsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = user?.sysRole !== 'employee';
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', date:'', time:'10:00', location:'', assignedTo:'all' });
  const [saving, setSaving] = useState(false);

  const fetch = () => evAPI.getAll({ year: new Date().getFullYear() }).then(r => setEvents(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) { toast.error('Title and date required'); return; }
    setSaving(true);
    try {
      const r = await evAPI.create(form);
      toast.success(`Event created & ${r.data.message?.split('&')[1]?.trim() || 'employees notified'}`);
      setShowAdd(false);
      setForm({ title:'', description:'', date:'', time:'10:00', location:'', assignedTo:'all' });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete event "${title}"?`)) return;
    try { await evAPI.delete(id); fetch(); toast.success('Event deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const now = new Date().toISOString().split('T')[0];
  const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>Events</h1><p>Company events, meetings &amp; announcements</p></div>
        {canManage && <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>＋ Add Event</button>}
      </div>
      <div className="g2">
        <div className="card">
          <div className="stitle">📋 All Events</div>
          {loading ? <Loading /> : events.length===0 ? <p className="text-sm text-muted">No events yet.</p>
          : events.map(ev=>(
            <div key={ev._id} className="ev-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:7 }}>
                <div className="fw7 text-sm">{ev.title}</div>
                <div className="flex gap8 aic">
                  <span className="badge b-pending">Event</span>
                  {canManage && <button className="icon-btn" onClick={()=>handleDelete(ev._id, ev.title)}>🗑️</button>}
                </div>
              </div>
              <div className="text-xs text-muted">📅 {fmtDate(ev.date)} · ⏰ {ev.time} · 👥 {ev.assignedTo==='all'?'All Employees':ev.assignedTo}</div>
              {ev.location&&<div className="text-xs text-muted">📍 {ev.location}</div>}
              {ev.description&&<div className="text-sm mt8" style={{ color:'var(--s2)' }}>{ev.description}</div>}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="stitle">📅 Upcoming Timeline</div>
          {[...events].filter(e=>e.date>=now).sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>{
            const d = new Date(ev.date+'T12:00:00');
            return (
              <div key={ev._id} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:'1px solid var(--cream3)' }}>
                <div style={{ minWidth:44, textAlign:'center', background:'var(--gl)', borderRadius:9, padding:'7px 5px', flexShrink:0, border:'1px solid #FDE68A' }}>
                  <div style={{ fontSize:17, fontWeight:800, color:'var(--gold)', lineHeight:1 }}>{d.getDate()}</div>
                  <div style={{ fontSize:9, color:'var(--gold)', fontWeight:800, marginTop:2 }}>{MON[d.getMonth()]}</div>
                </div>
                <div>
                  <div className="fw7 text-sm">{ev.title}</div>
                  <div className="text-xs text-muted mt8">{ev.time} · {ev.assignedTo==='all'?'All Employees':ev.assignedTo}</div>
                  {ev.description&&<div className="text-xs" style={{ color:'var(--s2)', marginTop:3 }}>{ev.description}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Create New Event">
        <form onSubmit={handleCreate}>
          <div className="form-group"><label className="form-label">Event Title *</label><input className="form-control" placeholder="e.g. All Hands Meeting" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date *</label><input className="form-control" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-control" type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Assign To</label>
            <select className="form-control form-select" value={form.assignedTo} onChange={e=>setForm(p=>({...p,assignedTo:e.target.value}))}>
              <option value="all">All Employees</option><option value="Engineering">Engineering Team</option><option value="Design">Design Team</option><option value="Marketing">Marketing Team</option><option value="HR">HR Team</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Location / Link</label><input className="form-control" placeholder="Conference Room A / Zoom link…" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} placeholder="Agenda and details…" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={{ resize:'vertical' }} /></div>
          <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button><button type="submit" disabled={saving} className="btn btn-primary">{saving?'⏳ Creating…':'Create & Notify'}</button></div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════ HolidaysPage ══════════════════════════════
import { holidayAPI as holAPI } from '../../utils/api';

export function HolidaysPage() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = user?.sysRole !== 'employee';
  const [holidays, setHolidays] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [form, setForm] = useState({ name:'', date:'', type:'National Holiday', notes:'' });
  const [saving, setSaving] = useState(false);

  const fetch = () => holAPI.getAll({ year: new Date().getFullYear() }).then(r=>setHolidays(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date) { toast.error('Name and date required'); return; }
    setSaving(true);
    try { await holAPI.create(form); toast.success(`Holiday "${form.name}" added — all employees notified!`); setShowAdd(false); setForm({name:'',date:'',type:'National Holiday',notes:''}); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete holiday "${name}"?`)) return;
    try { await holAPI.delete(id); fetch(); toast.success('Holiday deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date().toISOString().split('T')[0];
  const upcoming = holidays.filter(h => h.date?.slice(0,10) >= today).slice(0,5);

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>Company Holidays {new Date().getFullYear()}</h1><p>Plan your leaves around official holidays</p></div>
        {canManage && <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>＋ Add Holiday</button>}
      </div>
      <div className="g2">
        <div className="card-flat">
          <div className="tbl-wrap">
            {loading ? <Loading /> : (
              <table>
                <thead><tr><th>Holiday</th><th>Date</th><th>Day</th><th>Type</th>{canManage&&<th>Action</th>}</tr></thead>
                <tbody>
                  {holidays.map(h=>(
                    <tr key={h._id}>
                      <td className="fw7">{h.name}</td>
                      <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(h.date)}</td>
                      <td className="text-xs text-muted">{DAYS[new Date(h.date+'T12:00:00').getDay()]}</td>
                      <td><span className="badge b-role">{h.type}</span></td>
                      {canManage&&<td><button className="icon-btn" onClick={()=>handleDelete(h._id,h.name)}>🗑️</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="card">
          <div className="stitle">🗓️ Upcoming Holidays</div>
          {upcoming.map(h=>(
            <div key={h._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid var(--cream3)' }}>
              <div><div className="fw7 text-sm">{h.name}</div><div className="text-xs text-muted">{h.type}</div></div>
              <span className="badge b-role">{fmtDate(h.date)}</span>
            </div>
          ))}
          {upcoming.length===0&&<p className="text-sm text-muted">No upcoming holidays.</p>}
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Add Holiday">
        <form onSubmit={handleCreate}>
          <div className="form-group"><label className="form-label">Holiday Name *</label><input className="form-control" placeholder="e.g. Diwali" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Date *</label><input className="form-control" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-control form-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
              <option>National Holiday</option><option>Company Holiday</option><option>Regional Holiday</option><option>Optional Holiday</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Notes (optional)</label><input className="form-control" placeholder="Any additional info…" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} /></div>
          <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button><button type="submit" disabled={saving} className="btn btn-primary">{saving?'⏳ Adding…':'Add Holiday'}</button></div>
        </form>
      </Modal>
    </div>
  );
}

// ══════════════════════════════ NotificationsPage ══════════════════════════════
import { notifAPI } from '../../utils/api';
import { relTime } from '../../utils/helpers';

export function NotificationsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('all');

  const fetch = () => notifAPI.getAll({ limit:50 }).then(r=>setNotifs(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await notifAPI.markRead(id).catch(()=>{});
    setNotifs(p=>p.map(n=>n._id===id?{...n,isRead:true}:n));
  };

  const markAll = async () => {
    await notifAPI.markAllRead().catch(()=>{});
    setNotifs(p=>p.map(n=>({...n,isRead:true})));
    toast.success('All marked as read');
  };

  const displayed  = tab==='unread' ? notifs.filter(n=>!n.isRead) : notifs;
  const unreadCount = notifs.filter(n=>!n.isRead).length;

  const RULES = {
    employee:'<p>✔ Your own leave approvals/rejections</p><p>✔ Events for your department or all staff</p><p>✔ Holiday announcements (company-wide)</p><p>✔ Carry-forward balance updates</p>',
    manager:'<p>✔ All team leave applications</p><p>✔ Conflict detection alerts</p><p>✔ System-level conflict warnings</p><p>✔ Holiday additions</p>',
    admin:'<p>✔ System-level conflict alerts</p><p>✔ User activity summaries</p><p>✔ Policy change confirmations</p><p>✔ Audit events</p>',
  };

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>Notifications</h1><p>Only <b>your</b> relevant alerts — targeted per role</p></div>
        {unreadCount>0&&<button className="btn btn-ghost btn-sm" onClick={markAll}>✓ Mark all read</button>}
      </div>
      <div className="g2">
        <div>
          <div className="itabs">
            <button className={`it${tab==='all'?' active':''}`} onClick={()=>setTab('all')}>All ({notifs.length})</button>
            <button className={`it${tab==='unread'?' active':''}`} onClick={()=>setTab('unread')}>Unread ({unreadCount})</button>
          </div>
          {loading ? <Loading /> : displayed.length===0
            ? <div style={{ textAlign:'center', color:'var(--s4)', padding:32, fontSize:13 }}>No notifications</div>
            : displayed.map(n=>(
            <div key={n._id} className={`notif-item${n.isRead?'':' unread'}`} style={{ cursor:n.isRead?'default':'pointer' }} onClick={()=>!n.isRead&&markRead(n._id)}>
              <span style={{ fontSize:20, flexShrink:0 }}>{n.icon}</span>
              <div style={{ flex:1 }}>
                <div className="fw7 text-sm">{n.title}</div>
                <div className="text-sm" style={{ color:'var(--s1)', lineHeight:1.5, marginTop:2 }}>{n.message}</div>
                <div className="text-xs text-muted" style={{ marginTop:3 }}>{relTime(n.createdAt)}</div>
              </div>
              {!n.isRead&&<div className="notif-dot" />}
            </div>
          ))}
        </div>
        <div>
          <div className="card mb16">
            <div className="stitle">📊 Summary</div>
            {[
              ['Leave Applications','📋',notifs.filter(n=>n.type==='leave_applied').length,'b-pending'],
              ['Approvals/Rejections','✅',notifs.filter(n=>['leave_approved','leave_rejected'].includes(n.type)).length,'b-approved'],
              ['Events/Holidays','📢',notifs.filter(n=>['event_created','holiday_added'].includes(n.type)).length,'b-role'],
              ['Conflict Alerts','⚡',notifs.filter(n=>n.type==='conflict_detected').length,'b-conflict'],
              ['Carry Forward','📅',notifs.filter(n=>n.type==='carry_forward').length,'b-pending'],
            ].map(([lbl,ico,cnt,cls])=>(
              <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 13px', background:'var(--cream)', borderRadius:9, marginBottom:9 }}>
                <span className="fw6 text-sm">{ico} {lbl}</span><span className={`badge ${cls}`}>{cnt}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="stitle">🔔 Your Alert Rules</div>
            <div className="text-sm" style={{ color:'var(--s2)', lineHeight:1.85, marginTop:4 }} dangerouslySetInnerHTML={{ __html: RULES[user?.sysRole]||RULES.employee }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════ CarryForwardPage ══════════════════════════════
import { carryAPI, policyAPI as polAPI } from '../../utils/api';

export function CarryForwardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [records,  setRecords]  = useState([]);
  const [policy,   setPolicy]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [cfForm,   setCfForm]   = useState({ year: new Date().getFullYear()-1, maxCarryForward:5 });
  const [processing, setProcessing] = useState(false);
  const isAdmin = user?.sysRole === 'admin';

  useEffect(() => {
    Promise.all([carryAPI.getAll(), polAPI.get()])
      .then(([rR,pR]) => { setRecords(rR.data.data||[]); setPolicy(pR.data.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const process = async () => {
    if (!confirm(`Process carry-forward for year ${cfForm.year}?`)) return;
    setProcessing(true);
    try {
      const r = await carryAPI.process(cfForm);
      const done = (r.data.data||[]).filter(x=>!x.skipped).length;
      toast.success(`Processed ${done} employees! All notified.`);
      carryAPI.getAll().then(r=>setRecords(r.data.data||[]));
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setProcessing(false); }
  };

  if (loading) return <Loading />;
  const bal = user?.leaveBalance || {};
  const cf  = user?.carryForwardBalance || 0;

  return (
    <div className="page-anim">
      <div className="ph mb20"><h1>Leave Carry Forward</h1><p>Year-end balance rollover — max {policy?.maxCarryForward||5} days policy</p></div>

      <div className="cf-card mb20">
        <div className="cf-card-title">🏆 Limited Carry Forward Policy</div>
        <div style={{ fontSize:12, opacity:.75, marginTop:4 }}>Most widely used in IT companies</div>
        <div className="cf-stats">
          <div className="cf-stat"><div className="cf-stat-val">{policy?.elDays||24}</div><div className="cf-stat-lbl">EL Days/Year</div></div>
          <div className="cf-stat"><div className="cf-stat-val">{policy?.maxCarryForward||5}</div><div className="cf-stat-lbl">Max Carry Fwd</div></div>
          <div className="cf-stat"><div className="cf-stat-val">{policy?.carryForwardEnabled?'Active':'Off'}</div><div className="cf-stat-lbl">Status</div></div>
        </div>
        <div className="cf-info">
          📌 <b>How it works:</b> At year-end, unused EL is calculated. Only up to <b>{policy?.maxCarryForward||5} days</b> carry forward. Excess lapses permanently.<br />
          Example: 12 unused → {policy?.maxCarryForward||5} carried → {12-(policy?.maxCarryForward||5)} lapsed → New EL = {(policy?.elDays||24)+(policy?.maxCarryForward||5)} days
        </div>
      </div>

      <div className="g2">
        {/* My Status or Admin Process Panel */}
        <div className="card">
          {isAdmin ? (
            <>
              <div className="stitle">⚙️ Process Year-End Carry Forward</div>
              <div style={{ background:'var(--ol)', border:'1.5px solid #BFDBFE', borderRadius:9, padding:'11px 13px', marginBottom:16, fontSize:12.5, color:'var(--ocean2)' }}>
                ℹ️ This processes carry-forward for ALL active employees. Each gets a personal notification with their breakdown.
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Process Year</label><input className="form-control" type="number" value={cfForm.year} min={2020} max={new Date().getFullYear()} onChange={e=>setCfForm(p=>({...p,year:+e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Max CF Days</label><input className="form-control" type="number" value={cfForm.maxCarryForward} min={0} max={15} onChange={e=>setCfForm(p=>({...p,maxCarryForward:+e.target.value}))} /></div>
              </div>
              <button className="btn btn-primary" disabled={processing} onClick={process}>{processing?'⏳ Processing…':`🔄 Process ${cfForm.year} Carry Forward`}</button>
            </>
          ) : (
            <>
              <div className="stitle">📊 My Carry Forward Status</div>
              {[['🌴 Earned Leave (EL)',bal.el,policy?.elDays||24,'var(--forest)'],['🤒 Sick Leave (SL)',bal.sl,policy?.slDays||12,'var(--ocean)'],['📅 Casual Leave (CL)',bal.cl,policy?.clDays||6,'var(--gold)']].map(([lbl,rem,tot,col])=>(
                <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 13px', background:'var(--cream)', borderRadius:9, marginBottom:9, border:'1px solid var(--cream3)' }}>
                  <div><div className="fw7 text-sm">{lbl}</div><div className="text-xs text-muted">Used: {tot-(rem??0)} · Remaining: {rem??'—'}</div></div>
                  <div style={{ textAlign:'right' }}><div style={{ fontFamily:'Fraunces,serif', fontSize:22, color:col, fontWeight:600, lineHeight:1 }}>{rem??'—'}</div><div className="text-xs text-muted">days</div></div>
                </div>
              ))}
              {cf>0&&(
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 13px', background:'var(--tl)', borderRadius:9, border:'1px solid var(--teal)' }}>
                  <div><div className="fw7 text-sm">↗️ Active Carry Forward</div><div className="text-xs" style={{ color:'var(--teal)' }}>Deducted first on EL applications</div></div>
                  <div style={{ fontFamily:'Fraunces,serif', fontSize:22, color:'var(--teal)', fontWeight:600 }}>{cf}</div>
                </div>
              )}
              {cf>0&&<div className="alert success mt12"><div className="alert-ico">↗️</div><div className="alert-body"><strong>Carry Forward Active: {cf} days</strong><p>These days are deducted first when you apply for EL. Use before year-end!</p></div></div>}
            </>
          )}
        </div>

        <div className="card">
          <div className="stitle">📋 {isAdmin?'All':'My'} Carry Forward History</div>
          {records.length===0
            ? <div style={{ color:'var(--s4)', fontSize:13, padding:'16px 0', textAlign:'center' }}>No carry forward records yet.<br />Records appear after year-end processing.</div>
            : records.map(r=>(
            <div key={r._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--cream3)' }}>
              <div>
                <div className="fw7 text-sm">{isAdmin?r.employee?.name:`Year ${r.year}`}</div>
                <div className="text-xs text-muted">{isAdmin?`${r.employee?.designation} · Year ${r.year}`:`Processed ${fmtDate(r.createdAt)}`}</div>
                <div className="text-xs" style={{ color:'var(--s3)', marginTop:2 }}>
                  Unused: {r.unusedLeaves}d → Carried: <b style={{ color:'var(--forest)' }}>{r.carriedForward}d</b> · Lapsed: <span style={{ color:'var(--red)' }}>{r.lapsed}d</span>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:18, color:'var(--teal)', fontWeight:600 }}>+{r.carriedForward}</div>
                <div className="text-xs text-muted">days fwd</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
