# Fenstri - B2B Window Maintenance Platform

A complete, production-ready B2B web platform for window maintenance services with distinct portals for customers, dispatchers/admins, and technicians.

## 🏗️ Architecture

- **Frontend**: Vite + React + TypeScript with React Router
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF (client-side) + Edge Functions (server-side)
- **Deployment**: Vercel (recommended) or GitHub Pages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd fenstri
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration script:
   ```sql
   -- Copy and paste the entire content of supabase/migrations/001_init.sql
   ```
3. Go to **Storage** and verify the `workorder-photos` bucket was created
4. Get your project credentials from **Settings > API**

### 3. Environment Configuration

```bash
cd app
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PHOTO_BUCKET=workorder-photos
VITE_DEFAULT_LANG=de
```

### 4. Install Dependencies & Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## 📋 Initial Data Setup

### Create Admin User

1. Register a new account through the app
2. In Supabase SQL Editor, update the user role:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin@email.com';
   ```

### Sample Organization Data

```sql
-- Create sample organization
INSERT INTO organizations (name, address_line1, city, postal_code, country, phone, email)
VALUES ('Musterfirma GmbH', 'Musterstraße 123', 'Berlin', '10115', 'Deutschland', '+49 30 12345678', 'info@musterfirma.de');

-- Get the organization ID and update your profile
UPDATE profiles 
SET org_id = (SELECT id FROM organizations WHERE name = 'Musterfirma GmbH' LIMIT 1)
WHERE email = 'your-admin@email.com';

-- Create sample property
INSERT INTO properties (org_id, name, address_line1, city, postal_code, country)
VALUES (
  (SELECT org_id FROM profiles WHERE email = 'your-admin@email.com' LIMIT 1),
  'Bürogebäude Zentrum',
  'Hauptstraße 456',
  'Berlin',
  '10117',
  'Deutschland'
);

-- Create sample work order
INSERT INTO work_orders (
  org_id, 
  property_id, 
  service, 
  description, 
  status,
  created_by
)
VALUES (
  (SELECT org_id FROM profiles WHERE email = 'your-admin@email.com' LIMIT 1),
  (SELECT id FROM properties WHERE name = 'Bürogebäude Zentrum' LIMIT 1),
  'maintenance',
  'Jährliche Wartung aller Fenster im Erdgeschoss',
  'draft',
  (SELECT id FROM profiles WHERE email = 'your-admin@email.com' LIMIT 1)
);
```

## 🎯 User Roles & Access

### Customer Portal (`/portal/customer`)
- **Dashboard**: Overview of properties and recent work orders
- **Properties**: Manage building properties and windows
- **Requests**: Submit service requests and track status
- **Invoices**: View and download invoices as PDF

### Technician Portal (`/portal/technician`)
- **Dashboard**: Assigned work orders and daily schedule
- **Work Orders**: List with filters and search
- **Work Order Details**: Checklist, photo upload, status updates
- Mobile-optimized interface

### Dispatcher Portal (`/portal/dispatcher`)
- **Dashboard**: System overview and quick actions
- **Work Orders**: Assign technicians and manage scheduling
- **Calendar**: Visual schedule management

### Admin Portal (`/portal/admin`)
- **Dashboard**: System metrics and alerts
- **User Management**: Create/edit users and roles
- **Reports**: Analytics and audit logs
- **Settings**: System configuration

## 🔐 Security Features

- **Row Level Security (RLS)**: All data scoped by organization
- **Role-based Access Control**: Strict permission system
- **Secure File Upload**: Photos stored in Supabase Storage
- **Audit Logging**: Track all system changes

## 📱 Key Features

### Photo Management
- Upload work order photos via drag-and-drop
- Automatic compression and storage in Supabase
- Secure access with organization-based permissions

### PDF Invoice Generation
- **Client-side**: Instant PDF download with jsPDF
- **Server-side**: Edge Function for advanced formatting
- Professional invoice templates with company branding

### SEO Optimization
- Public landing pages for services and locations
- Structured data (JSON-LD) for search engines
- Sitemap and robots.txt included

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard
4. Configure custom domain if needed

### GitHub Pages

1. Set repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Push to main branch - automatic deployment via GitHub Actions

## 🔧 Edge Functions Setup

Deploy Supabase Edge Functions for advanced features:

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy generate-invoice-pdf
supabase functions deploy stripe-webhook

# Set environment variables
supabase secrets set STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## 📊 Database Schema

### Core Tables
- `organizations` - Multi-tenant organization data
- `profiles` - User profiles with role-based access
- `properties` - Customer building properties
- `windows` - Individual window tracking
- `work_orders` - Service requests and assignments
- `work_order_items` - Detailed service items
- `photos` - Work order documentation
- `invoices` - Billing and payment tracking

### Security
- All tables have RLS policies enforcing organization boundaries
- `current_org_id()` function ensures data isolation
- Audit logging for compliance

## 🎨 Customization

### Branding
- Update company info in `src/pdf/invoicePdf.ts`
- Modify colors in `tailwind.config.js`
- Replace favicon and logos in `public/`

### Localization
- German language by default
- Add translations in component files
- Configure `VITE_DEFAULT_LANG` for other languages

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Supabase Connection Issues**
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are properly configured

**Photo Upload Failures**
- Verify storage bucket exists and has correct policies
- Check file size limits (default: 10MB)
- Ensure user is authenticated

### Development Tips

```bash
# Run with debug logging
DEBUG=* npm run dev

# Build for production testing
npm run build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📈 Performance

- **Bundle Size**: Optimized with Vite tree-shaking
- **Images**: Automatic compression for uploads
- **Caching**: React Query for efficient data fetching
- **CDN**: Static assets served via Vercel/GitHub Pages

## 🔒 Environment Variables

### Required
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional
```env
VITE_PHOTO_BUCKET=workorder-photos
VITE_DEFAULT_LANG=de
GH_PAGES_BASE=/repo-name  # For GitHub Pages only
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Supabase documentation for backend issues

---

**Built with ❤️ for professional window maintenance services**
