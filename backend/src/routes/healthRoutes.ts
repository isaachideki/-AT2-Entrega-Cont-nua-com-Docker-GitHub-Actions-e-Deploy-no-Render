import { Router } from 'express';

/**
 * Versão exibida no health check.
 * Altere este valor (ex.: 1.0.1) para demonstrar uma entrega contínua rastreável.
 */
const VERSAO = '1.0.0';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verifica a integridade da API
 *     description: Rota usada pelo Render (Health Check Path) para monitorar se a aplicação está no ar.
 *     responses:
 *       200:
 *         description: API em funcionamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 servico:
 *                   type: string
 *                   example: caminhoes-api
 *                 versao:
 *                   type: string
 *                   example: 1.0.0
 *                 uptime:
 *                   type: integer
 *                   description: Tempo de execução do processo, em segundos.
 *                   example: 120
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    servico: 'caminhoes-api',
    versao: VERSAO,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
