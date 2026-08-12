'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { businessAPI } from '../../../lib/api';
import { Plus, Edit2, Trash2, QrCode, ExternalLink, Eye, Printer } from 'lucide-react';
import { CATEGORIES } from '../../../lib/constants';

export default function BusinessListPage() {
  const [businesses, setBusiness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showQR, setShowQR] = useState(null); // { qrDataUrl, pageUrl, businessName }

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await businessAPI.getAll({ search, limit: 100 });
      setBusiness(res?.data?.businesses || []);
    } catch (err) {
      toast.error('Failed to load businesses');
      setBusiness([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      await businessAPI.remove(id);
      setBusiness((prev) => prev.filter((b) => b._id !== id));
      toast.success('Business deleted');
    } catch {
      toast.error('Failed to delete business');
    }
  };

  const handleShowQR = async (id) => {
    try {
      const res = await businessAPI.getQR(id);
      setShowQR(res.data);
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const handleDownloadQR = () => {
    if (!showQR?.qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-${showQR.slug || 'code'}.png`;
    link.href = showQR.qrDataUrl;
    link.click();
  };

  const handlePrintStandee = () => {
    if (!showQR) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Review Standee - ${showQR.businessName}</title>
          <style>
            @page { size: A5 portrait; margin: 0; }
            body {
              font-family: 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 40px 20px;
              background: #ffffff;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .border-box {
              border: 8px solid #4f46e5;
              border-radius: 24px;
              padding: 40px 30px;
              width: 100%;
              max-width: 420px;
              box-sizing: border-box;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }
            .header-title { font-size: 26px; font-weight: 800; color: #1e1b4b; margin: 0 0 6px 0; }
            .subtitle { font-size: 16px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
            .stars { font-size: 32px; color: #f59e0b; margin-bottom: 20px; }
            .qr-frame { background: #ffffff; padding: 20px; border-radius: 16px; border: 2px solid #e2e8f0; display: inline-block; margin-bottom: 24px; }
            .qr-img { width: 260px; height: 260px; display: block; }
            .cta-text { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
            .sub-cta { font-size: 14px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="border-box">
            <h1 class="header-title">${showQR.businessName}</h1>
            <div class="subtitle">How Was Your Experience?</div>
            <div class="stars">★ ★ ★ ★ ★</div>
            <div class="qr-frame">
              <img src="${showQR.qrDataUrl}" class="qr-img" />
            </div>
            <div class="cta-text">SCAN QR CODE TO RATE US</div>
            <div class="sub-cta">Open camera on your phone & scan</div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getCategoryLabel = (val) => CATEGORIES.find((c) => c.value === val)?.label || val;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses()}
            style={{ width: 280 }}
          />
        </div>
        <Link href="/admin/businesses/new" className="btn btn-primary">
          <Plus size={18} /> Add Business
        </Link>
      </div>

      {/* Table */}
      {businesses.length ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => (
                <tr key={biz._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {biz.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{biz.name}</div>
                        {biz.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{biz.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{getCategoryLabel(biz.category)}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: 'var(--primary-600)' }}>/{biz.slug}</code>
                  </td>
                  <td>
                    <span className={`badge ${biz.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {biz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(biz.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <a href={`/${biz.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Preview">
                        <Eye size={16} />
                      </a>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleShowQR(biz._id)} title="QR Code">
                        <QrCode size={16} />
                      </button>
                      <Link href={`/admin/businesses/${biz._id}`} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                        <Edit2 size={16} />
                      </Link>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(biz._id, biz.name)} title="Delete" style={{ color: 'var(--rose-500)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <h3 className="empty-state-title">No businesses yet</h3>
            <p className="empty-state-desc">Add your first business to start collecting reviews</p>
            <Link href="/admin/businesses/new" className="btn btn-primary" style={{ marginTop: 20 }}>
              <Plus size={18} /> Add Your First Business
            </Link>
          </div>
        </div>
      )}

      {/* QR Customizer Modal */}
      {showQR && (
        <QRCustomizerModal showQR={showQR} onClose={() => setShowQR(null)} handlePrintStandee={handlePrintStandee} />
      )}
    </div>
  );
}

function QRCustomizerModal({ showQR, onClose, handlePrintStandee }) {
  const { QRCodeSVG } = require('qrcode.react');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');
  const qrContainerRef = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setLogoUrl(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const downloadPNG = () => {
    const svgElement = document.getElementById('custom-qr-svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600; // High resolution PNG
    canvas.width = size;
    canvas.height = size;

    const xml = new XMLSerializer().serializeToString(svgElement);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    const img = new Image();
    img.src = image64;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qr-${showQR.slug || 'code'}.png`;
      link.click();
      toast.success('High-res PNG downloaded!');
    };
  };

  const downloadSVG = () => {
    const svgElement = document.getElementById('custom-qr-svg');
    if (svgElement) {
      const serializer = new XMLSerializer();
      const svgBlob = new Blob([serializer.serializeToString(svgElement)], { type: 'image/svg+xml' });
      const downloadUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-${showQR.slug || 'code'}.svg`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success('Vector SVG downloaded!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 460, background: '#121212', border: '1px solid #222', color: '#fff' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid #222', paddingBottom: 12 }}>
          <h3 className="modal-title" style={{ color: '#fff' }}>Custom QR Generator</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} style={{ color: '#aaa' }}>✕</button>
        </div>

        <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '16px 0 4px', color: '#fff' }}>{showQR.businessName}</p>
        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 20 }}>{showQR.pageUrl}</p>

        {/* Live Customized QR Preview */}
        <div style={{ background: bgColor, padding: 20, borderRadius: 16, display: 'inline-block', border: '1px solid #333', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <QRCodeSVG
            id="custom-qr-svg"
            value={showQR.pageUrl}
            size={240}
            fgColor={fgColor}
            bgColor={bgColor}
            level="H"
            includeMargin={true}
            imageSettings={logoUrl ? {
              src: logoUrl,
              x: undefined,
              y: undefined,
              height: 48,
              width: 48,
              excavate: true,
            } : undefined}
          />
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20, textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 6 }}>QR Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent' }} />
              <span style={{ fontSize: '0.8rem', color: '#ccc', fontFamily: 'monospace' }}>{fgColor}</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 6 }}>Background</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent' }} />
              <span style={{ fontSize: '0.8rem', color: '#ccc', fontFamily: 'monospace' }}>{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Center Logo Upload */}
        <div style={{ marginTop: 14, textAlign: 'left' }}>
          <label style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 6 }}>Center Logo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ fontSize: '0.8rem', color: '#ccc', background: '#000', padding: 8, borderRadius: 6, border: '1px solid #333', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-full" onClick={downloadPNG} style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#fff', fontWeight: 700 }}>
              Download PNG
            </button>
            <button className="btn btn-outline btn-full" onClick={downloadSVG} style={{ borderColor: '#333', color: '#fff' }}>
              Download SVG
            </button>
          </div>
          <button className="btn btn-outline btn-full" onClick={handlePrintStandee} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: '#10b981', color: '#10b981', fontWeight: 700 }}>
            <Printer size={16} /> Print Counter Standee (A5/A4)
          </button>
        </div>
      </div>
    </div>
  );
}
