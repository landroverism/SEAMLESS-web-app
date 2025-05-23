const supabase = require('../services/supabase.service');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get dashboard analytics data
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get total orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, amount, created_at')
      .eq('tailor_id', tailorId);
    
    if (ordersError) {
      throw new ApiError(ordersError.message, 400);
    }
    
    // Get total clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('tailor_id', tailorId);
    
    if (clientsError) {
      throw new ApiError(clientsError.message, 400);
    }
    
    // Get low stock items
    const { data: lowStockItems, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('tailor_id', tailorId)
      .lt('quantity', supabase.raw('min_quantity'));
    
    if (inventoryError) {
      throw new ApiError(inventoryError.message, 400);
    }
    
    // Calculate metrics
    const totalOrders = orders.length;
    const totalClients = clients.length;
    const totalRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + parseFloat(order.amount), 0);
    
    // Orders by status
    const ordersByStatus = {
      pending: orders.filter(order => order.status === 'pending').length,
      in_progress: orders.filter(order => order.status === 'in_progress').length,
      ready_for_fitting: orders.filter(order => order.status === 'ready_for_fitting').length,
      completed: orders.filter(order => order.status === 'completed').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length
    };
    
    // Recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    // Monthly revenue for the current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = Array(12).fill(0);
    
    orders
      .filter(order => order.status === 'completed' && new Date(order.created_at).getFullYear() === currentYear)
      .forEach(order => {
        const month = new Date(order.created_at).getMonth();
        monthlyRevenue[month] += parseFloat(order.amount);
      });
    
    res.status(200).json({
      success: true,
      data: {
        metrics: {
          total_orders: totalOrders,
          total_clients: totalClients,
          total_revenue: totalRevenue,
          low_stock_count: lowStockItems.length
        },
        orders_by_status: ordersByStatus,
        recent_orders: recentOrders,
        monthly_revenue: monthlyRevenue.map((revenue, index) => ({
          month: new Date(0, index).toLocaleString('default', { month: 'short' }),
          revenue
        })),
        low_stock_items: lowStockItems
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics
 */
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { period = 'year', year = new Date().getFullYear() } = req.query;
    
    // Get completed orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('amount, created_at')
      .eq('tailor_id', tailorId)
      .eq('status', 'completed');
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    let revenueData = [];
    
    if (period === 'year') {
      // Monthly revenue for the specified year
      const monthlyRevenue = Array(12).fill(0);
      
      orders
        .filter(order => new Date(order.created_at).getFullYear() === parseInt(year))
        .forEach(order => {
          const month = new Date(order.created_at).getMonth();
          monthlyRevenue[month] += parseFloat(order.amount);
        });
      
      revenueData = monthlyRevenue.map((revenue, index) => ({
        label: new Date(parseInt(year), index).toLocaleString('default', { month: 'short' }),
        value: revenue
      }));
    } else if (period === 'month') {
      // Daily revenue for the current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      const dailyRevenue = Array(daysInMonth).fill(0);
      
      orders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        })
        .forEach(order => {
          const day = new Date(order.created_at).getDate() - 1; // 0-indexed array
          dailyRevenue[day] += parseFloat(order.amount);
        });
      
      revenueData = dailyRevenue.map((revenue, index) => ({
        label: `${index + 1}`,
        value: revenue
      }));
    } else if (period === 'week') {
      // Daily revenue for the current week
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const dailyRevenue = Array(7).fill(0);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      orders
        .filter(order => new Date(order.created_at) >= startOfWeek)
        .forEach(order => {
          const day = new Date(order.created_at).getDay();
          dailyRevenue[day] += parseFloat(order.amount);
        });
      
      revenueData = dailyRevenue.map((revenue, index) => ({
        label: dayNames[index],
        value: revenue
      }));
    }
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
    
    // Calculate average order value
    const averageOrderValue = totalRevenue / (orders.length || 1);
    
    res.status(200).json({
      success: true,
      data: {
        revenue_data: revenueData,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        order_count: orders.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service popularity analytics
 */
exports.getServiceAnalytics = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('service, amount, status')
      .eq('tailor_id', tailorId);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Group orders by service
    const serviceData = {};
    
    orders.forEach(order => {
      if (!serviceData[order.service]) {
        serviceData[order.service] = {
          service: order.service,
          count: 0,
          revenue: 0,
          completed: 0
        };
      }
      
      serviceData[order.service].count++;
      
      if (order.status === 'completed') {
        serviceData[order.service].completed++;
        serviceData[order.service].revenue += parseFloat(order.amount);
      }
    });
    
    // Convert to array and sort by count
    const servicesArray = Object.values(serviceData)
      .sort((a, b) => b.count - a.count);
    
    // Calculate percentages
    const totalOrders = orders.length || 1;
    servicesArray.forEach(service => {
      service.percentage = (service.count / totalOrders) * 100;
    });
    
    res.status(200).json({
      success: true,
      data: {
        services: servicesArray,
        total_services: servicesArray.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get client analytics
 */
exports.getClientAnalytics = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, created_at')
      .eq('tailor_id', tailorId);
    
    if (clientsError) {
      throw new ApiError(clientsError.message, 400);
    }
    
    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('client_id, amount, status')
      .eq('tailor_id', tailorId)
      .eq('status', 'completed');
    
    if (ordersError) {
      throw new ApiError(ordersError.message, 400);
    }
    
    // Calculate client growth by month for the current year
    const currentYear = new Date().getFullYear();
    const monthlyGrowth = Array(12).fill(0);
    
    clients
      .filter(client => new Date(client.created_at).getFullYear() === currentYear)
      .forEach(client => {
        const month = new Date(client.created_at).getMonth();
        monthlyGrowth[month]++;
      });
    
    // Calculate client lifetime value
    const clientOrders = {};
    
    orders.forEach(order => {
      if (!clientOrders[order.client_id]) {
        clientOrders[order.client_id] = {
          total_spent: 0,
          order_count: 0
        };
      }
      
      clientOrders[order.client_id].total_spent += parseFloat(order.amount);
      clientOrders[order.client_id].order_count++;
    });
    
    // Calculate average values
    const clientValues = Object.values(clientOrders);
    const totalClients = clientValues.length || 1;
    
    const averageLifetimeValue = clientValues.reduce((sum, client) => sum + client.total_spent, 0) / totalClients;
    const averageOrdersPerClient = clientValues.reduce((sum, client) => sum + client.order_count, 0) / totalClients;
    
    // Find top clients by spending
    const topClients = Object.entries(clientOrders)
      .map(([clientId, data]) => ({
        client_id: clientId,
        total_spent: data.total_spent,
        order_count: data.order_count
      }))
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 5);
    
    // Get client details for top clients
    const topClientIds = topClients.map(client => client.client_id);
    
    let topClientDetails = [];
    if (topClientIds.length > 0) {
      const { data: clientDetails, error: detailsError } = await supabase
        .from('clients')
        .select('id, name, email')
        .in('id', topClientIds);
      
      if (!detailsError) {
        // Merge client details with spending data
        topClientDetails = topClients.map(client => {
          const details = clientDetails.find(c => c.id === client.client_id) || {};
          return {
            ...client,
            name: details.name,
            email: details.email
          };
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        total_clients: clients.length,
        monthly_growth: monthlyGrowth.map((count, index) => ({
          month: new Date(0, index).toLocaleString('default', { month: 'short' }),
          count
        })),
        average_lifetime_value: averageLifetimeValue,
        average_orders_per_client: averageOrdersPerClient,
        top_clients: topClientDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tailor performance analytics
 */
exports.getPerformanceAnalytics = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at, due_date')
      .eq('tailor_id', tailorId);
    
    if (ordersError) {
      throw new ApiError(ordersError.message, 400);
    }
    
    // Calculate on-time delivery rate
    const completedOrders = orders.filter(order => order.status === 'completed');
    const onTimeDeliveries = completedOrders.filter(order => {
      const dueDate = new Date(order.due_date);
      const completionDate = new Date(order.updated_at || order.created_at);
      return completionDate <= dueDate;
    });
    
    const onTimeRate = completedOrders.length > 0 
      ? (onTimeDeliveries.length / completedOrders.length) * 100 
      : 100;
    
    // Calculate average completion time (in days)
    const completionTimes = completedOrders.map(order => {
      const startDate = new Date(order.created_at);
      const endDate = new Date(order.updated_at || order.created_at);
      return (endDate - startDate) / (1000 * 60 * 60 * 24); // Convert to days
    });
    
    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;
    
    // Calculate order fulfillment rate
    const totalOrdersExcludingNew = orders.filter(order => order.status !== 'pending').length;
    const fulfillmentRate = totalOrdersExcludingNew > 0
      ? (completedOrders.length / totalOrdersExcludingNew) * 100
      : 100;
    
    // Calculate workload distribution (orders by month)
    const currentYear = new Date().getFullYear();
    const monthlyWorkload = Array(12).fill(0);
    
    orders
      .filter(order => new Date(order.created_at).getFullYear() === currentYear)
      .forEach(order => {
        const month = new Date(order.created_at).getMonth();
        monthlyWorkload[month]++;
      });
    
    res.status(200).json({
      success: true,
      data: {
        on_time_delivery_rate: onTimeRate,
        average_completion_time: averageCompletionTime,
        order_fulfillment_rate: fulfillmentRate,
        monthly_workload: monthlyWorkload.map((count, index) => ({
          month: new Date(0, index).toLocaleString('default', { month: 'short' }),
          count
        })),
        total_completed_orders: completedOrders.length,
        total_orders: orders.length
      }
    });
  } catch (error) {
    next(error);
  }
};
