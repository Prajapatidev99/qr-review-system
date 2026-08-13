import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'QR Review System — Grow Your Google Reviews',
  description: 'Help your customers share their experience with a simple QR code scan. Collect Google reviews and private feedback effortlessly.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23111111' stroke='%23333333' stroke-width='4'/><text x='50' y='64' font-family='system-ui, sans-serif' font-size='42' font-weight='800' fill='%23ffffff' text-anchor='middle'>QR</text></svg>",
  },
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
        <meta name="theme-color" content="#111111" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23111111' stroke='%23333333' stroke-width='4'/><text x='50' y='64' font-family='system-ui, sans-serif' font-size='42' font-weight='800' fill='%23ffffff' text-anchor='middle'>QR</text></svg>" />
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
