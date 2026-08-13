'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function BillingPage() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '12px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, borderBottom: '1px solid #222', paddingBottom: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
          <CreditCard size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>Billing & Subscription Plans</h1>
          <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Manage your plan, upgrade business slots, and unlock premium AI features</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {[
          { id: 'starter', name: 'Starter', price: '₹299', period: '/month', popular: true, bz: '3 Businesses', scans: 'Unlimited scans', feat: ['3 Business Locations', 'AI Review Suggestions', 'WhatsApp & Call Support', 'Analytics Dashboard', 'Private Feedback'] },
          { id: 'special', name: 'Special Offer 🔥', price: '₹999', period: '/year', special: true, bz: '5 Businesses', scans: 'Unlimited scans', feat: ['5 Business Locations Included', 'Gemini Real-Time AI Generator', 'WhatsApp & Call Support', 'Custom Offer Popups', 'Priority Lifetime Updates'] },
          { id: 'growth', name: 'Growth', price: '₹1,499', period: '/month', bz: '10 Businesses', scans: 'Unlimited scans', feat: ['10 Business Locations', 'Everything in Starter', 'Custom Offer Popups', 'Multi-Language Support', 'Export Scan Reports'] },
          { id: 'enterprise', name: 'Enterprise', price: '₹4,999', period: '/month', bz: 'Unlimited', scans: 'Unlimited scans', feat: ['Unlimited Businesses', 'White-label Branding', 'Dedicated Account Manager', 'Priority 24/7 Support'] }
        ].map((p) => (
          <div
            key={p.id}
            style={{
              background: p.special ? '#1a037e' : p.popular ? '#1c1917' : '#0a0a0a',
              border: p.special ? '1px solid #8b5cf6' : p.popular ? '1px solid #f59e0b' : '1px solid #222',
              borderRadius: 16,
              padding: 24,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: p.special ? '0 8px 30px rgba(139, 92, 246, 0.25)' : 'none'
            }}
          >
            {p.special && (
              <span style={{
                position: 'absolute', top: -11, right: 16,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff',
                fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 9999,
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                Best Value 🔥
              </span>
            )}
            {p.popular && !p.special && (
              <span style={{
                position: 'absolute', top: -11, right: 16,
                background: '#f59e0b', color: '#000',
                fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 9999,
                textTransform: 'uppercase'
              }}>
                Most Popular
              </span>
            )}

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>{p.name}</h3>
            <div style={{ margin: '8px 0 16px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{p.price}</span>
              <span style={{ color: '#888', fontSize: '0.85rem' }}> {p.period}</span>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, marginBottom: 14 }}>
              ✓ {p.bz} · {p.scans}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '0.8rem', color: '#b0b0b0', flex: 1 }}>
              {p.feat.map((f, fi) => (
                <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <CheckCircle2 size={13} color={p.special ? '#a855f7' : p.popular ? '#f59e0b' : '#10b981'} flexShrink={0} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                toast.success(`Opening WhatsApp payment for ${p.name} Plan (${p.price}${p.period})...`);
                window.open(`https://api.whatsapp.com/send?phone=919974000000&text=Hi,%20I%20want%20to%20buy/upgrade%20to%20the%20${encodeURIComponent(p.name)}%20Plan%20(${encodeURIComponent(p.price + p.period)})%20for%20my%20QR%20Review%20account.`, '_blank');
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: p.special ? 'linear-gradient(135deg, #a855f7, #ec4899)' : p.popular ? '#f59e0b' : '#222',
                color: p.special ? '#fff' : p.popular ? '#000' : '#fff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Buy / Upgrade Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
