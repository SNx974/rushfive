const express = require('express');
const router  = express.Router();
const db      = require('../db');

// POST /api/inscriptions/init
// Sauvegarde équipe + joueurs, crée le PaymentIntent Stripe, retourne clientSecret
router.post('/init', async (req, res) => {
  const { equipe, joueurs } = req.body;

  if (!equipe?.nom || !joueurs?.length) {
    return res.status(400).json({ error: 'Données manquantes (equipe.nom, joueurs)' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Insérer l'équipe
    const eqRes = await client.query(
      `INSERT INTO equipes (nom, tag, mode_jeu, role_capitaine)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [equipe.nom, equipe.tag || null, equipe.mode || 'FOOT 5v5', equipe.role || 'captain']
    );
    const equipeId = eqRes.rows[0].id;

    // Insérer les joueurs
    for (let i = 0; i < joueurs.length; i++) {
      const j = joueurs[i];
      await client.query(
        `INSERT INTO joueurs (equipe_id, nom, prenom, pseudo, email, telephone, est_capitaine)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [equipeId, j.nom, j.prenom, j.pseudo, j.email, j.telephone || null, i === 0]
      );
    }

    await client.query('COMMIT');
    res.json({ equipeId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('inscriptions/init error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  } finally {
    client.release();
  }
});

// GET /api/inscriptions/:id
// Récupère une équipe avec ses joueurs
router.get('/:id', async (req, res) => {
  try {
    const eqRes = await db.query('SELECT * FROM equipes WHERE id = $1', [req.params.id]);
    if (!eqRes.rows.length) return res.status(404).json({ error: 'Équipe introuvable' });

    const jouRes = await db.query(
      'SELECT * FROM joueurs WHERE equipe_id = $1 ORDER BY est_capitaine DESC, id ASC',
      [req.params.id]
    );
    res.json({ equipe: eqRes.rows[0], joueurs: jouRes.rows });
  } catch (err) {
    console.error('inscriptions/:id error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/inscriptions/confirm/:paymentIntentId
// Vérifie le paiement et retourne les infos de l'équipe
router.get('/confirm/:paymentIntentId', async (req, res) => {
  try {
    const eqRes = await db.query(
      'SELECT * FROM equipes WHERE stripe_payment_intent_id = $1',
      [req.params.paymentIntentId]
    );
    if (!eqRes.rows.length) return res.status(404).json({ error: 'Inscription introuvable' });

    const equipe = eqRes.rows[0];
    const jouRes = await db.query(
      'SELECT * FROM joueurs WHERE equipe_id = $1 ORDER BY est_capitaine DESC',
      [equipe.id]
    );
    res.json({ equipe, joueurs: jouRes.rows });
  } catch (err) {
    console.error('inscriptions/confirm error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
