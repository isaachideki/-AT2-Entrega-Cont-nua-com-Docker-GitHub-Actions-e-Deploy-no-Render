import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import caminhaoRoutes from './routes/caminhaoRoutes';
import healthRoutes from './routes/healthRoutes';
import { connectDatabase, sequelize } from './config/database';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app = express();
// Em produção (Render) a porta vem da variável PORT; localmente usa 3000.
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.status(200).json({
    nome: 'Caminhões API',
    mensagem: 'API RESTful para gerenciamento de caminhões.',
    documentacao: '/api-docs',
    saude: '/api/health',
  });
});

app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes); // alias mantido por compatibilidade com a AT1
app.get('/api-docs.json', (_req, res) => res.status(200).json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/caminhoes', caminhaoRoutes);
app.use(notFound);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(port, () => {
      console.log(`Caminhões API executando na porta ${port}`);
      console.log('Swagger UI: /api-docs | Health check: /api/health');
    });

    // O Render envia SIGTERM ao trocar de versão: encerra com elegância em vez de ser morto.
    const encerrar = (sinal: string): void => {
      console.log(`${sinal} recebido. Encerrando o servidor...`);
      setTimeout(() => process.exit(1), 10_000).unref();
      server.close(() => {
        sequelize
          .close()
          .catch((erro: unknown) => console.error('Erro ao fechar o banco:', erro))
          .finally(() => process.exit(0));
      });
    };
    process.on('SIGTERM', () => encerrar('SIGTERM'));
    process.on('SIGINT', () => encerrar('SIGINT'));
  } catch (error) {
    console.error(
      'Não foi possível conectar ao PostgreSQL. Confira as variáveis de ambiente (DB_*) e se o banco está ativo.',
      error
    );

    process.exit(1);
  }
}

void start();
