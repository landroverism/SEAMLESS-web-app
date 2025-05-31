const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

// Configure options with increased timeout and retry settings
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    fetch: customFetch,
    headers: {
      'x-connection-timeout': '30000', // 30 seconds timeout
    },
  },
};

// Custom fetch with timeout
async function customFetch(url, options = {}) {
  const timeout = 30000; // 30 seconds timeout
  
  // Create an abort controller to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Connection error to Supabase: ${error.message}`);
    if (error.name === 'AbortError') {
      throw new Error('Connection timeout. Please try again later.');
    }
    throw error;
  }
}

// Create Supabase client with custom options
const supabase = createClient(supabaseUrl, supabaseKey, options);

// For Supabase, we need to use the same client for both auth and database operations
// since we don't have a valid service role key
console.log('Using regular Supabase client for all operations');
const supabaseAdmin = supabase;

// Test connection function
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('tailors').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error.message);
    return false;
  }
}

// Run connection test on startup
testSupabaseConnection();

module.exports = { supabase, supabaseAdmin, testSupabaseConnection };
