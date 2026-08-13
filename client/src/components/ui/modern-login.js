'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '../../lib/api';

export default function Component() {
  const canvasRef = useRef(null);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    let renderer;
    let geometry;
    let material;
    let scene;
    let camera;
    let animationId;

    const initThree = (THREE) => {
      if (!canvasRef.current || !active) return;
      const canvas = canvasRef.current;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
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
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

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

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    if (window.THREE) {
      const cleanUp = initThree(window.THREE);
      return () => {
        active = false;
        if (cleanUp) cleanUp();
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
        if (geometry) geometry.dispose();
        if (material) material.dispose();
      };
    } else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if (window.THREE && active) {
          initThree(window.THREE);
        }
      };
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

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const res = await authAPI.register({ name, email, password });
        const token = res.data.token;
        localStorage.setItem('qr_admin_token', token);
        localStorage.setItem('qr_admin_user', JSON.stringify(res.data.admin));
        document.cookie = `qr_admin_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        toast.success('Account created successfully!');
        window.location.href = '/admin';
      } else {
        const res = await authAPI.login({ email, password });
        const token = res.data.token;
        localStorage.setItem('qr_admin_token', token);
        localStorage.setItem('qr_admin_user', JSON.stringify(res.data.admin));
        document.cookie = `qr_admin_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        toast.success('Signed in successfully!');
        window.location.href = '/admin';
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  /* ─── shared styles ─── */
  const inputStyle = {
    width: "100%", padding: "0.65rem 0.85rem", borderRadius: 6,
    border: "1px solid #333", background: "#000", color: "#fff",
    fontSize: "0.875rem", outline: "none", boxSizing: "border-box"
  };

  const Logo = (
    <div style={{
      background: "#111", width: 44, height: 44, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.75rem", border: "1px solid #333"
    }}>QR</div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, width: "100vw", height: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", background: "#000000", color: "#fff",
      fontFamily: "'Inter',-apple-system,sans-serif", margin: 0, padding: 0
    }}>

      {/* WebGL Dot canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0, width: "100%", height: "100%" }} />

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(circle at center,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0) 100%)", pointerEvents: "none" }} />

      {/* Modal card */}
      <div style={{ position: "relative", zIndex: 2, background: "#121212", borderRadius: 12, padding: "2rem", width: "100%", maxWidth: 400, boxShadow: "0 10px 40px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid #222", margin: 16 }}>

        <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {Logo}
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, marginBottom: "0.25rem", letterSpacing: "-0.025em" }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#b0b0b0", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            {isSignUp ? 'Sign up to start growing your Google reviews.' : 'Sign in to manage your QR Review dashboard.'}
          </p>

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {isSignUp && (
              <div style={{ textAlign: "left", width: "100%" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#888", marginBottom: "0.35rem", fontWeight: 500 }}>Full Name</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div style={{ textAlign: "left", width: "100%" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#888", marginBottom: "0.35rem", fontWeight: 500 }}>Email Address</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!isSignUp}
              />
            </div>

            <div style={{ textAlign: "left", width: "100%" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#888", marginBottom: "0.35rem", fontWeight: 500 }}>Password</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "0.85rem", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", color: "#ffffff", fontWeight: 700, fontSize: "0.95rem",
                cursor: loading ? "wait" : "pointer", marginTop: "0.6rem", opacity: loading ? 0.8 : 1,
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)", transition: "all 0.2s ease"
              }}
            >
              {loading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Free Account' : 'Sign In with Email')}
            </button>

            <div style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#999' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
