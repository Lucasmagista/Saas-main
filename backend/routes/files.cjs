const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const express = require('express');
const router = express.Router();
const filesRepo = require('../repositories/storageRepository.cjs');

// POST /api/files - Upload de arquivo
router.post('/', async (req, res) => {
  try {
    const file = await filesRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'file', resourceId: file.id, newValues: file });
    res.json({ success: true, file });
  } catch (error) {
    logger.error('Erro ao fazer upload de arquivo', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/files/:id - Atualiza arquivo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldFile = await filesRepo.getById(id);
    const updatedFile = await filesRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'file', resourceId: id, oldValues: oldFile, newValues: updatedFile });
    res.json({ success: true, file: updatedFile });
  } catch (error) {
    logger.error('Erro ao atualizar arquivo', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:id - Remove arquivo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldFile = await filesRepo.getById(id);
    await filesRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'file', resourceId: id, oldValues: oldFile });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover arquivo', { error });
    res.status(500).json({ error: error.message });
  }
});

const multer = require('multer');
const storageRepo = require('../repositories/storageRepository.cjs');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido'));
    }
    cb(null, true);
  }
}); // Usar buffer em memória

// POST /api/files/upload - Upload de arquivo para sistema de arquivos local
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Arquivo obrigatório' });
    // Log de upload
    console.log(`[UPLOAD] Usuário: ${req.user?.id || 'anon'} - Arquivo: ${req.file.originalname}`);
    // Auditoria
    // Aqui você pode registrar no banco ou arquivo
    // Exemplo: await postgresClient.query('INSERT INTO audit_logs (user_id, action, file, date) VALUES ($1, $2, $3, $4)', [req.user?.id, 'upload', req.file.originalname, new Date().toISOString()]);
    const { originalname, buffer } = req.file;
    const { bucket = 'files' } = req.body;
    try {
      await storageRepo.uploadToBucket(bucket, originalname, buffer);
      const publicUrl = storageRepo.getPublicUrl(bucket, originalname);
      res.json({ url: publicUrl });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Exemplo de upload para bucket customizado
router.post('/upload-to-bucket', upload.single('file'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;
        const { bucket } = req.body;
        if (!bucket) return res.status(400).json({ error: 'Bucket é obrigatório' });
        try {
            await storageRepo.uploadToBucket(bucket, originalname, buffer);
            const publicUrl = storageRepo.getPublicUrl(bucket, originalname);
            res.json({ url: publicUrl });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload para bucket avatars
router.post('/upload/avatar', upload.single('file'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;
        try {
            await storageRepo.uploadToBucket('avatars', originalname, buffer);
            const publicUrl = storageRepo.getPublicUrl('avatars', originalname);
            res.json({ url: publicUrl });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload para bucket documents
router.post('/upload/document', upload.single('file'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;
        try {
            await storageRepo.uploadToBucket('documents', originalname, buffer);
            const publicUrl = storageRepo.getPublicUrl('documents', originalname);
            res.json({ url: publicUrl });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload para bucket backups
router.post('/upload/backup', upload.single('file'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;
        try {
            await storageRepo.uploadToBucket('backups', originalname, buffer);
            const publicUrl = storageRepo.getPublicUrl('backups', originalname);
            res.json({ url: publicUrl });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
