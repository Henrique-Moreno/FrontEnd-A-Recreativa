# Documentação

## Backend

O backend foi desenvolvido utilizando as tecnologias solicitadas: TypeScript, Express.js, Prisma ORM e SQLite como banco de dados. A arquitetura foi estruturada para manter organização e escalabilidade, com a criação de interfaces, repositórios, controllers e casos de uso. Para gerenciar erros, implementamos tratamento de exceções com middlewares personalizados, utilizando a biblioteca Zod para validação de dados. A biblioteca Winston foi integrada para logging, facilitando o rastreamento e depuração. Dependências como `multer` para upload de arquivos, `pdf-lib` para geração de PDFs padronizados e `jsonwebtoken` para autenticação foram essenciais para atender aos requisitos de upload, arquivamento e geração de documentos.

## Frontend

O frontend foi construído com Next.js, TypeScript e Ant Design, garantindo uma interface responsiva e amigável. Os componentes foram organizados de forma modular, como `LessonPlanForm` para preenchimento de planos de aula, `LessonPlanUpload` para upload de arquivos, `DocumentArchive` para arquivamento, `LessonPlanPreview` para visualização de documentos e `LessonPlanGeneratePDF` para exibição de PDFs padronizados. A biblioteca `react-hook-form` com `zod` foi usada para validação de formulários, enquanto `react-pdf` permitiu a pré-visualização de arquivos PDF. A autenticação foi gerenciada com `axios` e `jwt-decode`, integrando-se ao backend via API. O uso de `mammoth` possibilitou a leitura de arquivos `.docx`, atendendo aos requisitos de arquivamento e visualização.

## Como Executar o Projeto

Certifique-se de ter o Node.js (versão 18 ou superior) instalado. Clone o repositório do projeto:

### Backend

1. Acesse a pasta do backend:

   ```bash
   cd server
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o arquivo `.env`. Um exemplo está disponível em `env.example`. Crie um arquivo `.env` com o seguinte conteúdo:

   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="hhdjhkdoikduiueyehjeyhehhsyueuyjegneujhjegh"
   ```

4. Execute as migrações do Prisma para configurar o banco de dados SQLite:

   ```bash
   npx prisma migrate dev
   ```

5. Inicie o servidor:

   ```bash
   npm run dev
   ```

   O backend estará rodando em `http://localhost:3001`.

### Frontend

1. Acesse a pasta do frontend:

   ```bash
   cd web
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Execute o projeto:

   ```bash
   npm run dev
   ```

   O frontend estará disponível em `http://localhost:3000`.