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

// Função para obter dados da galeria
function getGalleryData() {
  return {
    1: [
      { src: "imagens/large/large_drink3.webp", alt: "Foto 1 - Drinks" },
      { src: "imagens/large/large_drink2.webp", alt: "Foto 2 - Bar Clássico" },
      { src: "imagens/large/large_drink1.webp", alt: "Foto 3 - Bar Clássico" },
      { src: "imagens/large/large_drink4.webp", alt: "Foto 3 - Bar Clássico" },
      { src: "imagens/large/large_drink5.webp", alt: "Foto 3 - Bar Clássico" },
    ],
    2: [
      { src: "imagens/large/large_placa.webp", alt: "Foto 1 - Drinks Autorais" },
      { src: "imagens/large/large_tacas1.webp", alt: "Foto 2 - Drinks Autorais" },
      { src: "imagens/large/large_tacas2.webp", alt: "Foto 3 - Drinks Autorais" },
      { src: "imagens/large/large_balcao2.webp", alt: "Foto 3 - Drinks Autorais" },
      { src: "imagens/large/large_tacas3.webp", alt: "Foto 3 - Drinks Autorais" },
    ],
    3: [
      { src: "imagens/large/large_convidada1.webp", alt: "Foto 1 - Eventos Especiais" },
      { src: "imagens/large/large_convidada2.webp", alt: "Foto 2 - Eventos Especiais" },
      { src: "imagens/large/large_convidada3.webp", alt: "Foto 3 - Eventos Especiais" },
      { src: "imagens/large/large_convidada4.webp", alt: "Foto 2 - Eventos Especiais" },
      { src: "imagens/large/large_convidada5.webp", alt: "Foto 2 - Eventos Especiais" },
      { src: "imagens/large/large_convidada6.webp", alt: "Foto 2 - Eventos Especiais" },
      { src: "imagens/large/large_convidada7.webp", alt: "Foto 2 - Eventos Especiais" }
    ]
  };
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'imagens', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// API routes
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log('Upload request received:', req.file);
  
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  
  // Return the relative path for the client
  const url = `/imagens/uploads/${req.file.filename}`;
  console.log('File uploaded successfully:', url);
  res.json({ url: url });
});

// Serve static files
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

// Rota para obter dados da galeria
// Rota para obter dados da galeria
app.get('/api/gallery', (req, res) => {
    try {
        // Tenta obter do banco de dados primeiro
        db.get('SELECT data FROM content WHERE section = "gallery"', [], (err, row) => {
            if (err) {
                console.error('Erro ao buscar galeria do banco:', err);
                // Se falhar, retorna os dados padrão
                return res.json(getGalleryData());
            }
            
            if (row) {
                try {
                    const galleryData = JSON.parse(row.data);
                    if (galleryData.albums) {
                        // Converte formato do banco para formato do lightbox
                        const albumsData = {};
                        Object.keys(galleryData.albums).forEach(key => {
                            albumsData[key] = galleryData.albums[key].photos.map(photo => ({
                                src: photo,
                                alt: `Foto do álbum ${galleryData.albums[key].name}`
                            }));
                        });
                        return res.json(albumsData);
                    }
                } catch (e) {
                    console.error('Erro ao parsear dados da galeria:', e);
                }
            }
            
            // Retorna dados padrão se não encontrar no banco
            res.json(getGalleryData());
        });
    } catch (e) {
        console.error('Erro na rota da galeria:', e);
        res.json(getGalleryData());
    }
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

// Rota para atualizar dados da galeria
app.post('/api/gallery', (req, res) => {
  const { albums } = req.body;
  
  // Converte os dados do formato admin para o formato do lightbox
  const albuns = {};
  albums.forEach((album, index) => {
    const albumId = (index + 1).toString();
    albuns[albumId] = album.photos.map(photo => ({
      src: photo,
      alt: `Foto do álbum ${album.name}`
    }));
  });

  // Salva no banco de dados
  const data = JSON.stringify({ albums: albuns });
  const query = 'INSERT OR REPLACE INTO content (section, data) VALUES (?, ?)';
  db.run(query, ['gallery', data], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar galeria.' });
    }
    
    // Notifica todos os clientes
    io.emit('galleryUpdated', albuns);
    
    res.json({ ok: true });
  });
});

// Socket.IO para atualização em tempo real
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
    
    // Envia dados da galeria quando um cliente se conecta
    socket.emit('galleryData', getGalleryData());
});

app.get('/api/gallery-socket', (req, res) => {
    res.json(getGalleryData());
});

// Fallback SPA/estático
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});