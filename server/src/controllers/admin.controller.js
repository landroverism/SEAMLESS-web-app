const { supabase } = require('../services/supabase.service');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Set a user as admin
 * @route   POST /api/admin/set-role
 * @access  Private
 */
exports.setAdminRole = async (req, res, next) => {
  try {
    const { userId, adminCode } = req.body;
    
    // Verify admin code - this should be stored securely in environment variables
    // For this example, we'll hardcode it
    const ADMIN_SETUP_CODE = 'tailorly-admin-2025';
    
    if (adminCode !== ADMIN_SETUP_CODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code'
      });
    }
    
    // Update user role in Supabase
    const { data: updatedTailor, error: updateError } = await supabase
      .from('tailors')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating tailor role:', updateError);
      throw new ApiError('Failed to update tailor role', 500);
    }
    
    if (!updatedTailor) {
      throw new ApiError('Tailor not found', 404);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Admin role assigned successfully',
      data: {
        tailor: {
          id: updatedTailor.id,
          name: updatedTailor.name,
          email: updatedTailor.email,
          role: updatedTailor.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create admin user
 * @route   POST /api/admin/create
 * @access  Public (with admin code)
 */
exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password, name, specialty, adminCode } = req.body;
    
    // Verify admin code
    const ADMIN_SETUP_CODE = 'tailorly-admin-2025';
    
    if (adminCode !== ADMIN_SETUP_CODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code'
      });
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('tailors')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Update existing user to admin role
      const { data: updatedTailor, error: updateError } = await supabase
        .from('tailors')
        .update({ role: 'admin' })
        .eq('email', email)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating tailor role:', updateError);
        throw new ApiError('Failed to update tailor role', 500);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Admin role assigned to existing user',
        data: {
          tailor: {
            id: updatedTailor.id,
            name: updatedTailor.name,
            email: updatedTailor.email,
            role: updatedTailor.role
          }
        }
      });
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
      throw new ApiError(authError.message, 400);
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
      throw new ApiError('Failed to create tailor profile', 500);
    }

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        tailor: {
          id: tailor.id,
          name: tailor.name,
          email: tailor.email,
          role: tailor.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
