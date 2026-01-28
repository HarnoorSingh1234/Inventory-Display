# HS Traders - Complete Project Setup Guide

## Project Overview
A full-stack yarn trading platform with public inventory display and admin management dashboard.

## Technology Stack

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite Database
- JWT Authentication
- WhatsApp Web integration (whatsapp-web.js)

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Axios for API calls
- React hooks for state management

## Project Structure

```
HSTraders/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── init_admin.py           # Admin user creation script
│   ├── requirements.txt        # Python dependencies
│   ├── api/                    # API routes
│   │   ├── v1/
│   │   │   ├── api.py         # Route aggregator
│   │   │   └── endpoints/     # Individual endpoints
│   │   └── deps.py            # Dependencies (auth)
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database setup
│   │   └── security.py        # JWT utilities
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   └── services/              # Business logic
│       ├── message_generator.py
│       └── whatsapp_service.py
└── frontend/
    ├── src/
    │   ├── app/               # Next.js pages
    │   │   ├── page.tsx      # Public homepage
    │   │   ├── layout.tsx    # Root layout
    │   │   └── admin/        # Admin dashboard
    │   ├── components/
    │   │   ├── public/       # Public components
    │   │   └── admin/        # Admin components
    │   ├── lib/              # Utilities
    │   │   ├── api.ts       # Axios config
    │   │   ├── auth.ts      # Auth helpers
    │   │   └── utils.ts     # Helper functions
    │   └── types/            # TypeScript types
    ├── .env.local            # Environment variables
    └── package.json
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create admin user
python init_admin.py

# Start server
uvicorn main:app --reload --port 8000
```

**Backend will run on:** http://localhost:8000
**API Documentation:** http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install  # or npm install

# Configure environment
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
# NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# Start development server
bun dev  # or npm run dev
```

**Frontend will run on:** http://localhost:3000

## Features

### Public Features (/)
- ✅ Live yarn inventory display
- ✅ Multiple inventory tables
- ✅ Real-time search (count/quality)
- ✅ Responsive design
- ✅ Floating WhatsApp contact button
- ✅ Auto-updating last modified time

### Admin Features (/admin)

#### Login (/admin/login)
- ✅ JWT-based authentication
- ✅ Secure token storage
- ✅ Auto-redirect on auth failure

#### Inventory Management (/admin/inventory)
- ✅ Create/edit/delete table groups
- ✅ Add/edit/delete yarn items
- ✅ Control homepage visibility
- ✅ Reorder items
- ✅ Live preview

#### WhatsApp Groups (/admin/whatsapp)
- ✅ Add group invite links
- ✅ Enable/disable groups
- ✅ Edit group names
- ✅ Delete groups

#### Broadcast (/admin/broadcast)
- ✅ Send to multiple groups
- ✅ Auto-generate from inventory
- ✅ Custom messages
- ✅ Broadcast history
- ✅ Status tracking

## API Endpoints

### Public Endpoints
- `GET /api/v1/homepage/tables` - Get all visible tables with items

### Admin Endpoints (Require JWT)
- `POST /api/v1/admin/login` - Admin login
- `POST /api/v1/admin/verify` - Verify token

**Table Groups:**
- `GET /api/v1/admin/table-groups` - List all
- `POST /api/v1/admin/table-groups` - Create new
- `PUT /api/v1/admin/table-groups/{id}` - Update
- `DELETE /api/v1/admin/table-groups/{id}` - Delete

**Yarn Items:**
- `GET /api/v1/admin/table-groups/{id}/items` - List items
- `POST /api/v1/admin/table-groups/{id}/items` - Create item
- `PUT /api/v1/admin/yarn-items/{id}` - Update item
- `DELETE /api/v1/admin/yarn-items/{id}` - Delete item

**WhatsApp Groups:**
- `GET /api/v1/admin/whatsapp/groups` - List all
- `POST /api/v1/admin/whatsapp/groups` - Create new
- `PUT /api/v1/admin/whatsapp/groups/{id}` - Update
- `DELETE /api/v1/admin/whatsapp/groups/{id}` - Delete

**Broadcast:**
- `POST /api/v1/admin/broadcast` - Send broadcast
- `GET /api/v1/admin/broadcast/history` - Get history

## Environment Variables

### Backend (.env or environment)
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./hstraders.db
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

## Database Schema

### Admin Users
- id, email, hashed_password, is_active, created_at

### Table Groups
- id, table_name, display_order, show_on_homepage, created_at, updated_at

### Yarn Items
- id, table_group_id, count, quality, rate, display_order, show_on_homepage, created_at, updated_at

### WhatsApp Groups
- id, group_name, group_invite_id, is_active, created_at

### Broadcast History
- id, group_id, message_preview, full_message, message_type, table_group_ids, scheduled_for, sent_at, status, error_message, created_at

## Default Admin Credentials

Created by `init_admin.py`:
- **Email:** admin@hstraders.com
- **Password:** admin123

⚠️ **IMPORTANT:** Change these credentials after first login!

## Development Workflow

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && bun dev`
3. Access frontend: http://localhost:3000
4. Access API docs: http://localhost:8000/docs
5. Login to admin: http://localhost:3000/admin/login

## Production Deployment

### Backend
1. Set production SECRET_KEY
2. Use PostgreSQL instead of SQLite
3. Configure CORS for production domain
4. Use gunicorn/uvicorn workers
5. Set up HTTPS

### Frontend
1. Build: `bun run build`
2. Set production API URL
3. Deploy to Vercel/Netlify/Custom server
4. Configure domain and SSL

## Key Features Implementation

### Authentication
- JWT tokens with 30-day expiration
- Bearer token in Authorization header
- Auto-refresh on 401 errors
- Logout clears token and redirects

### Search Functionality
- Client-side filtering
- Real-time results
- Searches count and quality fields
- Case-insensitive matching

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints (sm, md, lg)
- Touch-friendly UI elements
- Optimized for all screen sizes

### Error Handling
- Global error interceptor
- User-friendly error messages
- Loading states for all async operations
- Form validation

## Testing Checklist

### Frontend
- [ ] Public homepage loads correctly
- [ ] Search filters inventory
- [ ] WhatsApp button links correctly
- [ ] Admin login works
- [ ] Protected routes redirect to login
- [ ] Inventory CRUD operations work
- [ ] WhatsApp group management works
- [ ] Broadcast sends successfully
- [ ] Responsive on mobile devices

### Backend
- [ ] API documentation accessible
- [ ] Authentication endpoints work
- [ ] All CRUD operations functional
- [ ] Database relationships correct
- [ ] Error responses formatted properly
- [ ] CORS configured correctly

## Next Steps

1. **Initial Setup:**
   - Run backend and create admin user
   - Configure environment variables
   - Test admin login

2. **Data Entry:**
   - Create table groups
   - Add yarn items
   - Add WhatsApp groups

3. **Testing:**
   - Verify public homepage
   - Test all admin functions
   - Send test broadcasts

4. **Production:**
   - Deploy backend
   - Deploy frontend
   - Configure production domains
   - Set up monitoring

## Support & Maintenance

### Regular Tasks
- Update yarn rates daily
- Monitor broadcast history
- Review failed broadcasts
- Backup database regularly

### Common Issues
- **401 Errors:** Token expired, re-login
- **CORS Errors:** Check API URL in .env.local
- **Connection Refused:** Ensure backend is running
- **WhatsApp Issues:** Verify group invite links

## License
Private project for HS Traders

---

**Created:** January 2026
**Version:** 1.0.0
