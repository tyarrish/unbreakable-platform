#!/usr/bin/env tsx

/**
 * Verify Supabase Setup
 * Run this after configuring .env.local to test your connection
 */

import { createClient } from '@supabase/supabase-js'

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...\n')

  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || url === 'your-project-url-here') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured')
    console.log('   Set this in .env.local to your Supabase project URL')
    process.exit(1)
  }

  if (!anonKey || anonKey === 'your-anon-key-here') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not configured')
    console.log('   Set this in .env.local to your Supabase anon key')
    process.exit(1)
  }

  if (!serviceKey || serviceKey === 'your-service-role-key-here') {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured')
    console.log('   Set this in .env.local to your Supabase service role key')
    process.exit(1)
  }

  console.log('✅ Environment variables configured')
  console.log(`   URL: ${url}`)
  console.log(`   Anon Key: ${anonKey.substring(0, 20)}...`)
  console.log(`   Service Key: ${serviceKey.substring(0, 20)}...\n`)

  // Test connection
  try {
    const supabase = createClient(url, serviceKey)
    
    console.log('🔌 Testing connection to Supabase...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️  Connected, but migrations not run yet')
        console.log('   Run migrations next: see supabase/README.md\n')
      } else {
        console.error('❌ Connection error:', error.message)
        process.exit(1)
      }
    } else {
      console.log('✅ Successfully connected to Supabase!')
      console.log('✅ Database tables exist\n')
    }

    console.log('🎉 Setup verified! You can now run: pnpm dev\n')
  } catch (error) {
    console.error('❌ Failed to connect:', error)
    process.exit(1)
  }
}

verifySetup()

