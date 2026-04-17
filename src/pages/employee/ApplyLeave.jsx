// ══════════════════════════════ ApplyLeave ══════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI, userAPI, holidayAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Alert, Loading, VerticalBar } from '../../components/shared/index';
import { countWorkingDays, todayStr } from '../../utils/helpers';

const ApplyLeave=()=> {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();
  const [form, setForm] = useState({ leaveType:'EL', fromDate:'', toDate:'', reason:'', backupEmployee:'' });
  const [backups,    setBackups]    = useState({ available:[], unavailable:[], loaded:false });
  const [conflict,   setConflict]   = useState(null);
  const [holConflict,setHolConflict]= useState([]);
  const [holidays,   setHolidays]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [bkLoading,  setBkLoading]  = useState(false);
  const [days, setDays] = useState(0);

  useEffect(() => {
    holidayAPI.getAll({ year: new Date().getFullYear() }).then(r => setHolidays(r.data.data || [])).catch(()=>{});
  }, []);

  const onDateChange = useCallback(async (from, to) => {
    if (!from || !to || to < from) { setBackups({ available:[], unavailable:[], loaded:false }); setConflict(null); setHolConflict([]); setDays(0); return; }
    const d = countWorkingDays(from, to);
    setDays(d);
    setHolConflict(holidays.filter(h => { const hd = h.date?.slice(0,10); return hd >= from && hd <= to; }));
    setBkLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        userAPI.availableBackups({ fromDate: from, toDate: to }),
        leaveAPI.checkConflict({ fromDate: from, toDate: to })
      ]);
      setBackups({ available: bRes.data.available || [], unavailable: bRes.data.unavailable || [], loaded: true });
      setConflict(cRes.data);
    } catch {} finally { setBkLoading(false); }
  }, [holidays]);

  const handleChange = (field, val) => {
    setForm(p => {
      const next = { ...p, [field]: val };
      if (field === 'fromDate' || field === 'toDate') {
        const f = field==='fromDate' ? val : p.fromDate;
        const t = field==='toDate'   ? val : p.toDate;
        onDateChange(f, t);
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fromDate||!form.toDate) { toast.error('Select leave dates'); return; }
    if (form.toDate < form.fromDate)  { toast.error('End date must be after start date'); return; }
    if (form.fromDate < todayStr())   { toast.error('Cannot apply for past dates'); return; }
    if (!form.reason.trim())          { toast.error('Please provide a reason'); return; }
    setLoading(true);
    try {
      await leaveAPI.apply({ ...form, backupEmployee: form.backupEmployee || undefined });
      toast.success('Leave submitted! Manager notified.');
      navigate('/my-leaves');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  const bal = user?.leaveBalance || {};
  const today = todayStr();

  return (
    <div className="page-anim">
      <div className="ph"><h1>Apply for Leave</h1><p>Backup shows only <b>currently available</b> colleagues · Conflict auto-detected</p></div>
      <div className="g2">
        <form onSubmit={submit}>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select className="form-control form-select" value={form.leaveType} onChange={e=>handleChange('leaveType',e.target.value)}>
                <option value="CL">Casual Leave (CL)</option>
                <option value="SL">Sick Leave (SL)</option>
                <option value="EL">Earned Leave (EL)</option>
                <option value="ML">Maternity Leave</option>
                <option value="PL">Paternity Leave</option>
                <option value="CompOff">Compensatory Off</option>
                <option value="BL">Bereavement Leave</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">From Date</label><input className="form-control" type="date" min={today} value={form.fromDate} onChange={e=>handleChange('fromDate',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">To Date</label><input className="form-control" type="date" min={form.fromDate||today} value={form.toDate} onChange={e=>handleChange('toDate',e.target.value)} /></div>
            </div>
            {days > 0 && <div style={{ background:'var(--fl)', border:'1px solid var(--forest)', borderRadius:8, padding:'10px 13px', marginBottom:16, fontSize:13, color:'var(--forest2)', fontWeight:600 }}>📅 {days} working day{days!==1?'s':''} selected</div>}
            <div className="form-group">
              <label className="form-label">
                Backup Employee ★
                {backups.loaded && <span className="form-hint" style={{ display:'inline', marginLeft:8 }}>{bkLoading?'Loading…':`${backups.available.length} available, ${backups.unavailable.length} on leave`}</span>}
              </label>
              <select className="form-control form-select" value={form.backupEmployee} onChange={e=>setForm(p=>({...p,backupEmployee:e.target.value}))} disabled={bkLoading||!backups.loaded}>
                <option value="">{!backups.loaded?'— Select dates first —':'— Select available backup —'}</option>
                {backups.available.map(u=><option key={u._id} value={u._id}>{u.name} ({u.designation} · {u.department})</option>)}
              </select>
              {backups.loaded && backups.unavailable.length > 0 && (
                <div className="form-hint" style={{ color:'var(--brick)' }}>On leave: {backups.unavailable.slice(0,3).map(u=>u.name).join(', ')}{backups.unavailable.length>3?` & ${backups.unavailable.length-3} more`:''}</div>
              )}
              {backups.loaded && backups.available.length > 0 && (
                <div className="form-hint" style={{ color:'var(--forest)' }}>✅ {backups.available.length} colleagues available</div>
              )}
            </div>
            <div className="form-group"><label className="form-label">Reason</label><textarea className="form-control" rows={4} placeholder="Briefly describe your reason…" value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} style={{ resize:'vertical' }} /></div>

            {/* Validation Alerts */}
            {form.fromDate && form.fromDate < today && <Alert type="danger" icon="❌" title="Past Date" message="Cannot apply for past dates." />}
            {form.toDate && form.fromDate && form.toDate < form.fromDate && <Alert type="danger" icon="❌" title="Invalid Range" message="End date cannot be before start date." />}
            {conflict?.hasConflict && conflict.conflicts.map((c,i)=><Alert key={i} icon="⚠️" title={`Conflict: ${c.count} ${c.designation}s on leave`} message={c.message + ' — Backup assignment is mandatory.'} />)}
            {holConflict.length > 0 && <Alert type="info" icon="🎊" title="Holiday Overlap" message={`${holConflict.map(h=>h.name).join(', ')} fall in this range. Those days won't be deducted.`} />}
            {!conflict?.hasConflict && backups.loaded && !bkLoading && <Alert type="success" icon="✅" title="No Conflicts" message="Your leave window is clear. Proceed." />}

            <div className="flex gap8" style={{ marginTop:8 }}>
              <button type="submit" disabled={loading} className="btn btn-primary">{loading?'⏳ Submitting…':'📋 Submit Request'}</button>
              <button type="button" className="btn btn-ghost" onClick={()=>setForm({leaveType:'EL',fromDate:'',toDate:'',reason:'',backupEmployee:''})}>Clear</button>
            </div>
          </div>
        </form>

        <div>
          <div className="card mb16">
            <div className="stitle">📊 Your Leave Balance</div>
            {[['🌴 Earned Leave (EL)',bal.el,24,'b-pending'],['🤒 Sick Leave (SL)',bal.sl,12,'b-role'],['📅 Casual Leave (CL)',bal.cl,6,'b-approved']].map(([lbl,rem,tot,cls])=>(
              <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 13px', background:'var(--cream)', borderRadius:9, marginBottom:9, border:'1px solid var(--cream3)' }}>
                <span className="fw6 text-sm">{lbl}</span>
                <span className={`badge ${cls}`}>{rem??'—'}/{tot} left</span>
              </div>
            ))}
            {(user?.carryForwardBalance||0)>0 && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 13px', background:'var(--tl)', borderRadius:9, border:'1px solid var(--teal)' }}>
                <span className="fw6 text-sm">↗️ Carry Forward</span>
                <span className="badge" style={{ background:'var(--tl)', color:'var(--teal)' }}>{user.carryForwardBalance} days</span>
              </div>
            )}
          </div>
          <div className="card mb16">
            <div className="stitle">🧠 Validation Rules</div>
            <div style={{ fontSize:12.5, color:'var(--s2)', lineHeight:1.85, marginTop:4 }}>
              <p>✔ Cannot select past dates</p>
              <p>✔ End date must be ≥ start date</p>
              <p>✔ Backup shows <b>only available</b> colleagues</p>
              <p>✔ Conflict detected by designation</p>
              <p>✔ Holiday overlap auto-detected</p>
            </div>
          </div>
          <div className="card">
            <div className="stitle">📌 Leave Policy</div>
            <div style={{ fontSize:12.5, color:'var(--s2)', lineHeight:1.85, marginTop:4 }}>
              <p>• EL: 24 days/yr · Max carry-forward: 5 days</p>
              <p>• SL: 12 days/yr · Certificate for 3+ days</p>
              <p>• CL: 6 days/yr · Personal emergencies</p>
              <p>• Unused EL &gt;5 days lapses at year-end</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ApplyLeave;

// ══════════════════════════════ MyLeaves ══════════════════════════════
import { fmtDate, cap, leaveTypeLabel, statusBadge } from '../../utils/helpers';

export function MyLeaves() {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    leaveAPI.getAll().then(r => setLeaves(r.data.data || [])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this leave request?')) return;
    try { await leaveAPI.cancel(id); fetch(); toast.success('Leave cancelled'); }
    catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  if (loading) return <Loading />;
  return (
    <div className="page-anim">
      <div className="ph"><h1>My Leaves</h1><p>All applications and their status</p></div>
      <div className="card-flat">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Backup</th><th>Reason</th><th>Status</th><th>Manager Note</th><th>Action</th></tr></thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--s4)', padding:32 }}>No leave records yet</td></tr>
              ) : leaves.map(l => (
                <tr key={l._id}>
                  <td className="fw7">{l.leaveType}</td>
                  <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.fromDate)}</td>
                  <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.toDate)}</td>
                  <td style={{ fontWeight:800, textAlign:'center' }}>{l.numberOfDays}</td>
                  <td style={{ fontSize:12, color:'var(--s3)' }}>{l.backupEmployee?.name || '—'}</td>
                  <td style={{ fontSize:12.5 }}>{l.reason}</td>
                  <td><span className={`badge ${statusBadge(l.status)}`}>{cap(l.status)}</span></td>
                  <td style={{ fontSize:12, color:'var(--s4)' }}>{l.managerNote || '—'}</td>
                  <td>{l.status === 'pending' ? <button className="btn btn-danger btn-xs" onClick={()=>cancel(l._id)}>Cancel</button> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════ EmpAnalytics ══════════════════════════════
import { analyticsAPI } from '../../utils/api';
import { ChartBar, InsightCard as IC } from '../../components/shared/index';

export function EmpAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // VerticalBar imported above

  useEffect(() => {
    analyticsAPI.employee({ year: new Date().getFullYear() })
      .then(r => setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <Loading />;
  const mD = data?.monthly || Array(12).fill(0);
  const mMax = Math.max(...mD, 1);
  const types = Object.entries(data?.leaveTypeBreakdown || {});
  const tTotal = types.reduce((s,[,v])=>s+v,0)||1;
  const TCOLS = ['var(--forest)','var(--ocean)','var(--gold)','var(--plum)'];
  const bal = user?.leaveBalance || {};
  const cf  = user?.carryForwardBalance || 0;

  return (
    <div className="page-anim">
      <div className="ph mb20"><h1>My Analytics</h1><p>Personal leave trends, patterns and insights</p></div>
      <div className="g2 mb20">
        <div className="card"><div className="stitle">📅 Monthly Leave Usage ({new Date().getFullYear()})</div><VerticalBar data={MONTHS.map((m,i)=>({label:m,v:mD[i]}))} color="var(--brick)" /></div>
        <div className="card">
          <div className="stitle">🔍 Leave Pattern Analysis</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:12 }}>
            {[['Short Leaves (1–2 days)','Most frequent',data?.shortLeaves||0,'b-approved'],['Medium Leaves (3–5 days)','Quarterly pattern',data?.mediumLeaves||0,'b-pending'],['Long Leaves (5+ days)','Extended breaks',data?.longLeaves||0,'b-role'],['Approval Rate','All applications',`${data?.approvalRate||100}%`,'b-approved']].map(([lbl,sub,val,cls])=>(
              <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 13px', background:'var(--cream)', borderRadius:9, border:'1px solid var(--cream3)' }}>
                <div><div className="fw7 text-sm">{lbl}</div><div className="text-xs text-muted">{sub}</div></div>
                <span className={`badge ${cls}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="stitle">💡 Personalized Insights</div>
        <IC icon="📊" title={`${24-(bal.el||0)} of 24 EL days used (${Math.round((24-(bal.el||0))/24*100)}%)`} desc={(bal.el||0)>12?'Healthy pace — plenty of leave remaining.':'Moderate usage — plan remaining leaves carefully.'} />
        {cf>0 && <IC icon="↗️" title={`Carry Forward: ${cf} days active`} desc={`These days are deducted first on EL. Use before year-end policy resets (max 5 days carry-forward).`} />}
        <IC icon="💡" title="Year-end carry-forward" desc={`Unused EL beyond 5 days will lapse at year-end. Use your remaining ${bal.el||0} EL days before December.`} />
        <IC icon="📈" title="Leave pattern" desc={`You have ${data?.shortLeaves||0} short and ${data?.mediumLeaves||0} medium leave${data?.mediumLeaves!==1?'s':''} this year. Consolidating leaves can improve team coverage.`} />
      </div>
    </div>
  );
}
