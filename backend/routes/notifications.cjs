const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const express = require('express');
const router = express.Router();
const notificationsRepo = require('../repositories/notificationsRepository.cjs');

// POST /api/notifications - Cria notificação
router.post('/', express.json(), async (req, res) => {
  try {
    const notification = await notificationsRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'notification', resourceId: notification.id, newValues: notification });
    res.json({ success: true, notification });
  } catch (error) {
    logger.error('Erro ao criar notificação', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/:id - Atualiza notificação
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldNotification = await notificationsRepo.getById(id);
    const updatedNotification = await notificationsRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'notification', resourceId: id, oldValues: oldNotification, newValues: updatedNotification });
    res.json({ success: true, notification: updatedNotification });
  } catch (error) {
    logger.error('Erro ao atualizar notificação', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/notifications/:id - Remove notificação
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldNotification = await notificationsRepo.getById(id);
    await notificationsRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'notification', resourceId: id, oldValues: oldNotification });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover notificação', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications - Lista notificações

// GET /api/notifications
// Retorna a lista de notificações do usuário logado. Caso a tabela
// `notifications` não exista ou ocorra erro, retorna uma lista vazia.
router.get('/', async (req, res) => {
    try {
      const data = await notificationsRepo.listAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

module.exports = router;
