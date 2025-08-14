-- Banco de dados SQLite para armazenar leads
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  tipo_evento TEXT NOT NULL,
  data_evento TEXT NOT NULL,
  convidados INTEGER NOT NULL CHECK (convidados > 0),
  mensagem TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);