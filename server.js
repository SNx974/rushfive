require('dotenv').config();
const express = require('express');
const path    = require('path');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Stripe webhook doit recevoir le raw body AVANT le parser JSON ───────────
const paiementRouter = require('./routes/paiement');
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  paiementRouter.webhook
);

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Fichiers statiques (HTML / CSS / assets) ────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ─── Routes API ──────────────────────────────────────────────────────────────
app.use('/api/inscriptions', require('./routes/inscriptions'));
app.use('/api/payment',      paiementRouter.router);
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/content',     require('./routes/content'));

// ─── Config publique (clé Stripe côté front) ─────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    publishableKey : process.env.STRIPE_PUBLISHABLE_KEY,
    amount         : parseInt(process.env.PRIX_INSCRIPTION_CENTS) || 5000,
    nomTournoi     : process.env.NOM_TOURNOI  || 'Rush Five — FOOT 5v5',
    dateTournoi    : process.env.DATE_TOURNOI || 'Dimanche 13 Juillet',
    lieuTournoi    : process.env.LIEU_TOURNOI || 'Stade de St-Denis',
  });
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ─── Démarrage ───────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Rush Five server → http://0.0.0.0:${PORT}`);
});
