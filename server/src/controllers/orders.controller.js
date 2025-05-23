const supabase = require('../services/supabase.service');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all orders for the authenticated tailor
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { 
      status, 
      client_id, 
      search, 
      start_date, 
      end_date, 
      sort_by = 'created_at', 
      sort_order = 'desc',
      limit = 10, 
      page = 1 
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('orders')
      .select('*, clients(name, email)', { count: 'exact' });
    
    // Add tailor_id filter to only show orders for this tailor
    query = query.eq('tailor_id', tailorId);
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (client_id) {
      query = query.eq('client_id', client_id);
    }
    
    if (search) {
      query = query.or(`service.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      query = query.lte('created_at', end_date);
    }
    
    // Add sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: orders, error, count } = await query;
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        orders,
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
 * Get an order by ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const orderId = req.params.id;
    
    // Get order with client information
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, clients(name, email, phone, address, preferences, measurements)')
      .eq('id', orderId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (error || !order) {
      throw new ApiError('Order not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { 
      client_id, 
      service, 
      description, 
      amount, 
      status = 'pending', 
      due_date, 
      notes 
    } = req.body;
    
    // Check if client exists and belongs to this tailor
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .eq('tailor_id', tailorId)
      .single();
    
    if (clientError || !client) {
      throw new ApiError('Client not found', 404);
    }
    
    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          client_id,
          tailor_id: tailorId,
          service,
          description: description || '',
          amount,
          status,
          due_date,
          notes: notes || '',
          order_date: new Date()
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an order
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const orderId = req.params.id;
    const { 
      service, 
      description, 
      amount, 
      due_date, 
      notes 
    } = req.body;
    
    // Check if order exists and belongs to this tailor
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingOrder) {
      throw new ApiError('Order not found', 404);
    }
    
    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        service,
        description,
        amount,
        due_date,
        notes,
        updated_at: new Date()
      })
      .eq('id', orderId)
      .eq('tailor_id', tailorId)
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body;
    
    // Check if order exists and belongs to this tailor
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingOrder) {
      throw new ApiError('Order not found', 404);
    }
    
    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', orderId)
      .eq('tailor_id', tailorId)
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an order
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const orderId = req.params.id;
    
    // Check if order exists and belongs to this tailor
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingOrder) {
      throw new ApiError('Order not found', 404);
    }
    
    // Delete order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('tailor_id', tailorId);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order statistics summary
 */
exports.getOrderStatsSummary = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get total orders
    const { data: totalOrders, error: totalError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('tailor_id', tailorId);
    
    if (totalError) {
      throw new ApiError(totalError.message, 400);
    }
    
    // Get pending orders
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('tailor_id', tailorId)
      .eq('status', 'pending');
    
    if (pendingError) {
      throw new ApiError(pendingError.message, 400);
    }
    
    // Get in progress orders
    const { data: inProgressOrders, error: inProgressError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('tailor_id', tailorId)
      .eq('status', 'in_progress');
    
    if (inProgressError) {
      throw new ApiError(inProgressError.message, 400);
    }
    
    // Get completed orders
    const { data: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('tailor_id', tailorId)
      .eq('status', 'completed');
    
    if (completedError) {
      throw new ApiError(completedError.message, 400);
    }
    
    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('amount')
      .eq('tailor_id', tailorId)
      .eq('status', 'completed');
    
    if (revenueError) {
      throw new ApiError(revenueError.message, 400);
    }
    
    // Calculate total revenue
    const totalRevenue = revenueData.reduce((sum, order) => sum + parseFloat(order.amount), 0);
    
    res.status(200).json({
      success: true,
      data: {
        total_orders: totalOrders.length,
        pending_orders: pendingOrders.length,
        in_progress_orders: inProgressOrders.length,
        completed_orders: completedOrders.length,
        total_revenue: totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders grouped by status
 */
exports.getOrdersByStatus = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get all orders grouped by status
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status')
      .eq('tailor_id', tailorId);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Count orders by status
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      ready_for_fitting: 0,
      completed: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });
    
    // Format for chart data
    const chartData = Object.keys(statusCounts).map(status => ({
      status,
      count: statusCounts[status]
    }));
    
    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders grouped by month
 */
exports.getOrdersByMonth = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;
    
    // Get all orders for the specified year
    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, amount')
      .eq('tailor_id', tailorId)
      .gte('created_at', `${year}-01-01`)
      .lte('created_at', `${year}-12-31`);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Initialize monthly data
    const monthlyData = Array(12).fill().map((_, i) => ({
      month: i + 1,
      month_name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      order_count: 0,
      revenue: 0
    }));
    
    // Aggregate orders by month
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const monthIndex = orderDate.getMonth();
      
      monthlyData[monthIndex].order_count++;
      monthlyData[monthIndex].revenue += parseFloat(order.amount);
    });
    
    res.status(200).json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    next(error);
  }
};
