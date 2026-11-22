# AT2 — Entrega Contínua com Docker, GitHub Actions e Deploy no Render

Projeto acadêmico desenvolvido para a disciplina de **Integração e Entrega Contínua (IEC)** da FATEC, com o objetivo de implementar uma esteira automatizada de CI/CD utilizando Docker, GitHub Actions e deploy no Render.

A aplicação consiste em uma API REST para gerenciamento de caminhões, desenvolvida com Node.js, Express, TypeScript e PostgreSQL.

O processo automatiza a validação do código, a construção da imagem Docker e a publicação da aplicação em produção por meio de um Deploy Hook.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Node.js 24 | Ambiente de execução |
| Express 5 | Framework para API REST |
| TypeScript | Tipagem estática |
| PostgreSQL 16 | Banco de dados relacional |
| Sequelize | ORM para persistência |
| Docker | Containerização da aplicação |
| Docker Compose | Orquestração dos containers |
| GitHub Actions | Automação CI/CD |
| Render | Hospedagem da API |
| Swagger | Documentação dos endpoints |

## Arquitetura do projeto

```text
AT2-Entrega-Continua/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── caminhaoRoutes.ts
│   │   │   └── healthRoutes.ts
│   │   └── server.ts
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── landing/
│
├── docker-compose.yml
├── package-lock.json
├── LICENSE
└── README.md
```

## 1. Pré-requisitos

Antes de executar o projeto, instale:

- [Node.js](https://nodejs.org/) — versão 24.
- [Git](https://git-scm.com/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- [Visual Studio Code](https://code.visualstudio.com/).

Para verificar as instalações:

```bash
node --version
npm --version
git --version
docker --version
docker compose version
```

## 2. Clonar o repositório

Clone o projeto:

```bash
git clone https://github.com/isaachideki/-AT2-Entrega-Cont-nua-com-Docker-GitHub-Actions-e-Deploy-no-Render.git
```



## 3. Executar localmente com Docker Compose

O projeto utiliza Docker Compose para executar o PostgreSQL e a API em containers separados.

O arquivo `docker-compose.yml` já configura os serviços, as variáveis de ambiente e a comunicação entre os containers.

### Construir e iniciar os containers

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Esse comando realiza:

1. Construção da imagem Docker da API.
2. Inicialização do PostgreSQL.
3. Configuração da conexão entre os serviços.
4. Inicialização do backend após a disponibilidade do banco.

### Executar em segundo plano

```bash
docker compose up --build -d
```

### Verificar os containers

```bash
docker compose ps
```

### Consultar os logs

```bash
docker compose logs -f
```

Consultar somente os logs da API:

```bash
docker compose logs -f api
```

Consultar os logs do PostgreSQL:

```bash
docker compose logs -f db
```

### Encerrar os containers

```bash
docker compose down
```

**Observação:** os dados do PostgreSQL são armazenados em um volume Docker chamado `pgdata`. Para preservar os dados, não utilize `docker compose down -v`.

## 4. Executar o backend sem Docker

Também é possível executar o backend diretamente pelo Node.js.

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm ci
```

Configure as variáveis de ambiente de acordo com o banco PostgreSQL utilizado.

Exemplo de configuração para PostgreSQL local:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=caminhoes
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

Inicie o servidor em desenvolvimento:

```bash
npm run dev
```

Para interromper o servidor, pressione `CTRL + C`.

## 5. Scripts disponíveis no backend

Os comandos abaixo devem ser executados dentro da pasta `backend`.

| Comando | Descrição |
|---|---|
| `npm ci` | Instala as dependências do projeto |
| `npm run dev` | Inicia o servidor em desenvolvimento |
| `npm run type-check` | Executa a checagem de tipos TypeScript |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm start` | Inicia a aplicação compilada |
| `npm run db:migrate` | Executa as migrations |
| `npm run db:migrate:undo` | Desfaz a última migration |

### Validar o projeto

Checagem de tipos:

```bash
npm run type-check
```

Compilação:

```bash
npm run build
```

Execução da versão compilada:

```bash
npm start
```

### Health Check

A rota de Health Check permite verificar se a aplicação está funcionando corretamente.

Requisição:

```http
GET /api/health
```

Exemplo de resposta:

```json
{
  "status": "ok",
  "servico": "caminhoes-api",
  "versao": "1.0.0",
  "uptime": 120,
  "timestamp": "2026-11-22T12:00:00.000Z"
}
```

A resposta utiliza HTTP 200 quando a API está funcionando.

### Endereços locais

| Serviço | Endereço |
|---|---|
| API | http://localhost:3000 |
| Health Check | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/api-docs |
| PostgreSQL | localhost:5432 |

## 6. Dockerfile de produção

O backend utiliza um Dockerfile com estratégia Multi-Stage Build.

O processo é dividido em duas etapas:

**Builder:**

- Utiliza Node.js Alpine.
- Instala as dependências com `npm ci`.
- Copia os arquivos TypeScript.
- Compila a aplicação para JavaScript.
- Remove as dependências de desenvolvimento.

**Runner:**

- Utiliza uma imagem Node.js Alpine independente.
- Copia somente os arquivos necessários para produção.
- Executa a aplicação compilada.
- Utiliza um usuário sem privilégios administrativos.
- Configura uma verificação de saúde do container.

Comando para construir a imagem manualmente, a partir da raiz:

```bash
docker build -t caminhoes-api -f backend/Dockerfile backend
```

Executar a imagem:

```bash
docker run -p 3000:3000 caminhoes-api
```

Para essa execução isolada, configure também as variáveis de ambiente necessárias para a conexão com o PostgreSQL.

## 7. Integração Contínua com GitHub Actions

O projeto utiliza GitHub Actions para automatizar a validação do código a cada push na branch `main`.

Arquivo responsável:

```text
.github/workflows/deploy.yml
```

A esteira está organizada em três etapas.

### Etapa 1 — CI: Checagem de tipos e build

Responsável por:

1. Baixar o código-fonte.
2. Configurar o Node.js.
3. Instalar as dependências com `npm ci`.
4. Executar a checagem de tipos TypeScript.
5. Compilar a aplicação.

### Etapa 2 — CD: Build da imagem Docker

Responsável por:

1. Baixar o código-fonte.
2. Localizar o Dockerfile do backend.
3. Construir a imagem Docker.
4. Validar a construção do container.

### Etapa 3 — CD: Deploy no Render

Responsável por:

1. Verificar se as etapas anteriores foram aprovadas.
2. Recuperar o segredo `RENDER_DEPLOY_HOOK_URL`.
3. Executar uma requisição HTTP POST utilizando `curl`.
4. Validar o código HTTP retornado pelo Render.
5. Finalizar a execução com sucesso somente quando o acionamento for aceito.

O deploy depende do sucesso dos jobs anteriores.

### Gatilhos da automação

O workflow é executado automaticamente quando ocorre um push na branch `main`.

Também permite execução manual por meio da opção `workflow_dispatch` na aba Actions.

### Configurar o segredo do GitHub

No repositório, acesse:

`Settings → Secrets and variables → Actions`

Crie um segredo com o nome:

```text
RENDER_DEPLOY_HOOK_URL
```

No campo Secret, insira a URL do Deploy Hook gerada pelo Render.

A URL deve permanecer privada e não deve ser inserida diretamente no código-fonte.

## 9. Deploy no Render

A publicação da API é realizada utilizando um Web Service com runtime Docker.

### Configurações do serviço

| Configuração | Valor |
|---|---|
| Runtime | Docker |
| Branch | main |
| Root Directory | backend |
| Dockerfile Path | ./Dockerfile |
| Auto-Deploy | No |
| Health Check Path | /api/health |

Quando o Root Directory estiver configurado como `backend`, o caminho do Dockerfile será relativo a essa pasta.

### Variáveis de ambiente

As variáveis devem ser configuradas diretamente no painel do Render.

```env
NODE_ENV=production
DB_HOST=SEU_HOST_POSTGRES
DB_PORT=5432
DB_NAME=SEU_BANCO
DB_USER=SEU_USUARIO
DB_PASSWORD=SUA_SENHA
DB_SSL=true
```

Utilize as credenciais reais do banco PostgreSQL gerenciado.

### Auto-Deploy

A opção Auto-Deploy deve permanecer desativada (`No`).

Dessa maneira, um push no GitHub não inicia diretamente a publicação no Render.

A publicação é controlada pelo GitHub Actions por meio do Deploy Hook, garantindo que o código passe pelas etapas de validação e construção da imagem antes do acionamento.

### URL pública da API

**API em produção:**

`INSIRA_AQUI_A_URL_PUBLICA_DO_RENDER`

**Health Check:**

`INSIRA_AQUI_A_URL_PUBLICA_DO_RENDER/api/health`

**Swagger:**

`INSIRA_AQUI_A_URL_PUBLICA_DO_RENDER/api-docs`

## 10. Fluxo de Entrega Contínua

O fluxo automatizado funciona da seguinte maneira:

```text
Desenvolvimento
      |
      v
Commit e Push na main
      |
      v
GitHub Actions
      |
      v
Instalação das dependências
      |
      v
Checagem de tipos TypeScript
      |
      v
Build do backend
      |
      v
Construção da imagem Docker
      |
      v
CI e Docker aprovados?
      |
      v
Acionamento do Deploy Hook
      |
      v
Render recebe a solicitação
      |
      v
Deploy da aplicação
      |
      v
Health Check HTTP 200
      |
      v
API disponível em produção
```

## 11. Como acompanhar a execução

### GitHub Actions

Acesse a aba Actions para acompanhar as execuções:

https://github.com/isaachideki/-AT2-Entrega-Cont-nua-com-Docker-GitHub-Actions-e-Deploy-no-Render/actions

O resultado esperado é a aprovação das três etapas:

- CI — Checagem de tipos e build.
- CD — Build da imagem Docker.
- CD — Disparo do deploy no Render.

### Render

No painel do Render, acesse o Web Service e consulte as abas Events e Logs.

Elas permitem acompanhar o acionamento do Deploy Hook, o processo de publicação e a inicialização da API.

## 12. Testar a aplicação em produção

Após a conclusão do deploy, substitua a URL abaixo pelo endereço público do seu Web Service.

### Health Check

```powershell
Invoke-RestMethod "https://SUA-API.onrender.com/api/health"
```

### Listar caminhões

```powershell
Invoke-RestMethod "https://SUA-API.onrender.com/caminhoes"
```

### Documentação Swagger

```text
https://SUA-API.onrender.com/api-docs
```

A aplicação deve responder às requisições e acessar o PostgreSQL configurado no ambiente de produção.

## 13. Autor

**Isaac Hideki Shiokawa**

Estudante de Desenvolvimento de Software Multiplataforma — FATEC.

Projeto desenvolvido individualmente para a disciplina de Integração e Entrega Contínua (IEC).
