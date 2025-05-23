/**
 * Script to check if the admin tailor account exists and can log in
 * Run with: node src/scripts/check-admin.js
 */
const { supabase } = require('../services/supabase.service');
require('dotenv').config();

async function checkAdminTailor() {
  const email = 'vocalunion8@gmail.com';
  const password = 'kem98@#$';

  console.log('Checking admin tailor account...');

  try {
    // Try to sign in with the admin credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login failed:', authError.message);
      return;
    }

    console.log('Login successful!');
    console.log('User ID:', authData.user.id);
    
    // Check if user has a tailor profile
    const { data: tailor, error: tailorError } = await supabase
      .from('tailors')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (tailorError) {
      console.error('Error fetching tailor profile:', tailorError.message);
      return;
    }

    if (!tailor) {
      console.log('No tailor profile found for this user.');
      return;
    }

    console.log('Tailor profile found:');
    console.log('Name:', tailor.name);
    console.log('Email:', tailor.email);
    console.log('Role:', tailor.role || 'regular');
    console.log('Specialty:', tailor.specialty);

  } catch (error) {
    console.error('Error checking admin tailor:', error);
  }
}

checkAdminTailor();
