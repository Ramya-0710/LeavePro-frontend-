// ══════════════════════════════ MgrDashboard ══════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI, analyticsAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { StatCard, ChartBar, VerticalBar, Alert, Loading, EmptyState } from '../../components/shared/index';
import { fmtDate, avatarColor, initials } from '../../utils/helpers';

const MgrDashboard=()=> {
  const navigate = useNavigate();
  const toast    = useToast();
  const [pending,   setPending]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const fetch = () => {
    Promise.all([
      leaveAPI.getAll({ status:'pending' }),
      analyticsAPI.manager({ year: new Date().getFullYear() })
    ]).then(([lR, aR]) => {
      setPending(lR.data.data || []);
      setAnalytics(aR.data.data);
    }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, { status, managerNote: status==='approved'?'Approved ✅':'Rejected ❌' });
      toast.success(`Leave ${status}!`);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  if (loading) return <Loading />;
  const depts = Object.entries(analytics?.departmentBreakdown || {});
  const dMax  = depts.length ? Math.max(...depts.map(([,v])=>v),1) : 1;

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>Manager Dashboard</h1><p>Team leave overview &amp; approvals</p></div>
        <button className="btn btn-primary btn-sm" onClick={()=>navigate('/leave-requests')}>View All Requests</button>
      </div>
      <div className="g4 mb20">
        <StatCard label="Pending Requests"  value={pending.length}              icon="📋" accent="var(--brick)"  sub="Needs action"   />
        <StatCard label="On Leave Today"    value={analytics?.todayOnLeave??'—'}icon="🏖️" accent="var(--gold)"   sub="Out of office"  />
        <StatCard label="Approved (Year)"   value={(analytics?.topTakers||[]).reduce((s,t)=>s+t.days,0)||'—'} icon="✅" accent="var(--ocean)" sub="Total days" />
        <StatCard label="Conflict Incidents"value="2"                           icon="⚠️" accent="var(--ruby)"   sub="This month"     />
      </div>
      <div className="g2 mb20">
        <div className="card">
          <div className="stitle">⚡ Active Conflict Alerts</div>
          <Alert icon="⚠️" title="3 Developers on leave simultaneously" message="Engineering understaffed. Review before approving new Developer requests." />
          <Alert type="danger" icon="🔴" title="Critical coverage risk" message="Approving next Developer request leaves 1 dev available. Assign backup first!" />
        </div>
        <div className="card">
          <div className="stitle">📋 Quick Approvals</div>
          {pending.length === 0 ? <EmptyState icon="🎉" message="No pending requests!" /> : (
            pending.slice(0,4).map(l => (
              <div key={l._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 13px', background:'var(--cream)', borderRadius:9, marginBottom:9, border:'1px solid var(--cream3)' }}>
                <div>
                  <div className="fw7 text-sm">{l.employee?.name}</div>
                  <div className="text-xs text-muted mt8">{l.leaveType} · {l.numberOfDays}d · {fmtDate(l.fromDate)}</div>
                  <div className="text-xs" style={{ color:'var(--s3)', marginTop:2 }}>Backup: <b>{l.backupEmployee?.name||'Not assigned'}</b></div>
                </div>
                <div className="flex gap8">
                  <button className="btn-approve" onClick={()=>handleStatus(l._id,'approved')}>✓ Approve</button>
                  <button className="btn-reject"  onClick={()=>handleStatus(l._id,'rejected')}>✕</button>
                </div>
              </div>
            ))
          )}
          {pending.length > 4 && <button className="btn btn-ghost btn-sm" style={{ width:'100%', marginTop:8 }} onClick={()=>navigate('/leave-requests')}>View {pending.length-4} more →</button>}
        </div>
      </div>
      <div className="g2">
        <div className="card"><div className="stitle">📊 Department Availability</div><VerticalBar data={depts.map(([d,v])=>({label:d.slice(0,6),v}))} color="var(--ocean)" height={140} /></div>
        <div className="card"><div className="stitle">📅 Upcoming Approved Leaves</div>{(analytics?.topTakers||[]).slice(0,5).map((t,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--cream3)' }}>
            <div className="flex gap8 aic"><div className="td-av" style={{ width:28, height:28, background:avatarColor(t.name), fontSize:10 }}>{initials(t.name)}</div><div><div className="fw6 text-sm">{t.name}</div><div className="text-xs text-muted">{t.department}</div></div></div>
            <span className="badge b-dept">{t.days}d used</span>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
export default MgrDashboard;

// ══════════════════════════════ LeaveRequests ══════════════════════════════
import { Modal } from '../../components/shared/index';
import { cap, statusBadge } from '../../utils/helpers';

export function LeaveRequests() {
  const toast = useToast();
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search:'', status:'', dept:'' });
  const [rejectModal, setRejectModal] = useState({ open:false, id:null });
  const [rejectNote,  setRejectNote]  = useState('');
  const [actioning,   setActioning]   = useState(null);

  const fetch = () => {
    leaveAPI.getAll({ status: filters.status }).then(r=>setLeaves(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { fetch(); }, [filters.status]);

  const handleApprove = async (id) => {
    setActioning(id);
    try { await leaveAPI.updateStatus(id, { status:'approved', managerNote:'Approved ✅' }); toast.success('Leave approved!'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setActioning(null); }
  };

  const openReject = (id) => { setRejectModal({ open:true, id }); setRejectNote(''); };
  const confirmReject = async () => {
    if (!rejectNote.trim()) { toast.error('Rejection remark is required'); return; }
    try { await leaveAPI.updateStatus(rejectModal.id, { status:'rejected', managerNote: rejectNote }); toast.success('Leave rejected'); setRejectModal({open:false,id:null}); fetch(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const filtered = leaves.filter(l => {
    const q = filters.search.toLowerCase();
    return (!q || (l.employee?.name||'').toLowerCase().includes(q) || (l.employee?.designation||'').toLowerCase().includes(q))
        && (!filters.dept || l.employee?.department === filters.dept);
  });

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>Leave Requests</h1><p>Review and manage all team applications</p></div>
        <div className="ph-act" style={{ flexWrap:'wrap' }}>
          <div className="srch-wrap"><span style={{ color:'var(--s4)' }}>🔍</span><input placeholder="Search employee…" value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value}))} style={{ width:150 }} /></div>
          <select className="form-control form-select" style={{ width:130 }} value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value}))}>
            <option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
          <select className="form-control form-select" style={{ width:145 }} value={filters.dept} onChange={e=>setFilters(p=>({...p,dept:e.target.value}))}>
            <option value="">All Depts.</option><option>Engineering</option><option>Design</option><option>Marketing</option>
          </select>
        </div>
      </div>
      <div className="card-flat">
        <div className="tbl-wrap">
          {loading ? <Loading /> : (
            <table>
              <thead><tr><th>Employee</th><th>Dept.</th><th>Type</th><th>Reason</th><th>From</th><th>To</th><th>Days</th><th>Backup</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--s4)', padding:32 }}>No leaves found</td></tr>
                : filtered.map(l => (
                  <tr key={l._id}>
                    <td><div className="td-emp"><div className="td-av" style={{ background:avatarColor(l.employee?.name||'') }}>{initials(l.employee?.name||'')}</div><div><div className="fw7 text-sm">{l.employee?.name}</div><div className="text-xs text-muted">{l.employee?.designation}</div></div></div></td>
                    <td><span className="badge b-dept">{l.employee?.department}</span></td>
                    <td className="text-sm">{l.leaveType}</td>
                    <td style={{ fontSize:12, fontWeight:600 }}>{l.reason}</td>

                    <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.fromDate)}</td>
                    <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.toDate)}</td>
                    <td style={{ fontWeight:800, textAlign:'center' }}>{l.numberOfDays}</td>
             <td style={{ fontSize:12, color:'var(--s3)' }}>
  {l.backupEmployee ? (
    <>
      <div>{l.backupEmployee.name}</div>
      <div style={{ fontSize:11, opacity:0.7 }}>
        {l.backupEmployee.designation}
      </div>
    </>
  ) : '—'}
</td>
                    <td><span className={`badge ${statusBadge(l.status)}`}>{cap(l.status)}</span>{l.conflictDetected&&<span style={{ marginLeft:4, fontSize:10 }}>⚡</span>}</td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className="flex gap8">
                          <button className="btn-approve" disabled={actioning===l._id} onClick={()=>handleApprove(l._id)}>Approve</button>
                          <button className="btn-reject"  onClick={()=>openReject(l._id)}>Reject</button>
                        </div>
                      ) : <span style={{ fontSize:11.5, color:'var(--s4)' }}>{l.managerNote||'—'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={rejectModal.open} onClose={()=>setRejectModal({open:false,id:null})} title="Reject Leave Request">
        <div className="form-group"><label className="form-label">Rejection Reason / Remark *</label><textarea className="form-control" rows={4} placeholder="Please provide a reason for rejection…" value={rejectNote} onChange={e=>setRejectNote(e.target.value)} style={{ resize:'vertical' }} /></div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={()=>setRejectModal({open:false,id:null})}>Cancel</button><button className="btn btn-danger" onClick={confirmReject}>Reject Leave</button></div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════ TeamView ══════════════════════════════
import { userAPI } from '../../utils/api';
import { Modal as EmpModal } from '../../components/shared/index';

export function TeamView() {
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filters,   setFilters]   = useState({ search:'', dept:'' });
  const [selected,  setSelected]  = useState(null);
  const [empDetail, setEmpDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    userAPI.getAll({ sysRole:'employee', ...filters }).then(r=>setEmployees(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, [filters.dept, filters.search]);

  const openProfile = async (id) => {
    setSelected(id); setDetailLoading(true); setEmpDetail(null);
    try { const r = await userAPI.getOne(id); setEmpDetail(r.data.data); }
    catch {} finally { setDetailLoading(false); }
  };

  const stats = { avail: employees.filter(e=>!e.isOnLeaveToday).length, onLeave: employees.filter(e=>e.isOnLeaveToday).length };

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>Team View</h1><p>Click any card to view full profile, leave history &amp; calendar</p></div>
        <div className="ph-act">
          <div className="srch-wrap"><span style={{ color:'var(--s4)' }}>🔍</span><input placeholder="Search…" value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value}))} style={{ width:150 }} /></div>
          <select className="form-control form-select" style={{ width:155 }} value={filters.dept} onChange={e=>setFilters(p=>({...p,dept:e.target.value}))}>
            <option value="">All Departments</option><option>Engineering</option><option>Design</option><option>Marketing</option>
          </select>
        </div>
      </div>
      <div className="g4 mb20">
        <StatCard label="Available"     value={stats.avail}         icon="✅" accent="var(--forest)" sub="Today" />
        <StatCard label="On Leave"      value={stats.onLeave}       icon="🏖️" accent="var(--brick)"  sub="Today" />
        <StatCard label="Total Members" value={employees.length}    icon="👥" accent="var(--ocean)"  sub="Active" />
        <StatCard label="Conflicts"     value="2"                   icon="⚡" accent="var(--plum)"   sub="Active" />
      </div>
      {loading ? <Loading /> : (
        <div className="g-auto">
          {employees.map(e => (
            <div key={e._id} className="emp-card" onClick={() => openProfile(e._id)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div className="emp-av" style={{ background:avatarColor(e.name), marginBottom:0 }}>{initials(e.name)}</div>
                <span className={`badge ${e.isOnLeaveToday?'b-onleave':'b-avail'}`}>{e.isOnLeaveToday?'On Leave':'Available'}</span>
              </div>
              <div className="emp-name">{e.name}</div>
              <div className="emp-role-txt">{e.designation}</div>
              <span className="badge b-dept">{e.department}</span>
              <div className="emp-footer">
                <span className="text-xs text-muted">EL: {e.leaveBalance?.el??'—'} left</span>
                <span style={{ fontSize:11, color:'var(--forest)', fontWeight:700 }}>View Profile →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Profile Modal */}
      {selected && (
        <div className="epm-ov" onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}}>
          <div className="epm-box">
            {detailLoading ? <div style={{ padding:40 }}><Loading /></div> : empDetail && (
              <>
                <div className="epm-hdr">
                  <div className="epm-av" style={{ background:avatarColor(empDetail.name||'') }}>{initials(empDetail.name||'')}</div>
                  <div>
                    <div className="epm-name">{empDetail.name}</div>
                    <div className="epm-sub">{empDetail.designation} · {empDetail.department} · {empDetail.email} · {empDetail.isOnLeaveToday?'🏖️ On Leave':'✅ Available'}</div>
                  </div>
                  <button className="epm-close" onClick={()=>setSelected(null)}>✕</button>
                </div>
                <div className="epm-body">
                  <div className="epm-stats">
                    {[['EL Left',empDetail.leaveBalance?.el,'var(--forest)'],['SL Left',empDetail.leaveBalance?.sl,'var(--ocean)'],['CL Left',empDetail.leaveBalance?.cl,'var(--gold)']].map(([lbl,val,col])=>(
                      <div key={lbl} className="epm-stat"><div className="epm-stat-val" style={{ color:col }}>{val??'—'}</div><div className="epm-stat-lbl">{lbl}</div></div>
                    ))}
                  </div>
                  <div className="g2">
                    <div>
                      <div className="stitle">📋 Leave History</div>
                      {(empDetail.leaves||[]).length === 0 ? <p className="text-sm text-muted">No leave records.</p>
                      : (empDetail.leaves||[]).map(l=>(
                        <div key={l._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--cream3)' }}>
                          <div><div className="fw6 text-sm">{l.leaveType}</div><div className="text-xs text-muted">{fmtDate(l.fromDate)}{l.fromDate!==l.toDate?' – '+fmtDate(l.toDate):''} · {l.numberOfDays}d</div>{l.backupEmployee&&<div className="text-xs text-muted">Backup: {l.backupEmployee.name}</div>}</div>
                          <span className={`badge ${statusBadge(l.status)}`}>{cap(l.status)}</span>
                        </div>
                      ))}
                    </div>
                    
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCalendar({ empLeaves = [] }) {
  const yr=new Date().getFullYear(), mo=new Date().getMonth();
  const firstDay=new Date(yr,mo,1).getDay(), daysInMonth=new Date(yr,mo+1,0).getDate();
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const isOnLeave=(d)=>{const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;return empLeaves.some(l=>l.fromDate?.slice(0,10)<=ds&&l.toDate?.slice(0,10)>=ds);};
  const isToday=(d)=>new Date().getDate()===d&&new Date().getMonth()===mo;
  return (
    <div style={{ background:'var(--cal-bg)', borderRadius:12, padding:14, border:'1px solid var(--cal-bdr)' }}>
      <div style={{ fontFamily:'Fraunces,serif', fontSize:15, color:'var(--cal-text)', marginBottom:12, fontWeight:600 }}>{MONTHS[mo]} {yr}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:4 }}>
        {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{ textAlign:'center', fontSize:9, fontWeight:700, color:'var(--cal-muted)', padding:'4px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {Array(firstDay).fill(null).map((_,i)=><div key={'e'+i} style={{ height:30 }} />)}
        {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
          const onL=isOnLeave(d), tod=isToday(d);
          return <div key={d} style={{ height:30, background:tod?'var(--cal-today)':'var(--cal-card)', border:`1px solid ${tod?'#3B6DD4':'var(--cal-bdr)'}`, borderRadius:5, padding:'3px 2px', textAlign:'center' }}>
            <div style={{ fontSize:10, fontWeight:700, color:tod?'#7BAFF5':'var(--cal-text)' }}>{d}</div>
            {onL&&<div style={{ width:5, height:5, borderRadius:'50%', background:'#F472B6', margin:'1px auto 0' }} />}
          </div>;
        })}
      </div>
      {empLeaves.length>0&&<div style={{ marginTop:10, fontSize:10.5, color:'var(--cal-muted)' }}>{empLeaves.map(l=><div key={l._id} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}><div style={{ width:7, height:7, borderRadius:'50%', background:'#F472B6', flexShrink:0 }} /><span style={{ color:'rgba(232,237,245,.7)' }}>{fmtDate(l.fromDate)}{l.fromDate!==l.toDate?' – '+fmtDate(l.toDate):''}: {l.leaveType}</span></div>)}</div>}
    </div>
  );
}

// ══════════════════════════════ MgrAnalytics ══════════════════════════════
export function MgrAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const TCOLS=['var(--forest)','var(--ocean)','var(--gold)','var(--plum)','var(--teal)','var(--brick)'];

  useEffect(()=>{
    analyticsAPI.manager({year:new Date().getFullYear()}).then(r=>setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if(loading) return <Loading />;
  const mD=data?.monthly||Array(12).fill(0);const mMax=Math.max(...mD,1);
  const depts=Object.entries(data?.departmentBreakdown||{});const dMax=Math.max(...depts.map(([,v])=>v),1);
  const types=Object.entries(data?.leaveTypeBreakdown||{});const tTotal=types.reduce((s,[,v])=>s+v,0)||1;
  const monthChartData=MONTHS.map((m,i)=>({label:m,v:mD[i]}));
  const deptChartData=depts.map(([dept,val])=>({label:dept.slice(0,5),v:val}));

  return (
    <div className="page-anim">
      <div className="ph mb20"><h1>Analytics & Insights</h1><p>Team-wide leave intelligence</p></div>
      <div className="g2 mb20">
        <div className="card"><div className="stitle">📈 Monthly Leave Trends</div><VerticalBar data={monthChartData} color="var(--forest)" /></div>
        <div className="card"><div className="stitle">🏢 Department Breakdown</div><VerticalBar data={deptChartData} color="var(--ocean)" /></div>
      </div>
      <div className="g2 mb20">
        <div className="card">
          <div className="stitle">🏷️ Leave Type Distribution</div>
          <div style={{ marginTop:12 }}>{types.map(([type,val],i)=>(
            <div key={type} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:13 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:TCOLS[i%TCOLS.length], flexShrink:0 }} />
              <div style={{ flex:1, fontSize:13, fontWeight:600 }}>{type}</div>
              <div style={{ width:100, height:8, background:'var(--cream2)', borderRadius:6, overflow:'hidden' }}><div style={{ width:`${Math.round(val/tTotal*100)}%`, height:'100%', background:TCOLS[i%TCOLS.length], borderRadius:6 }} /></div>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--s2)', width:32 }}>{Math.round(val/tTotal*100)}%</div>
            </div>
          ))}</div>
        </div>
        <div className="card">
          <div className="stitle">👑 Top Leave Takers</div>
          {(data?.topTakers||[]).map((emp,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:11 }}>
              <div style={{ width:23, height:23, borderRadius:'50%', background:avatarColor(emp.name), color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</div>
              <div style={{ flex:1 }}><div className="fw7 text-sm">{emp.name}</div><div className="text-xs text-muted">{emp.department}</div></div>
              <span className={`badge ${emp.days>=15?'b-rejected':emp.days>=8?'b-pending':'b-approved'}`}>{emp.days}d</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="stitle">💡 Smart Insights</div>
        <InsightCard icon="📈" title="Peak leave month detected" desc="April has the highest leave activity. Pre-assign backups for Engineering before Q2 planning." />
        <InsightCard icon="⚠️" title="Engineering team leave risk" desc="3+ developers on simultaneous leave triggered conflict detection. Stagger approvals by designation." />
        <InsightCard icon="💡" title="Year-end carry-forward reminder" desc="Employees with >5 unused EL will lose excess at year-end. Send a reminder in Q3." />
      </div>
    </div>
  );
}

function InsightCard({icon,title,desc}) { return <div className="insight"><span className="insight-ico">{icon}</span><div><span className="insight-title">{title}</span><p className="insight-desc">{desc}</p></div></div>; }
