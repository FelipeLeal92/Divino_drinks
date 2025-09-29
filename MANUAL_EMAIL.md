# Manual de Configuração de Email

Este manual explica como configurar as variáveis no seu arquivo `.env` para permitir que o site envie notificações de novos leads por e-mail.

## 1. Entendendo as Variáveis

O sistema usa as seguintes variáveis de ambiente para se conectar ao seu provedor de e-mail e enviar as mensagens. Você precisará obter as informações de **SMTP** do seu provedor (Gmail, Outlook, KingHost, etc.).

- `EMAIL_HOST`: O endereço do servidor SMTP.
  - *Exemplo Gmail: `smtp.gmail.com`*
  - *Exemplo Outlook: `smtp-mail.outlook.com`*

- `EMAIL_PORT`: A porta de comunicação com o servidor SMTP. As mais comuns são:
  - `465` (usando SSL, que é o padrão mais seguro)
  - `587` (usando TLS)
  - O código está configurado para usar a conexão segura (`secure: true`) automaticamente se a porta for `465`.

- `EMAIL_USER`: O nome de usuário para autenticação no servidor SMTP. **Geralmente, é o seu endereço de e-mail completo.** No código, esta variável cumpre o papel do que você mencionou como `SMTP_USER`.

- `EMAIL_PASS`: A senha para autenticação.
  - **ATENÇÃO:** Se você usa serviços como o **Gmail** ou **Outlook**, é altamente recomendável (e muitas vezes obrigatório) gerar uma **"Senha de Aplicativo"** em vez de usar sua senha principal. Usar sua senha principal pode não funcionar e é menos seguro.
  - *Como gerar uma Senha de Aplicativo no Gmail:* Pesquise no Google por "Fazer login com senhas de app" e siga as instruções da página de ajuda do Google.

- `EMAIL_FROM`: O endereço de e-mail que aparecerá como **remetente** da mensagem. Para evitar que seus e-mails sejam marcados como spam, este deve ser o mesmo endereço de e-mail do `EMAIL_USER`. Esta variável corresponde ao que você chamou de `MAIL_FROM`.

- `MAIL_TO`: O endereço de e-mail que **receberá** as notificações de novos leads. Pode ser qualquer e-mail que você deseje.

## 2. Exemplo de Configuração no arquivo `.env`

Copie o bloco abaixo para o seu arquivo `.env` e substitua os valores de exemplo pelos seus próprios dados.

```env
# =================================
# CONFIGURAÇÃO DE ENVIO DE E-MAIL
# =================================

# Endereço do servidor SMTP do seu provedor.
EMAIL_HOST=smtp.example.com

# Porta do servidor SMTP (465 para SSL, 587 para TLS).
EMAIL_PORT=465

# Seu endereço de e-mail completo para login no servidor SMTP.
EMAIL_USER=seu-email@exemplo.com

# A SENHA DE APLICATIVO gerada pelo seu provedor de e-mail.
EMAIL_PASS=sua-senha-de-aplicativo

# O e-mail que aparecerá como remetente (deve ser o mesmo que EMAIL_USER).
EMAIL_FROM=seu-email@exemplo.com

# O e-mail que receberá as notificações de novos leads.
MAIL_TO=email-para-receber-notificacoes@exemplo.com
```

## 3. Passo Final

Após salvar as alterações no seu arquivo `.env`, **lembre-se de reiniciar o servidor** (`Ctrl+C` para parar e `npm start` para iniciar) para que as novas configurações sejam carregadas.
