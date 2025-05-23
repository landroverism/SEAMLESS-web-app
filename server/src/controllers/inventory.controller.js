const supabase = require('../services/supabase.service');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all inventory items for the authenticated tailor
 */
exports.getAllInventoryItems = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { 
      category, 
      search, 
      low_stock,
      sort_by = 'name', 
      sort_order = 'asc',
      limit = 10, 
      page = 1 
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('inventory')
      .select('*', { count: 'exact' });
    
    // Add tailor_id filter to only show inventory for this tailor
    query = query.eq('tailor_id', tailorId);
    
    // Add filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (low_stock === 'true') {
      query = query.lt('quantity', supabase.raw('min_quantity'));
    }
    
    // Add sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: items, error, count } = await query;
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        items,
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
 * Get an inventory item by ID
 */
exports.getInventoryItemById = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const itemId = req.params.id;
    
    // Get inventory item
    const { data: item, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', itemId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (error || !item) {
      throw new ApiError('Inventory item not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new inventory item
 */
exports.createInventoryItem = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const { 
      name, 
      category, 
      description, 
      quantity, 
      unit, 
      price, 
      min_quantity 
    } = req.body;
    
    // Create inventory item
    const { data: item, error } = await supabase
      .from('inventory')
      .insert([
        {
          name,
          category,
          description: description || '',
          quantity,
          unit,
          price,
          min_quantity,
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
      message: 'Inventory item created successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an inventory item
 */
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const itemId = req.params.id;
    const { 
      name, 
      category, 
      description, 
      quantity, 
      unit, 
      price, 
      min_quantity 
    } = req.body;
    
    // Check if item exists and belongs to this tailor
    const { data: existingItem, error: checkError } = await supabase
      .from('inventory')
      .select('id')
      .eq('id', itemId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingItem) {
      throw new ApiError('Inventory item not found', 404);
    }
    
    // Update inventory item
    const { data: item, error } = await supabase
      .from('inventory')
      .update({
        name,
        category,
        description,
        quantity,
        unit,
        price,
        min_quantity,
        updated_at: new Date()
      })
      .eq('id', itemId)
      .eq('tailor_id', tailorId)
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update inventory item quantity
 */
exports.updateInventoryQuantity = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const itemId = req.params.id;
    const { quantity, operation } = req.body;
    
    // Check if item exists and belongs to this tailor
    const { data: existingItem, error: checkError } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('id', itemId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingItem) {
      throw new ApiError('Inventory item not found', 404);
    }
    
    // Calculate new quantity based on operation
    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = existingItem.quantity + parseFloat(quantity);
        break;
      case 'subtract':
        newQuantity = Math.max(0, existingItem.quantity - parseFloat(quantity));
        break;
      case 'set':
        newQuantity = parseFloat(quantity);
        break;
      default:
        newQuantity = existingItem.quantity;
    }
    
    // Update inventory item quantity
    const { data: item, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date()
      })
      .eq('id', itemId)
      .eq('tailor_id', tailorId)
      .select()
      .single();
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventory quantity updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an inventory item
 */
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    const itemId = req.params.id;
    
    // Check if item exists and belongs to this tailor
    const { data: existingItem, error: checkError } = await supabase
      .from('inventory')
      .select('id')
      .eq('id', itemId)
      .eq('tailor_id', tailorId)
      .single();
    
    if (checkError || !existingItem) {
      throw new ApiError('Inventory item not found', 404);
    }
    
    // Delete inventory item
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId)
      .eq('tailor_id', tailorId);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock inventory items
 */
exports.getLowStockItems = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get low stock items
    const { data: items, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('tailor_id', tailorId)
      .lt('quantity', supabase.raw('min_quantity'))
      .order('quantity', { ascending: true });
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory items grouped by category
 */
exports.getItemsByCategory = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get all inventory items
    const { data: items, error } = await supabase
      .from('inventory')
      .select('category, quantity')
      .eq('tailor_id', tailorId);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Group items by category
    const categories = {};
    
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = {
          category: item.category,
          count: 0,
          total_quantity: 0
        };
      }
      
      categories[item.category].count++;
      categories[item.category].total_quantity += parseFloat(item.quantity);
    });
    
    // Convert to array for response
    const categoryData = Object.values(categories);
    
    res.status(200).json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get total inventory value
 */
exports.getTotalInventoryValue = async (req, res, next) => {
  try {
    const tailorId = req.user.id;
    
    // Get all inventory items with quantity and price
    const { data: items, error } = await supabase
      .from('inventory')
      .select('quantity, price')
      .eq('tailor_id', tailorId);
    
    if (error) {
      throw new ApiError(error.message, 400);
    }
    
    // Calculate total value
    const totalValue = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.price));
    }, 0);
    
    // Calculate by category
    const categoryValues = {};
    const { data: categoryItems, error: categoryError } = await supabase
      .from('inventory')
      .select('category, quantity, price')
      .eq('tailor_id', tailorId);
    
    if (categoryError) {
      throw new ApiError(categoryError.message, 400);
    }
    
    categoryItems.forEach(item => {
      if (!categoryValues[item.category]) {
        categoryValues[item.category] = 0;
      }
      
      categoryValues[item.category] += parseFloat(item.quantity) * parseFloat(item.price);
    });
    
    // Convert to array for response
    const categoryData = Object.keys(categoryValues).map(category => ({
      category,
      value: categoryValues[category]
    }));
    
    res.status(200).json({
      success: true,
      data: {
        total_value: totalValue,
        by_category: categoryData
      }
    });
  } catch (error) {
    next(error);
  }
};
