/**
 * Script to create an admin tailor account
 * Run with: node src/scripts/create-admin.js
 */
const { supabase } = require('../services/supabase.service');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function createAdminTailor() {
  const email = 'vocalunion8@gmail.com';
  const password = 'kem98@#$';
  const name = 'Admin User';
  const specialty = 'System Administration';

  console.log('Creating admin tailor account...');

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('tailors')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('Admin user already exists, updating role to admin...');
      
      // Update existing user to admin role
      const { data: updatedTailor, error: updateError } = await supabase
        .from('tailors')
        .update({ role: 'admin' })
        .eq('email', email)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating tailor role:', updateError);
        return;
      }
      
      console.log('Admin role assigned successfully to existing user:', updatedTailor.email);
      return;
    }

    // Create user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          specialty,
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return;
    }

    console.log('Auth account created:', authData.user.id);

    // Create tailor profile in the database
    const { data: tailor, error: tailorError } = await supabase
      .from('tailors')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          specialty,
          role: 'admin',
          experience: '5+ years',
          phone: '',
          rating: 5
        }
      ])
      .select()
      .single();

    if (tailorError) {
      console.error('Error creating tailor profile:', tailorError);
      return;
    }

    console.log('Admin tailor created successfully!');
    console.log('Email:', tailor.email);
    console.log('Role:', tailor.role);
    console.log('ID:', tailor.id);

    // Generate JWT token for testing
    const token = jwt.sign(
      { id: authData.user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('JWT Token for testing:', token);

  } catch (error) {
    console.error('Error creating admin tailor:', error);
  }
}

createAdminTailor();
