'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Building2, MessageSquareText, BarChart3,
  Lightbulb, LogOut, Menu, X, QrCode
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { href: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquareText },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') return;

    const token = localStorage.getItem('qr_admin_token');
    const user = localStorage.getItem('qr_admin_user');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (user) {
      try {
        setAdmin(JSON.parse(user));
      } catch {
        setAdmin(null);
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('qr_admin_token');
    localStorage.removeItem('qr_admin_user');
    router.push('/admin/login');
  };

  // Login page doesn't use admin layout
  if (pathname === '/admin/login') {
    return children;
  }

  const pageTitle = navItems.find((item) => item.href === pathname)?.label || 'Dashboard';

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 45, display: 'none',
          }}
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">
            <QrCode size={20} />
          </div>
          <span className="admin-sidebar-brand-text">QR Review</span>
          <button
            className="btn btn-ghost btn-icon"
            style={{ marginLeft: 'auto', display: 'none', color: 'white' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {admin && (
            <div style={{ padding: '0 16px 12px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              {admin.name || admin.email}
            </div>
          )}
          <button className="admin-nav-link" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              id="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>
            <h1 className="admin-topbar-title">{pageTitle}</h1>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
          #mobile-menu-btn { display: flex !important; }
          .admin-sidebar button[style*="display: none"] { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
