import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notifAPI } from '../../utils/api';
import { avatarColor, initials } from '../../utils/helpers';

// ── Topbar ──────────────────────────────────────────
export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetch = () => notifAPI.getAll().then(r => setUnread(r.data.unreadCount || 0)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  if (!user) return null;
  const tagMap = { employee: { label: 'Employee', cls: 'emp' }, manager: { label: 'Manager', cls: 'mgr' }, admin: { label: 'Admin', cls: 'adm' } };
  const tag = tagMap[user.sysRole] || tagMap.employee;
  const name = user.name || '';

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <div className="topbar-logo-icon">🌿</div>
        <span>Leave<em>Flow</em>&nbsp;<span style={{ fontSize: 10, color: 'var(--s4)', fontFamily: 'Sora,sans-serif', fontWeight: 400 }}>Pro</span></span>
      </div>
      <div className="t-right">
        <button className="notif-btn" onClick={() => navigate('/notifications')}>
          🔔
          {unread > 0 && <span className="notif-badge-dot">{unread > 9 ? '9+' : unread}</span>}
        </button>
        <div className="user-pill">
          <div className="up-av" style={{ background: avatarColor(name) }}>{initials(name)}</div>
          <span className="up-name">{name.split(' ')[0]}</span>
          <span className={`up-tag ${tag.cls}`}>{tag.label}</span>
        </div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}

// ── NAV CONFIG ──────────────────────────────────────
const NAV = {
  employee: [
    { label: 'My Dashboard',  path: '/dashboard',     icon: <IconGrid /> },
    { label: 'Apply Leave',   path: '/apply',         icon: <IconPlus /> },
    { label: 'My Leaves',     path: '/my-leaves',     icon: <IconList /> },
    { label: 'My Analytics',  path: '/emp-analytics', icon: <IconChart /> },
    { label: 'Carry Forward', path: '/carry-forward', icon: <IconForward /> },
    { divider: true, label: 'Shared' },
    { label: 'Calendar',      path: '/calendar',      icon: <IconCal /> },
    { label: 'Events',        path: '/events',        icon: <IconClock /> },
    { label: 'Holidays',      path: '/holidays',      icon: <IconStar /> },
    { label: 'Notifications', path: '/notifications', icon: <IconBell />, badge: true },
    { divider: true, label: 'Account' },
    { label: 'My Profile',    path: '/profile',       icon: <IconUser /> },
  ],
  manager: [
    { label: 'Dashboard',       path: '/mgr-dashboard',  icon: <IconGrid /> },
    { label: 'Apply Leave',     path: '/mgr-apply',      icon: <IconPlus /> },
    { label: 'My Leaves',       path: '/mgr-my-leaves',  icon: <IconList /> },
    { label: 'Leave Requests',  path: '/leave-requests', icon: <IconList />, badge: true },
    { label: 'Team View',       path: '/team',           icon: <IconTeam /> },
    { label: 'Analytics',       path: '/mgr-analytics',  icon: <IconChart /> },
    { divider: true, label: 'Shared' },
    { label: 'Calendar',        path: '/calendar',       icon: <IconCal /> },
    { label: 'Events',          path: '/events',         icon: <IconClock /> },
    { label: 'Holidays',        path: '/holidays',       icon: <IconStar /> },
    { label: 'Notifications',   path: '/notifications',  icon: <IconBell />, badge: true },
    { divider: true, label: 'Account' },
    { label: 'My Profile',      path: '/profile',        icon: <IconUser /> },
  ],
  admin: [
    { label: 'Admin Dashboard',  path: '/adm-dashboard',      icon: <IconGrid /> },
    { label: 'User Management',  path: '/user-mgmt',          icon: <IconTeam /> },
    { label: 'Leave Approvals',  path: '/adm-leave-approvals',icon: <IconList />, badge: true },
    { label: 'Leave Policy',     path: '/leave-policy',       icon: <IconPolicy /> },
    { label: 'Analytics',        path: '/adm-analytics',      icon: <IconChart /> },
    { divider: true, label: 'Shared' },
    { label: 'Calendar',        path: '/calendar',      icon: <IconCal /> },
    { label: 'Holidays',        path: '/holidays',      icon: <IconStar /> },
    { label: 'Notifications',   path: '/notifications', icon: <IconBell />, badge: true },
    { divider: true, label: 'Account' },
    { label: 'My Profile',      path: '/profile',       icon: <IconUser /> },
  ],
};

// ── Sidebar ──────────────────────────────────────────
export function Sidebar() {
  const { user } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    notifAPI.getAll().then(r => setNotifCount(r.data.unreadCount || 0)).catch(() => {});
    if (user?.sysRole === 'manager' || user?.sysRole === 'admin') {
      import('../../utils/api').then(({ leaveAPI }) =>
        leaveAPI.getAll({ status: 'pending' }).then(r => setPendingLeaves(r.data.count || 0)).catch(() => {})
      );
    }
  }, [user]);

  if (!user) return null;
  const role = user.sysRole || 'employee';
  const items = NAV[role] || NAV.employee;
  const modeClass = { employee: 'emp', manager: 'mgr', admin: 'adm' }[role] || 'emp';

  return (
    <div className="sidebar">
      {/* Sidebar Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:9, padding:'12px 12px 14px', marginBottom:6, borderBottom:'1px solid #E8E6DC' }}>
        <div style={{ width:28, height:28, background:'linear-gradient(135deg,#2D5A27,#1E3D1B)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🌿</div>
        <div style={{ fontFamily:'Fraunces,serif', fontSize:16, color:'#1C2B3A', lineHeight:1 }}>Leave<em style={{ color:'#2D5A27', fontStyle:'italic' }}>Flow</em></div>
        <div style={{ marginLeft:'auto', fontSize:10, color:'#9AAAB8', fontWeight:500, fontFamily:'Sora,sans-serif' }}>Pro</div>
      </div>

      <div className="sb-profile">
        <div className="sbp-av" style={{ background: avatarColor(user.name || '') }}>{initials(user.name || '')}</div>
        <div>
          <div className="sbp-name">{user.name}</div>
          <div className="sbp-role">{user.designation}</div>
        </div>
      </div>

      <div className="sb-section">
        <span className="sb-label">{{ employee: 'Employee', manager: 'Manager', admin: 'Admin' }[role]}</span>
        {items.map((item, i) => {
          if (item.divider) return (
            <div key={i}><div className="sb-divider" /><span className="sb-label">{item.label}</span></div>
          );
          const cnt = item.badge && item.path === '/notifications' ? notifCount
                    : item.badge && item.path === '/leave-requests' ? pendingLeaves : 0;
          return (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link${isActive ? ` active ${modeClass}` : ''}`}>
              {item.icon}
              {item.label}
              {cnt > 0 && <span className="nav-cnt">{cnt}</span>}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

// ── SVG Icons ──────────────────────────────────────
function IconGrid()    { return <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function IconList()    { return <svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h9M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconChart()   { return <svg viewBox="0 0 16 16" fill="none"><path d="M2 12L5 7l3 3 3-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconTeam()    { return <svg viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="10.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.5"/><path d="M11 10.5C12.2 10.8 15 11.6 15 14" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function IconPlus()    { return <svg viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconCal()     { return <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 3V1M11 3V1M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconClock()   { return <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconStar()    { return <svg viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.5 4.5H14L10 8.5 11.5 13 8 10.5 4.5 13 6 8.5 2 6h4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>; }
function IconBell()    { return <svg viewBox="0 0 16 16" fill="none"><path d="M8 2a4.5 4.5 0 00-4.5 4.5V9.5L2 11h12l-1.5-1.5V6.5A4.5 4.5 0 008 2zM6.5 11v.5a1.5 1.5 0 003 0V11" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function IconForward() { return <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 3V1M11 3V1M2 7h12M9 10l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconPolicy()  { return <svg viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconUser()    { return <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
