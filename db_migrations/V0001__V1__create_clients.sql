CREATE TABLE t_p48002676_invoice_creation_ser.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  inn TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
