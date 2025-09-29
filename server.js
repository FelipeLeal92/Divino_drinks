require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração de Autenticação ---
// ATENÇÃO: Armazenar credenciais em texto plano é inseguro. 
// Em um ambiente de produção, use hashing (ex: bcrypt) e variáveis de ambiente.
const ADMIN_USER = {
    email: 'divinodrinks@gmail.com',
    password: 'manager123'
};

app.use(session({
    secret: 'your_very_secret_key_change_it', // Troque por uma chave secreta real e segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Para desenvolvimento. Em produção, use `true` com HTTPS.
}));

// Middleware para checar se o usuário está autenticado
const checkAuth = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// --- Fim da Configuração de Autenticação ---


// Carregar o banco de dados JSON
let db = {};
const dbPath = path.join(__dirname, 'db.json');

fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Erro ao ler db.json:', err);
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

// --- Rotas de Autenticação ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
        req.session.loggedin = true;
        req.session.email = email;
        res.redirect('/admin');
    } else {
        res.redirect('/login.html?error=1');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    });
});

// Rota protegida para a página de administração
app.get('/admin', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- Fim das Rotas de Autenticação ---


// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'imagens', 'uploads');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Rotas da API (protegidas) ---
app.post('/api/upload', checkAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }
    const imageUrl = `/imagens/uploads/${req.file.filename}`;
    res.status(201).json({ url: imageUrl });
});

app.get('/api/content', (req, res) => {
    res.status(200).json(db);
});

app.post('/api/content/:section', checkAuth, (req, res) => {
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

// Rota principal
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
