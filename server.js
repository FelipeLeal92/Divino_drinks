require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Carregar o banco de dados JSON
let db = {};
const dbPath = path.join(__dirname, 'db.json');

fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Erro ao ler db.json:', err);
        // Se o arquivo não existir, pode-se iniciar com um objeto vazio
        db = {};
    } else {
        db = JSON.parse(data);
    }
});

// Função para salvar o banco de dados
const saveDb = () => {
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Erro ao salvar em db.json:', err);
        }
    });
};

// Middleware de Segurança com Helmet e CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], 
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], 
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://www.gstatic.com"], 
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://r2cdn.perplexity.ai"], 
      imgSrc: ["'self'", "data:", "http://localhost:3000"], 
      connectSrc: ["'self'", "ws:"], 
      objectSrc: ["'none'"], 
      upgradeInsecureRequests: [],
    },
  })
);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'imagens', 'uploads');
        // Cria o diretório se não existir
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rota de Upload
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }
    // Retorna a URL relativa da imagem
    const imageUrl = `/imagens/uploads/${req.file.filename}`;
    res.status(201).json({ url: imageUrl });
});


// Rota para obter todo o conteúdo
app.get('/api/content', (req, res) => {
    res.status(200).json(db);
});

// Rota para atualizar uma seção do conteúdo
app.post('/api/content/:section', (req, res) => {
    const { section } = req.params;
    const newData = req.body;

    if (db.hasOwnProperty(section)) {
        db[section] = newData;
        saveDb();
        res.status(200).json({ message: `Seção '${section}' atualizada com sucesso!` });
    } else {
        res.status(404).json({ error: `Seção '${section}' não encontrada.` });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});