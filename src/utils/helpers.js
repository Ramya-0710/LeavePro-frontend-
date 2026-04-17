// ── Date helpers ──
export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const relTime = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1)    return 'Just now';
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

export const countWorkingDays = (from, to) => {
  let count = 0;
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(count, 1);
};

// ── String helpers ──
export const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ── Avatar color (deterministic) ──
const COLORS = ['#2D5A27','#1A5E9B','#C04A2A','#6B2D7A','#9A6B00','#0F7B6C','#5B3AA0','#354C5F','#7A3C2A','#1F6B5A'];
export const avatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

// ── Leave type label ──
export const leaveTypeLabel = (type) => {
  const map = { CL:'Casual Leave', SL:'Sick Leave', EL:'Earned Leave', ML:'Maternity Leave', PL:'Paternity Leave', CompOff:'Compensatory Off', BL:'Bereavement Leave' };
  return map[type] || type;
};

// ── Badge class ──
export const statusBadge = (status) => {
  const map = { pending:'b-pending', approved:'b-approved', rejected:'b-rejected', cancelled:'b-cancelled' };
  return map[status] || 'b-dept';
};

// ── Today's date string ──
export const todayStr = () => new Date().toISOString().split('T')[0];
