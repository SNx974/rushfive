const { useState, useEffect, useRef } = React;

/* ============================== ICONS ============================== */
const Icon = {
  Crosshair: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  ),
  Home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7H10v7H5a1 1 0 01-1-1z" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  ),
  Friends: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M2.5 19c.5-3 3.5-5 6.5-5s5.5 2 6 5" />
      <path d="M15 19c.3-2 2-3.3 4-3.5" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Gear: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 113.3 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1A2 2 0 016.1 4.3l.1.1a1.7 1.7 0 001.8.3H8a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1A2 2 0 1119.7 7l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  ),
  Bell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 003.4 0" />
    </svg>
  ),
  Chat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8z" />
    </svg>
  ),
  ChevronDown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>
  ),
  ChevronLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 18l-6-6 6-6"/></svg>
  ),
  ChevronRight: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 18l6-6-6-6"/></svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>
  ),
  CheckBadge: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2l2.2 1.6 2.7-.4 1.3 2.4 2.4 1.3-.4 2.7L22 12l-1.6 2.2.4 2.7-2.4 1.3-1.3 2.4-2.7-.4L12 22l-2.2-1.6-2.7.4-1.3-2.4-2.4-1.3.4-2.7L2 12l1.6-2.2L3.2 7l2.4-1.3 1.3-2.4 2.7.4z"/>
      <path d="M9 12l2 2 4-4" stroke="#0a0a0c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Diamond: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2l5 6-5 14L7 8z" />
    </svg>
  ),
  Discord: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M20 4.5A18 18 0 0015.5 3l-.3.5a14 14 0 014 2 14 14 0 00-12.4 0 14 14 0 014-2L10.5 3A18 18 0 006 4.5C3 9 2.3 13.3 2.6 17.6A18 18 0 008 20l.9-1.2a11 11 0 01-1.9-.9c.2-.1.3-.2.5-.3a13 13 0 0011 0c.2.1.3.2.5.3a11 11 0 01-1.9 1L18 20a18 18 0 005.4-2.4c.4-5-.7-9.3-3.4-13.1zM9.2 15a2.1 2.1 0 110-4.1 2.1 2.1 0 010 4.1zm5.6 0a2.1 2.1 0 110-4.1 2.1 2.1 0 010 4.1z"/>
    </svg>
  ),
  Twitter: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M18.9 3H22l-7.3 8.4L23 21h-6.8l-5.3-7-6 7H1.7l7.9-9L1 3h7l4.8 6.3zM17 19l-9.7-13H6L16 19z"/>
    </svg>
  ),
  Instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  Youtube: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M22 7.5a3 3 0 00-2-2C18.2 5 12 5 12 5s-6.2 0-8 .5a3 3 0 00-2 2C1.5 9.3 1.5 12 1.5 12s0 2.7.5 4.5a3 3 0 002 2c1.8.5 8 .5 8 .5s6.2 0 8-.5a3 3 0 002-2c.5-1.8.5-4.5.5-4.5s0-2.7-.5-4.5zM10 15.5v-7l6 3.5z"/>
    </svg>
  ),
  Trophy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8 4h8v6a4 4 0 11-8 0z"/>
      <path d="M5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3"/>
      <path d="M10 14v3h4v-3M8 20h8"/>
    </svg>
  ),
  Sword: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 6l5-3-1 5-9 9-3-3z"/>
      <path d="M9 14l-4 4 1 1-2 2"/>
    </svg>
  ),
  Load: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
    </svg>
  ),
  Helmet: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 14a8 8 0 0116 0v3H4z"/>
      <path d="M8 17v3M16 17v3M9 11h.01M15 11h.01"/>
    </svg>
  ),
};

/* ============================== LOGO ============================== */
const RushLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="rl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff3a48"/>
        <stop offset="1" stopColor="#c1121f"/>
      </linearGradient>
    </defs>
    <path d="M8 4 L44 4 Q56 4 56 18 Q56 28 46 32 L58 60 L42 60 L32 36 L24 36 L24 60 L8 60 Z M24 14 L24 26 L40 26 Q44 26 44 20 Q44 14 40 14 Z" fill="url(#rl)"/>
  </svg>
);

/* ============================== HERO PLACEHOLDER ============================== */
const HeroArt = () => (
  <svg viewBox="0 0 600 400" preserveAspectRatio="xMaxYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
    <defs>
      <radialGradient id="hg" cx="0.65" cy="0.45" r="0.7">
        <stop offset="0" stopColor="#3a0a10" stopOpacity="0.9"/>
        <stop offset="0.5" stopColor="#1a0608" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#0a0a0c" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="hg2" x1="0" x2="1">
        <stop offset="0" stopColor="#0a0a0c"/>
        <stop offset="0.4" stopColor="#0a0a0c" stopOpacity="0.85"/>
        <stop offset="1" stopColor="#0a0a0c" stopOpacity="0"/>
      </linearGradient>
      <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M22 0 L0 0 0 22" fill="none" stroke="#2a0a10" strokeWidth="0.5" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="#15080b"/>
    <rect width="600" height="400" fill="url(#grid)"/>
    <rect width="600" height="400" fill="url(#hg)"/>
    {/* Big faint R behind */}
    <g opacity="0.35" transform="translate(330 60)">
      <path d="M0 0 L160 0 Q220 0 220 60 Q220 110 175 130 L235 280 L160 280 L115 160 L70 160 L70 280 L0 280 Z M70 50 L70 110 L150 110 Q170 110 170 80 Q170 50 150 50 Z" fill="#ef2434" opacity="0.4"/>
    </g>
    {/* Silhouette figure (placeholder) */}
    <g transform="translate(360 60)">
      {/* hood/body silhouette */}
      <path d="M90 0 Q150 5 175 60 Q190 100 185 145 L220 200 Q235 240 230 290 L235 340 L40 340 L45 290 Q40 240 55 200 L90 145 Q85 100 100 60 Q115 5 90 0 Z" fill="#0a0608"/>
      <path d="M75 80 Q110 60 165 80 Q175 110 165 140 Q140 150 105 145 Q80 130 75 80 Z" fill="#180a0d"/>
      {/* glowing eyes */}
      <circle cx="105" cy="105" r="6" fill="#ff3a48"/>
      <circle cx="105" cy="105" r="10" fill="#ff3a48" opacity="0.3"/>
      <circle cx="145" cy="105" r="6" fill="#ff3a48"/>
      <circle cx="145" cy="105" r="10" fill="#ff3a48" opacity="0.3"/>
      {/* chest emblem */}
      <g transform="translate(110 210) scale(0.5)" fill="#ef2434">
        <path d="M0 0 L60 0 Q80 0 80 22 Q80 38 65 46 L85 95 L60 95 L45 56 L25 56 L25 95 L0 95 Z M25 18 L25 38 L55 38 Q62 38 62 28 Q62 18 55 18 Z"/>
      </g>
    </g>
    {/* fade to left */}
    <rect width="600" height="400" fill="url(#hg2)"/>
    {/* particles */}
    {[...Array(40)].map((_,i)=>(
      <circle key={i} cx={200+Math.random()*400} cy={Math.random()*400} r={Math.random()*1.5+0.3} fill="#ff3a48" opacity={Math.random()*0.6+0.2}/>
    ))}
  </svg>
);

/* ============================== GAME TILES ============================== */
const GameTile = ({ game }) => {
  const tiles = {
    valorant: (
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <defs>
          <linearGradient id="v1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1a0608"/>
            <stop offset="1" stopColor="#3a0a10"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#v1)"/>
        <path d="M30 50 L70 50 L100 130 L130 50 L170 50 L110 170 L90 170 Z" fill="#ef2434"/>
      </svg>
    ),
    cod: (
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="200" fill="#3a2418"/>
        <rect width="200" height="200" fill="#1a0e08" opacity="0.6"/>
        <g fill="#1a0a08" opacity="0.8">
          <polygon points="0,140 40,100 80,120 120,90 160,110 200,95 200,200 0,200"/>
        </g>
        <text x="100" y="115" textAnchor="middle" fill="#e8c89a" fontFamily="Rajdhani" fontWeight="700" fontSize="34" letterSpacing="2">CALL∙DUTY</text>
      </svg>
    ),
    lol: (
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <defs>
          <radialGradient id="l1" cx="0.5" cy="0.5" r="0.7">
            <stop offset="0" stopColor="#1a2a4a"/>
            <stop offset="1" stopColor="#08101e"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#l1)"/>
        <circle cx="100" cy="100" r="55" fill="none" stroke="#d4b86a" strokeWidth="6"/>
        <text x="100" y="118" textAnchor="middle" fill="#d4b86a" fontFamily="serif" fontWeight="700" fontSize="58" fontStyle="italic">L</text>
      </svg>
    ),
    apex: (
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <defs>
          <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0608"/>
            <stop offset="1" stopColor="#1a0408"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#a1)"/>
        <polygon points="100,40 140,140 100,115 60,140" fill="#ef2434"/>
        <polygon points="100,75 120,130 100,118 80,130" fill="#0a0a0c"/>
      </svg>
    ),
    fortnite: (
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <defs>
          <linearGradient id="f1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a1a5a"/>
            <stop offset="1" stopColor="#1a0a2a"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#f1)"/>
        <path d="M50 180 Q70 110 100 80 Q130 110 150 180 Z" fill="#0a0612" opacity="0.7"/>
        <circle cx="85" cy="90" r="3" fill="#a06aff"/>
        <circle cx="115" cy="92" r="3" fill="#a06aff"/>
      </svg>
    ),
  };
  return tiles[game] || null;
};

const SmallGameLogo = ({ game }) => {
  if (game === 'valorant') return <svg viewBox="0 0 32 32"><path d="M4 8 L11 8 L16 22 L21 8 L28 8 L18 28 L14 28 Z" fill="#ef2434"/></svg>;
  if (game === 'cod') return (
    <svg viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#5a3a1a"/><text x="16" y="20" textAnchor="middle" fill="#e8c89a" fontFamily="Rajdhani" fontWeight="700" fontSize="8">CALL∙DUTY</text></svg>
  );
  if (game === 'lol') return (
    <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#08101e"/><circle cx="16" cy="16" r="10" fill="none" stroke="#d4b86a" strokeWidth="1.5"/><text x="16" y="21" textAnchor="middle" fill="#d4b86a" fontFamily="serif" fontWeight="700" fontSize="14" fontStyle="italic">L</text></svg>
  );
  if (game === 'apex') return <svg viewBox="0 0 32 32"><polygon points="16,6 24,26 16,22 8,26" fill="#ef2434"/></svg>;
  if (game === 'fortnite') return <svg viewBox="0 0 32 32"><rect width="32" height="32" rx="3" fill="#2a1245"/><text x="16" y="22" textAnchor="middle" fill="#fff" fontFamily="Rajdhani" fontWeight="700" fontSize="18">F</text></svg>;
  return null;
};

/* ============================== AVATAR ============================== */
const Avatar = ({ seed = 0, size = 36, ring }) => {
  const palettes = [
    ['#1a0608','#ef2434','#ff8090'],
    ['#0a1a2a','#3a6abf','#a0c0ff'],
    ['#1a1a0a','#8a8a3a','#dfdf90'],
    ['#1a0a1a','#7c3aed','#c0a0ff'],
    ['#2a1a0a','#bf6a3a','#ffc090'],
    ['#0a1a0a','#3aaf6a','#90ffc0'],
  ];
  const c = palettes[seed % palettes.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c[0],
      border: ring ? `2px solid ${ring}` : '2px solid #2a2a31',
      overflow: 'hidden', flexShrink: 0, position: 'relative'
    }}>
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <rect width="40" height="40" fill={c[0]}/>
        <path d="M0 30 Q20 12 40 30 L40 40 L0 40 Z" fill={c[1]} opacity="0.7"/>
        <circle cx="20" cy="18" r="9" fill={c[0]} stroke={c[1]} strokeWidth="1"/>
        <circle cx="16.5" cy="18" r="1.4" fill={c[2]}/>
        <circle cx="23.5" cy="18" r="1.4" fill={c[2]}/>
      </svg>
    </div>
  );
};

/* ============================== RANK BADGE ============================== */
const ImmortalBadge = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <defs>
      <linearGradient id="ib" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff5070"/>
        <stop offset="1" stopColor="#a01838"/>
      </linearGradient>
    </defs>
    <path d="M20 3 L33 12 L30 32 L20 38 L10 32 L7 12 Z" fill="url(#ib)" stroke="#ff8090" strokeWidth="0.8"/>
    <path d="M20 9 L27 14 L25 28 L20 32 L15 28 L13 14 Z" fill="#3a0810" opacity="0.6"/>
    <path d="M14 16 L20 12 L26 16 L20 28 Z" fill="#ff5070" opacity="0.8"/>
    <path d="M20 12 L23 18 L20 28 L17 18 Z" fill="#fff" opacity="0.6"/>
  </svg>
);

/* ============================== MAIN APP ============================== */
function App() {
  const [view, setView] = useState('home'); // home | profile | leaderboard
  const [matchFlowOpen, setMatchFlowOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('ACCUEIL');
  const [activeMenu, setActiveMenu] = useState('Accueil');
  const [queueActive, setQueueActive] = useState(true);
  const [queueSeconds, setQueueSeconds] = useState(18);
  const [playersFound, setPlayersFound] = useState(8);
  const [selectedGame, setSelectedGame] = useState('valorant');

  // Sync top nav + sidebar menu with current view
  const goView = (v) => {
    setView(v);
    if (v === 'home') { setActiveNav('ACCUEIL'); setActiveMenu('Accueil'); }
    if (v === 'profile') { setActiveNav('ACCUEIL'); setActiveMenu('Profil'); }
    if (v === 'leaderboard') { setActiveNav('CLASSEMENTS'); setActiveMenu('Accueil'); }
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!queueActive) return;
    const t = setInterval(() => {
      setQueueSeconds(s => s + 1);
      setPlayersFound(p => {
        if (Math.random() > 0.7 && p < 10) return Math.min(p + 1, 10);
        return p;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [queueActive]);

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const sidebarMenu = [
    { id: 'Accueil', icon: Icon.Home },
    { id: 'Profil', icon: Icon.User },
    { id: 'Amis', icon: Icon.Friends },
    { id: 'Historique', icon: Icon.Clock },
    { id: 'Paramètres', icon: Icon.Gear },
  ];

  const topNav = ['ACCUEIL', 'JEUX', 'CLASSEMENTS', 'LIGUES', 'TOURNOIS', 'BOUTIQUE'];

  const trackedGames = [
    { id: 'valorant', name: 'VALORANT', mmr: '3,250 MMR' },
    { id: 'cod', name: 'CALL OF DUTY', mmr: '2,850 MMR' },
    { id: 'lol', name: 'LEAGUE OF LEGENDS', mmr: '2,650 MMR' },
    { id: 'apex', name: 'APEX LEGENDS', mmr: '2,400 MMR' },
    { id: 'fortnite', name: 'FORTNITE', mmr: '2,100 MMR' },
  ];

  const popularGames = [
    { id: 'valorant', name: 'VALORANT', players: '24,532 joueurs' },
    { id: 'cod', name: 'CALL OF DUTY', players: '18,102 joueurs' },
    { id: 'lol', name: 'LEAGUE OF LEGENDS', players: '16,910 joueurs' },
    { id: 'apex', name: 'APEX LEGENDS', players: '13,502 joueurs' },
    { id: 'fortnite', name: 'FORTNITE', players: '9,874 joueurs' },
  ];

  const ranking = [
    { rank: 1, name: 'NeyZ', mmr: '4,350 MMR', seed: 1 },
    { rank: 2, name: 'Skyline', mmr: '4,120 MMR', seed: 2 },
    { rank: 3, name: 'W4rrior', mmr: '3,980 MMR', seed: 4 },
    { rank: 4, name: 'Zerox', mmr: '3,250 MMR', seed: 0, me: true },
    { rank: 5, name: 'Kirua', mmr: '3,150 MMR', seed: 5 },
  ];

  const activity = [
    { name: 'NeyZ', action: 'a atteint le rang Radiant', time: 'il y a 10 min', seed: 1, icon: 'rank' },
    { name: 'Skyline', action: 'a remporté un match', time: 'il y a 25 min', seed: 2, icon: 'win' },
    { name: 'W4rrior', action: 'a rejoint Rush Stack', time: 'il y a 1 h', seed: 4, icon: 'join' },
  ];

  const steps = [
    { id: 'rech', label: 'RECHERCHE', sub: 'En cours', icon: Icon.User, active: true },
    { id: 'found', label: 'JOUEURS TROUVÉS', icon: Icon.Friends },
    { id: 'conf', label: 'CONFIRMATION', icon: Icon.Check },
    { id: 'load', label: 'CHARGEMENT', icon: Icon.Load },
    { id: 'match', label: 'EN MATCH', icon: Icon.Sword },
  ];

  /* ---------------- CIRCULAR TIMER ---------------- */
  const Timer = () => {
    const radius = 100;
    const circ = 2 * Math.PI * radius;
    const progress = (queueSeconds % 45) / 45;
    return (
      <div style={{ position: 'relative', width: 240, height: 240, display: 'grid', placeItems: 'center' }}>
        <svg width="240" height="240" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <filter id="redglow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4"/>
            </filter>
            <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff3a48"/>
              <stop offset="1" stopColor="#7a0814"/>
            </linearGradient>
          </defs>
          {/* outer faint ring */}
          <circle cx="120" cy="120" r={radius+10} fill="none" stroke="#2a0810" strokeWidth="1"/>
          {/* background ring */}
          <circle cx="120" cy="120" r={radius} fill="none" stroke="#220a10" strokeWidth="6"/>
          {/* dashed outer */}
          <circle cx="120" cy="120" r={radius+18} fill="none" stroke="#3a0a14" strokeWidth="1" strokeDasharray="2 6"/>
          {/* progress glow */}
          <circle cx="120" cy="120" r={radius} fill="none" stroke="url(#ringG)" strokeWidth="10"
            strokeDasharray={`${circ*progress} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 120 120)"
            filter="url(#redglow)"
            opacity="0.7"
          />
          {/* progress sharp */}
          <circle cx="120" cy="120" r={radius} fill="none" stroke="url(#ringG)" strokeWidth="4"
            strokeDasharray={`${circ*progress} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 120 120)"
          />
          {/* tick marks */}
          {[...Array(60)].map((_,i)=>{
            const a = (i/60) * Math.PI * 2 - Math.PI/2;
            const x1 = 120 + Math.cos(a) * (radius+22);
            const y1 = 120 + Math.sin(a) * (radius+22);
            const x2 = 120 + Math.cos(a) * (radius+26);
            const y2 = 120 + Math.sin(a) * (radius+26);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a0a14" strokeWidth={i%5===0?1.5:0.5}/>;
          })}
        </svg>
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div className="mono-up" style={{ fontSize: 11, color: '#8a8a93', marginBottom: 8 }}>Recherche de partie</div>
          <div className="display" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: '0.02em' }}>{fmtTime(queueSeconds)}</div>
          <div className="mono-up" style={{ fontSize: 10, color: '#5e5e66', marginTop: 10 }}>Temps estimé : 00:45</div>
        </div>
      </div>
    );
  };

  /* ============================== LAYOUT ============================== */
  return (
    <>
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ============== LEFT SIDEBAR ============== */}
      <aside style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', padding: '20px 18px', gap: 22, position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px' }}>
          <RushLogo size={36}/>
          <div className="display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.04em' }}>RUSH STACK</div>
        </div>

        {/* CTA */}
        <button onClick={()=>setMatchFlowOpen(true)} style={{
          width: '100%', padding: '14px 16px', borderRadius: 8,
          background: 'linear-gradient(180deg, #ef2434, #c1121f)',
          color: '#fff', fontWeight: 700, letterSpacing: '0.06em', fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 6px 24px rgba(239,36,52,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
          fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer', border: 'none'
        }}>
          <Icon.Crosshair width="18" height="18"/>
          LANCER UNE QUEUE
        </button>

        {/* MENU */}
        <div>
          <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted-2)', padding: '0 6px 10px' }}>MENU</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sidebarMenu.map(m => {
              const active = activeMenu === m.id;
              const I = m.icon;
              return (
                <button key={m.id} onClick={()=>{
                    setActiveMenu(m.id);
                    if (m.id === 'Profil') goView('profile');
                    else if (m.id === 'Accueil') goView('home');
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 6,
                    background: active ? 'rgba(239,36,52,0.08)' : 'transparent',
                    color: active ? '#ef2434' : '#c0c0c8',
                    fontWeight: active ? 600 : 500, fontSize: 14,
                    position: 'relative', textAlign: 'left'
                  }}>
                  {active && <span style={{position:'absolute', left:0, top:8, bottom:8, width:2, background:'#ef2434', borderRadius:2}}/>}
                  <I width="18" height="18"/>
                  {m.id}
                </button>
              );
            })}
          </nav>
        </div>

        {/* JEUX SUIVIS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 6px 10px' }}>
            <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted-2)' }}>JEUX SUIVIS</div>
            <button style={{ fontSize: 11, color: '#8a8a93' }}>Modifier</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {trackedGames.map(g => (
              <button key={g.id} onClick={()=>setSelectedGame(g.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 8px', borderRadius: 6,
                  background: selectedGame === g.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                  textAlign: 'left'
                }}>
                <div style={{ width: 30, height: 30, borderRadius: 5, overflow:'hidden', flexShrink: 0 }}>
                  <SmallGameLogo game={g.id}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="display" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.03em' }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{g.mmr}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SAISON BANNER */}
        <div style={{
          position: 'relative', borderRadius: 10, overflow: 'hidden',
          background: 'linear-gradient(135deg, #2a0610 0%, #0a0608 100%)',
          padding: '16px 14px', minHeight: 140,
          border: '1px solid #2a0a14'
        }}>
          <svg viewBox="0 0 220 160" preserveAspectRatio="xMidYMid slice" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.55}}>
            <defs>
              <radialGradient id="sbg" cx="0.7" cy="0.5" r="0.6">
                <stop offset="0" stopColor="#ef2434" stopOpacity="0.5"/>
                <stop offset="1" stopColor="#0a0608" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="220" height="160" fill="url(#sbg)"/>
            <g transform="translate(125 30)">
              <path d="M30 10 Q50 15 55 40 Q58 60 55 80 L70 110 L20 110 L8 80 Q5 60 8 40 Q13 15 30 10 Z" fill="#0a0408"/>
              <circle cx="22" cy="45" r="3" fill="#ff3a48"/>
              <circle cx="42" cy="45" r="3" fill="#ff3a48"/>
            </g>
          </svg>
          <div style={{position:'relative'}}>
            <div className="mono-up" style={{ fontSize: 10, color: '#bababa', marginBottom: 4 }}>SAISON 2</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 700, color: '#ef2434', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 28 }}>RECHARGED</div>
            <button style={{
              padding: '8px 12px', borderRadius: 6,
              background: '#ef2434', color: '#fff',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              fontFamily: "'Rajdhani', sans-serif"
            }}>VOIR LES RÉCOMPENSES</button>
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* Social */}
        <div style={{ display: 'flex', gap: 16, padding: '0 6px', color: '#5a5a62' }}>
          <Icon.Discord width="18" height="18"/>
          <Icon.Twitter width="18" height="18"/>
          <Icon.Instagram width="18" height="18"/>
          <Icon.Youtube width="18" height="18"/>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 10, color: '#4a4a52', padding: '0 6px', flexWrap: 'wrap' }}>
          <span>© 2024 RUSH STACK</span>
          <span>CGU</span>
          <span>CONFIDENTIALITÉ</span>
          <span>SUPPORT</span>
        </div>
      </aside>

      {/* ============== MAIN ============== */}
      <main style={{ display: 'flex', flexDirection: 'column' }}>
        {/* TOP NAV */}
        <header style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          alignItems: 'center', padding: '18px 28px',
          borderBottom: '1px solid var(--line)'
        }}>
          <nav style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {topNav.map(n => {
              const active = activeNav === n;
              return (
                <button key={n} onClick={()=>{
                  setActiveNav(n);
                  if (n === 'CLASSEMENTS') goView('leaderboard');
                  else if (n === 'ACCUEIL') goView('home');
                }}
                  style={{
                    padding: '8px 20px', position: 'relative',
                    color: active ? '#ef2434' : '#c0c0c8',
                    fontWeight: 600, letterSpacing: '0.08em', fontSize: 13,
                    fontFamily: "'Rajdhani', sans-serif"
                  }}>
                  {n}
                  {active && <span style={{position:'absolute', left:18, right:18, bottom:0, height:2, background:'#ef2434', borderRadius:2}}/>}
                </button>
              );
            })}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button style={{ position: 'relative', color: '#c0c0c8' }}>
              <Icon.Bell width="20" height="20"/>
              <span style={{position:'absolute', top:-1, right:-1, width:7, height:7, background:'#ef2434', borderRadius:'50%', border:'2px solid var(--bg)'}}/>
            </button>
            <button style={{ color: '#c0c0c8' }}><Icon.Chat width="20" height="20"/></button>
            <div style={{ width: 1, height: 28, background: 'var(--line)' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar seed={0} size={38} ring="#ef2434"/>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Zerox</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Immortal 3 · 3,250 MMR</div>
              </div>
              <Icon.ChevronDown width="16" height="16" style={{color:'#8a8a93'}}/>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        {view === 'home' && (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* HERO */}
          <section style={{
            position: 'relative', borderRadius: 12, overflow: 'hidden',
            background: 'linear-gradient(180deg, #14080a, #0e0608)',
            border: '1px solid var(--line)',
            minHeight: 280
          }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%' }}>
              <HeroArt/>
            </div>
            <div style={{ position: 'relative', padding: '36px 40px', maxWidth: 580 }}>
              <div className="mono-up" style={{ color: '#ef2434', fontSize: 11, fontWeight: 700, marginBottom: 14 }}>RUSH STACK</div>
              <h1 className="display" style={{
                fontSize: 44, lineHeight: 1.05, margin: '0 0 18px',
                fontWeight: 700, letterSpacing: '0.01em'
              }}>
                COMPÈTE. PROGRESSE.<br/>
                <span style={{ color: '#ef2434' }}>DEVIENS UNE LÉGENDE.</span>
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 420, margin: '0 0 26px' }}>
                Affronte les meilleurs joueurs, grimpe les classements<br/>
                et marque l'histoire dans chaque jeu.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={()=>setMatchFlowOpen(true)} style={{
                  padding: '12px 20px', borderRadius: 8,
                  background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
                  fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 4px 18px rgba(239,36,52,0.4)',
                  fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer', border: 'none'
                }}>
                  LANCER UNE QUEUE <Icon.Crosshair width="16" height="16"/>
                </button>
                <button onClick={()=>goView('leaderboard')} style={{
                  padding: '12px 20px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', color: '#fff',
                  border: '1px solid #3a3a42',
                  fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
                  fontFamily: "'Rajdhani', sans-serif"
                }}>VOIR LES CLASSEMENTS</button>
              </div>
            </div>
          </section>

          {/* QUEUE PANEL */}
          <section style={{
            borderRadius: 12, border: '1px solid var(--line)',
            background: 'var(--panel)', padding: 24
          }}>
            <div className="display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 20, textTransform: 'uppercase' }}>
              Lancement de la file d'attente
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 20 }}>
              {/* LEFT: game info */}
              <div style={{
                background: 'var(--panel-2)', borderRadius: 10,
                border: '1px solid var(--line)', padding: 18
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--line)', marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden' }}>
                    <SmallGameLogo game="valorant"/>
                  </div>
                  <div className="display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.05em' }}>VALORANT</div>
                </div>
                <FieldRow label="MODE" value="COMPÉTITIF"/>
                <FieldRow label="RÔLE" value="AU CHOIX"/>
                <FieldRow label="RÉGION" value={<><span>EUROPE (PARIS)</span><span style={{color:'#ef2434', fontSize: 11, marginLeft:'auto'}}>23ms</span></>}/>
              </div>

              {/* CENTER: timer */}
              <div style={{
                background: 'var(--panel-2)', borderRadius: 10,
                border: '1px solid var(--line)', padding: 18,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14
              }}>
                <Timer/>
                <button onClick={()=>setQueueActive(false)} style={{
                  padding: '10px 22px', borderRadius: 6,
                  border: '1px solid #3a3a42', color: '#c0c0c8',
                  fontSize: 11, letterSpacing: '0.1em', fontWeight: 600,
                  background: 'rgba(0,0,0,0.2)',
                  fontFamily: "'Rajdhani', sans-serif"
                }}>ANNULER LA RECHERCHE</button>
              </div>

              {/* RIGHT: MMR info */}
              <div style={{
                background: 'var(--panel-2)', borderRadius: 10,
                border: '1px solid var(--line)', padding: 18
              }}>
                <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 10 }}>MMR ACTUEL</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
                  <ImmortalBadge size={42}/>
                  <div>
                    <div className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em' }}>IMMORTAL 3</div>
                    <div className="display" style={{ fontSize: 22, fontWeight: 700 }}>3,250</div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>PLAGE MMR</div>
                  <div className="display" style={{ fontSize: 16, fontWeight: 600 }}>3,150 - 3,350</div>
                </div>
                <div>
                  <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>JOUEURS TROUVÉS</div>
                  <div className="display" style={{ fontSize: 16, fontWeight: 600 }}>
                    <span style={{ color: '#ef2434' }}>{playersFound}</span> / 10
                  </div>
                </div>
              </div>
            </div>

            {/* STEP TRACKER */}
            <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'start', position: 'relative' }}>
              {steps.map((s, i) => {
                const Ic = s.icon;
                const active = s.active;
                return (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {/* connecting line */}
                    {i < steps.length-1 && (
                      <div style={{
                        position: 'absolute', top: 22, left: 'calc(50% + 24px)', right: 'calc(-50% + 24px)',
                        height: 1, background: 'repeating-linear-gradient(90deg, #3a3a42 0 4px, transparent 4px 8px)'
                      }}/>
                    )}
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      border: active ? '1.5px solid #ef2434' : '1px solid #2a2a31',
                      background: active ? 'rgba(239,36,52,0.08)' : '#0e0e12',
                      display: 'grid', placeItems: 'center',
                      color: active ? '#ef2434' : '#5a5a62',
                      boxShadow: active ? '0 0 20px rgba(239,36,52,0.3)' : 'none',
                      position: 'relative', zIndex: 1
                    }}>
                      <Ic width="20" height="20"/>
                    </div>
                    <div className="mono-up" style={{
                      marginTop: 10, fontSize: 10,
                      color: active ? '#fff' : '#6a6a72',
                      fontWeight: 600
                    }}>{s.label}</div>
                    {s.sub && <div style={{ fontSize: 10, color: '#ef2434', marginTop: 2 }}>{s.sub}</div>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* POPULAR GAMES */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div className="display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Jeux populaires</div>
              <button className="mono-up" style={{ fontSize: 10, color: '#ef2434', fontWeight: 700 }}>VOIR TOUS LES JEUX</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
              {popularGames.map(g => (
                <div key={g.id} style={{
                  borderRadius: 10, overflow: 'hidden',
                  background: 'var(--panel)', border: '1px solid var(--line)',
                  cursor: 'pointer', transition: 'transform .2s, border-color .2s'
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='#ef2434';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='var(--line)';}}>
                  <div style={{ aspectRatio: '4/3', position: 'relative' }}>
                    <GameTile game={g.id}/>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div className="display" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{g.players}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        )}
        {view === 'profile' && window.ProfileView && <window.ProfileView goView={goView}/>}
        {view === 'leaderboard' && window.LeaderboardView && <window.LeaderboardView goView={goView}/>}
      </main>

      {/* ============== RIGHT SIDEBAR ============== */}
      <aside style={{ borderLeft: '1px solid var(--line)', padding: 20, display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>

        {/* PROFILE */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <Avatar seed={0} size={54} ring="#ef2434"/>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>Zerox</div>
                <Icon.CheckBadge width="14" height="14" style={{color:'#ef2434'}}/>
              </div>
              <div style={{ fontSize: 11, color: '#28d17c', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28d17c' }}/> En ligne
              </div>
            </div>
          </div>
          {/* Rank row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <ImmortalBadge size={36}/>
            <div style={{ flex: 1 }}>
              <div className="display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>IMMORTAL 3</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>3,250 MMR</div>
            </div>
          </div>
          {/* progress bar */}
          <div style={{ marginTop: 10, marginBottom: 14 }}>
            <div style={{ height: 4, background: '#26262c', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #c1121f, #ef2434)' }}/>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>3,250 / 3,500</div>
          </div>
          {/* stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            <StatBlock label="MATCHS" value="1,248"/>
            <StatBlock label="VICTOIRES" value="712"/>
            <StatBlock label="WINRATE" value="57%"/>
          </div>
        </div>

        {/* RANKING */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div className="mono-up" style={{ fontSize: 11, fontWeight: 700 }}>CLASSEMENT GLOBAL</div>
            <button className="mono-up" style={{ fontSize: 9, color: '#ef2434', fontWeight: 700 }}>VOIR LE CLASSEMENT</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ranking.map(r => (
              <div key={r.rank} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '4px 0',
                ...(r.me ? {} : {})
              }}>
                <div className="display" style={{ width: 24, fontSize: 12, fontWeight: 700, color: r.rank <= 3 ? '#ef2434' : '#8a8a93' }}>#{r.rank}</div>
                <Avatar seed={r.seed} size={28}/>
                <div style={{ flex: 1, fontSize: 12, fontWeight: r.me ? 700 : 500, color: r.me ? '#fff' : '#c0c0c8' }}>{r.name}</div>
                <div className="display" style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{r.mmr}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, color: '#5a5a62' }}>
            <button style={{ width: 24, height: 24, border: '1px solid var(--line)', borderRadius: 4, display:'grid', placeItems:'center' }}><Icon.ChevronLeft width="12" height="12"/></button>
            <button style={{ width: 24, height: 24, border: '1px solid var(--line)', borderRadius: 4, display:'grid', placeItems:'center' }}><Icon.ChevronRight width="12" height="12"/></button>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 18 }}>
          <div className="mono-up" style={{ fontSize: 11, fontWeight: 700, marginBottom: 14 }}>ACTIVITÉ RÉCENTE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <Avatar seed={a.seed} size={34}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.3 }}>{a.action}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
    {matchFlowOpen && window.MatchFlowView && <window.MatchFlowView onClose={()=>setMatchFlowOpen(false)}/>}
    </>
  );
}

const FieldRow = ({ label, value }) => (
  <div style={{ padding: '10px 0', borderBottom: '1px solid #1f1f24' }}>
    <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
    <div className="display" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.03em', display: 'flex', alignItems: 'center' }}>{value}</div>
  </div>
);

const StatBlock = ({ label, value }) => (
  <div>
    <div className="mono-up" style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
    <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
  </div>
);

// Expose shared components for profile.jsx and leaderboard.jsx
Object.assign(window, {
  Icon, RushLogo, HeroArt, GameTile, SmallGameLogo, Avatar, ImmortalBadge, FieldRow, StatBlock
});

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
