import { useState, useEffect } from 'react';
import { policyAPI, carryAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Modal, PolicyCard, Loading } from '../../components/shared/index';

export default function LeavePolicy() {
  const toast = useToast();
  const [policy,  setPolicy]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen]       = useState(false);
  const [form, setForm]               = useState({});
  const [saving, setSaving]           = useState(false);
  const [cfProcessing, setCfProcessing] = useState(false);
  const [cfForm, setCfForm] = useState({ year: new Date().getFullYear() - 1, maxCarryForward: 5 });

  const fetch = () => {
    policyAPI.get().then(r => { setPolicy(r.data.data); setForm(r.data.data || {}); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const openEdit = () => { setForm({ ...policy }); setEditOpen(true); };
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const savePolicy = async () => {
    setSaving(true);
    try { await policyAPI.update(form); toast.success('Policy updated & all employees notified!'); setEditOpen(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const resetBalances = async () => {
    if (!confirm(`Reset ALL employee EL balances to ${policy?.elDays || 24} days?`)) return;
    try { const r = await policyAPI.resetBalances(); toast.success(r.data.message || 'Balances reset!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const processCarryFwd = async () => {
    if (!confirm(`Process carry-forward for year ${cfForm.year} with max ${cfForm.maxCarryForward} days? This will update all employee balances.`)) return;
    setCfProcessing(true);
    try {
      const r = await carryAPI.process(cfForm);
      const processed = (r.data.data || []).filter(x => !x.skipped).length;
      toast.success(`Processed ${processed} employees! All notified of their carry-forward amount.`);
    } catch (err) { toast.error(err.response?.data?.message || 'Processing failed'); }
    finally { setCfProcessing(false); }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-anim">
      <div className="ph mb20"><h1>Leave Policy Management</h1><p>Configure yearly quotas, carry-forward rules and system settings</p></div>

      <div className="admin-banner" style={{ background:'linear-gradient(135deg,var(--ocean2),var(--ocean))', marginBottom:20 }}>
        <div className="admin-banner-icon">📋</div>
        <div>
          <div className="admin-banner-title">Leave Policy Configuration</div>
          <div className="admin-banner-sub">Changes apply to all employees · Effective current leave year · All changes are audit-logged</div>
        </div>
      </div>

      <div className="g2 mb20">
        <div className="card">
          <div className="stitle">🏖️ Leave Quotas (per employee/year)</div>
          <PolicyCard label="Earned Leave (EL)" desc="Accrued with service time, carry-forward eligible" badge={`${policy?.elDays || 24} days/year`} badgeClass="b-approved" />
          <PolicyCard label="Sick Leave (SL)"   desc={`Medical certificate required for ${policy?.slCertRequiredDays || 3}+ consecutive days`} badge={`${policy?.slDays || 12} days/year`} badgeClass="b-role" />
          <PolicyCard label="Casual Leave (CL)" desc="Short personal emergencies, no carry-forward" badge={`${policy?.clDays || 6} days/year`} badgeClass="b-pending" />
          <button className="btn btn-ocean btn-sm mt12" onClick={openEdit}>✏️ Edit Policy</button>
        </div>

        <div className="card">
          <div className="stitle">📅 Carry Forward Rules</div>
          <PolicyCard label="Max Carry Forward"  desc="Max unused EL carried to next year"    badge={`${policy?.maxCarryForward || 5} days`} />
          <PolicyCard label="Min Advance Notice" desc="Required for planned leaves"            badge={`${policy?.advanceNoticeDays || 3} days`} />
          <PolicyCard label="SL Certificate"     desc="Certificate required from day"          badge={`Day ${policy?.slCertRequiredDays || 3}+`} />
          <PolicyCard label="Conflict Threshold" desc="Same-designation employees on leave"    badge={`${policy?.conflictThreshold || 3}+ triggers alert`} badgeClass="b-conflict" />
          <PolicyCard label="Leave Year"         desc="Annual cycle boundary"                  badge={policy?.leaveYear || 'Jan–Dec'} />
          <div style={{ marginTop:16, background:'linear-gradient(135deg,var(--forest),var(--forest2))', borderRadius:12, padding:16, color:'#fff' }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>📌 Carry Forward Example</div>
            <div style={{ fontSize:12, opacity:.85, lineHeight:1.8 }}>
              Year-end unused EL: 12 days<br />
              Max carry-forward: {policy?.maxCarryForward || 5} days<br />
              Lapsed: {12 - (policy?.maxCarryForward || 5)} days<br />
              <b>New EL balance: {(policy?.elDays || 24) + (policy?.maxCarryForward || 5)} days</b>
            </div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="stitle">⚙️ System Configuration</div>
          <PolicyCard label="Timezone"            desc="All timestamps & calendar display"  badge={policy?.timezone || 'Asia/Kolkata'} badgeClass="b-admin" />
          <PolicyCard label="Conflict Detection"  desc="Auto-flag on leave apply"           badge="✅ Enabled"  badgeClass="b-approved" />
          <PolicyCard label="Notification System" desc="Role-targeted push alerts"          badge="✅ Active"   badgeClass="b-approved" />
          <PolicyCard label="Carry Forward"       desc="Year-end auto-processing"           badge={policy?.carryForwardEnabled ? '✅ Enabled' : '❌ Disabled'} badgeClass={policy?.carryForwardEnabled ? 'b-approved' : 'b-rejected'} />
        </div>

        <div className="card">
          <div className="stitle">🔄 Bulk Actions</div>
          <PolicyCard
            label="Reset Annual Balances"
            desc={`Reset all EL to ${policy?.elDays || 24} days for new leave year`}
            action={<button className="btn btn-ocean btn-sm" onClick={resetBalances}>Reset All</button>}
          />
          <div style={{ marginTop:20 }}>
            <div className="stitle" style={{ marginBottom:12, fontSize:13 }}>🗓️ Process Year-End Carry Forward</div>
            <div style={{ background:'var(--ol)', border:'1.5px solid #BFDBFE', borderRadius:9, padding:'11px 13px', marginBottom:14, fontSize:12.5, color:'var(--ocean2)' }}>
              ℹ️ This will calculate unused EL for all employees, carry forward up to the max limit, lapse excess, and send individual notifications.
            </div>
            <div className="form-row mb16">
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Process Year</label>
                <input className="form-control" type="number" value={cfForm.year} min={2020} max={new Date().getFullYear()} onChange={e=>setCfForm(p=>({...p,year:parseInt(e.target.value)||p.year}))} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Max CF Days</label>
                <input className="form-control" type="number" value={cfForm.maxCarryForward} min={0} max={15} onChange={e=>setCfForm(p=>({...p,maxCarryForward:parseInt(e.target.value)||0}))} />
              </div>
            </div>
            <button className="btn btn-gold" disabled={cfProcessing} onClick={processCarryFwd}>
              {cfProcessing ? '⏳ Processing…' : `🔄 Process ${cfForm.year} Carry Forward`}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Policy Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Leave Policy">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Annual EL Quota</label><input className="form-control" type="number" min={1} max={60} value={form.elDays||24} onChange={e=>f('elDays',+e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Annual SL Quota</label><input className="form-control" type="number" min={1} max={30} value={form.slDays||12} onChange={e=>f('slDays',+e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Annual CL Quota</label><input className="form-control" type="number" min={1} max={20} value={form.clDays||6} onChange={e=>f('clDays',+e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Max Carry Forward (days)</label><input className="form-control" type="number" min={0} max={20} value={form.maxCarryForward||5} onChange={e=>f('maxCarryForward',+e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Advance Notice (days)</label><input className="form-control" type="number" min={0} max={30} value={form.advanceNoticeDays||3} onChange={e=>f('advanceNoticeDays',+e.target.value)} /></div>
          <div className="form-group"><label className="form-label">SL Cert Required (day+)</label><input className="form-control" type="number" min={1} max={7} value={form.slCertRequiredDays||3} onChange={e=>f('slCertRequiredDays',+e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Conflict Threshold</label><input className="form-control" type="number" min={2} max={10} value={form.conflictThreshold||3} onChange={e=>f('conflictThreshold',+e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Leave Year</label>
            <select className="form-control form-select" value={form.leaveYear||'Jan–Dec'} onChange={e=>f('leaveYear',e.target.value)}>
              <option>Jan–Dec</option><option>Apr–Mar</option><option>Jul–Jun</option>
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button>
          <button className="btn btn-gold" disabled={saving} onClick={savePolicy}>{saving ? '⏳ Saving…' : 'Save & Notify All'}</button>
        </div>
      </Modal>
    </div>
  );
}
