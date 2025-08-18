const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate.cjs');
const router = express.Router();
const projectsRepo = require('../repositories/projectsRepository.cjs');

// Schemas de validação
const createProjectSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1),
  description: z.string().optional(),
  status: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

const paramsSchema = z.object({ id: z.string() });

// GET /api/projects - Lista projetos
router.get('/', async (req, res) => {
  try {
    const data = await projectsRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects - Cria projeto
router.post('/', express.json(), validate({ body: createProjectSchema }), async (req, res) => {
  try {
    const data = await projectsRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'project', resourceId: project.id, newValues: project });
    res.json({ success: true, project });
  } catch (error) {
    logger.error('Erro ao criar projeto', { error: error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/projects/:id - Atualiza projeto
router.put('/:id', express.json(), validate({ body: updateProjectSchema, params: paramsSchema }), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await projectsRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'project', resourceId: id, oldValues: oldProject, newValues: updatedProject });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/projects/:id - Remove projeto
router.delete('/:id', validate({ params: paramsSchema }), async (req, res) => {
  const { id } = req.params;
  try {
    await projectsRepo.remove(id);
    await logAudit({ req, action: 'delete', resourceType: 'project', resourceId: id, oldValues: oldProject });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
