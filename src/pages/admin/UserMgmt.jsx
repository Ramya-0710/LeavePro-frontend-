import { useState, useEffect } from 'react';
import { userAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Modal, StatCard, Loading } from '../../components/shared/index';
import { avatarColor, initials, cap } from '../../utils/helpers';

const ROLE_BADGE = { employee:'b-emp', manager:'b-mgr', admin:'b-admin' };
const DEPTS = ['Engineering','Design','Marketing','HR','Sales','Finance','Operations'];

// ✅ FIX: FormBody moved OUTSIDE UserMgmt so its identity is stable across renders.
// When defined inside, every keystroke recreated the component type → React unmounted
// and remounted it → input lost focus after 1 character typed.
function FormBody({ form, setForm, managers, editUser }) {
  const uf = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const ub = (field, val) => setForm(p => ({ ...p, leaveBalance: { ...p.leaveBalance, [field]: parseInt(val)||0 } }));
  const [showTempPw, setShowTempPw] = useState(false);

  return (
    <>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" placeholder="e.g. Raj Kumar" value={form.name} onChange={e=>uf('name',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" placeholder="raj@company.com" value={form.email} onChange={e=>uf('email',e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Designation *</label><input className="form-control" placeholder="e.g. Developer" value={form.designation} onChange={e=>uf('designation',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Department *</label>
          <select className="form-control form-select" value={form.department} onChange={e=>uf('department',e.target.value)}>
            {DEPTS.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">System Role</label>
          <select className="form-control form-select" value={form.sysRole} onChange={e=>uf('sysRole',e.target.value)}>
            <option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Reports To</label>
          <select className="form-control form-select" value={form.reportsTo} onChange={e=>uf('reportsTo',e.target.value)}>
            <option value="">None</option>
            {managers.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">CL Balance</label><input className="form-control" type="number" min={0} max={30} value={form.leaveBalance?.cl||6}  onChange={e=>ub('cl',e.target.value)} /></div>
        <div className="form-group"><label className="form-label">SL Balance</label><input className="form-control" type="number" min={0} max={30} value={form.leaveBalance?.sl||12} onChange={e=>ub('sl',e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">EL Balance</label><input className="form-control" type="number" min={0} max={60} value={form.leaveBalance?.el||24} onChange={e=>ub('el',e.target.value)} /></div>
      {editUser && (
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-control form-select" value={form.isActive?'active':'inactive'} onChange={e=>uf('isActive',e.target.value==='active')}>
            <option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>
      )}
      {!editUser && (
        <div className="form-group" style={{ marginTop: 6 }}>
          <label className="form-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
            🔐 Temporary Password
            <span style={{ fontSize:11, fontWeight:400, color:'var(--s4)' }}>(optional — defaults to <b>password123</b>)</span>
          </label>
          <div style={{ position:'relative' }}>
            <input
              className="form-control"
              type={showTempPw ? 'text' : 'password'}
              placeholder="Leave blank to use default: password123"
              value={form.tempPassword || ''}
              onChange={e=>uf('tempPassword', e.target.value)}
              style={{ paddingRight:40 }}
            />
            <button
              type="button"
              onClick={() => setShowTempPw(p=>!p)}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--s4)' }}
            >{showTempPw ? '🙈' : '👁️'}</button>
          </div>
          <span className="form-hint">Min. 6 characters. Employee must change this after first login.</span>
        </div>
      )}
    </>
  );
}

export default function UserMgmt() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filters,  setFilters]  = useState({ search:'', dept:'', sysRole:'' });
  const [addOpen,  setAddOpen]  = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving,   setSaving]   = useState(false);

  const blank = { name:'', email:'', designation:'', department:'Engineering', sysRole:'employee', reportsTo:'', leaveBalance:{cl:6,sl:12,el:24}, tempPassword:'' };
  const [form, setForm] = useState(blank);

  const fetchUsers = () => {
    setLoading(true);
    const params = {};
    if (filters.dept)    params.dept    = filters.dept;
    if (filters.sysRole) params.sysRole = filters.sysRole;
    if (filters.search)  params.search  = filters.search;
    userAPI.getAll(params)
      .then(r => setUsers(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [filters.dept, filters.sysRole]);
  useEffect(() => {
    const t = setTimeout(fetchUsers, 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  useEffect(() => {
    userAPI.getAll({ sysRole:'manager' })
      .then(r => setManagers(r.data.data || []))
      .catch(() => {});
  }, []);

  const openAdd  = () => { setForm(blank); setAddOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name:u.name, email:u.email, designation:u.designation, department:u.department, sysRole:u.sysRole, reportsTo:u.reportsTo?._id||'', leaveBalance:{...u.leaveBalance}, isActive:u.isActive });
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.designation) { toast.error('Name, email and designation required'); return; }
    if (form.tempPassword && form.tempPassword.trim().length > 0 && form.tempPassword.trim().length < 6) {
      toast.error('Temporary password must be at least 6 characters'); return;
    }
    setSaving(true);
    try {
      await userAPI.create({ ...form, reportsTo: form.reportsTo || null });
      const pw = (form.tempPassword && form.tempPassword.trim().length >= 6) ? form.tempPassword.trim() : 'password123';
      toast.success(`"${form.name}" added! Temp password: ${pw}`);
      setAddOpen(false);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await userAPI.update(editUser._id, form);
      toast.success('Employee updated!');
      setEditUser(null);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    try { await userAPI.delete(u._id); toast.success(`"${u.name}" removed`); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const stats = {
    total:     users.length,
    employee:  users.filter(u=>u.sysRole==='employee').length,
    manager:   users.filter(u=>u.sysRole==='manager').length,
    onLeave:   users.filter(u=>u.isOnLeaveToday).length,
  };

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph"><h1>User Management</h1><p>Add, edit, assign roles and manage all employees</p></div>
        <button className="btn btn-gold" onClick={openAdd}>＋ Add Employee</button>
      </div>

      <div className="g4 mb20">
        <StatCard label="Total Users"    value={stats.total}    icon="👥" accent="var(--forest)" sub="All roles" />
        <StatCard label="Employees"      value={stats.employee} icon="👤" accent="var(--ocean)"  sub="Active" />
        <StatCard label="Managers"       value={stats.manager}  icon="👨‍💼" accent="var(--gold)"   sub="Active" />
        <StatCard label="On Leave Today" value={stats.onLeave}  icon="🏖️" accent="var(--brick)"  sub="Out of office" />
      </div>

      <div className="card-flat">
        <div style={{ padding:'14px 16px', background:'var(--cream)', borderBottom:'1.5px solid var(--cream3)', display:'flex', gap:10, flexWrap:'wrap' }}>
          <div className="srch-wrap">
            <span style={{ color:'var(--s4)' }}>🔍</span>
            <input placeholder="Search by name or designation…" value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value}))} style={{ width:200 }} />
          </div>
          <select className="form-control form-select" style={{ width:150 }} value={filters.dept} onChange={e=>setFilters(p=>({...p,dept:e.target.value}))}>
            <option value="">All Departments</option>{DEPTS.slice(0,4).map(d=><option key={d}>{d}</option>)}
          </select>
          <select className="form-control form-select" style={{ width:130 }} value={filters.sysRole} onChange={e=>setFilters(p=>({...p,sysRole:e.target.value}))}>
            <option value="">All Roles</option><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option>
          </select>
        </div>
        <div className="tbl-wrap">
          {loading ? <Loading /> : (
            <table>
              <thead><tr><th>Employee</th><th>Email</th><th>Designation</th><th>Dept.</th><th>Role</th><th>Manager</th><th>CL</th><th>SL</th><th>EL</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.length === 0
                  ? <tr><td colSpan={11} style={{ textAlign:'center', color:'var(--s4)', padding:32 }}>No users found</td></tr>
                  : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="td-emp">
                        <div className="td-av" style={{ background: avatarColor(u.name) }}>{initials(u.name)}</div>
                        <div><div className="fw7 text-sm">{u.name}</div></div>
                      </div>
                    </td>
                    <td className="text-xs text-muted">{u.email}</td>
                    <td className="text-sm">{u.designation}</td>
                    <td><span className="badge b-dept">{u.department}</span></td>
                    <td><span className={`badge ${ROLE_BADGE[u.sysRole]||'b-dept'}`}>{cap(u.sysRole)}</span></td>
                    <td className="text-xs text-muted">{u.reportsTo?.name || '—'}</td>
                    <td style={{ fontWeight:800, textAlign:'center' }}>{u.leaveBalance?.cl ?? '—'}</td>
                    <td style={{ fontWeight:800, textAlign:'center' }}>{u.leaveBalance?.sl ?? '—'}</td>
                    <td style={{ fontWeight:800, textAlign:'center' }}>{u.leaveBalance?.el ?? '—'}</td>
                    <td><span className={`badge ${u.isActive ? 'b-approved' : 'b-rejected'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="flex gap8">
                        {u.sysRole !== 'admin' && <button className="icon-btn edit" onClick={() => openEdit(u)} title="Edit">✏️</button>}
                        {u.sysRole !== 'admin' && <button className="icon-btn" onClick={() => handleDelete(u)} title="Delete">🗑️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Employee">
        <FormBody form={form} setForm={setForm} managers={managers} editUser={null} />
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
          <button className="btn btn-gold" disabled={saving} onClick={handleAdd}>{saving ? '⏳ Adding…' : 'Add Employee'}</button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit Employee">
        <FormBody form={form} setForm={setForm} managers={managers} editUser={editUser} />
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
          <button className="btn btn-gold" disabled={saving} onClick={handleEdit}>{saving ? '⏳ Saving…' : 'Save Changes'}</button>
        </div>
      </Modal>
    </div>
  );
}
