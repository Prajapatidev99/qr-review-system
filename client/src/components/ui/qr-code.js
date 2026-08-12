'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRCodeGenerator({ initialUrl = 'https://review.mybrand.com' }) {
  const [url, setUrl] = useState(initialUrl);
  const [qrCode, setQRCode] = useState(initialUrl);
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [size, setSize] = useState(240);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const qrRef = useRef(null);

  const generateQRCode = (e) => {
    e.preventDefault();
    setQRCode(url);
  };

  const downloadSVG = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (svgElement) {
      const serializer = new XMLSerializer();
      const svgBlob = new Blob([serializer.serializeToString(svgElement)], {
        type: 'image/svg+xml',
      });
      const downloadUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qrcode.svg';
      link.click();
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const downloadPNG = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const xml = new XMLSerializer().serializeToString(svgElement);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    const img = new Image();
    img.src = image64;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'qrcode.png';
      link.click();
    };
  };

  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        color: '#f8fafc'
      }}>
        <form onSubmit={generateQRCode} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Target Business Review URL
            </label>
            <input
              type="url"
              placeholder="https://review.mybrand.com/shopname"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Color & Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, alignItems: 'center' }}>
            {/* Foreground Color */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                QR Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: 42, height: 42, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{color}</span>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                Background
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{ width: 42, height: 42, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{backgroundColor}</span>
              </div>
            </div>

            {/* Size Slider */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                Size: {size}px
              </label>
              <input
                type="range"
                min="140"
                max="400"
                step="10"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>

            {/* Error Correction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                Error Correction
              </label>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff', fontSize: '0.85rem', outline: 'none'
                }}
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
            }}
          >
            Generate QR Code
          </button>
        </form>

        {/* QR Display Output & Downloads */}
        {qrCode && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div
              ref={qrRef}
              style={{
                background: backgroundColor,
                padding: 16,
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'inline-block',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            >
              <QRCodeSVG
                value={qrCode}
                size={size}
                fgColor={color}
                bgColor={backgroundColor}
                level={errorCorrection}
                includeMargin={true}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={downloadPNG}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: '#10b981', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Download PNG
              </button>
              <button
                onClick={downloadSVG}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Download SVG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
