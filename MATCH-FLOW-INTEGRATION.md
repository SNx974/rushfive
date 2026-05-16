# Intégration du Match Flow — Rush Stack

Ce package contient **un seul fichier**, `match-flow.jsx`, qui implémente le flow complet de lancement d'un match.

## 📦 Composant principal

### `MatchFlow` (exporté sur `window.MatchFlowView`)

```jsx
<MatchFlow onClose={() => navigate('/')} />
```

**Props :**
- `onClose: () => void` — callback appelé quand l'utilisateur quitte le flow (bouton ✕ ou retour accueil après MMR)

**État interne géré :**
- `stage` — étape courante (`lobby` | `mapban` | `ingame` | `report` | `confirm`)
- `teams` — `{ A: Player[5], B: Player[5] }`
- `bannedMaps` — `string[]` ids des maps bannies
- `pickedMap` — `string | null` id de la map jouée
- `host` — `string | null` id du joueur hôte
- `reports` — `{ A: 'win'|'loss'|null, B: 'win'|'loss'|null }`
- `finalResult` — `'A' | 'B' | null` équipe gagnante validée
- `teamChat`, `globalChat` — `Message[]`

## 🎬 Les 5 sous-composants (stages)

| Stage | Composant | Props | Responsabilité |
|-------|-----------|-------|----------------|
| 1. Lobby | `LobbyStage` | `teams`, `setTeams`, `captains`, `onNext` | Affichage 10 joueurs en 5v5, fonction **shuffle** (mélange + équilibre MMR), désignation auto des capitaines |
| 2. Map Ban | `MapBanStage` | `teams`, `myTeam`, `iAmCaptain`, `bannedMaps`, `setBannedMaps`, `pickedMap`, `setPickedMap`, `onNext` | Phase de ban entre les 2 capitaines, 9 maps, dernière restante = jouée |
| 3. In-Game | `InGameStage` | `teams`, `myTeam`, `pickedMap`, `host`, `setHost`, `onNext` | Sélection de l'hôte, génération code lobby, lancement, timer de match, bouton **Fin de game** |
| 4. Report | `ReportStage` | `teams`, `myTeam`, `reports`, `setReports`, `onNext(result)` | Chaque capitaine vote V/D, détection de conflit, passage auto à l'étape suivante quand les deux ont voté |
| 5. Confirm | `ConfirmStage` | `teams`, `myTeam`, `finalResult`, `onHome` | Affichage victoire/défaite, animation MMR (gain/perte), répartition pour les 10 joueurs |

## 🧩 Composants secondaires (extractibles)

- **`ChatPanel`** (`title`, `subtitle`, `messages`, `onSend`, `accent`, `showTeams?`) — panneau de tchat sticky avec input + scroll auto
- **`ChatMessage`** — bulle de message
- **`TeamCard`** (`team`, `players`, `captainId`, `totalMmr`, `shuffling`, `accent`) — carte d'équipe pour le lobby
- **`MapTile`** (`mapId`, `large?`) — SVG décoratif par map (9 maps : Ascent, Bind, Haven, Split, Icebox, Breeze, Fracture, Lotus, Pearl)
- **`RosterMini`** (`team`, `players`, `accent`, `host`) — petite liste de joueurs in-game
- **`ResultChoice`** (`onClick`, `icon`, `title`, `subtitle`, `accent`) — gros bouton Victoire/Défaite
- **`ReportRow`** (`team`, `status`, `captain`, `accent`, `isMe`) — ligne de statut de vote
- **`RewardPill`** (`icon`, `label`, `value`) — petite carte de récompense

## 📊 Données / constantes

```js
POOL_10  // 10 joueurs par défaut (à remplacer par tes vrais joueurs)
MAPS     // 9 maps : { id, name, color }
```

## 🔌 Dépendances externes

Le fichier suppose que les helpers suivants sont disponibles sur `window` (provenant de `app.jsx`) :

```js
window.Icon          // ensemble d'icônes SVG (Crosshair, ChevronLeft, ChevronRight, Check, etc.)
window.Avatar        // <Avatar seed={n} size={n} ring={color}/>
window.ImmortalBadge // badge de rang Immortal
window.SmallGameLogo // petit logo de jeu
window.RushLogo      // logo Rush Stack
```

Si ton site n'a pas ces helpers, soit :
1. Tu les recrées rapidement (chacun est ~20 lignes de JSX/SVG),
2. Tu les remplaces par tes propres composants équivalents (icônes lucide-react, ton avatar maison, etc.),
3. Tu copies leurs définitions depuis `app.jsx` du package précédent.

## 🎨 CSS / Variables

Le composant utilise des CSS custom properties (`var(--bg)`, `var(--panel)`, `var(--line)`, `var(--muted)`, etc.). Soit tu les définis dans ton `:root`, soit tu remplaces par tes propres tokens. Valeurs utilisées :

```css
--bg:       #0a0a0c
--panel:    #131316
--panel-2:  #18181c
--line:     #26262c
--muted:    #8a8a93
--muted-2:  #5e5e66
```

Brand : `#ef2434` (rouge) — `#28d17c` (vert équipe A / victoire) — `#ffd860` (or / capitaine / MVP).

Fonts utilisées : **Inter** + **Rajdhani** (via Google Fonts).

## 🧠 Fonctions logiques clés

### `shuffle()` — dans `LobbyStage`
Mélange aléatoirement les 10 joueurs et reforme deux équipes de 5. Animation visible (8 cycles de 120ms) avec recalcul live de l'écart MMR.

### `banMap(mapId)` — dans `MapBanStage`
Ajoute un map à `bannedMaps[]`. Le tour est calculé via `banOrder = ['A','B','A','B','A','B','A','B']`. Quand il ne reste qu'1 map, elle est auto-`pickedMap`.

### `submitReport(result)` + auto-vote équipe adverse — dans `ReportStage`
Le joueur vote `'win'` ou `'loss'`. Un `setTimeout` simule le vote du capitaine adverse 3.5s plus tard (à remplacer par un vrai WebSocket / polling). Détection de conflit : si A et B votent tous les deux 'win' ou tous les deux 'loss' → message d'avertissement, modérateur à appeler.

### Animation MMR — dans `ConfirmStage`
Cubic easing manuel (`1 - Math.pow(1 - p, 3)`) sur 2 secondes pour faire monter le delta MMR de 0 à `baseGain ± variance`.

## 🚀 Intégration dans Next.js / React Router

### Option A — Modal/Overlay (recommandée)
```jsx
const [open, setOpen] = useState(false);
<button onClick={() => setOpen(true)}>Lancer une queue</button>
{open && <MatchFlow onClose={() => setOpen(false)} />}
```

### Option B — Route dédiée
```jsx
// /match → <MatchPage/>
function MatchPage() {
  const router = useRouter();
  return <MatchFlow onClose={() => router.push('/')} />;
}
```

### Option C — Sous-routes par stage
Si tu veux que chaque stage ait son URL (`/match/lobby`, `/match/mapban`, …), il faut remonter `stage` au niveau du router, et faire de chaque sous-composant une page autonome qui lit/écrit dans un store partagé (Zustand, Context).

## ⚠️ À adapter avant prod

1. **Mock data** → brancher sur ton vrai matchmaking backend (`POOL_10` à remplacer par les vrais joueurs trouvés).
2. **Setimeout simulé** dans `ReportStage` → remplacer par un vrai WebSocket / polling pour recevoir le vote adverse.
3. **`window.X` helpers** → convertir en imports ES classiques.
4. **Inline styles** → migrer vers Tailwind / CSS modules / styled-components selon ta stack.
5. **TypeScript** → typer `Player`, `Map`, `Message`, `Report`, etc.
6. **Persistence** → si l'utilisateur F5 en plein match, garder l'état (localStorage ou serveur).

---

🎮 Bon courage pour l'intégration !
