# 🚀 Fenstri Platform - Deployment Guide

## Current Status
Your B2B window maintenance platform code is ready and pushed to GitHub. The deployment requires **manual configuration** of GitHub Pages and environment variables.

## 🔧 Required Steps to Complete Deployment

### Step 1: Enable GitHub Pages
1. Navigate to: `https://github.com/fenstrise/fenstri-complete/settings/pages`
2. Under **"Source"**, select **"GitHub Actions"**
3. Click **"Save"**

### Step 2: Configure Environment Variables
Navigate to: `https://github.com/fenstrise/fenstri-complete/settings/secrets/actions`

Add these repository secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_PHOTO_BUCKET` | Photo storage bucket name | `property-photos` |
| `VITE_DEFAULT_LANG` | Default language | `de` |

### Step 3: Trigger Deployment
1. Go to: `https://github.com/fenstrise/fenstri-complete/actions`
2. Click on the latest workflow run
3. Click **"Re-run all jobs"**

## 🎯 Expected Results

After completing the above steps:
- ✅ GitHub Actions will build and deploy your app
- ✅ Site will be live at: `https://fenstrise.github.io/fenstri-complete/`
- ✅ All features will be functional with proper environment variables

## 🏢 Platform Features

Your deployed platform includes:

### Public Pages
- **Homepage** - Professional landing page with SEO
- **Services** - Window maintenance service descriptions
- **Contact** - Contact forms and information

### Authentication System
- **Login/Register** - Secure authentication via Supabase
- **Password Reset** - Email-based password recovery

### Role-Based Portals

#### Customer Portal (`/portal/customer`)
- Dashboard with service overview
- Property management
- Service request creation
- Invoice viewing and download

#### Technician Portal (`/portal/technician`)
- Assigned work orders
- Job status updates
- Photo uploads
- Time tracking

#### Dispatcher Portal (`/portal/dispatcher`)
- Work order assignment
- Technician scheduling
- Priority management
- Status monitoring

#### Admin Portal (`/portal/admin`)
- User management
- Organization settings
- System analytics
- Billing management

## 🗄️ Database Setup

After deployment, set up your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the migration script from: `supabase/migrations/001_init.sql`

This creates all necessary tables, security policies, and initial data.

## 🔍 Troubleshooting

### Site Returns 404
- Verify GitHub Pages is enabled with "GitHub Actions" as source
- Check that the latest workflow run completed successfully

### Build Failures
- Ensure all environment variables are added as GitHub Secrets
- Check GitHub Actions logs for specific error messages

### Authentication Issues
- Verify Supabase URL and anon key are correct
- Ensure Supabase project is active and accessible

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify all environment variables are properly set
3. Ensure Supabase project is configured correctly

---

**Your professional B2B window maintenance platform is ready for deployment!** 🎉
