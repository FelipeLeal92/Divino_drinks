-- Banco de dados SQLite para armazenar leads e conteúdo do site
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

-- Tabela para conteúdo do site
CREATE TABLE IF NOT EXISTS content (
  section TEXT PRIMARY KEY,
  data TEXT -- JSON string
);

-- Inserir dados padrão
INSERT OR IGNORE INTO content (section, data) VALUES
('hero', '{"background_image":"imagens/hero-bg.webp","title":"Alta COQUETELARIA para eventos INESQUECÍVEIS","subtitle":"Somos especialistas em criar EXPERIENCIAS EXCLUSIVAS de Alta Coquetelaria, voltadas para quem valoriza o verdadeiro sabor da EXCELÊNCIA.","badges":[{"icon":"star","text":"Bartenders premiados"},{"icon":"house","text":"Receitas autorais"},{"icon":"heart","text":"Atendimento exclusivo"}]}'),
('about', '{"description":"Somos uma equipe de mixologistas que transforma eventos em <strong>experiências sensoriais</strong>. Apaixonados por <strong>eternizar momentos</strong> através dos nossos <strong>drinks</strong>, utilizamos uma carta que combina drinks autorais e clássicos, com ingredientes selecionados e atendimento exclusivo.\\n\\nCom um <strong>histórico de sucesso</strong> em eventos de diversos segmentos, somos reconhecidos como <strong>referência em excelência</strong> no serviço de bar. Entendemos que <strong>cada evento é único</strong>, por isso contamos com uma equipe de profissionais altamente qualificados para garantir um atendimento impecável e manter nosso elevado padrão de qualidade.","cards":[{"title":"Drinks personalizados","text":"Acreditamos que cada cliente é único. Por isso, desenvolvemos coquetéis exclusivos, criados especialmente para refletir a identidade do seu evento. Nossos drinks podem ser totalmente personalizados."},{"title":"Estrutura","text":"Nossa estrutura foi pensada para oferecer sofisticação e harmonia ao seu evento. Trabalhamos com materiais modernos e de alta qualidade, incluindo taças e copos de vidro, que elevam a experiência de cada drink"},{"title":"Profissionais e Atendimento","text":"Nosso maior diferencial está nas pessoas. A equipe da Divino Drinks é formada por profissionais preparados para entregar muito mais do que drinks impecáveis: oferecemos uma experiência de atendimento que valoriza cada detalhe."}]}'),
('services', '{"cards":[{"image":"imagens/coquetelaria_luxo.webp","title":"COQUETELARIA DE LUXO","text":"Nossa Alta Coquetelaria apresenta uma seleção impecável de drinks exclusivos, combinando sabor, criatividade e uma apresentação que impressiona a todos.\\n\\n<strong>Utilizamos peças de alto padrão, garantindo que a experiência visual seja tão marcante quanto o sabor de cada drink.</strong>"},{"image":"imagens/openbar.webp","title":"OPEN BAR INFINITO","text":"Nosso open bar é Infinito, sem pausas, sem surpresas e sem faltar bebida no meio da festa. O clima continua animado do primeiro ao último brinde.\\n\\n<strong>Nossa missão é proporcionar uma experiência completa, unindo sabor, diversão e tranquilidade. Você brinda, a gente cuida do resto.</strong>"},{"image":"imagens/welcome_drink.webp","title":"WELCOME DRINK","text":"Um coquetel de boas-vindas, servido com elegância para recepcionar seus convidados tanto na cerimônia quanto no início da festa, marcando o começo das celebrações com charme e sabor.\\n\\n<strong>Receba seus convidados com sofisticação desde o primeiro gole — drinks refrescantes e espumantes servidos com charme e excelência.</strong>"},{"image":"imagens/Degustacao.webp","title":"DEGUSTAÇÃO","text":"Oferecemos um menu exclusivo e totalmente personalizado, com drinks autorais criados sob medida para cada cliente e ocasião. Cada receita é pensada com carinho para harmonizar com o estilo da festa e refletir as preferências de quem celebra.\\n\\n<strong>É o momento ideal para conhecer nossa qualidade, conversar sobre preferências e garantir que tudo esteja no ponto certo para o grande dia</strong>"}]}'),
('testimonials', '{"testimonials":[{"image":"imagens/Depoimento/depoimento1.webp","quote":"\"Estão de parabéns! Uns drinks espetaculares! Eu não tomo álcool, mas meu marido que é espanhol ficou louco com as bebidas e me disse que a caipirinha foi a melhor que ele bebeu desde que viemos ao Brasil (estamos juntos há 21 anos). Imagine a delícia que ele achou.\"","author":"Marina & Lucas"},{"image":"imagens/Depoimento/depoimento2.webp","quote":"\"O bar foi o ponto alto do casamento. Drinks impecáveis e equipe atenciosa. Agilidade e padrão altíssimo durante a festa inteira\"","author":"Marcelo M."},{"image":"imagens/Depoimento/depoimento3.webp","quote":"\"Desde o primeiro contato, fiquei impressionado com o profissionalismo e atenção da equipe. No evento, cada detalhe foi impecável — dos drinks autorais ao cuidado com os convidados. Recebemos elogios a noite inteira e, sinceramente, já estamos pensando no próximo!\"","author":"Gabriela M."},{"image":"imagens/Depoimento/depoimento4.webp","quote":"\"Sério, eu nem sei por onde começar! Cada drink era mais lindo que o outro (e eu juro que experimentei TODOS 😅). A galera do bar era tão gente boa que parecia parte da festa. Já quero repetir, porque a noite foi simplesmente perfeita!\"","author":"Luiza R."}]}'),
('gallery', '{"albums":[{"name":"Evento 1","photos":["imagens/galeria/foto1.webp","imagens/galeria/foto2.webp"]},{"name":"Evento 2","photos":["imagens/galeria/foto3.webp"]}]}'),
('footer', '{"contact":"Contato: (11) 99999-9999","message":"Mensagem do footer"}');

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);