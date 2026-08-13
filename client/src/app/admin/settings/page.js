'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../../../lib/api';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }}>
      <div className="card" style={{ background: '#121212', border: '1px solid #222', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #222', paddingBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <KeyRound size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>Account Security & Password</h2>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Update your administrator account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#aaa', fontSize: '0.85rem' }}>Current Password</label>
            <input
              type="password"
              className="form-input"
              style={{ background: '#000', border: '1px solid #333', color: '#fff' }}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#aaa', fontSize: '0.85rem' }}>New Password</label>
            <input
              type="password"
              className="form-input"
              style={{ background: '#000', border: '1px solid #333', color: '#fff' }}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#aaa', fontSize: '0.85rem' }}>Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              style={{ background: '#000', border: '1px solid #333', color: '#fff' }}
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <ShieldCheck size={16} />
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* ─── Subscription & Plan Upgrade Section ─── */}
      <div className="card" style={{ background: '#121212', border: '1px solid #222', padding: 32, marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #222', paddingBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <Lock size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>Subscription & Billing Plans</h2>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Choose or upgrade your plan to unlock more business slots and AI features</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { id: 'starter', name: 'Starter', price: '₹299', period: '/month', popular: true, bz: '3 Businesses', scans: 'Unlimited scans', feat: ['AI Review Suggestions', 'WhatsApp & Call', 'Analytics Dashboard', 'Private Feedback'] },
            { id: 'growth', name: 'Growth', price: '₹1,499', period: '/month', bz: '10 Businesses', scans: 'Unlimited scans', feat: ['Everything in Starter', 'Custom Offer Popups', 'Multi-Language', 'Export Reports'] },
            { id: 'enterprise', name: 'Enterprise', price: '₹4,999', period: '/month', bz: 'Unlimited Businesses', scans: 'Unlimited scans', feat: ['White-label Branding', 'Agency Admin', 'Account Manager', 'Priority Support'] }
          ].map((p) => (
            <div
              key={p.id}
              style={{
                background: p.popular ? '#1c1917' : '#000000',
                border: p.popular ? '1px solid #f59e0b' : '1px solid #222',
                borderRadius: 14,
                padding: 20,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {p.popular && (
                <span style={{
                  position: 'absolute', top: -10, right: 16,
                  background: '#f59e0b', color: '#000',
                  fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                  textTransform: 'uppercase'
                }}>
                  Recommended
                </span>
              )}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>{p.name}</h3>
              <div style={{ margin: '8px 0 14px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{p.price}</span>
                <span style={{ color: '#888', fontSize: '0.8rem' }}> {p.period}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginBottom: 12 }}>
                ✓ {p.bz} · {p.scans}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', fontSize: '0.78rem', color: '#aaa', flex: 1 }}>
                {p.feat.map((f, fi) => (
                  <li key={fi} style={{ marginBottom: 4 }}>• {f}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Redirecting to upgrade to ${p.name} Plan (${p.price}/mo)...`);
                  window.open(`https://api.whatsapp.com/send?phone=919974000000&text=Hi,%20I%20want%20to%20buy%20the%20${p.name}%20Plan%20(${p.price}/mo)%20for%20my%20QR%20Review%20account`, '_blank');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: p.popular ? '#f59e0b' : '#222',
                  color: p.popular ? '#000' : '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Buy / Upgrade Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
