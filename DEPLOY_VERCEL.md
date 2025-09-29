# Tutorial: Como Fazer o Deploy do seu Projeto na Vercel

Este guia explica passo a passo como fazer o deploy do seu projeto Node.js/Express na plataforma Vercel.

---

## ⚠️ AVISO CRÍTICO: Armazenamento de Dados (`db.json`)

Antes de começar, é fundamental entender uma limitação da Vercel para este projeto:

- **O Problema:** A Vercel utiliza um ambiente "serverless", onde o sistema de arquivos não é permanente. Seu projeto atualmente salva novos leads e conteúdo do site no arquivo `db.json`. **Na Vercel, qualquer alteração feita neste arquivo será perdida** assim que o servidor "dormir" ou for reiniciado.
- **A Consequência:** O formulário de leads e o painel de administração não funcionarão como esperado para salvar novos dados.
- **A Solução (para o futuro):** Para que o salvamento de dados funcione na Vercel, você precisará migrar seu armazenamento para um banco de dados real e persistente. Algumas opções compatíveis com a Vercel são:
  - Vercel KV
  - Vercel Postgres
  - Supabase
  - MongoDB Atlas

**Este tutorial permitirá que você publique uma versão "somente leitura" do seu site. As funcionalidades que dependem de salvar dados no `db.json` não irão funcionar.**

---

## Passo 1: Preparação do Projeto

O arquivo `vercel.json` que criei para você já informa à Vercel como construir e executar seu `server.js`. Nenhuma outra alteração no código é necessária.

## Passo 2: Método de Deploy (Recomendado: GitHub)

A forma mais fácil e recomendada de fazer o deploy é via integração com o GitHub.

1.  **Crie um Repositório no GitHub:** Se o seu projeto ainda não está no GitHub, crie um novo repositório e envie seus arquivos para ele. Certifique-se de que o `vercel.json` está incluído.

2.  **Crie uma Conta na Vercel:** Acesse [vercel.com](https://vercel.com/) e crie uma conta (você pode usar sua conta do GitHub para se inscrever, o que facilita o processo).

3.  **Importe seu Projeto:**
    - No seu dashboard da Vercel, clique em **"Add New..." -> "Project"**.
    - Na tela seguinte, encontre e importe o repositório do seu projeto no GitHub.

4.  **Configure o Projeto:**
    - A Vercel deve detectar automaticamente que é um projeto Node.js. As configurações padrão devem funcionar graças ao arquivo `vercel.json`.
    - **O passo mais importante é configurar as Variáveis de Ambiente.**

## Passo 3: Configurar as Variáveis de Ambiente

O seu arquivo `.env` local não é enviado para a Vercel por segurança. Você precisa cadastrar essas variáveis diretamente na plataforma.

1.  Na tela de configuração do seu projeto na Vercel, abra a seção **"Environment Variables"**.

2.  Adicione, uma por uma, todas as variáveis que estão no seu arquivo `.env`. Isso inclui:
    - `WHATSAPP_PHONE`
    - `EMAIL_HOST`
    - `EMAIL_PORT`
    - `EMAIL_USER`
    - `EMAIL_PASS`
    - `EMAIL_FROM`
    - `MAIL_TO`
    - E qualquer outra variável secreta que você tenha.

3.  Clique em **"Deploy"**.

## Passo 4: Acessando seu Site

Após alguns instantes, a Vercel concluirá o deploy. Você receberá um link (ex: `seu-projeto.vercel.app`) para acessar seu site ao vivo.

Lembre-se que, a partir de agora, cada `git push` que você fizer para a branch principal do seu repositório no GitHub irá automaticamente gerar um novo deploy na Vercel.

---

### Método Alternativo: Vercel CLI

Se preferir não usar o GitHub, você pode fazer o deploy pela linha de comando.

1.  **Instale a Vercel CLI:** `npm install -g vercel`
2.  **Faça Login:** `vercel login`
3.  **Execute o Deploy:** No diretório raiz do seu projeto, apenas execute o comando `vercel`.
4.  Siga as instruções na tela. Você precisará informar o link do projeto e confirmar as configurações. As variáveis de ambiente ainda precisarão ser configuradas no dashboard do site da Vercel.
