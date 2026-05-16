# Rush Stack — Handoff pour Claude Code

> Dashboard gaming compétitif avec flow complet de matchmaking. Prototype HTML/React fonctionnel à porter en production.

## 🎯 Objectif

Transformer ce prototype HTML statique (Babel in-browser) en application **Next.js / Vite + React + TypeScript** structurée, typée, modulaire, prête pour la production.

## 📦 Contenu du package

```
Rush Stack.html        → Point d'entrée HTML (Babel in-browser, à remplacer par un vrai bundler)
app.jsx                → AppShell : sidebar, top nav, vue Accueil (hero + queue panel + popular games)
profile.jsx            → Vue Profil joueur (bannière, stats, MMR chart, succès, historique matchs)
leaderboard.jsx        → Vue Classement (podium top 3, filtres, table 17 joueurs, position perso)
match-flow.jsx         → Flow complet de lancement de partie (5 stages)
HANDOFF.md             → Ce fichier
```

## 🗺️ Architecture & vues

### 1. Vue **Accueil** (`app.jsx` → composant `App`)
- Sidebar gauche : logo, CTA "Lancer une queue", menu (Accueil/Profil/Amis/Historique/Paramètres), jeux suivis (5), bannière Saison
- Top nav : Accueil / Jeux / Classements / Ligues / Tournois / Boutique + cloche, chat, profil dropdown
- Contenu principal : Hero "Compète, progresse, deviens une légende" → Queue panel (jeu / timer circulaire animé / MMR) avec step tracker 5 étapes → Grille jeux populaires
- Sidebar droite : carte profil avec rang, mini-classement, activité récente

### 2. Vue **Profil** (`profile.jsx` → `ProfileView`)
- Bannière joueur (avatar level, rang, MMR, XP bar, actions)
- 5 onglets (Aperçu / Matchs / Stats / Succès / Amis)
- 4 cartes statistiques (Matchs, Victoires, Winrate, KDA)
- Courbe MMR 30 jours (SVG inline, area + line + dot)
- Carte succès (6 achievements unlocked/locked)
- Rangs par jeu (5 cartes avec MMR bar)
- Historique des 8 derniers matchs (table avec V/D, score, KDA, MMR delta)

### 3. Vue **Classements** (`leaderboard.jsx` → `LeaderboardView`)
- Header hero "Hall of Legends"
- Barre de filtres (jeu, région, saison, recherche)
- Podium top 3 (carte centrale plus grande, couronne sur #1)
- Table classement (rang, joueur, jeu, rang actuel, MMR, winrate, évolution, statut)
- Pagination
- Footer "Votre position" épinglé avec CTA

### 4. Flow **Match** (`match-flow.jsx` → `MatchFlow`)
Plein écran, propre layout sans sidebars. 5 stages séquentiels avec progress bar en haut :

| Stage | Composant | Description |
|-------|-----------|-------------|
| 1. Accept | `AcceptStage` | Match trouvé, countdown 15s, cartes acceptation équipe |
| 2. Agent Select | `AgentSelectStage` | Grille 12 agents, panneau showcase avec capacités + stats, bouton verrou |
| 3. Loading | `LoadingStage` | Map SVG en fond, listes 5v5 avec agents, barre progression + astuce qui tourne |
| 4. In-Match | `InMatchStage` | HUD scoreboard live, mini-map tactique SVG, kill feed, économie, objectif |
| 5. Results | `ResultsStage` | VICTOIRE/DÉFAITE en gradient, score final, MMR animé (+24), 6 stats perfs, scoreboard final 5v5 |

Le flow est invoqué via `setMatchFlowOpen(true)` depuis le CTA "Lancer une queue" (sidebar) ou le bouton hero, et se ferme via `onClose`.

## 🎨 Design system

### Couleurs (à extraire en tokens)
```css
--bg:       #0a0a0c    /* Fond principal */
--panel:    #131316    /* Cards */
--panel-2:  #18181c    /* Cards nested */
--line:     #26262c    /* Borders */
--text:     #ffffff
--muted:    #8a8a93
--muted-2:  #5e5e66
--red:      #ef2434    /* Brand primary */
--red-2:    #ff3a48
--red-dim:  #8a1722
--green:    #28d17c    /* Success / Victory */
--gold:     #ffd860    /* MVP / Top 1 */
```

### Typo
- **Inter** (400/500/600/700) : texte courant
- **Rajdhani** (500/600/700) : display, titres, monospace-uppercase labels (classe `.display` + `.mono-up`)

### Patterns
- **Cards** : `background: var(--panel); border: 1px solid var(--line); border-radius: 10-12px;`
- **CTAs primaires** : `linear-gradient(180deg, #ef2434, #c1121f)` + `box-shadow: 0 6px 24px rgba(239,36,52,0.35)`
- **Labels** : Rajdhani 700 uppercase letter-spacing 0.1-0.2em color var(--muted)
- **Avatars** : SVG procéduraux (6 palettes via `seed`)

## 🛠️ Migration recommandée

### Étape 1 — Stack
- **Next.js 15** (App Router) ou **Vite + React 18 + TypeScript**
- **Tailwind CSS** pour les utilities (extraire les `style={{}}` inline en classes)
- **Framer Motion** pour les animations (timer, accept countdown, MMR counter, podium)
- **React Router** si Vite (sinon routes Next : `/`, `/profile`, `/leaderboard`, `/match`)

### Étape 2 — Structure des dossiers
```
src/
├── app/                       # Routes Next.js
│   ├── page.tsx               # Home
│   ├── profile/page.tsx
│   ├── leaderboard/page.tsx
│   └── match/page.tsx
├── components/
│   ├── shell/                 # Sidebar, TopNav, RightPanel
│   ├── home/                  # Hero, QueuePanel, Timer, StepTracker, PopularGames
│   ├── profile/               # PlayerBanner, MMRChart, Achievements, GameRanks, MatchHistory
│   ├── leaderboard/           # Podium, FiltersBar, PlayerRow, SelectChip
│   ├── match/                 # AcceptStage, AgentSelect, Loading, InMatch, Results
│   └── ui/                    # Avatar, Badge, Button, Card, Icon (lucide-react?)
├── lib/
│   ├── types.ts               # Player, Match, Game, Rank
│   ├── mock-data.ts           # Tous les fixtures (extraits des arrays inline)
│   └── utils.ts
├── styles/
│   └── globals.css            # Tokens CSS, fonts
└── hooks/
    ├── useQueueTimer.ts
    └── useMmrAnimation.ts
```

### Étape 3 — Types essentiels à créer

```ts
type Game = 'valorant' | 'cod' | 'lol' | 'apex' | 'fortnite';
type GameMode = 'COMPÉTITIF' | 'RANKED PLAY' | 'CLASSÉ SOLO' | 'CLASSÉ' | 'ARÈNE';
type Rank = 'IMMORTAL 1' | 'IMMORTAL 2' | 'IMMORTAL 3' | 'RADIANT' | 'CHALLENGER' | /* ... */;
type Status = 'online' | 'ingame' | 'offline';

interface Player {
  id: string;
  name: string;
  avatarSeed: number;
  tag: string;             // 'FR' | 'DE' | ...
  rank: Rank;
  mmr: number;
  wins: number;
  status: Status;
  isPro?: boolean;
}

interface Match {
  id: string;
  game: Game;
  mode: GameMode;
  result: 'V' | 'D';
  score: string;
  kda: string;
  mmrDelta: number;
  map: string;
  playedAt: Date;
}

interface MatchPlayer extends Player {
  agent: { name: string; glyph: string; color: string };
  acs: number;
  kills: number; deaths: number; assists: number;
  headshot: number;
  adr: number;
  isMvp?: boolean;
  isYou?: boolean;
}
```

### Étape 4 — Points d'attention

1. **Inline styles → Tailwind** : `style={{ display: 'flex', gap: 12 }}` → `className="flex gap-3"`. Garde les valeurs exactes (couleurs, paddings) — extraire en tokens Tailwind dans `tailwind.config.ts`.
2. **Composants `window.X`** : les passages `const { Icon, Avatar } = window;` sont des hacks pour le multi-script Babel — à remplacer par des imports ES classiques.
3. **`Object.assign(window, {...})`** en fin de `app.jsx` : à supprimer, idem.
4. **Icônes** : remplacer le namespace `Icon.*` par `lucide-react` (équivalents directs pour 90% des cas) ou conserver les SVG custom.
5. **Animations** :
   - Timer queue : déjà en `setInterval` simple → garder ou passer en `useAnimationFrame`.
   - MMR animé dans Results : déjà en cubic-easing manuel → remplacer par Framer Motion `useSpring`.
   - Pulsing rings du Accept stage : déjà en SMIL SVG → garder ou Framer Motion.
6. **Mock data** : tous les arrays inline (`allPlayers`, `matches`, `agents`, etc.) à extraire dans `lib/mock-data.ts` puis brancher sur des routes API plus tard.
7. **Routing du match flow** : actuellement overlay via `matchFlowOpen` state. Pour Next.js, soit garder l'overlay (`<Dialog>` Radix), soit faire une vraie route `/match/[id]` avec stages en sub-routes (`/match/[id]/accept`, `/agent`, `/loading`, `/match`, `/results`).
8. **Pas de backend pour l'instant** : tous les états sont locaux. Prévoir une couche `lib/api/` pour swap facilement vers `fetch`/tRPC plus tard.

## ✅ Checklist de portage

- [ ] Setup Next.js + TS + Tailwind + Lucide
- [ ] Extraire les CSS tokens dans `globals.css` / `tailwind.config.ts`
- [ ] Charger les fonts Inter + Rajdhani (next/font)
- [ ] Composants UI primitifs : Avatar, ImmortalBadge, Card, Button, Icon
- [ ] AppShell : Sidebar + TopNav + slot
- [ ] Page Home (Hero + QueuePanel + Popular)
- [ ] Page Profile (5 sections)
- [ ] Page Leaderboard (Podium + Table + Filters)
- [ ] Match Flow (5 stages, transitions Framer Motion)
- [ ] Types + mock-data dans `lib/`
- [ ] Tests : Storybook pour les composants clés ?
- [ ] Animations & micro-interactions polies

## 🎮 Bonus / next steps possibles

- Écran **Boutique** (skins, packs, devises)
- Écran **Tournois** (bracket, planning)
- **Mode duo/squad** dans la queue (sélecteur d'amis)
- **Replay viewer** dans Profile/Match history
- **Notifications** centre (cloche → drawer)
- **Settings** (thème, audio, contrôles, langue)
- Mode **mobile responsive**

---

Bon courage 🚀
