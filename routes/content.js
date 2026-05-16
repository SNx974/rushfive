const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const jwt     = require('jsonwebtoken');

const CONTENT_FILE = path.join(__dirname, '..', 'content.json');

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
}

function writeContent(data) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try { jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalide' }); }
}

// GET /api/content  (public)
router.get('/', (req, res) => {
  try { res.json(readContent()); }
  catch { res.status(500).json({ error: 'Impossible de lire le contenu' }); }
});

// PUT /api/content  (admin)
router.put('/', auth, (req, res) => {
  try {
    const current = readContent();
    const updated = { ...current, ...req.body };
    writeContent(updated);
    res.json({ success: true, content: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/content/partenaires  (admin) — remplace la liste complète
router.put('/partenaires', auth, (req, res) => {
  try {
    const content = readContent();
    content.partenaires = req.body.partenaires;
    writeContent(content);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/content/recompenses  (admin)
router.put('/recompenses', auth, (req, res) => {
  try {
    const content = readContent();
    content.recompenses = req.body.recompenses;
    writeContent(content);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
