'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../../../lib/api';
import { ShieldCheck, KeyRound } from 'lucide-react';

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
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Update your account password</p>
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
              marginTop: 16,
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
    </div>
  );
}
