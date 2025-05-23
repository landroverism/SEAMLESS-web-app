const supabase = require('../services/supabase.service');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all clients for the authenticated tailor
 */
exports.getAllClients = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { search, limit = 10, page = 1 } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' });
    
    // Add tailor_id filter to only show clients for this tailor
    query = query.eq('tailor_id', tailorId);
    
    // Add search functionality if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: clients, error, count } = await query;
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a client by ID
 */
exports.getClientById = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const clientId = req.params.id;
    
    // Get client with measurements and preferences
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (error || !client) {
      throw new ApiError('Client not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new client
 */
exports.createClient = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { name, email, phone, address, preferences, measurements } = req.body;
    
    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          name,
          email,
          phone: phone || '',
          address: address || '',
          preferences: preferences || {},
          measurements: measurements || {},
          tailor_id: tailorId
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a client
 */
exports.updateClient = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const clientId = req.params.id;
    const { name, email, phone, address } = req.body;
    
    // Check if client exists and belongs to this tailor
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingClient) {
      throw new ApiError('Client not found', 404);
    }
    
    // Update client
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        name,
        email,
        phone,
        address,
        updated_at: new Date()
      })
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a client
 */
exports.deleteClient = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const clientId = req.params.id;
    
    // Check if client exists and belongs to this tailor
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingClient) {
      throw new ApiError('Client not found', 404);
    }
    
    // Delete client
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('tailor_id', tailorId);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update client preferences
 */
exports.updateClientPreferences = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const clientId = req.params.id;
    const { preferences } = req.body;
    
    // Check if client exists and belongs to this tailor
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id, preferences')
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingClient) {
      throw new ApiError('Client not found', 404);
    }
    
    // Update client preferences
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        preferences,
        updated_at: new Date()
      })
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Client preferences updated successfully',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update client measurements
 */
exports.updateClientMeasurements = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const clientId = req.params.id;
    const { measurements } = req.body;
    
    // Check if client exists and belongs to this tailor
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id, measurements')
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingClient) {
      throw new ApiError('Client not found', 404);
    }
    
    // Update client measurements
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        measurements,
        updated_at: new Date()
      })
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Client measurements updated successfully',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders for a client
 */
exports.getClientOrders = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const clientId = req.params.id;
    
    // Check if client exists and belongs to this tailor
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingClient) {
      throw new ApiError('Client not found', 404);
    }
    
    // Get orders for this client
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', clientId)
      .eq('tailor_id', tailorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
