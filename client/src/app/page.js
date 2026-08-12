'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  QrCode, Star, Sparkles, ShieldCheck, Zap, Globe2, BarChart3,
  MessageCircle, ArrowRight, CheckCircle2, Utensils, Scissors, Stethoscope, Smartphone,
  Users, TrendingUp, Scan, Eye, ChevronRight
} from 'lucide-react';

/* ── Animated Counter Hook ── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState('restaurant');
  const canvasRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  /* ── Counters ── */
  const [countBusinesses, refB] = useCounter(500);
  const [countScans, refS] = useCounter(25000);
  const [countReviews, refR] = useCounter(12000);
  const [countLangs, refL] = useCounter(3);

  /* ── Scroll tracking for nav blur ── */
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── WebGL Dot Matrix Background ── */
  useEffect(() => {
    let active = true;
    let renderer, geometry, material, scene, camera, animationId;

    const initThree = (THREE) => {
      if (!canvasRef.current || !active) return;
      const canvas = canvasRef.current;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2) },
        u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0] },
        u_colors: {
          value: [
            new THREE.Vector3(0.06, 0.72, 0.52),
            new THREE.Vector3(0.02, 0.71, 0.83),
            new THREE.Vector3(0.1, 0.8, 0.6),
            new THREE.Vector3(0.05, 0.6, 0.75),
            new THREE.Vector3(0.2, 0.85, 0.75),
            new THREE.Vector3(0.1, 0.7, 0.9)
          ]
        },
        u_total_size: { value: 20.0 },
        u_dot_size: { value: 6.0 },
        u_reverse: { value: 0 }
      };

      material = new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position, 1.0);
            fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }
        `,
        fragmentShader: `
          precision mediump float;
          in vec2 fragCoord;
          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;
          uniform int u_reverse;
          out vec4 fragColor;

          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) {
              return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
          }

          void main() {
              vec2 st = fragCoord.xy;
              st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
              st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));
              float opacity = step(0.0, st.x) * step(0.0, st.y);
              vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
              float frequency = 5.0;
              float show_offset = random(st2);
              float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
              opacity *= u_opacities[int(rand * 10.0)];
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
              vec3 color = u_colors[int(show_offset * 6.0)];

              float animation_speed_factor = 3.0;
              vec2 center_grid = u_resolution / 2.0 / u_total_size;
              float dist_from_center = distance(center_grid, st2);
              float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
              float current_timing_offset = timing_offset_intro;
              opacity *= step(current_timing_offset, u_time * animation_speed_factor);
              opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

              fragColor = vec4(color, opacity);
              fragColor.rgb *= fragColor.a;
          }
        `,
        uniforms: uniforms,
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        transparent: true
      });

      geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));

      const startTime = performance.now();
      const animate = () => {
        if (!active) return;
        animationId = requestAnimationFrame(animate);
        uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!renderer || !uniforms) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth * 2, window.innerHeight * 2);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    if (window.THREE) {
      initThree(window.THREE);
    } else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => { if (window.THREE && active) initThree(window.THREE); };
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, []);

  /* ── Shared Styles ── */
  const card = {
    background: '#121212', border: '1px solid #222', borderRadius: 16,
    padding: 28, transition: 'all 0.3s ease'
  };

  const sectionTitle = (text, sub) => (
    <div style={{ textAlign: 'center', marginBottom: 56 }}>
      <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>{text}</h2>
      <p style={{ color: '#b0b0b0', fontSize: '1.05rem', marginTop: 10, maxWidth: 560, margin: '10px auto 0' }}>{sub}</p>
    </div>
  );

  const demoReviews = {
    restaurant: '"Amazing food, warm hospitality, and quick service! Highly recommend their special thali. ⭐⭐⭐⭐⭐"',
    salon: '"Best hair styling experience! Stylist was super professional and used premium products. ✨"',
    clinic: '"Dr. is very gentle and experienced. Clean facility and zero waiting time. 🙏"',
    mobile_shop: '"Genuine smartphones and instant screen repair in 20 minutes! Highly trusted store. 🛠️"',
  };

  return (
    <div style={{ background: '#000000', color: '#fff', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflowX: 'hidden' }}>
      {/* WebGL Dot canvas — identical to login page */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'radial-gradient(circle at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ═══════ NAVIGATION ═══════ */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 32px', maxWidth: 1200, margin: '0 auto',
          borderBottom: scrollY > 20 ? '1px solid #222' : '1px solid transparent',
          background: scrollY > 20 ? 'rgba(0,0,0,0.85)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(20px)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: '#111', border: '1px solid #333',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
            }}>QR</div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>QR Review</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#features" style={{ color: '#b0b0b0', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
            <a href="#how-it-works" style={{ color: '#b0b0b0', fontSize: '0.875rem', fontWeight: 500 }}>How it works</a>
            <a href="#pricing" style={{ color: '#b0b0b0', fontSize: '0.875rem', fontWeight: 500 }}>Pricing</a>
            <Link href="/admin/login" style={{
              padding: '8px 20px', borderRadius: 8, border: '1px solid #333', background: '#111',
              color: '#fff', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              Dashboard <ChevronRight size={14} />
            </Link>
          </div>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <section style={{ textAlign: 'center', padding: '100px 20px 40px', maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            background: '#111', border: '1px solid #333',
            borderRadius: 9999, color: '#10b981', fontSize: '0.8rem', fontWeight: 600, marginBottom: 28
          }}>
            <Sparkles size={13} /> AI-Powered Review Growth Engine
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-0.04em', marginBottom: 20, color: '#fff'
          }}>
            Turn every scan into a<br />
            <span style={{ color: '#10b981' }}>5-star Google review.</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#c0c0c0', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 40px' }}>
            Smart QR codes for restaurants, salons, clinics & retail. AI-generated review suggestions in English, Hindi & Gujarati. Zero Google gating risk.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/admin/login" style={{
              padding: '14px 32px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 24px rgba(16, 185, 129, 0.35)', transition: 'all 0.2s', textDecoration: 'none'
            }}>
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" style={{
              padding: '14px 28px', borderRadius: 8, border: '1px solid #333', background: '#111',
              color: '#fff', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
            }}>
              See How It Works
            </a>
          </div>
        </section>

        {/* ═══════ STATS BAR ═══════ */}
        <section style={{ maxWidth: 900, margin: '60px auto', padding: '0 20px' }}>
          <div style={{
            ...card, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, padding: 0,
            overflow: 'hidden', textAlign: 'center'
          }}>
            {[
              { label: 'Businesses', value: countBusinesses, suffix: '+', icon: Users, ref: refB },
              { label: 'QR Scans', value: countScans, suffix: '+', icon: Scan, ref: refS },
              { label: 'Reviews Generated', value: countReviews, suffix: '+', icon: Star, ref: refR },
              { label: 'Languages', value: countLangs, suffix: '', icon: Globe2, ref: refL },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} style={{
                padding: '28px 16px', borderRight: i < 3 ? '1px solid #222' : 'none'
              }}>
                <div style={{ color: '#10b981', marginBottom: 8 }}><stat.icon size={20} /></div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ LIVE DEMO ═══════ */}
        <section id="how-it-works" style={{ maxWidth: 900, margin: '80px auto', padding: '0 20px' }}>
          {sectionTitle('See it in action', 'What your customer sees after scanning the QR code')}

          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
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
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 12px', border: 'none', fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedTab === tab.id ? '#1a1a1a' : 'transparent',
                    color: selectedTab === tab.id ? '#10b981' : '#666',
                    borderBottom: selectedTab === tab.id ? '2px solid #10b981' : '2px solid transparent'
                  }}
                >
                  <tab.icon size={15} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Phone mock */}
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 340, background: '#fff', borderRadius: 28, padding: '32px 24px',
                color: '#0f172a', boxShadow: '0 0 80px rgba(16, 185, 129, 0.08)', textAlign: 'center',
                border: '4px solid #222'
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '1.3rem'
                }}>
                  {selectedTab === 'restaurant' ? '🍕' : selectedTab === 'salon' ? '💇‍♂️' : selectedTab === 'clinic' ? '🩺' : '📱'}
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {selectedTab === 'restaurant' ? 'Spice Garden Bistro' : selectedTab === 'salon' ? 'Apex Luxury Salon' : selectedTab === 'clinic' ? 'Care Dental Clinic' : 'Metro Mobile Hub'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 18px' }}>How was your experience today?</p>

                {/* Stars */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={30} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                {/* AI suggestion */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, textAlign: 'left', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <Sparkles size={11} /> AI Suggested Review
                  </span>
                  <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                    {demoReviews[selectedTab]}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, padding: 10, background: '#10b981', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem' }}>
                    ✓ Copied
                  </div>
                  <div style={{ flex: 1, padding: 10, background: '#4285F4', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem' }}>
                    Open Google 🚀
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS — 3 STEPS ═══════ */}
        <section style={{ maxWidth: 1000, margin: '80px auto', padding: '0 20px' }}>
          {sectionTitle('Three steps. That\'s it.', 'From QR scan to 5-star review in under 30 seconds')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { step: '01', title: 'Customer Scans QR', desc: 'Place QR codes on tables, reception desks, or bills. Customer scans with any phone camera.', icon: Scan, color: '#10b981' },
              { step: '02', title: 'AI Generates Review', desc: 'Our AI instantly creates 5 unique, natural-sounding review options in the customer\'s chosen language.', icon: Sparkles, color: '#06b6d4' },
              { step: '03', title: 'One-Tap to Google', desc: 'Customer taps a review, it auto-copies, and Google Reviews opens. Done in 10 seconds.', icon: TrendingUp, color: '#10b981' },
            ].map((s, i) => (
              <div key={i} style={{ ...card, position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 20, right: 20, fontSize: '2.5rem', fontWeight: 800,
                  color: '#1a1a1a', letterSpacing: '-0.05em'
                }}>{s.step}</div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#111', border: '1px solid #333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 20
                }}>
                  <s.icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#b0b0b0', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ FEATURES GRID ═══════ */}
        <section id="features" style={{ maxWidth: 1000, margin: '80px auto', padding: '0 20px' }}>
          {sectionTitle('Built for Indian local businesses', 'Every feature designed for maximum review conversion')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {[
              { icon: Sparkles, color: '#10b981', title: 'AI Non-Repetitive Reviews', desc: 'Generates 5 unique, natural-sounding review options every scan. No repeated reviews on Google.' },
              { icon: Zap, color: '#06b6d4', title: 'Instant Auto-Copy & Open', desc: 'Customer taps a review → it auto-copies → Google Reviews opens. All in 1 tap.' },
              { icon: ShieldCheck, color: '#f59e0b', title: 'Google Policy Compliant', desc: 'No review gating. Google review option is visible to everyone. Private feedback catches low ratings.' },
              { icon: Globe2, color: '#06b6d4', title: 'Multi-Language (EN / HI / GU)', desc: 'Full localization in English, Hindi, and Gujarati. Customers review in their comfortable language.' },
              { icon: BarChart3, color: '#10b981', title: 'Scan & Rating Analytics', desc: 'Track daily QR scans, sentiment ratio, and conversion timelines in your admin dashboard.' },
              { icon: MessageCircle, color: '#f59e0b', title: 'WhatsApp & Call Buttons', desc: 'Let customers reach you via WhatsApp, phone call, or Google Maps from the review page.' },
            ].map((f, i) => (
              <div key={i} style={{ ...card, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#111', border: '1px solid #333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0
                }}>
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#b0b0b0', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section style={{ maxWidth: 1000, margin: '80px auto', padding: '0 20px' }}>
          {sectionTitle('Trusted by business owners', 'Hear from real local businesses across India')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Rajesh Patel', biz: 'Spice Garden Restaurant, Ahmedabad', quote: 'Our Google reviews went from 12 to 85 in just 2 months. Customers love how easy it is!', stars: 5 },
              { name: 'Priya Sharma', biz: 'Glow Beauty Salon, Surat', quote: 'The Hindi language option is a game changer. My customers feel comfortable leaving detailed reviews.', stars: 5 },
              { name: 'Dr. Amit Desai', biz: 'Care Dental Clinic, Vadodara', quote: 'Private feedback catches complaints before they go public. My rating went from 3.8 to 4.6 stars.', stars: 5 },
            ].map((t, i) => (
              <div key={i} style={{ ...card }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {Array(t.stars).fill(0).map((_, s) => (
                    <Star key={s} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e0e0e0', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#999' }}>{t.biz}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ PRICING ═══════ */}
        <section id="pricing" style={{ maxWidth: 1000, margin: '80px auto', padding: '0 20px' }}>
          {sectionTitle('Simple, transparent pricing', 'Start free and scale as your business grows')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { name: 'Free', price: '₹0', period: 'forever', bz: '1 Business', scans: '50 scans/mo', feat: ['Basic QR Code', 'Standard Reviews', 'Email Support'] },
              { name: 'Starter', price: '₹499', period: '/month', popular: true, bz: '3 Businesses', scans: 'Unlimited scans', feat: ['AI Review Suggestions', 'WhatsApp & Call', 'Analytics Dashboard', 'Private Feedback'] },
              { name: 'Growth', price: '₹1,499', period: '/month', bz: '10 Businesses', scans: 'Unlimited scans', feat: ['Everything in Starter', 'Custom Offer Popups', 'Multi-Language', 'Export Reports'] },
              { name: 'Enterprise', price: '₹4,999', period: '/month', bz: 'Unlimited', scans: 'Unlimited scans', feat: ['White-label Branding', 'Agency Admin', 'Account Manager', 'Priority Support'] }
            ].map((p, i) => (
              <div key={i} style={{
                ...card, position: 'relative', display: 'flex', flexDirection: 'column',
                border: p.popular ? '1px solid #10b981' : '1px solid #222',
              }}>
                {p.popular && (
                  <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff',
                    fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: 9999,
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    Most Popular
                  </span>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{p.name}</h3>
                <div style={{ margin: '14px 0 18px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800 }}>{p.price}</span>
                  <span style={{ color: '#999', fontSize: '0.85rem' }}> {p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 8, color: '#e0e0e0' }}>
                    <CheckCircle2 size={14} color="#10b981" /> {p.bz}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 8, color: '#e0e0e0' }}>
                    <CheckCircle2 size={14} color="#10b981" /> {p.scans}
                  </li>
                  {p.feat.map((ft, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 8, color: '#b0b0b0' }}>
                      <CheckCircle2 size={14} color="#333" /> {ft}
                    </li>
                  ))}
                </ul>
                <Link href="/admin/login" style={{
                  display: 'block', textAlign: 'center', padding: '12px 20px', borderRadius: 8,
                  fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
                  ...(p.popular
                    ? { background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }
                    : { background: '#111', border: '1px solid #333', color: '#fff' }
                  )
                }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ CTA BANNER ═══════ */}
        <section style={{ maxWidth: 900, margin: '80px auto 60px', padding: '0 20px' }}>
          <div style={{
            ...card, textAlign: 'center', padding: '56px 40px',
            background: '#0a0a0a', border: '1px solid #1a1a1a'
          }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Ready to grow your Google reviews?
            </h2>
            <p style={{ color: '#c0c0c0', fontSize: '1rem', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Join 500+ Indian businesses already using QR Review to boost their online reputation.
            </p>
            <Link href="/admin/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff',
              fontSize: '1rem', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(16, 185, 129, 0.35)', transition: 'all 0.2s'
            }}>
              Start Free — No Credit Card <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer style={{ borderTop: '1px solid #1a1a1a', padding: '32px 20px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#111', border: '1px solid #333',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.65rem'
              }}>QR</div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#999' }}>QR Review System</span>
            </div>
            <p style={{ color: '#777', fontSize: '0.8rem' }}>© {new Date().getFullYear()} QR Review. Designed for local businesses in India.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
