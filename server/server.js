// Backend completo: Express + SQLite + Multer + Socket.IO + Nodemailer
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');

// E-mail opcional
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Banco SQLite
const dbFile = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbFile);

// Cria tabela se não existir
try {
  const schema = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf-8');
  db.exec(schema);
} catch (err) {
  console.error('Erro ao ler arquivo schema:', err);
}

// Rota de health-check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Rota para obter conteúdo do site
app.get('/api/content', (req, res) => {
  const query = 'SELECT section, data FROM content';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao obter conteúdo.' });
    }
    const content = {};
    rows.forEach(row => {
      try {
        content[row.section] = JSON.parse(row.data);
      } catch (e) {
        console.error(`Erro ao parsear JSON da seção ${row.section}:`, e);
        content[row.section] = {};
      }
    });
    res.json(content);
  });
});

// Rota para atualizar conteúdo (simples, sem auth)
app.post('/api/content/:section', (req, res) => {
  const { section } = req.params;
  const data = JSON.stringify(req.body);
  
  const query = 'INSERT OR REPLACE INTO content (section, data) VALUES (?, ?)';
  db.run(query, [section, data], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar conteúdo.' });
    }
    
    // Notificar todos os clientes conectados sobre a atualização
    io.emit('contentUpdated', { section, data: req.body });
    
    res.json({ ok: true });
  });
});

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
        
        console.log(`E-mail enviado com sucesso para lead ID: ${this.lastID}`);
      } catch (mailErr) {
        console.error('Falha ao enviar e-mail:', mailErr.message);
        return res.status(500).json({ error: `Falha ao enviar e-mail: ${mailErr.message}` })
      }
    }
    
    res.json({ ok: true, id: this.lastID });
  });
});


app.get('/api/*', (req, res) => {
    // Deixa as rotas API normais funcionarem
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Fallback SPA/estático
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});