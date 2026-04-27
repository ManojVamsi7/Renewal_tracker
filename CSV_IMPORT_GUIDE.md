# CSV Import Guide - Client Management System

## Overview
The system now supports bulk CSV import, filtering, and the new field structure with studentId and department.

## Field Changes

### Previous Structure
- `servicePackage` → renamed to `department`
- No student identifier

### New Structure
- `studentId` (new) - Unique identifier for each student
- `name` - Full name of the student/client
- `email` - Email address
- `phone` - Contact number (empty for imports, can be filled later)
- `department` - Department/program name
- `monthlyAmount` - Monthly subscription cost (defaults to 0 for imports)
- `startDate` (from CSV: "date joined") - When the subscription started
- `renewalDate` - Auto-calculated as startDate + 1 month, same day

## CSV File Format

### Required Columns
```
studentid,name,email,department,date joined
STU001,John Doe,john@example.com,Engineering,2024-01-15
STU002,Jane Smith,jane@example.com,Marketing,2024-01-20
STU003,Bob Johnson,bob@example.com,Sales,2024-02-01
```

### Date Format
- Use `YYYY-MM-DD` format for dates
- Example: `2024-01-15`

### Important Notes
- Student ID must be unique
- Email must be valid
- Department field accepts any text
- All fields are required

## How to Import

1. **Click "Import CSV" button** on the Clients page
2. **Select CSV file** from your computer
3. **Review validation** - System checks for:
   - All required columns present
   - Valid email addresses
   - No missing data
   - Unique student IDs
4. **Preview data** - See first 10 rows to verify
5. **Confirm import** - System will import all clients
6. **Success** - Clients appear in client list with:
   - Auto-calculated renewal dates
   - Active status
   - Import timestamp in notes

## Search and Filter Features

### Filter by All (Default)
Searches across studentId, name, email, and department

### Filter by Student ID
- Enter student ID number (e.g., STU001)
- Shows matching records

### Filter by Name
- Enter partial or full name
- Case-insensitive search

## Viewing Imported Clients

### Client List Table
Columns display:
- Student ID (unique identifier in monospace)
- Name
- Email
- Department
- Monthly Amount
- Renewal Date
- Status (Active/Inactive)
- Actions (Edit/Delete)

### Client Detail View
Shows:
- Student ID
- Full name
- Department
- Email
- Phone
- Monthly Amount
- Start Date
- Renewal Date
- Payment History
- Payment Verification Status

## Auto-Renewal Calculation

### Example
- **Import Date**: April 19, 2024
- **First Renewal**: May 19, 2024
- **Late Payment**: May 25, 2024
- **Next Renewal**: June 19, 2024 (maintains original cycle)

The system maintains the original subscription day regardless of when payment is made.

## Removing Demo Data

### Clear All Clients Button
- Red trash icon in top right (only visible if clients exist)
- Confirms before deletion
- Removes all clients from system
- Use this after importing real data

## Updating After Import

### Edit Individual Client
- Click "Edit" on any client row
- Update any field (studentId, name, email, department, etc.)
- Phone and monthly amount default to empty/0 on import but can be updated

### Delete Individual Client
- Click "Delete" on any client row
- Confirms before deletion

## Field Mapping in Calculations

All calculations and functions that previously used `servicePackage` now use `department`:
- Reports
- Client detail views
- Form validations
- Table displays

## Notes

- Renewal dates are automatically calculated from start date
- Students are set to "Active" status on import
- Phone numbers must be added manually after import (not in CSV)
- Monthly amounts should be updated after import if needed
- Import creates a timestamp note for record-keeping
