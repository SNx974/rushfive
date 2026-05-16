require('dotenv').config();
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db      = require('../db');

// ─── Middleware auth JWT ──────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { login, password } = req.body;
  if (
    !login || !password ||
    login    !== process.env.ADMIN_LOGIN ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// GET /api/admin/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [total, paid, pending, revenue] = await Promise.all([
      db.query("SELECT COUNT(*) FROM equipes"),
      db.query("SELECT COUNT(*) FROM equipes WHERE paiement_statut = 'paid'"),
      db.query("SELECT COUNT(*) FROM equipes WHERE paiement_statut = 'pending'"),
      db.query("SELECT COALESCE(SUM(stripe_amount),0) FROM equipes WHERE paiement_statut = 'paid'"),
    ]);
    res.json({
      total   : parseInt(total.rows[0].count),
      paid    : parseInt(paid.rows[0].count),
      pending : parseInt(pending.rows[0].count),
      revenue : parseInt(revenue.rows[0].coalesce),
    });
  } catch (err) {
    console.error('admin/stats error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/inscriptions?search=&statut=
router.get('/inscriptions', auth, async (req, res) => {
  try {
    const { search, statut, paiement } = req.query;
    let   where = [];
    let   params = [];
    let   i = 1;

    if (search) {
      where.push(`(e.nom ILIKE $${i} OR j.pseudo ILIKE $${i})`);
      params.push(`%${search}%`); i++;
    }
    if (statut) {
      where.push(`e.statut = $${i}`);
      params.push(statut); i++;
    }
    if (paiement) {
      where.push(`e.paiement_statut = $${i}`);
      params.push(paiement); i++;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const result = await db.query(
      `SELECT
         e.id, e.nom, e.tag, e.mode_jeu, e.statut, e.paiement_statut,
         e.stripe_amount, e.stripe_payment_intent_id, e.created_at,
         COUNT(j.id) AS nb_joueurs,
         STRING_AGG(CASE WHEN j.est_capitaine THEN j.pseudo END, '') AS capitaine
       FROM equipes e
       LEFT JOIN joueurs j ON j.equipe_id = e.id
       ${whereClause}
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('admin/inscriptions error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/inscriptions/:id
router.get('/inscriptions/:id', auth, async (req, res) => {
  try {
    const eqRes  = await db.query('SELECT * FROM equipes WHERE id = $1', [req.params.id]);
    if (!eqRes.rows.length) return res.status(404).json({ error: 'Introuvable' });
    const jouRes = await db.query(
      'SELECT * FROM joueurs WHERE equipe_id = $1 ORDER BY est_capitaine DESC',
      [req.params.id]
    );
    res.json({ equipe: eqRes.rows[0], joueurs: jouRes.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/inscriptions/:id
router.put('/inscriptions/:id', auth, async (req, res) => {
  const { statut, paiement_statut } = req.body;
  try {
    const fields = [];
    const vals   = [];
    let   i = 1;
    if (statut)          { fields.push(`statut = $${i++}`);          vals.push(statut); }
    if (paiement_statut) { fields.push(`paiement_statut = $${i++}`); vals.push(paiement_statut); }
    if (!fields.length)  return res.status(400).json({ error: 'Rien à mettre à jour' });

    vals.push(req.params.id);
    await db.query(`UPDATE equipes SET ${fields.join(', ')} WHERE id = $${i}`, vals);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/inscriptions/:id
router.delete('/inscriptions/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM equipes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/inscriptions/:id/rembourser
router.post('/inscriptions/:id/rembourser', auth, async (req, res) => {
  try {
    const eqRes = await db.query('SELECT * FROM equipes WHERE id = $1', [req.params.id]);
    if (!eqRes.rows.length) return res.status(404).json({ error: 'Introuvable' });

    const equipe = eqRes.rows[0];
    if (!equipe.stripe_payment_intent_id) {
      return res.status(400).json({ error: 'Aucun paiement Stripe associé' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: equipe.stripe_payment_intent_id,
    });

    await db.query(
      "UPDATE equipes SET paiement_statut = 'refunded', statut = 'refusee' WHERE id = $1",
      [req.params.id]
    );

    res.json({ success: true, refundId: refund.id });
  } catch (err) {
    console.error('admin/rembourser error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/export — CSV
router.get('/export', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.id, e.nom, e.tag, e.mode_jeu, e.statut, e.paiement_statut,
              e.stripe_amount, e.created_at,
              j.prenom, j.nom AS joueur_nom, j.pseudo, j.email, j.telephone, j.est_capitaine
       FROM equipes e
       LEFT JOIN joueurs j ON j.equipe_id = e.id
       ORDER BY e.id, j.est_capitaine DESC`
    );

    const header = 'ID Equipe,Nom Equipe,Tag,Mode,Statut,Paiement,Montant,Date,Prénom,Nom,Pseudo,Email,Téléphone,Capitaine\n';
    const rows   = result.rows.map(r =>
      [r.id, r.nom, r.tag||'', r.mode_jeu, r.statut, r.paiement_statut,
       r.stripe_amount ? (r.stripe_amount/100).toFixed(2)+'€' : '',
       new Date(r.created_at).toLocaleDateString('fr-FR'),
       r.prenom||'', r.joueur_nom||'', r.pseudo||'', r.email||'', r.telephone||'',
       r.est_capitaine ? 'Oui' : 'Non'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inscriptions-rush-five.csv"');
    res.send('﻿' + header + rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur export' });
  }
});

module.exports = router;
