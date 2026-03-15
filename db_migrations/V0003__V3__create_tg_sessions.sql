CREATE TABLE t_p48002676_invoice_creation_ser.tg_sessions (
  chat_id BIGINT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'idle',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
