'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsAPI, feedbackAPI } from '../../lib/api';
import {
  QrCode, TrendingUp, ThumbsUp, ThumbsDown,
  MessageSquareText, AlertCircle, ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, feedbackRes] = await Promise.all([
          analyticsAPI.getOverview(),
          feedbackAPI.getAll({ limit: 5 }),
        ]);
        setOverview(overviewRes?.data || null);
        setRecentFeedbacks(feedbackRes?.data?.feedbacks || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setRecentFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <QrCode size={22} />
          </div>
          <div>
            <div className="stat-value">{overview?.totalScans || 0}</div>
            <div className="stat-label">Total Scans</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <ThumbsUp size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--emerald-600)' }}>
              {overview?.totalPositive || 0}
            </div>
            <div className="stat-label">Positive Ratings (4-5★)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-danger">
            <ThumbsDown size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--rose-500)' }}>
              {overview?.totalNegative || 0}
            </div>
            <div className="stat-label">Negative Ratings (1-3★)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">
            <AlertCircle size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--amber-600)' }}>
              {overview?.unresolvedFeedbacks || 0}
            </div>
            <div className="stat-label">Unresolved Feedbacks</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Businesses */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Businesses</h3>
            <Link href="/admin/businesses" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {overview?.businesses?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {overview.businesses.map((biz) => (
                <Link
                  key={biz._id}
                  href={`/admin/businesses/${biz._id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', textDecoration: 'none',
                    color: 'var(--text-primary)', transition: 'all var(--transition-fast)',
                  }}
                  className="hoverable-row"
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.85rem',
                  }}>
                    {biz.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{biz.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/{biz.slug}</div>
                  </div>
                  <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <p className="empty-state-title">No businesses yet</p>
              <p className="empty-state-desc">Add your first business to get started</p>
              <Link href="/admin/businesses/new" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                Add Business
              </Link>
            </div>
          )}
        </div>

        {/* Recent Feedbacks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Feedbacks</h3>
            <Link href="/admin/feedbacks" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentFeedbacks.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentFeedbacks.map((fb) => (
                <div
                  key={fb._id}
                  style={{
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fb.name}</span>
                    <span className={`badge ${fb.isResolved ? 'badge-success' : 'badge-danger'}`}>
                      {fb.isResolved ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {fb.message.length > 80 ? fb.message.substring(0, 80) + '...' : fb.message}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                    {'⭐'.repeat(fb.rating)} · {fb.businessId?.name || 'Unknown'} · {new Date(fb.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <p className="empty-state-title">No feedbacks yet</p>
              <p className="empty-state-desc">Customer feedbacks will appear here</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
