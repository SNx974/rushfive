require('dotenv').config();
const express = require('express');
const router  = express.Router();
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db      = require('../db');

// POST /api/payment/create-intent
// Crée un PaymentIntent Stripe pour une équipe déjà enregistrée en DB
router.post('/create-intent', async (req, res) => {
  const { equipeId } = req.body;

  if (!equipeId) {
    return res.status(400).json({ error: 'equipeId manquant' });
  }

  try {
    const eqRes = await db.query('SELECT * FROM equipes WHERE id = $1', [equipeId]);
    if (!eqRes.rows.length) return res.status(404).json({ error: 'Équipe introuvable' });

    const equipe = eqRes.rows[0];
    const amount = parseInt(process.env.PRIX_INSCRIPTION_CENTS) || 5000;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        equipe_id  : String(equipeId),
        equipe_nom : equipe.nom,
      },
      description: `Inscription ${equipe.nom} — ${process.env.NOM_TOURNOI || 'Rush Five'}`,
    });

    // Lier le PaymentIntent à l'équipe
    await db.query(
      'UPDATE equipes SET stripe_payment_intent_id = $1, stripe_amount = $2 WHERE id = $3',
      [paymentIntent.id, amount, equipeId]
    );

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error('payment/create-intent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payment/status/:paymentIntentId
router.get('/status/:paymentIntentId', async (req, res) => {
  try {
    const pi = await stripe.paymentIntents.retrieve(req.params.paymentIntentId);
    res.json({ status: pi.status, amount: pi.amount, currency: pi.currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webhook — handler Stripe (raw body)
async function webhook(req, res) {
  const sig     = req.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await db.query(
      `UPDATE equipes
       SET paiement_statut = 'paid', statut = 'validee'
       WHERE stripe_payment_intent_id = $1`,
      [pi.id]
    );
    console.log(`Payment confirmed for equipe ${pi.metadata.equipe_id}`);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    await db.query(
      `UPDATE equipes SET paiement_statut = 'failed' WHERE stripe_payment_intent_id = $1`,
      [pi.id]
    );
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    await db.query(
      `UPDATE equipes SET paiement_statut = 'refunded', statut = 'refusee'
       WHERE stripe_payment_intent_id = $1`,
      [charge.payment_intent]
    );
  }

  res.json({ received: true });
}

module.exports = { router, webhook };
