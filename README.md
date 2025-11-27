# Mas Poll Frontend

A minimal and clean polling application frontend built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 📊 **View All Polls** - Browse all available polls
- ➕ **Create Polls** - Create new polls with multiple options
- 🗳️ **Vote** - Cast votes on open polls
- 📈 **View Results** - See real-time poll results with vote counts and percentages
- 🔒 **Close Polls** - Close polls to prevent further voting

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout.tsx   # Main layout with navigation
│   └── PollCard.tsx # Poll card component
├── pages/           # Page components
│   ├── Home.tsx     # Polls list page
│   ├── CreatePoll.tsx # Create poll page
│   └── PollDetail.tsx # Poll detail/vote page
├── services/        # API service functions
│   └── apiService.ts # API calls to backend services
├── config/          # Configuration
│   └── environment.ts # Environment variables
├── types/           # TypeScript type definitions
│   └── index.ts     # Shared types
├── App.tsx          # Main app component with routes
└── main.tsx         # Entry point
```

## Backend Services

The frontend connects to three microservices:

- **Poll Service** (Port 8001) - Poll CRUD operations
- **Option Service** (Port 8002) - Poll options management
- **Vote Service** (Port 8003) - Voting & analytics

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## Environment Variables

Optional - defaults are used if not specified:

```env
VITE_POLL_SERVICE_URL=http://localhost:8001
VITE_OPTION_SERVICE_URL=http://localhost:8002
VITE_VOTE_SERVICE_URL=http://localhost:8003
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Poll Service
- `GET /polls` - List all polls
- `GET /polls/{id}` - Get poll by ID
- `POST /polls` - Create new poll
- `PATCH /polls/{id}/close` - Close poll

### Option Service
- `GET /polls/{poll_id}/options` - Get poll options
- `POST /polls/{poll_id}/options` - Add option
- `DELETE /options/{option_id}` - Delete option

### Vote Service
- `POST /vote` - Submit vote
- `GET /polls/{poll_id}/results` - Get poll results
- `GET /analytics/today` - Today's vote count
- `GET /analytics/top` - Most voted poll

