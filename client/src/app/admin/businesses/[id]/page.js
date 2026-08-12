'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { businessAPI, analyticsAPI } from '../../../../lib/api';
import { CATEGORIES, LANGUAGES } from '../../../../lib/constants';
import { ArrowLeft, Save, BarChart3, QrCode, ExternalLink } from 'lucide-react';

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all businesses and find by ID
        const res = await businessAPI.getAll({ limit: 200 });
        const biz = res.data.businesses.find((b) => b._id === params.id);
        if (!biz) {
          toast.error('Business not found');
          router.push('/admin/businesses');
          return;
        }
        setForm(biz);

        // Fetch analytics
        try {
          const analyticsRes = await analyticsAPI.getSummary(params.id);
          setAnalytics(analyticsRes.data);
        } catch { /* analytics may fail if no data */ }
      } catch {
        toast.error('Failed to load business');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateOffer = (field, value) => {
    setForm((prev) => ({
      ...prev,
      offer: { ...prev.offer, [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await businessAPI.update(params.id, form);
      toast.success('Business updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <Link href="/admin/businesses" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Businesses
      </Link>

      {/* Quick Stats */}
      {analytics && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary"><QrCode size={20} /></div>
            <div>
              <div className="stat-value">{analytics.totalScans}</div>
              <div className="stat-label">Total Scans</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success"><BarChart3 size={20} /></div>
            <div>
              <div className="stat-value" style={{ color: 'var(--emerald-600)' }}>★ {analytics.avgRating}</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <div className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--emerald-600)' }}>{analytics.positiveCount}</div>
                <div className="stat-label">Positive</div>
              </div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--rose-500)' }}>{analytics.negativeCount}</div>
                <div className="stat-label">Negative</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <a href={`/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
          <ExternalLink size={14} /> Preview Page
        </a>
        <Link href={`/admin/businesses/${params.id}/analytics`} className="btn btn-outline btn-sm">
          <BarChart3 size={14} /> View Analytics
        </Link>
      </div>

      {/* Edit Form */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>Edit Business</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input type="text" className="form-input" value={form.name} onChange={(e) => updateForm('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input form-select" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Review Link *</label>
            <input type="url" className="form-input" value={form.googleReviewLink} onChange={(e) => updateForm('googleReviewLink', e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input type="tel" className="form-input" value={form.whatsappNumber} onChange={(e) => updateForm('whatsappNumber', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Link</label>
            <input type="url" className="form-input" value={form.googleMapsLink || ''} onChange={(e) => updateForm('googleMapsLink', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" className="form-input" value={form.address || ''} onChange={(e) => updateForm('address', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Default Language</label>
              <select className="form-input form-select" value={form.defaultLanguage} onChange={(e) => updateForm('defaultLanguage', e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input form-select" value={form.isActive ? 'active' : 'inactive'} onChange={(e) => updateForm('isActive', e.target.value === 'active')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Offer */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '24px 0 16px', color: 'var(--text-secondary)' }}>Offer Popup</h3>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.offer?.enabled || false} onChange={(e) => updateOffer('enabled', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary-600)' }} />
              <span className="form-label" style={{ margin: 0 }}>Enable offer popup</span>
            </label>
          </div>
          {form.offer?.enabled && (
            <>
              <div className="form-group">
                <label className="form-label">Offer Title</label>
                <input type="text" className="form-input" value={form.offer.title || ''} onChange={(e) => updateOffer('title', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Offer Description</label>
                <textarea className="form-input form-textarea" value={form.offer.description || ''} onChange={(e) => updateOffer('description', e.target.value)} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></span> : <><Save size={18} /> Save Changes</>}
            </button>
            <Link href="/admin/businesses" className="btn btn-outline btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
