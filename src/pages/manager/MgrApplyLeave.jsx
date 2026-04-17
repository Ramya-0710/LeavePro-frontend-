// ══════════════════════════════ MgrApplyLeave ══════════════════════════════
// Managers can apply for their own leave; admin must approve/reject
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI, userAPI, holidayAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Alert, Loading } from '../../components/shared/index';
import { countWorkingDays, todayStr } from '../../utils/helpers';

export default function MgrApplyLeave() {
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
  const [myLeaves,   setMyLeaves]   = useState([]);
  const [leavesLoad, setLeavesLoad] = useState(true);
  const [days, setDays] = useState(0);

  useEffect(() => {
    holidayAPI.getAll({ year: new Date().getFullYear() })
      .then(r => setHolidays(r.data.data || [])).catch(()=>{});
    // Load manager's own leaves only
    leaveAPI.getAll({ mine: 'true' })
      .then(r => setMyLeaves(r.data.data || []))
      .catch(()=>{})
      .finally(()=>setLeavesLoad(false));
  }, []);

  const onDateChange = useCallback(async (from, to) => {
    if (!from || !to || to < from) {
      setBackups({ available:[], unavailable:[], loaded:false });
      setConflict(null); setHolConflict([]); setDays(0);
      return;
    }
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
      toast.success('Leave submitted! Admin will review your request.');
      navigate('/mgr-my-leaves');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  const cancelLeave = async (id) => {
    if (!confirm('Cancel this leave request?')) return;
    try {
      await leaveAPI.cancel(id);
      setMyLeaves(p => p.filter(l => l._id !== id));
      toast.success('Leave cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  const bal   = user?.leaveBalance || {};
  const today = todayStr();

  const statusBadge = s => ({ pending:'b-pending', approved:'b-approved', rejected:'b-rejected', cancelled:'b-cancelled' }[s]||'b-dept');
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

  return (
    <div className="page-anim">
      <div className="ph">
        <h1>Apply for Leave</h1>
        <p>As a manager, your leave requests go to <b>Admin</b> for approval.</p>
      </div>

      <div className="g2">
        {/* ── Application Form ── */}
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
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input className="form-control" type="date" min={today} value={form.fromDate} onChange={e=>handleChange('fromDate',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">To Date</label>
                <input className="form-control" type="date" min={form.fromDate||today} value={form.toDate} onChange={e=>handleChange('toDate',e.target.value)} />
              </div>
            </div>
            {days > 0 && (
              <div style={{ background:'var(--fl)', border:'1px solid var(--forest)', borderRadius:8, padding:'10px 13px', marginBottom:16, fontSize:13, color:'var(--forest2)', fontWeight:600 }}>
                📅 {days} working day{days!==1?'s':''} selected
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea className="form-control" rows={4} placeholder="Briefly describe your reason…" value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} style={{ resize:'vertical' }} />
            </div>

            {/* Alerts */}
            {form.fromDate && form.fromDate < today && <Alert type="danger" icon="❌" title="Past Date" message="Cannot apply for past dates." />}
            {form.toDate && form.fromDate && form.toDate < form.fromDate && <Alert type="danger" icon="❌" title="Invalid Range" message="End date cannot be before start date." />}
            {conflict?.hasConflict && conflict.conflicts.map((c,i)=><Alert key={i} icon="⚠️" title={`Conflict: ${c.count} ${c.designation}s on leave`} message={c.message} />)}
            {holConflict.length > 0 && <Alert type="info" icon="🎊" title="Holiday Overlap" message={`${holConflict.map(h=>h.name).join(', ')} fall in this range.`} />}
            {!conflict?.hasConflict && backups.loaded && !bkLoading && <Alert type="success" icon="✅" title="No Conflicts Detected" message="Your leave window is clear." />}

            <div style={{ background:'var(--cream3)', borderRadius:8, padding:'10px 13px', marginBottom:16, fontSize:12.5, color:'var(--forest2)' }}>
              📣 <b>Note:</b> Manager leave requests are reviewed by Admin. You will be notified once your request is approved or rejected.
            </div>

            <div className="flex gap8" style={{ marginTop:8 }}>
              <button type="submit" disabled={loading} className="btn btn-primary">{loading?'⏳ Submitting…':'📋 Submit Request'}</button>
              <button type="button" className="btn btn-ghost" onClick={()=>setForm({leaveType:'EL',fromDate:'',toDate:'',reason:'',backupEmployee:''})}>Clear</button>
            </div>
          </div>
        </form>

        {/* ── Sidebar ── */}
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
            <div className="stitle">📌 Manager Leave Policy</div>
            <div style={{ fontSize:12.5, color:'var(--s2)', lineHeight:1.85, marginTop:4 }}>
              <p>• All manager leaves are approved by Admin</p>
              <p>• Assign a backup to ensure team coverage</p>
              <p>• EL: 24 days/yr · SL: 12 days/yr · CL: 6 days/yr</p>
              <p>• Pending requests can be cancelled anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Leave History ── */}
      <div className="card mt20">
        <div className="stitle">📋 My Leave History</div>
        {leavesLoad ? <Loading /> : myLeaves.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--s4)', padding:24 }}>No leave records yet</div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Admin Note</th><th>Action</th></tr>
              </thead>
              <tbody>
                {myLeaves.map(l => (
                  <tr key={l._id}>
                    <td className="fw7">{l.leaveType}</td>
                    <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.fromDate)}</td>
                    <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.toDate)}</td>
                    <td style={{ fontWeight:800, textAlign:'center' }}>{l.numberOfDays}</td>
                    <td style={{ fontSize:12.5 }}>{l.reason}</td>
                    <td><span className={`badge ${statusBadge(l.status)}`}>{l.status}</span></td>
                    <td style={{ fontSize:12, color:'var(--s4)' }}>{l.managerNote || '—'}</td>
                    <td>{l.status === 'pending'
                      ? <button className="btn btn-danger btn-xs" onClick={()=>cancelLeave(l._id)}>Cancel</button>
                      : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
