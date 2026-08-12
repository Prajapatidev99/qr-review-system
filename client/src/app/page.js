'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  QrCode, Star, Sparkles, ShieldCheck, Zap, Globe2, BarChart3,
  MessageCircle, Phone, ArrowRight, CheckCircle2, Building2, Store, Utensils, Scissors, Stethoscope, Smartphone
} from 'lucide-react';

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState('restaurant');

  return (
    <div style={{ background: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* ── Top Navigation Bar ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', maxWidth: 1200, margin: '0 auto', borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.2rem', color: 'white',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <QrCode size={22} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            QR Review
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="#features" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 500 }}>How it works</a>
          <a href="#pricing" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 500 }}>Pricing</a>
          <Link href="/admin/login" className="btn btn-primary btn-sm" style={{ borderRadius: 9999, padding: '10px 20px' }}>
            Admin Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ textAlign: 'center', padding: '80px 20px 60px', maxWidth: 900, margin: '0 auto', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 300, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 9999, color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: 24
        }}>
          <Sparkles size={14} /> AI-Powered Google Review Growth Engine
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15,
          letterSpacing: '-0.03em', marginBottom: 20,
          background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 70%, #818cf8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Turn Every Customer Scan Into a 5-Star Google Review.
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 720, margin: '0 auto 36px' }}>
          Smart QR codes for restaurants, salons, clinics & retail shops. Instant AI review suggestions, zero Google gating risk, and multi-language support (English, Hindi, Gujarati).
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin/login" className="btn btn-primary btn-lg" style={{ borderRadius: 9999, padding: '16px 36px', fontSize: '1rem' }}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" className="btn btn-outline btn-lg" style={{ borderRadius: 9999, borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            See How It Works
          </a>
        </div>
      </section>

      {/* ── Demo Preview Mockup ── */}
      <section style={{ maxWidth: 880, margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 24,
          padding: 32, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8', fontWeight: 700 }}>Live Interactive Demo</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>What Your Customer Sees on Scanning</h3>
            </div>

            {/* Category Selector Tabs */}
            <div style={{ display: 'flex', gap: 6, background: 'rgba(15, 23, 42, 0.6)', padding: 4, borderRadius: 9999 }}>
              {[
                { id: 'restaurant', label: 'Restaurant', icon: Utensils },
                { id: 'salon', label: 'Salon', icon: Scissors },
                { id: 'clinic', label: 'Clinic', icon: Stethoscope },
                { id: 'mobile_shop', label: 'Mobile Shop', icon: Smartphone }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                    borderRadius: 9999, border: 'none', fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedTab === tab.id ? '#4f46e5' : 'transparent',
                    color: selectedTab === tab.id ? 'white' : '#94a3b8'
                  }}
                >
                  <tab.icon size={13} /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Screen Mock */}
          <div style={{
            maxWidth: 380, margin: '0 auto', background: '#ffffff', borderRadius: 24,
            padding: 24, color: '#0f172a', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center'
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #4f46e5, #818cf8)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>
              {selectedTab === 'restaurant' ? '🍕' : selectedTab === 'salon' ? '💇‍♂️' : selectedTab === 'clinic' ? '🩺' : '📱'}
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              {selectedTab === 'restaurant' ? 'Spice Garden Bistro' : selectedTab === 'salon' ? 'Apex Luxury Salon' : selectedTab === 'clinic' ? 'Care Dental Clinic' : 'Metro Mobile Hub'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 16px' }}>How was your experience today?</p>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={28} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>

            {/* AI Review Choices */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, textAlign: 'left', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <Sparkles size={11} /> AI Suggested Review (Tap to Auto-Copy & Redirect)
              </span>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                {selectedTab === 'restaurant' && '"Amazing food, warm hospitality, and quick service! Highly recommend their special thali. ⭐⭐⭐⭐⭐"'}
                {selectedTab === 'salon' && '"Best hair styling experience! Stylist was super professional and used premium products. ✨"'}
                {selectedTab === 'clinic' && '"Dr. is very gentle and experienced. Clean facility and zero waiting time. 🙏"'}
                {selectedTab === 'mobile_shop' && '"Genuine smartphones and instant screen repair in 20 minutes! Highly trusted store. 🛠️"'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, padding: 10, background: '#10b981', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem' }}>
                ✓ Auto-Copied
              </div>
              <div style={{ flex: 1, padding: 10, background: '#4285F4', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem' }}>
                Open Google Reviews 🚀
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Features Grid ── */}
      <section id="features" style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Everything You Need to Scale Reviews</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: 8 }}>Built specifically for Indian local business owners</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {[
            {
              icon: Sparkles, color: '#818cf8',
              title: 'AI Non-Repetitive Reviews',
              desc: 'Generates 5 unique, natural-sounding review options every time a customer scans. No repeated reviews on Google.'
            },
            {
              icon: Zap, color: '#34d399',
              title: 'Instant Auto-Copy & Open',
              desc: 'Customers tap a review option, and it automatically copies the text and launches Google Reviews in 1 tap.'
            },
            {
              icon: ShieldCheck, color: '#fbbf24',
              title: 'Google Policy Compliant',
              desc: 'Follows Google anti-gating policy strictly. Google review option is visible to all users while private feedback form helps catch low ratings.'
            },
            {
              icon: Globe2, color: '#60a5fa',
              title: 'Multi-Language (EN / HI / GU)',
              desc: 'Full localization in English, Hindi, and Gujarati. Let customers express themselves in their comfortable native language.'
            },
            {
              icon: BarChart3, color: '#c084fc',
              title: 'Scan & Rating Analytics',
              desc: 'Track daily QR scans, positive vs negative sentiment ratio, and conversion timelines in your admin dashboard.'
            },
            {
              icon: MessageCircle, color: '#34d399',
              title: 'Direct WhatsApp & Call Buttons',
              desc: 'Allow customers to reach out via WhatsApp chat, phone call, or Google Maps directions right from the review landing page.'
            }
          ].map((f, i) => (
            <div key={i} style={{
              background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20, padding: 28, transition: 'all 0.3s'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Tiers (India SaaS) ── */}
      <section id="pricing" style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Simple, Affordable Pricing</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: 8 }}>Start free and upgrade as your business grows</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {[
            { name: 'Free', price: '₹0', period: 'forever', bz: '1 Business', scans: '50 scans/mo', feat: ['Basic QR Code', 'Standard Reviews', 'Email Support'] },
            { name: 'Starter', price: '₹499', period: '/month', popular: true, bz: '3 Businesses', scans: 'Unlimited scans', feat: ['AI Review Suggestions', 'WhatsApp & Call Buttons', 'Analytics Dashboard', 'Private Feedback Form'] },
            { name: 'Growth', price: '₹1,499', period: '/month', bz: '10 Businesses', scans: 'Unlimited scans', feat: ['Everything in Starter', 'Custom Offer Popups', 'Multi-Language (EN/HI/GU)', 'Export Reports'] },
            { name: 'Enterprise', price: '₹4,999', period: '/month', bz: 'Unlimited', scans: 'Unlimited scans', feat: ['White-label Branding', 'Agency Admin', 'Dedicated Account Mgr', 'Priority Support'] }
          ].map((p, i) => (
            <div key={i} style={{
              background: p.popular ? 'linear-gradient(180deg, rgba(79, 70, 229, 0.25) 0%, rgba(30, 41, 59, 0.6) 100%)' : 'rgba(30, 41, 59, 0.4)',
              border: p.popular ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 24, padding: 32, position: 'relative', display: 'flex', flexDirection: 'column'
            }}>
              {p.popular && (
                <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '4px 14px', borderRadius: 9999, textTransform: 'uppercase' }}>
                  Most Popular
                </span>
              )}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{p.name}</h3>
              <div style={{ margin: '16px 0 20px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800 }}>{p.price}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}> {p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginBottom: 10, color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color="#34d399" /> {p.bz}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginBottom: 10, color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color="#34d399" /> {p.scans}
                </li>
                {p.feat.map((ft, fidx) => (
                  <li key={fidx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginBottom: 10, color: '#94a3b8' }}>
                    <CheckCircle2 size={16} color="#4f46e5" /> {ft}
                  </li>
                ))}
              </ul>
              <Link href="/admin/login" className={`btn ${p.popular ? 'btn-primary' : 'btn-outline'} btn-full`} style={{ borderRadius: 9999 }}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p>© {new Date().getFullYear()} QR Review Growth System. Designed for Local Businesses in India.</p>
      </footer>
    </div>
  );
}
