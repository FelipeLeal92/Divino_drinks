// Backend simples: Express + SQLite + (opcional) Nodemailer
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// E-mail opcional
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Banco SQLite
const dbFile = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbFile);

// Cria tabela se não existir
const schema = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf-8');
db.exec(schema);

// Rota de health-check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Rota para receber leads
app.post('/api/lead', (req, res) => {
  const {
    nome, email, telefone, tipoEvento, dataEvento, convidados, mensagem
  } = req.body || {};

  if (!nome || !email || !telefone || !tipoEvento || !dataEvento || !convidados) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const stmt = db.prepare(`
    INSERT INTO leads (nome, email, telefone, tipo_evento, data_evento, convidados, mensagem)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([nome, email, telefone, tipoEvento, dataEvento, Number(convidados), mensagem || null], async function(err){
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar lead.' });
    }

    // Envio de e-mail (opcional)
    if (process.env.SMTP_HOST && process.env.MAIL_TO) {
      try {
          const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
          }
        });

        const html = `
          <h2>Novo lead — Divino Drinks</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${telefone}</p>
          <p><strong>Tipo de evento:</strong> ${tipoEvento}</p>
          <p><strong>Data do evento:</strong> ${dataEvento}</p>
          <p><strong>Convidados:</strong> ${convidados}</p>
          <p><strong>Mensagem:</strong><br/> ${mensagem ? mensagem.replace(/\n/g,'<br>') : '-'}</p>
          <p style="font-size:12px;color:#666">ID do lead: ${this.lastID}</p>
        `;

        await transporter.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER,
          to: process.env.MAIL_TO,
          subject: `Novo lead — ${nome} (${tipoEvento})`,
          html
        });
      } catch (mailErr) {
        console.error('Falha ao enviar e-mail:', mailErr.message);
        return res.status(500).json({ error: `Falha ao enviar e-mail: ${mailErr.message}` })
      }
    }

    res.json({ ok: true, id: this.lastID });
  });
});

// Fallback SPA/estático
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});