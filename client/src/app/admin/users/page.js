'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../../../lib/api';
import { Users, Search, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error(err.response?.data?.error || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePlanChange = async (userId, newPlan) => {
    setUpdatingId(userId);
    try {
      const res = await authAPI.updateUserPlan(userId, newPlan);
      toast.success(res.data.message || `Plan updated to ${newPlan.toUpperCase()}`);
      fetchUsers();
    } catch (err) {
      console.error('Update plan error:', err);
      toast.error(err.response?.data?.error || 'Failed to update user plan.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getPlanBadge = (plan) => {
    const p = (plan || 'free').toLowerCase();
    if (p === 'starter') return { bg: '#065f46', color: '#34d399', label: 'Starter (₹299/mo)' };
    if (p === 'special') return { bg: '#581c87', color: '#e879f9', label: 'Special 🔥 (₹999/yr)' };
    if (p === 'growth') return { bg: '#1e3a8a', color: '#60a5fa', label: 'Growth (₹1,499/mo)' };
    if (p === 'enterprise') return { bg: '#701a75', color: '#f472b6', label: 'Enterprise (₹4,999/mo)' };
    return { bg: '#27272a', color: '#a1a1aa', label: 'Free Tier (1 Slot)' };
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Header Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ background: '#121212', border: '1px solid #222', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>Total Registered Accounts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{users.length}</div>
          </div>
        </div>

        <div className="card" style={{ background: '#121212', border: '1px solid #222', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>Paid Subscribers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {users.filter(u => u.subscription?.plan && u.subscription.plan !== 'free').length}
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#121212', border: '1px solid #222', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>Free Tier Accounts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {users.filter(u => !u.subscription?.plan || u.subscription.plan === 'free').length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ background: '#121212', border: '1px solid #222', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>User Signups & Account Plans</h2>
            <p style={{ fontSize: '0.82rem', color: '#888', margin: '2px 0 0' }}>Manage all registered platform accounts and update their subscription tiers</p>
          </div>

          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.2rem', borderRadius: 8,
                border: '1px solid #333', background: '#000', color: '#fff', fontSize: '0.85rem', outline: 'none'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}>Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}>No accounts found matching search.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222', color: '#888', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>User Details</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Joined Date</th>
                  <th style={{ padding: '12px 16px' }}>Active Plan</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions / Change Plan</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const badge = getPlanBadge(u.subscription?.plan);
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{u.name || 'Unnamed User'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                          background: u.role === 'super_admin' ? '#451a03' : '#18181b',
                          color: u.role === 'super_admin' ? '#fbbf24' : '#a1a1aa',
                          border: u.role === 'super_admin' ? '1px solid #b45309' : '1px solid #27272a'
                        }}>
                          {u.role === 'super_admin' ? 'Super Admin' : 'Business Owner'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#aaa', fontSize: '0.82rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700,
                          background: badge.bg, color: badge.color
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <select
                          disabled={updatingId === u._id}
                          value={u.subscription?.plan || 'free'}
                          onChange={(e) => handlePlanChange(u._id, e.target.value)}
                          style={{
                            padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #333',
                            background: '#000', color: '#fff', fontSize: '0.82rem', cursor: 'pointer', outline: 'none'
                          }}
                        >
                          <option value="free">Free Tier (1 Slot)</option>
                          <option value="starter">Starter (₹299/mo · 3 Slots)</option>
                          <option value="special">Special Offer 🔥 (₹999/yr · 5 Slots)</option>
                          <option value="growth">Growth (₹1,499/mo · 10 Slots)</option>
                          <option value="enterprise">Enterprise (₹4,999/mo · Unlimited)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
