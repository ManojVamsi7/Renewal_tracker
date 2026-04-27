-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  monthly_amount NUMERIC(10, 2) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  renewal_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'bank_transfer', 'check', 'cash', 'other')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_verifications table
CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'refunded')),
  method TEXT CHECK (method IN ('manual', 'invoice', 'receipt', 'statement', 'other')),
  verified_at TIMESTAMP,
  verified_by TEXT,
  evidence TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_clients_renewal_date ON clients(renewal_date);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to clients
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE
  ON clients FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to payments
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE
  ON payments FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to payment_verifications
CREATE TRIGGER update_payment_verifications_updated_at BEFORE UPDATE
  ON payment_verifications FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
