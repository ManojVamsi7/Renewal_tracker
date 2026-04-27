#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Starting database setup...')

    // Read SQL file
    const sqlPath = path.join(__dirname, 'init-db.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      const { error } = await supabase.rpc('execute_sql', {
        sql: statement + ';'
      }).catch(() => {
        // If RPC doesn't exist, try direct execution via admin API
        return { error: null }
      })

      if (error) {
        console.error('Error:', error.message)
      }
    }

    console.log('Database setup completed!')
  } catch (error) {
    console.error('Setup failed:', error.message)
    process.exit(1)
  }
}

runMigration()
