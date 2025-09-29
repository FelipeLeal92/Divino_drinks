#!/usr/bin/env node

/**
 * Script para inicializar o banco de dados SQLite
 * Uso: npm run db:init
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data.sqlite');

console.log('Inicializando banco de dados...');
console.log(`Caminho do banco: ${dbPath}`);

// Remover banco existente se solicitado
if (process.argv.includes('--force')) {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Banco de dados existente removido.');
  }
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Criando tabelas...');

  // Tabela de conteúdo
  db.run(`CREATE TABLE IF NOT EXISTS content (
    section TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela content:', err);
    } else {
      console.log('✓ Tabela content criada');
    }
  });

  // Tabela de leads
  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    tipo_evento TEXT NOT NULL,
    data_evento DATE NOT NULL,
    convidados INTEGER NOT NULL,
    mensagem TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela leads:', err);
    } else {
      console.log('✓ Tabela leads criada');
    }
  });

  // Tabela de uploads
  db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela uploads:', err);
    } else {
      console.log('✓ Tabela uploads criada');
    }
  });

  // Índices para performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_content_updated_at ON content(updated_at DESC)`);

  console.log('✓ Índices criados');
});

db.close((err) => {
  if (err) {
    console.error('Erro ao fechar banco:', err);
    process.exit(1);
  } else {
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('Você pode agora executar: npm start');
    process.exit(0);
  }
});
