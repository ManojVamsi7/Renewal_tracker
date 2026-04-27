# Supabase Setup & Data Migration Guide

## Overview

This system now uses Supabase PostgreSQL for persistent data storage, replacing the in-memory state management. All client and payment data is now stored and synced with Supabase.

## Database Schema

### Tables

1. **clients**
   - `id` (UUID) - Primary key
   - `student_id` (TEXT) - Unique student identifier
   - `name` (TEXT) - Client name
   - `email` (TEXT) - Email address
   - `phone` (TEXT) - Phone number
   - `department` (TEXT) - Department/Package name
   - `monthly_amount` (NUMERIC) - Monthly fee
   - `start_date` (TIMESTAMP) - Service start date
   - `renewal_date` (TIMESTAMP) - Next renewal date
   - `status` (TEXT) - 'active' or 'inactive'
   - `notes` (TEXT) - Optional notes
   - `created_at`, `updated_at` (TIMESTAMP) - Auto-managed

2. **payments**
   - `id` (UUID) - Primary key
   - `client_id` (UUID) - Foreign key to clients
   - `amount` (NUMERIC) - Payment amount
   - `payment_date` (TIMESTAMP) - When payment was made
   - `payment_method` (TEXT) - Type of payment
   - `notes` (TEXT) - Optional notes
   - `created_at`, `updated_at` (TIMESTAMP) - Auto-managed

3. **payment_verifications**
   - `id` (UUID) - Primary key
   - `payment_id` (UUID) - Foreign key to payments
   - `status` (TEXT) - 'pending', 'verified', 'failed', 'refunded'
   - `method` (TEXT) - Verification method
   - `verified_at` (TIMESTAMP) - When verified
   - `verified_by` (TEXT) - Who verified
   - `evidence` (TEXT) - Verification evidence
   - `notes` (TEXT) - Optional notes
   - `created_at`, `updated_at` (TIMESTAMP) - Auto-managed

## Setup Instructions

### 1. Create Database Tables (One-Time)

Go to Supabase SQL Editor and run the SQL script:

```bash
# Copy contents from scripts/init-db.sql
# Paste into Supabase > SQL Editor > New Query > Run
```

Or use the SQL Editor in your Supabase dashboard:
1. Go to SQL Editor
2. Click "New Query"
3. Copy-paste the entire contents of `scripts/init-db.sql`
4. Click "Run"

### 2. Import Existing Data

You can import data from CSV files. The system supports:

**CSV Format for Clients:**
```
studentid,name,email,department,date joined
STU001,John Doe,john@example.com,Engineering,2024-01-15
STU002,Jane Smith,jane@example.com,Marketing,2024-02-20
```

**CSV Format for Payments:**
```
studentid,month,amount,method,verified
STU001,2024-01,5000,bank_transfer,yes
STU001,2024-02,5000,credit_card,yes
```

Use the "Import CSV" button in the Clients page to import all clients at once.

### 3. Update Historical Payment Data

The application now supports manual monthly payment updates:

1. Go to Client Detail page
2. Click on any month in the "Payment Timeline"
3. A modal will open to record/update payment for that specific month
4. Enter amount, method, and any notes
5. Click "Save Payment"

This allows you to backfill all your historical payment data from your previous spreadsheets.

## Features

### Monthly Payment Updates
- Click any month in the payment timeline to update
- Supports recording payments for past months
- Automatically calculates renewal dates
- Tracks verification status

### Automatic Data Sync
- All changes immediately sync to Supabase
- Data persists across sessions
- Real-time updates when payments are recorded

### Bulk Import
- Import entire CSV of clients
- Auto-generates student IDs
- Validates for duplicates
- Calculates renewal dates automatically

## Troubleshooting

### Database Not Initialized
If you see errors about missing tables:
1. Go to Supabase Dashboard > SQL Editor
2. Run the `scripts/init-db.sql` script
3. Refresh the application

### Payment Records Not Saving
1. Check browser console for errors
2. Verify Supabase environment variables are set
3. Ensure your Supabase project has active database

### Import Failing
- Ensure CSV format matches expected columns
- Check for duplicate student IDs
- Verify all required fields are present

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POSTGRES_URL=your_postgres_url
```

All these should be automatically set if you connected Supabase integration.

## Migrating from Previous Data

1. **Export existing spreadsheet data** to CSV format
2. **Use Import CSV feature** to bulk load clients
3. **Use monthly update feature** to record all historical payments
4. **Verify all data** in the dashboard

The system now maintains billing cycles accurately and won't reset renewal dates based on payment timing!
