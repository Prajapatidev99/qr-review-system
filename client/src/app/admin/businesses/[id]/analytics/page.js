'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { analyticsAPI, businessAPI } from '../../../../../lib/api';
import { ArrowLeft, QrCode, TrendingUp, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#10b981'];
const ACTION_COLORS = {
  scanned: '#818cf8',
  rated: '#6366f1',
  copied_review: '#10b981',
  clicked_google: '#3b82f6',
  submitted_feedback: '#f59e0b',
};

export default function BusinessAnalyticsPage() {
  const params = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [params.id, days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, timelineRes, bizRes] = await Promise.all([
        analyticsAPI.getSummary(params.id, { days }),
        analyticsAPI.getTimeline(params.id, { days }),
        businessAPI.getAll({ limit: 200 }),
      ]);
      setAnalytics(summaryRes.data);
      setTimeline(timelineRes.data.timeline);
      const biz = bizRes.data.businesses.find((b) => b._id === params.id);
      setBusiness(biz);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No analytics data</h3>
          <p className="empty-state-desc">Analytics will appear once customers start scanning</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const ratingData = [1, 2, 3, 4, 5].map((r) => ({
    name: `${r}★`,
    count: analytics.ratingDistribution.find((d) => d.rating === r)?.count || 0,
    fill: COLORS[r - 1],
  }));

  const actionData = analytics.actionBreakdown.map((a) => ({
    name: a.action.replace(/_/g, ' '),
    value: a.count,
    fill: ACTION_COLORS[a.action] || '#9ca3af',
  }));

  const positiveRate = analytics.totalScans > 0
    ? ((analytics.positiveCount / (analytics.positiveCount + analytics.negativeCount || 1)) * 100).toFixed(0)
    : 0;

  return (
    <div>
      <Link href={`/admin/businesses/${params.id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to {business?.name || 'Business'}
      </Link>

      {/* Period Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          {business?.name} — Analytics
        </h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><QrCode size={22} /></div>
          <div>
            <div className="stat-value">{analytics.totalScans}</div>
            <div className="stat-label">Total Scans</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-amber"><Star size={22} /></div>
          <div>
            <div className="stat-value">★ {analytics.avgRating}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><ThumbsUp size={22} /></div>
          <div>
            <div className="stat-value" style={{ color: 'var(--emerald-600)' }}>{positiveRate}%</div>
            <div className="stat-label">Positive Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger"><ThumbsDown size={22} /></div>
          <div>
            <div className="stat-value">{analytics.unresolvedFeedbacks}</div>
            <div className="stat-label">Unresolved</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 8 }}>
        {/* Timeline Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Scan Timeline</h3>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={2} name="Scans" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Positive" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="negative" stroke="#f43f5e" strokeWidth={2} name="Negative" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <p className="empty-state-desc">No timeline data yet</p>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ratingData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {ratingData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Breakdown */}
      {actionData.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Action Breakdown</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {actionData.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.fill }}></div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{a.name}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>({a.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
