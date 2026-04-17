import { useState, useEffect } from 'react';
import { avatarColor, initials } from '../../utils/helpers';

// ── Avatar ──────────────────────────────────────────
export const Avatar = ({ name = '', size = 28, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 800, flexShrink: 0, ...style }}>
    {initials(name)}
  </div>
);

// ── Stat Card ───────────────────────────────────────
export const StatCard = ({ label, value, sub, icon, accent = 'var(--forest)' }) => (
  <div className="stat" style={{ '--acc': accent }}>
    <span className="stat-ico">{icon}</span>
    <div className="stat-lbl">{label}</div>
    <div className="stat-val">{value ?? '—'}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

// ── Bar Chart Row ───────────────────────────────────
export const ChartBar = ({ label, value, max, color = 'var(--forest)' }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="chart-row">
      <div className="chart-lbl">{label}</div>
      <div className="chart-track">
        <div className="chart-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="chart-val">{value}</div>
    </div>
  );
};

// ── Ring Chart ──────────────────────────────────────
export const RingChart = ({ current, total, color, label, sub }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = total > 0 ? Math.round((current / total) * circ) : 0;
  return (
    <div className="bal-row">
      <div className="ring-wrap">
        <svg width="78" height="78" viewBox="0 0 78 78">
          <circle cx="39" cy="39" r={r} fill="none" stroke="var(--cream3)" strokeWidth="7" />
          <circle cx="39" cy="39" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div className="ring-center">
          <div className="ring-num" style={{ color }}>{current}</div>
          <div className="ring-of">/ {total}</div>
        </div>
      </div>
      <div>
        <div className="fw7" style={{ fontSize: 14 }}>{label}</div>
        {sub && <div className="text-sm text-muted mt8">{sub}</div>}
      </div>
    </div>
  );
};

// ── Modal ───────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, wide = false }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-box${wide ? ' wide' : ''}`}>
        <div className="modal-hdr">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── Alert ───────────────────────────────────────────
export const Alert = ({ type = 'warning', icon, title, message }) => (
  <div className={`alert ${type}`}>
    <div className="alert-ico">{icon}</div>
    <div className="alert-body">
      {title && <strong>{title}</strong>}
      {message && <p>{message}</p>}
    </div>
  </div>
);

// ── Loading ─────────────────────────────────────────
export const Loading = () => (
  <div className="loading-wrap"><div className="spinner" /></div>
);

// ── Insight Card ────────────────────────────────────
export const InsightCard = ({ icon, title, desc }) => (
  <div className="insight">
    <span className="insight-ico">{icon}</span>
    <div>
      <span className="insight-title">{title}</span>
      <p className="insight-desc">{desc}</p>
    </div>
  </div>
);

// ── Policy Card ─────────────────────────────────────
export const PolicyCard = ({ label, desc, badge, badgeClass = 'b-approved', action }) => (
  <div className="policy-card">
    <div>
      <div className="policy-label">{label}</div>
      {desc && <div className="policy-desc">{desc}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {badge && <span className={`badge ${badgeClass}`}>{badge}</span>}
      {action}
    </div>
  </div>
);

// ── Timeline Item ───────────────────────────────────
export const TLItem = ({ date, text, status, color }) => (
  <div className="tl-item">
    <div className="tl-dot" style={{ background: color || 'var(--forest)' }} />
    <div className="tl-date">{date}</div>
    <div className="tl-text">{text}</div>
    {status && <div style={{ marginTop: 5 }}><span className={`badge b-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></div>}
  </div>
);

// ── Empty State ─────────────────────────────────────
export const EmptyState = ({ icon = '📭', message = 'No data found' }) => (
  <div style={{ textAlign: 'center', color: 'var(--s4)', padding: '32px 16px', fontSize: 13 }}>
    <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
    {message}
  </div>
);

// ── Vertical Bar Chart ──────────────────────────────
export const VerticalBar = ({ data = [], color = 'var(--forest)', height = 180, showValues = true }) => {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height: height + 40, paddingBottom:0, marginTop:12 }}>
      {data.map((d, i) => {
        const pct = Math.round((d.v / max) * 100);
        const barH = Math.max(Math.round((d.v / max) * height), d.v > 0 ? 6 : 0);
        return (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, gap:4 }}>
            {showValues && <div style={{ fontSize:10, fontWeight:800, color:'var(--s3)', height:16, display:'flex', alignItems:'center' }}>{d.v > 0 ? d.v : ''}</div>}
            <div style={{ width:'100%', height, display:'flex', alignItems:'flex-end' }}>
              <div style={{ width:'100%', height:barH, background:color, borderRadius:'4px 4px 0 0', transition:'height .6s ease', minHeight: d.v > 0 ? 4 : 0, opacity: d.v > 0 ? 1 : .15, backgroundImage:`linear-gradient(to top, ${color}, ${color}CC)` }} />
            </div>
            <div style={{ fontSize:9.5, fontWeight:700, color:'var(--s4)', letterSpacing:.3, textAlign:'center', lineHeight:1.2 }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
};
