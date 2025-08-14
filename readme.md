# Divino Drinks — Landing Page

Landing page responsiva em preto e dourado, com captura de leads via backend Node + SQLite e envio de e-mail opcional.

## Requisitos
- Node.js 18+
- (Opcional) Credenciais SMTP para e-mail

## Instalação
1. npm install
2. Copie .env.example para .env e edite os valores.
3. npm start
4. Acesse http://localhost:3000

## Estrutura
- Frontend em /public (HTML, CSS, JS)
- Backend em /server (Express + SQLite)
- Banco SQLite criado automaticamente em /server/data.sqlite

## Deploy (opções)
- VPS/Servidor próprio:
  - Configure Node + PM2 (ou systemd), reverse proxy (Nginx) apontando para PORT.
  - Certificado TLS com Let's Encrypt.
- Serviços gerenciados:
  - Hospede o backend Node e a pasta /public como estático.
  - Defina variáveis .env no painel do provedor.
- Estático + Backend separado:
  - Publique /public em serviço de hosting estático.
  - Publique o backend em um serviço Node.
  - Ajuste no script.js o fetch('/api/lead') para a URL pública do backend (ex.: https://api.seudominio.com/api/lead).
  - No backend, habilite CORS.

## SEO & Performance
- Título e descrição únicos (edite no index.html).
- Imagens com loading="lazy".
- Open Graph e JSON-LD configurados.
- Substitua imagens Unsplash por fotos reais otimizadas (WebP, 1600px máx). 
- Gere favicon e og:image próprios.
- Considere minificar CSS/JS em produção.

## Banco de dados
- Schema em server/database.sql
- Tabela: leads (nome, email, telefone, tipo_evento, data_evento, convidados, mensagem, created_at)

## E-mail
- Preencha SMTP_* e MAIL_TO no .env.
- Se não preencher, o lead será salvo no banco, sem envio de e-mail.

## Personalização
- Paleta e fontes em styles.css (variáveis CSS).
- Conteúdo textual em index.html.
- Créditos no rodapé: "Criado por ...".

## Segurança
- Adicione validação do lado do servidor mais rígida se necessário.
- Rate limiting/recaptcha pode ser integrado em produção.