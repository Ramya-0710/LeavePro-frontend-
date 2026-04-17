import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../utils/api';
import { avatarColor, initials, cap } from '../../utils/helpers';

const ROLE_COLORS = { employee: 'var(--ocean)', manager: 'var(--gold)', admin: 'var(--forest)' };
const ROLE_LABELS = { employee: 'Employee', manager: 'Manager', admin: 'Admin' };

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState({ curr: false, new: false, conf: false });

  if (!user) return null;

  const uf = (f, v) => setProfileForm(p => ({ ...p, [f]: v }));
  const upw = (f, v) => setPwForm(p => ({ ...p, [f]: v }));

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) return toast.error('Name cannot be empty');
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile({ name: profileForm.name.trim(), phone: profileForm.phone.trim() });
      updateUser(res.data.user);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!pwForm.currentPassword) return toast.error('Enter your current password');
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const joinDate = user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const roleColor = ROLE_COLORS[user.sysRole] || 'var(--forest)';

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph">
          <h1>My Profile</h1>
          <p>View your information and manage your account settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Left: Avatar + Identity Card ── */}
        <div>
          <div className="card-flat" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', background: avatarColor(user.name || ''),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,.14)'
            }}>
              {initials(user.name || '')}
            </div>

            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: 'var(--s1)', marginBottom: 4 }}>
              {user.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--s3)', marginBottom: 10 }}>{user.designation}</div>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 12,
              fontWeight: 700, background: roleColor + '18', color: roleColor, marginBottom: 18
            }}>
              {ROLE_LABELS[user.sysRole] || cap(user.sysRole)}
            </span>

            <div style={{ borderTop: '1.5px solid var(--cream3)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Department', value: user.department },
                { label: 'Email', value: user.email },
                { label: 'Phone', value: user.phone || '—' },
                { label: 'Reports To', value: user.reportsTo?.name || '—' },
                { label: 'Joined', value: joinDate },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--s4)', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: 'var(--s1)', fontWeight: 600, textAlign: 'right', maxWidth: 160, wordBreak: 'break-all' }}>{value}</span>
                </div>
              ))}
            </div>

            {user.sysRole === 'employee' && (
              <div style={{ borderTop: '1.5px solid var(--cream3)', paddingTop: 16, marginTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Leave Balances</div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {[
                    { label: 'CL', value: user.leaveBalance?.cl ?? 0, color: 'var(--ocean)' },
                    { label: 'SL', value: user.leaveBalance?.sl ?? 0, color: 'var(--forest)' },
                    { label: 'EL', value: user.leaveBalance?.el ?? 0, color: 'var(--gold)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--s4)', fontWeight: 700 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Edit Profile + Change Password ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Edit Profile Card */}
          <div className="card-flat" style={{ padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: 'var(--s1)' }}>Edit Profile</div>
                <div style={{ fontSize: 12, color: 'var(--s4)', marginTop: 2 }}>Update your name and contact number</div>
              </div>
              {!editMode && (
                <button className="btn btn-ghost" onClick={() => { setEditMode(true); setProfileForm({ name: user.name || '', phone: user.phone || '' }); }}>
                  ✏️ Edit
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                {editMode
                  ? <input className="form-control" value={profileForm.name} onChange={e => uf('name', e.target.value)} placeholder="Your full name" />
                  : <div className="form-control" style={{ background: 'var(--cream)', cursor: 'default', color: 'var(--s2)' }}>{user.name || '—'}</div>
                }
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                {editMode
                  ? <input className="form-control" value={profileForm.phone} onChange={e => uf('phone', e.target.value)} placeholder="e.g. +91 98765 43210" />
                  : <div className="form-control" style={{ background: 'var(--cream)', cursor: 'default', color: 'var(--s2)' }}>{user.phone || '—'}</div>
                }
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-control" style={{ background: 'var(--cream)', cursor: 'not-allowed', color: 'var(--s3)' }}>{user.email}</div>
                <span className="form-hint">Email cannot be changed. Contact admin if needed.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <div className="form-control" style={{ background: 'var(--cream)', cursor: 'not-allowed', color: 'var(--s3)' }}>{user.designation}</div>
                <span className="form-hint">Designation is managed by admin.</span>
              </div>
            </div>

            {editMode && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
                <button className="btn btn-gold" disabled={savingProfile} onClick={handleProfileSave}>
                  {savingProfile ? '⏳ Saving…' : '✓ Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="card-flat" style={{ padding: 26 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: 'var(--s1)' }}>Change Password</div>
              <div style={{ fontSize: 12, color: 'var(--s4)', marginTop: 2 }}>Ensure your account stays secure</div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPw.curr ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={e => upw('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                  style={{ paddingRight: 40 }}
                />
                <button onClick={() => setShowPw(p => ({ ...p, curr: !p.curr }))}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--s4)' }}>
                  {showPw.curr ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type={showPw.new ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => upw('newPassword', e.target.value)}
                    placeholder="Min. 6 characters"
                    style={{ paddingRight: 40 }}
                  />
                  <button onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--s4)' }}>
                    {showPw.new ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type={showPw.conf ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={e => upw('confirmPassword', e.target.value)}
                    placeholder="Re-enter new password"
                    style={{ paddingRight: 40 }}
                  />
                  <button onClick={() => setShowPw(p => ({ ...p, conf: !p.conf }))}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--s4)' }}>
                    {showPw.conf ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            {pwForm.newPassword && pwForm.confirmPassword && (
              <div style={{ fontSize: 12, marginBottom: 10, color: pwForm.newPassword === pwForm.confirmPassword ? 'var(--forest)' : 'var(--brick)', fontWeight: 600 }}>
                {pwForm.newPassword === pwForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-gold" disabled={savingPw} onClick={handlePasswordChange}>
                {savingPw ? '⏳ Updating…' : '🔒 Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
