const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const express = require('express');
const router = express.Router();
const customersRepo = require('../repositories/customersRepository.cjs');

// GET /api/customers - Lista clientes
router.get('/', async (req, res) => {
  try {
    const data = await customersRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/customers - Cria cliente
router.post('/', express.json(), async (req, res) => {
  try {
    const customer = await customersRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'customer', resourceId: customer.id, newValues: customer });
    res.json({ success: true, customer });
  } catch (error) {
    logger.error('Erro ao criar cliente', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/customers/:id - Atualiza cliente
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldCustomer = await customersRepo.getById(id);
    const updatedCustomer = await customersRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'customer', resourceId: id, oldValues: oldCustomer, newValues: updatedCustomer });
    res.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    logger.error('Erro ao atualizar cliente', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/customers/:id - Remove cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldCustomer = await customersRepo.getById(id);
    await customersRepo.remove(id);
    await logAudit({ req, action: 'delete', resourceType: 'customer', resourceId: id, oldValues: oldCustomer });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover cliente', { error });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
