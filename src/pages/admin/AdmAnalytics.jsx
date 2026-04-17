import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../utils/api';
import { StatCard, ChartBar, VerticalBar, Loading } from '../../components/shared/index';

const TCOLS = ['var(--forest)','var(--ocean)','var(--gold)','var(--plum)','var(--teal)','var(--brick)'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdmAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [year,    setYear]    = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    analyticsAPI.admin({ year }).then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [year]);

  if (loading) return <Loading />;

  const mD     = data?.monthly || Array(12).fill(0);
  const mMax   = Math.max(...mD, 1);
  const depts  = Object.entries(data?.departmentBreakdown || {});
  const dMax   = depts.length ? Math.max(...depts.map(([,v]) => v), 1) : 1;
  const types  = Object.entries(data?.leaveTypeBreakdown  || {});
  const tTotal = types.reduce((s,[,v]) => s + v, 0) || 1;

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>System-Wide Analytics</h1><p>Organisation-level leave intelligence &amp; trends</p></div>
        <div className="ph-act">
          <select className="form-control form-select" style={{ width:120 }} value={year} onChange={e=>setYear(+e.target.value)}>
            {[2023,2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="g4 mb20">
        <StatCard label="Total Leaves (Year)"    value={mD.reduce((s,v)=>s+v,0)||'—'} icon="📊" accent="var(--forest)" sub="Approved days" />
        <StatCard label="Pending Requests"        value={data?.pendingCount??'—'}        icon="📋" accent="var(--gold)"   sub="Needs action" />
        <StatCard label="Rejected Leaves"         value={data?.rejectedCount??'—'}       icon="❌" accent="var(--brick)"  sub="This year" />
        <StatCard label="Overall Approval Rate"   value={`${data?.approvalRate??0}%`}    icon="✅" accent="var(--ocean)"  sub="Year to date" />
      </div>

      <div className="g2 mb20">
        <div className="card">
          <div className="stitle">📈 Monthly Trends (Org-Wide {year})</div>
          <VerticalBar data={MONTHS.map((m,i)=>({label:m,v:mD[i]}))} color="var(--ocean)" />
        </div>
        <div className="card">
          <div className="stitle">🏢 Department Comparison</div>
          <div>
            {depts.length === 0
              ? <p className="text-sm text-muted">No data yet</p>
              : <VerticalBar data={depts.map(([d,v])=>({label:d.slice(0,6),v}))} color="var(--ocean)" />
            }
          </div>
        </div>
      </div>

      <div className="g2 mb20">
        <div className="card">
          <div className="stitle">🏷️ Leave Type Distribution</div>
          {types.length === 0 ? <p className="text-sm text-muted">No data yet</p> : (
            <div style={{ marginTop:12 }}>
              {types.map(([type,val],i) => (
                <div key={type} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:13 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:TCOLS[i%TCOLS.length], flexShrink:0 }} />
                  <div style={{ flex:1, fontSize:13, fontWeight:600 }}>{type}</div>
                  <div style={{ width:100, height:8, background:'var(--cream2)', borderRadius:6, overflow:'hidden' }}>
                    <div style={{ width:`${Math.round(val/tTotal*100)}%`, height:'100%', background:TCOLS[i%TCOLS.length], borderRadius:6 }} />
                  </div>
                  <div style={{ fontSize:12, fontWeight:800, color:'var(--s2)', width:36 }}>{Math.round(val/tTotal*100)}%</div>
                  <div style={{ fontSize:12, color:'var(--s4)', width:20 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="stitle">👤 User Summary</div>
          {[
            ['Total Employees', data?.totalEmployees, 'var(--forest)', '👤'],
            ['Total Managers',  data?.totalManagers,  'var(--ocean)',  '👨‍💼'],
            ['Total Admins',    data?.totalAdmins,    'var(--gold)',   '🧑‍💼'],
          ].map(([lbl,val,col,ico]) => (
            <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', background:'var(--cream)', borderRadius:9, marginBottom:9, border:'1px solid var(--cream3)' }}>
              <span className="fw6 text-sm">{ico} {lbl}</span>
              <span style={{ fontFamily:'Fraunces,serif', fontSize:22, fontWeight:600, color:col }}>{val ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="stitle">💡 Admin Insights</div>
        {[
          ['📈', 'Peak leave month detected', `${MONTHS[mD.indexOf(Math.max(...mD))]} shows highest leave activity (${Math.max(...mD)} days). Pre-assign backups for Engineering in advance.`],
          ['⚠️', 'Engineering team conflict risk', 'Multiple conflict incidents this year — all in Engineering. Consider increasing conflict threshold from 3→4 or hiring additional developers.'],
          ['📊', `${data?.approvalRate || 84}% approval rate`, 'Rejection rate mostly from Engineering role conflicts. SL approvals at near 100%. Consider updating conflict detection rules.'],
          ['💡', 'Year-end carry-forward projection', 'Many employees have unused EL. Send a leave-usage reminder in Q3 to reduce year-end lapse and improve employee satisfaction.'],
        ].map(([icon,title,desc]) => (
          <div key={title} className="insight">
            <span className="insight-ico">{icon}</span>
            <div><span className="insight-title">{title}</span><p className="insight-desc">{desc}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
