-- Rush Five — Schéma PostgreSQL

CREATE TABLE IF NOT EXISTS equipes (
  id                        SERIAL PRIMARY KEY,
  nom                       VARCHAR(100) NOT NULL,
  tag                       VARCHAR(10),
  mode_jeu                  VARCHAR(50) DEFAULT 'FOOT 5v5',
  role_capitaine            VARCHAR(20) DEFAULT 'captain',
  statut                    VARCHAR(20) DEFAULT 'en_attente',
  paiement_statut           VARCHAR(20) DEFAULT 'pending',
  stripe_payment_intent_id  VARCHAR(200),
  stripe_amount             INTEGER,
  created_at                TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS joueurs (
  id            SERIAL PRIMARY KEY,
  equipe_id     INTEGER REFERENCES equipes(id) ON DELETE CASCADE,
  nom           VARCHAR(100),
  prenom        VARCHAR(100),
  pseudo        VARCHAR(100),
  email         VARCHAR(200),
  telephone     VARCHAR(30),
  est_capitaine BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipes_paiement ON equipes(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_joueurs_equipe ON joueurs(equipe_id);
