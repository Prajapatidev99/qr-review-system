'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { feedbackAPI, businessAPI } from '../../../lib/api';
import { CheckCircle, Phone, MessageSquare, Clock, Filter } from 'lucide-react';

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ businessId: '', isResolved: '' });
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveNote, setResolveNote] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.businessId) params.businessId = filter.businessId;
      if (filter.isResolved !== '') params.isResolved = filter.isResolved;

      const [fbRes, bizRes] = await Promise.all([
        feedbackAPI.getAll(params),
        businessAPI.getAll({ limit: 100 }),
      ]);
      setFeedbacks(fbRes.data.feedbacks);
      setBusinesses(bizRes.data.businesses);
    } catch {
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveModal) return;
    try {
      await feedbackAPI.resolve(resolveModal._id, { resolvedNote: resolveNote });
      setFeedbacks((prev) =>
        prev.map((f) =>
          f._id === resolveModal._id ? { ...f, isResolved: true, resolvedNote: resolveNote } : f
        )
      );
      toast.success('Feedback marked as resolved');
      setResolveModal(null);
      setResolveNote('');
    } catch {
      toast.error('Failed to resolve feedback');
    }
  };

  const handleExportCSV = () => {
    if (!feedbacks.length) {
      toast.error('No feedbacks to export');
      return;
    }
    const headers = ['Name', 'Phone', 'Rating', 'Business', 'Message', 'Status', 'Resolution Note', 'Date'];
    const rows = feedbacks.map((f) => [
      `"${(f.name || '').replace(/"/g, '""')}"`,
      `"${(f.phone || '').replace(/"/g, '""')}"`,
      f.rating,
      `"${(f.businessId?.name || '').replace(/"/g, '""')}"`,
      `"${(f.message || '').replace(/"/g, '""')}"`,
      f.isResolved ? 'Resolved' : 'Pending',
      `"${(f.resolvedNote || '').replace(/"/g, '""')}"`,
      `"${new Date(f.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `feedbacks_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report downloaded!');
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={18} style={{ color: 'var(--text-tertiary)' }} />
        <select
          className="form-input form-select"
          style={{ width: 200 }}
          value={filter.businessId}
          onChange={(e) => setFilter({ ...filter, businessId: e.target.value })}
        >
          <option value="">All Businesses</option>
          {businesses.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
        <select
          className="form-input form-select"
          style={{ width: 160 }}
          value={filter.isResolved}
          onChange={(e) => setFilter({ ...filter, isResolved: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="false">Pending</option>
          <option value="true">Resolved</option>
        </select>

        <button
          className="btn btn-outline btn-sm"
          onClick={handleExportCSV}
          style={{ marginLeft: 'auto' }}
        >
          📥 Export CSV
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner"></div>
        </div>
      ) : feedbacks.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {feedbacks.map((fb) => (
            <div key={fb._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{fb.name}</span>
                    <span className={`badge ${fb.isResolved ? 'badge-success' : 'badge-danger'}`}>
                      {fb.isResolved ? '✓ Resolved' : '⏳ Pending'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    <span>{'⭐'.repeat(fb.rating)}</span>
                    <span>{fb.businessId?.name || 'Unknown'}</span>
                    <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {new Date(fb.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {!fb.isResolved && (
                  <button className="btn btn-success btn-sm" onClick={() => setResolveModal(fb)}>
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                {fb.message}
              </p>

              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:${fb.phone}`} className="btn btn-ghost btn-sm">
                  <Phone size={14} /> {fb.phone}
                </a>
                <a href={`https://wa.me/${fb.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ color: '#25D366' }}>
                  <MessageSquare size={14} /> WhatsApp
                </a>
              </div>

              {fb.isResolved && fb.resolvedNote && (
                <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--emerald-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--emerald-600)' }}>
                  <strong>Resolution note:</strong> {fb.resolvedNote}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h3 className="empty-state-title">No feedbacks found</h3>
            <p className="empty-state-desc">Customer feedbacks will appear here when they submit the form</p>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="modal-overlay" onClick={() => setResolveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Resolve Feedback</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setResolveModal(null)}>✕</button>
            </div>
            <p style={{ marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              From: <strong>{resolveModal.name}</strong> ({resolveModal.phone})
            </p>
            <p style={{ marginBottom: 16, fontSize: '0.9rem', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              {resolveModal.message}
            </p>
            <div className="form-group">
              <label className="form-label">Resolution Note (optional)</label>
              <textarea
                className="form-input form-textarea"
                placeholder="What was done to resolve this issue..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success btn-full" onClick={handleResolve}>
                <CheckCircle size={16} /> Mark as Resolved
              </button>
              <button className="btn btn-outline" onClick={() => setResolveModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
