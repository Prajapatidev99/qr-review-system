# QR-Based Customer Review Growth System

A SaaS platform that helps local businesses collect Google reviews and private feedback through scannable QR codes.

## Features

- 🎯 **Smart Review Flow** — Star rating → review suggestions + Google redirect
- 📊 **Analytics Dashboard** — Track scans, ratings, and conversion
- 🌐 **Multi-language** — English, Hindi, Gujarati
- 📱 **Mobile-First** — Optimized for QR code scanning on phones
- 🔒 **Google Policy Compliant** — No review gating, no auto-submission
- 💬 **Action Buttons** — WhatsApp, Call, Google Maps directions

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Styling:** Vanilla CSS with modern design tokens

## Project Structure

```
QR-AUTOMATION/
├── client/          # Next.js frontend
├── server/          # Express backend API
├── .env.example     # Environment variable template
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd server
npm install
cp .env.example .env    # Edit with your values
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local    # Edit with your values
npm run dev
```

## API Documentation

See `server/` README for full API endpoint documentation.

## License

MIT
