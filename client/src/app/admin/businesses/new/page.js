'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { businessAPI } from '../../../../lib/api';
import { CATEGORIES, LANGUAGES } from '../../../../lib/constants';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [planLimitError, setPlanLimitError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: 'restaurant',
    googleReviewLink: '',
    phone: '',
    whatsappNumber: '',
    googleMapsLink: '',
    address: '',
    logo: '',
    defaultLanguage: 'en',
    offer: { enabled: false, title: '', description: '' },
  });

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
    if (!form.name || !form.googleReviewLink) {
      toast.error('Business name and Google review link are required');
      return;
    }
    setLoading(true);
    setPlanLimitError(null);
    try {
      await businessAPI.create(form);
      toast.success('Business created successfully!');
      router.push('/admin/businesses');
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setPlanLimitError(err.response.data.error);
        toast.error('Plan limit reached!');
      } else {
        toast.error(err.response?.data?.error || 'Failed to create business');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <Link href="/admin/businesses" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Businesses
      </Link>

      {planLimitError && (
        <div style={{
          background: '#451a03', border: '1px solid #f59e0b', borderRadius: 12,
          padding: 20, marginBottom: 24, color: '#fef3c7'
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#fbbf24', fontWeight: 700 }}>
            ⚠️ Subscription Plan Limit Reached
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.88rem', lineHeight: 1.5, color: '#fde68a' }}>
            {planLimitError}
          </p>
          <Link
            href="/admin/settings"
            className="btn"
            style={{
              background: '#f59e0b', color: '#000', fontWeight: 700, fontSize: '0.85rem',
              padding: '8px 16px', borderRadius: 8, display: 'inline-block'
            }}
          >
            🚀 Upgrade Plan in Settings
          </Link>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>Add New Business</h2>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text" className="form-input" placeholder="e.g. Spice Garden Restaurant"
                value={form.name} onChange={(e) => updateForm('name', e.target.value)} required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input form-select" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.category === 'other' && (
            <div className="form-group" style={{ marginTop: -8 }}>
              <label className="form-label">Custom Business Type / Specialty</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pet Grooming, Bakery, Car Wash, Coaching Institute..."
                value={form.customCategory || ''}
                onChange={(e) => updateForm('customCategory', e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Google Review Link *</label>
            <input
              type="url" className="form-input" placeholder="https://search.google.com/local/writereview?..."
              value={form.googleReviewLink} onChange={(e) => updateForm('googleReviewLink', e.target.value)} required
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Paste your Google Business review link here
            </p>
          </div>

          {/* Contact Info */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '24px 0 16px', color: 'var(--text-secondary)' }}>
            Contact Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel" className="form-input" placeholder="+91 98765 43210"
                value={form.phone} onChange={(e) => updateForm('phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input
                type="tel" className="form-input" placeholder="+919876543210"
                value={form.whatsappNumber} onChange={(e) => updateForm('whatsappNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Link</label>
            <input
              type="url" className="form-input" placeholder="https://maps.google.com/..."
              value={form.googleMapsLink} onChange={(e) => updateForm('googleMapsLink', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text" className="form-input" placeholder="Full business address"
              value={form.address} onChange={(e) => updateForm('address', e.target.value)}
            />
          </div>

          {/* Settings */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '24px 0 16px', color: 'var(--text-secondary)' }}>
            Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Default Language</label>
              <select className="form-input form-select" value={form.defaultLanguage} onChange={(e) => updateForm('defaultLanguage', e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Logo URL (optional)</label>
              <input
                type="url" className="form-input" placeholder="https://..."
                value={form.logo} onChange={(e) => updateForm('logo', e.target.value)}
              />
            </div>
          </div>

          {/* Offer Popup */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '24px 0 16px', color: 'var(--text-secondary)' }}>
            Offer Popup (Optional)
          </h3>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.offer.enabled}
                onChange={(e) => updateOffer('enabled', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-600)' }}
              />
              <span className="form-label" style={{ margin: 0 }}>Enable offer popup</span>
            </label>
          </div>

          {form.offer.enabled && (
            <>
              <div className="form-group">
                <label className="form-label">Offer Title</label>
                <input
                  type="text" className="form-input" placeholder="🎉 Special 10% Discount!"
                  value={form.offer.title} onChange={(e) => updateOffer('title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Offer Description</label>
                <textarea
                  className="form-input form-textarea" placeholder="Show this page at the counter to get your discount..."
                  value={form.offer.description} onChange={(e) => updateOffer('description', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></span> : <><Save size={18} /> Create Business</>}
            </button>
            <Link href="/admin/businesses" className="btn btn-outline btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
