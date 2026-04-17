// ══════════════════════════════ AdmLeaveApprovals ══════════════════════════════
// Admin can approve/reject ALL leave requests — including manager leaves
import { useState, useEffect } from 'react';
import { leaveAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Modal, Loading } from '../../components/shared/index';
import { fmtDate, cap, statusBadge, avatarColor, initials } from '../../utils/helpers';

const DEPTS = ['Engineering','Design','Marketing','HR','Sales','Finance','Operations'];
const ROLE_BADGE = { employee:'b-emp', manager:'b-mgr', admin:'b-admin' };

export default function AdmLeaveApprovals() {
  const toast = useToast();
  const [leaves,    setLeaves]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filters,   setFilters]   = useState({ search:'', status:'pending', dept:'', role:'' });
  const [rejectModal, setRejectModal] = useState({ open:false, id:null });
  const [rejectNote,  setRejectNote]  = useState('');
  const [actioning,   setActioning]   = useState(null);

  const fetchLeaves = () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    leaveAPI.getAll(params)
      .then(r => setLeaves(r.data.data || []))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  };
  useEffect(fetchLeaves, [filters.status]);

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await leaveAPI.updateStatus(id, { status:'approved', managerNote:'Approved by Admin ✅' });
      toast.success('Leave approved!');
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setActioning(null); }
  };

  const openReject = (id) => { setRejectModal({ open:true, id }); setRejectNote(''); };
  const confirmReject = async () => {
    if (!rejectNote.trim()) { toast.error('Rejection reason is required'); return; }
    try {
      await leaveAPI.updateStatus(rejectModal.id, { status:'rejected', managerNote: rejectNote });
      toast.success('Leave rejected');
      setRejectModal({ open:false, id:null });
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const filtered = leaves.filter(l => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q || (l.employee?.name||'').toLowerCase().includes(q) || (l.employee?.designation||'').toLowerCase().includes(q);
    const matchDept   = !filters.dept || l.employee?.department === filters.dept;
    const matchRole   = !filters.role || l.employee?.sysRole === filters.role;
    return matchSearch && matchDept && matchRole;
  });

  const pending   = leaves.filter(l => l.status==='pending').length;
  const managers  = leaves.filter(l => l.employee?.sysRole==='manager').length;

  return (
    <div className="page-anim">
      <div className="ph-row">
        <div className="ph">
          <h1>Leave Approvals</h1>
          <p>Approve or reject manager leave requests</p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="g4 mb20">
        {[
          ['Pending', pending, '⏳', 'var(--brick)'],
          ['Total Shown', filtered.length, '📋', 'var(--ocean)'],
          ['Manager Leaves', managers, '👨‍💼', 'var(--gold)'],
          ['Approved (filtered)', leaves.filter(l=>l.status==='approved').length, '✅', 'var(--forest)'],
        ].map(([label,val,icon,accent])=>(
          <div key={label} className="card" style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:26 }}>{icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:accent }}>{val}</div>
              <div style={{ fontSize:12, color:'var(--s4)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-flat">
        {/* Filters */}
        <div style={{ padding:'14px 16px', background:'var(--cream)', borderBottom:'1.5px solid var(--cream3)', display:'flex', gap:10, flexWrap:'wrap' }}>
          <div className="srch-wrap">
            <span style={{ color:'var(--s4)' }}>🔍</span>
            <input placeholder="Search employee or designation…" value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value}))} style={{ width:200 }} />
          </div>
          <select className="form-control form-select" style={{ width:130 }} value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        
        </div>

        <div className="tbl-wrap">
          {loading ? <Loading /> : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Dept.</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign:'center', color:'var(--s4)', padding:32 }}>No leave requests found</td></tr>
                ) : filtered.map(l => (
                  <tr key={l._id}>
                    <td>
                      <div className="td-emp">
                        <div className="td-av" style={{ background:avatarColor(l.employee?.name||'') }}>{initials(l.employee?.name||'')}</div>
                        <div>
                          <div className="fw7 text-sm">{l.employee?.name}</div>
                          <div className="text-xs text-muted">{l.employee?.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${ROLE_BADGE[l.employee?.sysRole]||'b-dept'}`}>{cap(l.employee?.sysRole||'')}</span>
                    </td>
                    <td><span className="badge b-dept">{l.employee?.department}</span></td>
                    <td className="text-sm fw7">{l.leaveType}</td>
                    <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.fromDate)}</td>
                    <td style={{ fontSize:12, fontWeight:600 }}>{fmtDate(l.toDate)}</td>
                    <td style={{ fontWeight:800, textAlign:'center' }}>{l.numberOfDays}</td>
                    <td className="text-sm" style={{
  maxWidth: 180,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}}>
  {l.reason || '—'}
</td>
                    <td>
                      <span className={`badge ${statusBadge(l.status)}`}>{cap(l.status)}</span>
                      {l.conflictDetected && <span style={{ marginLeft:4, fontSize:10 }} title={l.conflictDetails}>⚡</span>}
                    </td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className="flex gap8">
                          <button className="btn-approve" disabled={actioning===l._id} onClick={()=>handleApprove(l._id)}>
                            {actioning===l._id ? '⏳' : '✓ Approve'}
                          </button>
                          <button className="btn-reject" onClick={()=>openReject(l._id)}>✕ Reject</button>
                        </div>
                      ) : (
                        <span style={{ fontSize:11.5, color:'var(--s4)' }}>{l.managerNote||'—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.open} onClose={()=>setRejectModal({open:false,id:null})} title="Reject Leave Request">
        <div className="form-group">
          <label className="form-label">Rejection Reason *</label>
          <textarea className="form-control" rows={4} placeholder="Please provide a reason for rejection…" value={rejectNote} onChange={e=>setRejectNote(e.target.value)} style={{ resize:'vertical' }} />
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={()=>setRejectModal({open:false,id:null})}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmReject}>Reject Leave</button>
        </div>
      </Modal>
    </div>
  );
}
