# Telegram Session Manager - Frontend

Next.js 14+ frontend with TypeScript and Material-UI for managing Telegram Telethon sessions.

## Features

- ✅ Next.js 14+ with App Router
- ✅ TypeScript for type safety
- ✅ Material-UI v5 with Telegram-inspired theme
- ✅ Dark mode support
- ✅ Telegram Mini App integration (@twa-dev/sdk)
- ✅ Zustand for state management
- ✅ Axios with JWT authentication
- ✅ Toast notifications
- ✅ Mobile-first responsive design
- ✅ Session management UI

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend/README.md)

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

### Local Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

**Vercel is the recommended platform for Next.js applications.**

#### Browser Deployment (No CLI Required!):

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - **Root Directory:** `frontend` ← **IMPORTANT!**
   - **Framework Preset:** Next.js (auto-detected)
   - **Environment Variable:** `NEXT_PUBLIC_API_URL` = Your backend URL
     - Examples: `https://api.yourdomain.com` or `http://123.45.67.89:8000`
5. **Click "Deploy"**

That's it! Vercel will build and deploy your app. No CLI needed!

📖 **[Complete Browser Deployment Guide](../VERCEL_DEPLOYMENT.md)** - Detailed step-by-step guide

#### Quick Deploy Button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thertxnetwork/nextrobo-rtx&project-name=telegram-session-manager&repository-name=telegram-session-manager&root-directory=frontend&env=NEXT_PUBLIC_API_URL&envDescription=Backend%20API%20URL%20(HTTP%20or%20HTTPS)&envLink=https://github.com/thertxnetwork/nextrobo-rtx/blob/main/VERCEL_DEPLOYMENT.md)

#### CLI Deployment (Alternative):

If you prefer command line:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **For production:**
   ```bash
   vercel --prod
   ```

### Deploy to Other Platforms

This Next.js app can also be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- DigitalOcean App Platform

See [Next.js Deployment Documentation](https://nextjs.org/docs/deployment) for details.

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── src/
│   ├── components/
│   │   ├── Layout/         # Layout components
│   │   │   └── AppLayout.tsx
│   │   ├── Session/        # Session components
│   │   │   ├── SessionCard.tsx
│   │   │   ├── SessionList.tsx
│   │   │   └── CreateSessionWizard.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── useSessions.ts  # Session management hook
│   │   └── useTelegram.ts  # Telegram WebApp hook
│   ├── lib/
│   │   ├── api.ts          # Axios API client
│   │   ├── telegram.ts     # Telegram utilities
│   │   └── theme.ts        # MUI theme configuration
│   ├── store/
│   │   └── authStore.ts    # Zustand auth store
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── utils/
└── public/                  # Static assets
```

## Key Components

### AppLayout
Main application layout with navigation and logout.

### SessionCard
Displays individual session information with actions.

### SessionList
Lists all user sessions with pagination support.

### CreateSessionWizard
Step-by-step wizard for creating new Telegram sessions.

### ThemeProvider
Wraps app with Material-UI theme and toast notifications.

## Hooks

### useAuth
Manages authentication state and Telegram login.

### useSessions
Handles session CRUD operations.

### useTelegram
Integrates with Telegram WebApp SDK.

## State Management

Uses Zustand for lightweight state management:
- Authentication state
- User information
- Token management

## Styling

Material-UI v5 with custom Telegram-inspired theme:
- Primary color: Telegram blue (#0088cc)
- Rounded corners (12px)
- Custom shadows
- Dark mode support

## Telegram Mini App

The application integrates with Telegram Mini App:
- Auto-validates `initData` on mount
- Supports Telegram theme colors
- Haptic feedback for interactions
- Native UI elements (alerts, confirms)

## Environment Variables

See `.env.example` for configuration options.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

See LICENSE file in the root directory.
