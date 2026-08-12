import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'QR Review System — Grow Your Google Reviews',
  description: 'Help your customers share their experience with a simple QR code scan. Collect Google reviews and private feedback effortlessly.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📱</text></svg>" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              fontSize: '0.9rem',
            },
          }}
        />
      </body>
    </html>
  );
}
