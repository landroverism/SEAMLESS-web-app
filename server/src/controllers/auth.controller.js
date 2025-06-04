const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { supabase } = require('../services/supabase.service');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Register a new tailor
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, specialty, experience, phone } = req.body;

    // Check if user already exists using admin client to bypass RLS
    const { data: existingUser } = await supabase
      .from('tailors')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }

    // Check if this is an existing user trying to register again
    const { data: existingAuth, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    }).catch(() => ({ data: null, error: null })); // Ignore sign-in errors
    
    // If user can sign in, they already exist
    if (existingAuth?.user) {
      // Get their profile using admin client to bypass RLS
      const { data: existingProfile } = await supabase
        .from('tailors')
        .select('*')
        .eq('id', existingAuth.user.id)
        .single();
      
      // If they have a profile, return it
      if (existingProfile) {
        // Generate JWT token for existing user
        const token = jwt.sign(
          { id: existingAuth.user.id, email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        return res.status(200).json({
          success: true,
          message: 'User already exists, logged in',
          data: {
            tailor: {
              id: existingProfile.id,
              name: existingProfile.name,
              email: existingProfile.email,
              specialty: existingProfile.specialty,
              emailVerified: true
            },
            token
          }
        });
      }
    }
    
    // Create new user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          specialty,
          experience: experience || '',
          phone: phone || ''
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      // If user exists but wrong password, guide them to login
      if (authError.status === 422 && authError.code === 'user_already_exists') {
        return res.status(400).json({
          success: false,
          message: 'Account already exists. Please login instead.',
          error: authError.message
        });
      }
      
      throw new ApiError(authError.message, 400);
    }
    
    // Log registration status (email verification is disabled)
    console.log('Registration status:', { 
      userId: authData.user?.id,
      email
    });

    // Create tailor profile in the database using admin client to bypass RLS
    const { data: tailor, error: tailorError } = await supabase
      .from('tailors')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          specialty,
          experience: experience || '',
          phone: phone || '',
          rating: 0
        }
      ])
      .select()
      .single();

    if (tailorError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new ApiError(tailorError.message, 400);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: authData.user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Email verification is disabled, so user is immediately registered
    res.status(201).json({
      success: true,
      message: 'Tailor registered successfully',
      data: {
        tailor: {
          id: tailor.id,
          name: tailor.name,
          email: tailor.email,
          specialty: tailor.specialty,
          emailVerified: true
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a tailor
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase auth
    let authData, authError;
    try {
      console.log(`Attempting to authenticate user: ${email}`);
      const authResponse = await supabase.auth.signInWithPassword({
        email,
        password
      });
      authData = authResponse.data;
      authError = authResponse.error;
    } catch (connectionError) {
      console.error('Supabase connection error:', connectionError);
      
      // Check if it's a network connectivity issue
      if (connectionError.code === 'EAI_AGAIN' || 
          connectionError.message?.includes('getaddrinfo') ||
          connectionError.message?.includes('fetch failed')) {
        return res.status(503).json({
          success: false,
          message: 'Network connectivity issue. Cannot connect to authentication service.',
          error: 'Please check your internet connection and try again later.',
          isNetworkError: true
        });
      }
      
      // Other connection errors
      return res.status(503).json({
        success: false,
        message: 'Authentication service unavailable. Please try again later.',
        error: connectionError.message || 'Connection timeout',
        isNetworkError: true
      });
    }

    if (authError) {
      console.error('Authentication error:', authError);
      throw new ApiError('Invalid credentials', 401);
    }

    // Get tailor profile
    let tailor, tailorError;
    try {
      const tailorResponse = await supabase
        .from('tailors')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      tailor = tailorResponse.data;
      tailorError = tailorResponse.error;
    } catch (connectionError) {
      console.error('Supabase connection error during profile retrieval:', connectionError);
      
      // If we can authenticate but can't get the profile due to network issues,
      // we'll still return a valid token but with a warning
      console.log('Creating fallback response with auth data only');
      
      // Create a JWT token with available user data
      const token = jwt.sign(
        { 
          id: authData.user.id,
          email: authData.user.email,
          role: authData.user.user_metadata?.role || 'tailor',
          isAdmin: authData.user.user_metadata?.isAdmin || false
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(206).json({
        success: true,
        message: 'Authenticated successfully, but profile data is unavailable. Some features may be limited.',
        token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: authData.user.user_metadata?.role || 'tailor',
          isAdmin: authData.user.user_metadata?.isAdmin || false
        },
        partialData: true
      });
    }

    if (tailorError || !tailor) {
      // Profile doesn't exist, create it automatically
      console.log('Creating missing tailor profile for user:', authData.user.id);
      
      // Get user metadata if available
      const userData = authData.user.user_metadata || {};
      
      // Try to create tailor profile
      try {
        const { data: newTailor, error: createError } = await supabase
          .from('tailors')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: userData.name || email.split('@')[0], // Use email username if no name
              specialty: userData.specialty || 'General Tailoring',
              experience: userData.experience || '',
              phone: userData.phone || '',
              rating: 0
            }
          ])
          .select()
          .single();
        
        if (createError) {
          console.warn('Could not create tailor profile:', createError);
          // Continue with login despite profile creation error
        }
        
        if (newTailor) {
          // If profile was created successfully, return it
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
              tailor: {
                id: newTailor.id,
                name: newTailor.name,
                email: newTailor.email,
                specialty: newTailor.specialty,
                role: newTailor.role || 'user',
                isAdmin: newTailor.role === 'admin',
                emailVerified: true
              },
              token: jwt.sign(
                { 
                  id: authData.user.id, 
                  email,
                  role: newTailor.role || 'user',
                  isAdmin: newTailor.role === 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
              )
            }
          });
        }
      } catch (profileError) {
        console.error('Error in profile creation:', profileError);
        // Continue with login despite profile creation error
      }
      
      // If we couldn't create a profile, return a minimal user object based on auth data
      // This allows login to succeed even if profile creation fails due to RLS
      const username = userData.name || email.split('@')[0];
      const userRole = userData.role || 'user';
      const isAdmin = userRole === 'admin';
      
      // Generate token with available information
      const token = jwt.sign(
        { 
          id: authData.user.id, 
          email,
          role: userRole,
          isAdmin
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Login successful (using auth data)',
        data: {
          tailor: {
            id: authData.user.id,
            name: username,
            email: email,
            specialty: userData.specialty || 'General Tailoring',
            role: userRole,
            isAdmin,
            emailVerified: true
          },
          token
        }
      });
    }

    // Check if user has admin role
    const isAdmin = tailor.role === 'admin';
    
    // Generate JWT token with role information
    const token = jwt.sign(
      { 
        id: tailor.id, 
        email,
        role: tailor.role || 'user',
        isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        tailor: {
          id: tailor.id,
          name: tailor.name,
          email: tailor.email,
          specialty: tailor.specialty,
          role: tailor.role || 'user',
          isAdmin,
          emailVerified: true
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current tailor profile
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: tailor, error } = await supabase
      .from('tailors')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !tailor) {
      throw new ApiError('Tailor profile not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: tailor.id,
        name: tailor.name,
        email: tailor.email,
        specialty: tailor.specialty,
        experience: tailor.experience,
        phone: tailor.phone,
        rating: tailor.rating,
        created_at: tailor.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout a tailor
 */
exports.logout = async (req, res, next) => {
  try {
    // With JWT, we don't need to do anything server-side
    // The client should remove the token
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update tailor profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, specialty, experience, phone } = req.body;

    // Update profile
    const { data: tailor, error } = await supabase
      .from('tailors')
      .update({
        name: name,
        specialty: specialty,
        experience: experience,
        phone: phone,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new ApiError('Failed to update profile', 400);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: tailor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Request password reset from Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`
    });

    if (error) {
      throw new ApiError(error.message, 400);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      throw new ApiError(error.message, 400);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};
