const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../public'));
  },
  filename: function (req, file, cb) {
    const uniqueName = `logo-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado.' });
  const logoUrl = `/` + req.file.filename;
  res.json({ logoUrl });
});

module.exports = router;
