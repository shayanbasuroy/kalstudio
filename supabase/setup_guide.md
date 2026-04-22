# Kal Studio Supabase Schema Setup Guide

## Overview
This guide explains how to set up and maintain the Kal Studio database schema in Supabase.

## Files Structure
- `schema.sql` - Original complete schema (drops and recreates everything)
- `idempotent_schema.sql` - Safe, idempotent schema (recommended for production)
- `migrations/` - Incremental migration scripts
- `migrations/20260421_add_materials.sql` - Adds materials table
- `migrations/20260422_add_missing_columns.sql` - Adds missing columns to existing tables

## Quick Setup (Recommended)

### Option 1: Fresh Install (Development)
1. Go to your Supabase project SQL editor
2. Copy and paste the contents of `schema.sql`
3. Run the SQL

**Warning:** This will drop existing tables if uncommented. Use for fresh databases only.

### Option 2: Safe Update (Production)
1. Go to your Supabase project SQL editor
2. Copy and paste the contents of `idempotent_schema.sql`
3. Run the SQL
4. Then run `migrations/20260422_add_missing_columns.sql` to add any missing columns

## Database Schema Summary

### Core Tables
1. **users** - Extends Supabase auth.users with role ('owner', 'sales', 'developer') and status
2. **clients** - Client records with status ('lead', 'active', 'lost')
3. **gigs** - Projects with service types ('landing', 'multipage', 'custom')
4. **payments** - Client payments received
5. **payouts** - Staff payments with proof_url for payment proofs
6. **payment_details** - Staff banking/UPI details
7. **application_data** - Job applications from prospective staff
8. **materials** - Resource hub for staff (Strategy, Design Assets, Legal/Templates, Training)

### Key Features
- **Row Level Security (RLS)**: Full RLS policies for multi-tenant security
- **Automatic Timestamps**: updated_at triggers on relevant tables
- **Auth Integration**: Trigger to create user profile on signup
- **Performance Indexes**: Optimized indexes on frequently queried columns
- **Helper Views**: Revenue overview and staff payout summary views

## Security Model

### Roles and Permissions
- **Owner**: Full access to everything
- **Sales**: Can view/manage their own clients, view assigned gigs, view own payouts
- **Developer**: Can view assigned gigs, view own payouts, access materials
- **Public**: Can submit lead forms (clients with status='lead')

### RLS Policies Implemented
- Owners have full CRUD access on all tables
- Staff can only view their own data
- Public can only insert leads (not view other data)
- Active staff can view materials

## Common Tasks

### Adding a New Column to Existing Table
1. Create a new migration file in `migrations/` folder
2. Use pattern: `ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name type;`
3. Example: See `20260422_add_missing_columns.sql`

### Creating a New Table
1. Add to both `schema.sql` and `idempotent_schema.sql`
2. Include RLS policies and indexes
3. Consider adding to the helper views if relevant

### Resetting the Database
```sql
-- In development only
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
-- Then run schema.sql
```

## Troubleshooting

### "Column does not exist" Errors
Run the migration script: `migrations/20260422_add_missing_columns.sql`

### "Permission denied" Errors
1. Ensure RLS is enabled on the table
2. Check that the user has a corresponding record in the users table
3. Verify the user's role and status

### Performance Issues
1. Check that indexes exist on frequently queried columns
2. Use the helper views for complex queries
3. Monitor query performance in Supabase dashboard

## Development Notes

### Testing Locally
1. Use Supabase CLI: `supabase start`
2. Apply schema: `supabase db reset` or use the SQL files

### Sample Data
Uncomment the sample data section in `idempotent_schema.sql` for development.

### Environment Variables
Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
```

## Maintenance Schedule
- Monthly: Review and optimize indexes
- Quarterly: Audit RLS policies
- Before major releases: Run full schema validation

---

**Last Updated:** April 2025  
**Version:** 2.0