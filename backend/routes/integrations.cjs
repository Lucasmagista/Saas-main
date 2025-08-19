const express = require('express');
const router = express.Router();
const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const integrationsRepo = require('../repositories/integrationsRepository.cjs');

// POST /api/integrations - Cria integração
router.post('/', express.json(), async (req, res) => {
  try {
    const integration = await integrationsRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'integration', resourceId: integration.id, newValues: integration });
    res.json({ success: true, integration });
  } catch (error) {
    logger.error('Erro ao criar integração', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/integrations/:id - Atualiza integração
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldIntegration = await integrationsRepo.getById(id);
    const updatedIntegration = await integrationsRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'integration', resourceId: id, oldValues: oldIntegration, newValues: updatedIntegration });
    res.json({ success: true, integration: updatedIntegration });
  } catch (error) {
    logger.error('Erro ao atualizar integração', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/integrations/:id - Remove integração
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldIntegration = await integrationsRepo.getById(id);
    await integrationsRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'integration', resourceId: id, oldValues: oldIntegration });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover integração', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/integrations - Lista integrações
router.get('/', async (req, res) => {
  try {
    const data = await integrationsRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/integrations - Cria integração
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await integrationsRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/integrations/:id - Atualiza integração
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await integrationsRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/integrations/:id - Remove integração
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await integrationsRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET /api/integrations/stats - Estatísticas gerais das integrações
router.get('/stats', async (req, res) => {
  try {
    const db = require('../postgresClient.cjs');
    const result = await db.query('SELECT COUNT(1) AS total FROM integrations');
    const total = Number(result.rows?.[0]?.total || 0);
    // Você pode adicionar mais estatísticas reais aqui
    res.json([
      {
        title: 'Integrações Ativas',
        value: total,
        change: '',
        icon: '',
      }
      // Adicione mais estatísticas conforme necessário
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas: ' + err.message });
  }
});

// GET /api/integrations/status - Status do sistema de integrações
router.get('/status', async (req, res) => {
  try {
    // Exemplo: status simples, ajuste para buscar status real se necessário
    res.json([
      { name: 'API Principal', status: 'ok', description: 'Operacional' },
      { name: 'Webhooks', status: 'ok', description: 'Operacional' },
      { name: 'Sincronização', status: 'degraded', description: 'Degradado' }
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar status: ' + err.message });
  }
});

// GET e POST /api/integrations/global-config - Configurações globais das integrações
const GLOBAL_CONFIG_KEY = 'integrations_global_config';
const db = require('../postgresClient.cjs');

router.get('/global-config', async (req, res) => {
  try {
    const result = await db.query('SELECT value FROM configs WHERE key = $1 LIMIT 1', [GLOBAL_CONFIG_KEY]);
    res.json(result.rows[0]?.value || null);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações globais: ' + err.message });
  }
});

router.post('/global-config', express.json(), async (req, res) => {
  try {
    const value = req.body;
    await db.query(
      `INSERT INTO configs(key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [GLOBAL_CONFIG_KEY, value]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar configurações globais: ' + err.message });
  }
});

module.exports = router;
