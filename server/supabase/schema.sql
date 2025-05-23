-- Tailorly Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tailors table (linked to Supabase auth users)
CREATE TABLE tailors (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  specialty TEXT,
  experience TEXT,
  role TEXT DEFAULT 'tailor',
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  preferences JSONB DEFAULT '{}',
  measurements JSONB DEFAULT '{}',
  tailor_id UUID NOT NULL REFERENCES tailors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tailor_id UUID NOT NULL REFERENCES tailors(id),
  service TEXT NOT NULL,
  description TEXT,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'ready_for_fitting', 'completed', 'cancelled')),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price DECIMAL NOT NULL,
  min_quantity DECIMAL NOT NULL,
  tailor_id UUID NOT NULL REFERENCES tailors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_clients_tailor_id ON clients(tailor_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_tailor_id ON orders(tailor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_inventory_tailor_id ON inventory(tailor_id);
CREATE INDEX idx_inventory_category ON inventory(category);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE tailors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Tailors can only access their own profile
CREATE POLICY tailor_select_own ON tailors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY tailor_update_own ON tailors
  FOR UPDATE USING (auth.uid() = id);

-- Tailors can only access their own clients
CREATE POLICY tailor_select_clients ON clients
  FOR SELECT USING (auth.uid() = tailor_id);

CREATE POLICY tailor_insert_clients ON clients
  FOR INSERT WITH CHECK (auth.uid() = tailor_id);

CREATE POLICY tailor_update_clients ON clients
  FOR UPDATE USING (auth.uid() = tailor_id);

CREATE POLICY tailor_delete_clients ON clients
  FOR DELETE USING (auth.uid() = tailor_id);

-- Tailors can only access their own orders
CREATE POLICY tailor_select_orders ON orders
  FOR SELECT USING (auth.uid() = tailor_id);

CREATE POLICY tailor_insert_orders ON orders
  FOR INSERT WITH CHECK (auth.uid() = tailor_id);

CREATE POLICY tailor_update_orders ON orders
  FOR UPDATE USING (auth.uid() = tailor_id);

CREATE POLICY tailor_delete_orders ON orders
  FOR DELETE USING (auth.uid() = tailor_id);

-- Tailors can only access their own inventory
CREATE POLICY tailor_select_inventory ON inventory
  FOR SELECT USING (auth.uid() = tailor_id);

CREATE POLICY tailor_insert_inventory ON inventory
  FOR INSERT WITH CHECK (auth.uid() = tailor_id);

CREATE POLICY tailor_update_inventory ON inventory
  FOR UPDATE USING (auth.uid() = tailor_id);

CREATE POLICY tailor_delete_inventory ON inventory
  FOR DELETE USING (auth.uid() = tailor_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tailors_updated_at
BEFORE UPDATE ON tailors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
