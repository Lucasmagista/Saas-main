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
    // Exemplo: buscar estatísticas reais do banco (ajuste conforme seu modelo)
    // Aqui, apenas um exemplo simples de contagem
    const { data: integrations, error } = await require('../supabaseClient.cjs').from('integrations').select('*');
    if (error) throw new Error(error.message);
    const total = integrations.length;
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
const supabase = require('../supabaseClient.cjs');

router.get('/global-config', async (req, res) => {
  try {
    // Exemplo: buscar config de uma tabela 'configs' (ajuste conforme seu modelo)
    const { data, error } = await supabase.from('configs').select('value').eq('key', GLOBAL_CONFIG_KEY).single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    res.json(data ? data.value : null);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações globais: ' + err.message });
  }
});

router.post('/global-config', async (req, res) => {
  try {
    const value = req.body;
    // Upsert na tabela configs
    const { error } = await supabase.from('configs').upsert({ key: GLOBAL_CONFIG_KEY, value }, { onConflict: ['key'] });
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar configurações globais: ' + err.message });
  }
});

module.exports = router;
