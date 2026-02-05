# UniChat - University Student Random Chat

A web app where verified university students can randomly match and chat 1-on-1 with other students from universities in the same country. Perfect for those boring lectures! 🎓💬

## Features

- **University Email Verification** - Only verified students can access the chat
- **Country-based Matching** - Get matched with students from universities in your country
- **Anonymous Pseudonyms** - Each session gives you a random name like "SleepyPanda" or "BoldTiger"
- **Real-time Chat** - Instant messaging with typing indicators
- **Skip & Next** - Quickly find a new match if the vibe isn't right

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL
- **Auth**: JWT + Email verification

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone and install dependencies**

```bash
cd Biv1
npm run install:all
```

2. **Set up PostgreSQL**

Create a database called `unichat`:

```sql
CREATE DATABASE unichat;
```

3. **Configure environment**

Create `server/.env`:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unichat
JWT_SECRET=your-secret-key-here

# For development, use Ethereal (https://ethereal.email) to test emails
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user
SMTP_PASS=your-ethereal-pass
```

4. **Run the app**

```bash
# Run both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Development Notes

### Email Verification

For development, verification codes are logged to the console. In production, configure real SMTP credentials.

### Supported University Domains

The app recognizes university emails from:
- `.edu` (US)
- `.ac.uk` (UK)
- `.edu.au` (Australia)
- `.ac.jp` (Japan)
- `.edu.sg` (Singapore)
- And many more...

See `server/src/services/universityDomains.ts` for the full list.

### Testing Without University Email

For development, you can temporarily modify the validation in `server/src/services/universityDomains.ts` to accept any email domain.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth, Socket)
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Entry point
│   └── ...
├── server/                 # Express backend
│   └── src/
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── socket/         # WebSocket handlers
│       └── db/             # Database setup
└── package.json            # Root package.json
```

## License

MIT
