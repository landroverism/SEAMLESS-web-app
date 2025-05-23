const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

// Regular client for auth operations
const supabase = createClient(supabaseUrl, supabaseKey);

// For Supabase, we need to use the same client for both auth and database operations
// since we don't have a valid service role key
console.log('Using regular Supabase client for all operations');
const supabaseAdmin = supabase;

module.exports = { supabase, supabaseAdmin };
