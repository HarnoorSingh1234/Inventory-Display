# HS Traders Frontend

Next.js frontend for the yarn trading platform with public inventory display and admin management dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **State Management**: React hooks (useState, useEffect)

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js app router pages
│   │   ├── page.tsx             # Public homepage
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   └── admin/               # Admin dashboard
│   │       ├── layout.tsx       # Auth guard
│   │       ├── login/           # Login page
│   │       ├── inventory/       # Inventory management
│   │       ├── whatsapp/        # WhatsApp groups
│   │       └── broadcast/       # Broadcast messages
│   ├── components/
│   │   ├── public/              # Public-facing components
│   │   └── admin/               # Admin components
│   ├── lib/
│   │   ├── api.ts              # Axios configuration
│   │   ├── auth.ts             # Authentication helpers
│   │   └── utils.ts            # Utility functions
│   └── types/                   # TypeScript type definitions
├── .env.local                   # Environment variables
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

### 3. Start Development Server

```bash
bun dev
# or
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Features

### Public Pages

- **Homepage** (`/`)
  - Display live yarn inventory tables
  - Client-side search by count or quality
  - Floating WhatsApp contact button
  - Responsive design for mobile and desktop

### Admin Dashboard

- **Login** (`/admin/login`)
  - JWT-based authentication
  - Token stored in localStorage

- **Inventory Management** (`/admin/inventory`)
  - Create and manage table groups
  - Add/edit/delete yarn items
  - Control visibility on homepage
  - Reorder items

- **WhatsApp Groups** (`/admin/whatsapp`)
  - Add WhatsApp group invite links
  - Enable/disable groups
  - Manage group names

- **Broadcast** (`/admin/broadcast`)
  - Send messages to multiple groups
  - Auto-generate from inventory
  - Custom messages
  - View broadcast history

## Authentication

Admin routes are protected by authentication guard in `/admin/layout.tsx`:
- Redirects to login if no valid token
- Verifies token on mount
- Clears token and redirects on 401 errors

## API Integration

All API calls go through the configured axios instance in `lib/api.ts`:
- Base URL from environment variable
- Automatic token injection
- Global error handling
- 401 redirect handling

## Development Tips

### Running with Backend

1. Start the backend server on port 8000
2. Start the frontend on port 3000
3. The frontend will proxy API requests to the backend

### Type Safety

All API responses and requests are typed. See `src/types/` for:
- `table.ts` - Inventory types
- `whatsapp.ts` - WhatsApp group types
- `broadcast.ts` - Broadcast types
- `admin.ts` - Authentication types

### Component Structure

Components are organized by scope:
- `components/public/` - Public-facing components
- `components/admin/` - Admin dashboard components

Each component is self-contained with proper TypeScript typing.

## Build for Production

```bash
bun run build
bun run start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp business number | `919876543210` |

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Private project for HS Traders
