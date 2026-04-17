import { useState, useEffect } from 'react';
import { analyticsAPI, auditAPI } from '../../utils/api';
import { StatCard, ChartBar, VerticalBar, Loading } from '../../components/shared/index';
import { relTime } from '../../utils/helpers';

const AUDIT_ICONS  = { approve:'✅', reject:'❌', apply:'📋', policy:'⚙️', event:'📅', user_add:'👤', user_edit:'✏️', user_delete:'🗑️', holiday:'🎊', carry_forward:'📅', login:'🔐', cancel:'🚫' };
const AUDIT_COLORS = { approve:'var(--forest)', reject:'var(--red)', apply:'var(--ocean)', policy:'var(--gold)', event:'var(--amb)', user_add:'var(--plum)', user_edit:'var(--teal)', user_delete:'var(--red)' };

export default function AdmDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [audit,     setAudit]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.admin({ year: new Date().getFullYear() }),
      auditAPI.getAll({ limit: 8 })
    ]).then(([aR, auR]) => {
      setAnalytics(aR.data.data);
      setAudit(auR.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mD     = analytics?.monthly || Array(12).fill(0);
  const mMax   = Math.max(...mD, 1);
  const depts  = Object.entries(analytics?.departmentBreakdown || {});
  const dMax   = depts.length ? Math.max(...depts.map(([,v]) => v), 1) : 1;

  return (
    <div className="page-anim">
      <div className="admin-banner">
        <div className="admin-banner-icon">🧑‍💼</div>
        <div>
          <div className="admin-banner-title">Admin Control Panel</div>
          <div className="admin-banner-sub">System-wide governance · User management · Policy control · Audit logs</div>
        </div>
      </div>

      <div className="g4 mb20">
        <StatCard label="Total Employees" value={analytics?.totalEmployees ?? '—'} icon="👥" accent="var(--forest)" sub="Active accounts" />
        <StatCard label="Total Managers"  value={analytics?.totalManagers  ?? '—'} icon="👨‍💼" accent="var(--ocean)"  sub="Active" />
        <StatCard label="Pending Leaves"  value={analytics?.pendingCount   ?? '—'} icon="📋" accent="var(--gold)"   sub="Needs attention" />
        <StatCard label="Approval Rate"   value={analytics?.approvalRate != null ? `${analytics.approvalRate}%` : '—'} icon="✅" accent="var(--ruby)" sub="This year" />
      </div>

      <div className="g2 mb20">
        <div className="card">
          <div className="stitle">📊 Org-Wide Leave Distribution</div>
          <VerticalBar data={depts.map(([d,v])=>({label:d.slice(0,6),v}))} color="var(--ocean)" height={140} />
        </div>
        <div className="card">
          <div className="stitle">⚙️ System Status</div>
          {[['Conflict Detection','✅ Active','var(--fp)'],['Carry Forward Policy','✅ Enabled (5 days)','var(--fp)'],['Notification System','✅ Role-Targeted','var(--fp)'],['Timezone','IST (UTC+5:30)','var(--gl)'],['Leave Year','Jan–Dec 2025','var(--gl)']].map(([lbl,val,bg])=>(
            <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 13px', background:bg, borderRadius:9, marginBottom:9 }}>
              <span className="fw6 text-sm">{lbl}</span>
              <span className="badge b-approved">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="stitle">🔍 Recent Audit Log</div>
          {audit.length === 0
            ? <p className="text-sm text-muted">No audit records yet.</p>
            : audit.map(a => (
            <div key={a._id} className="audit-item">
              <div className="audit-icon" style={{ background:`${AUDIT_COLORS[a.action]||'var(--ocean)'}20`, color:AUDIT_COLORS[a.action]||'var(--ocean)' }}>
                {AUDIT_ICONS[a.action]||'📋'}
              </div>
              <div style={{ flex:1 }}>
                <div className="text-sm fw6">{a.description}</div>
                <div className="text-xs text-muted">{a.performedBy?.name} ({a.performedBy?.sysRole}) · {relTime(a.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="stitle">📈 Monthly Trends (Org-Wide)</div>
          <VerticalBar data={MONTHS.map((m,i)=>({label:m,v:mD[i]}))} color="var(--ocean)" />
        </div>
      </div>
    </div>
  );
}
