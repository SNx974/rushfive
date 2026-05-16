/* ============================== MATCH FLOW (FULLSCREEN) ============================== */
/*
   5 STAGES :
   0 RECHERCHE        – queue search (timer)
   1 MATCH TROUVÉ     – accept popup
   2 CONFIRMATION     – waiting on all 10 players to accept
   3 CHARGEMENT       – map + team rosters loading
   4 EN MATCH         – live HUD
*/

const ALLIES = [
  { name: 'Zerox',    rank: 'IMMORTAL 3',  role: 'DUELLISTE',   roleColor: '#ef2434', seed: 0, mmr: 3250, me: true },
  { name: 'NeyZ',     rank: 'RADIANT',     role: 'CONTRÔLEUR',  roleColor: '#7c3aed', seed: 1, mmr: 4350 },
  { name: 'Kirua',    rank: 'IMMORTAL 3',  role: 'INITIATEUR',  roleColor: '#3a8aff', seed: 5, mmr: 3150 },
  { name: 'Phantom',  rank: 'IMMORTAL 2',  role: 'SENTINELLE',  roleColor: '#28d17c', seed: 3, mmr: 3120 },
  { name: 'Bl4ze',    rank: 'IMMORTAL 3',  role: 'DUELLISTE',   roleColor: '#ef2434', seed: 2, mmr: 3080 },
];

const ENEMIES = [
  { name: 'Vortex',   rank: 'IMMORTAL 3',  role: 'DUELLISTE',   roleColor: '#ef2434', seed: 4, mmr: 3020 },
  { name: 'Sh4dow',   rank: 'IMMORTAL 2',  role: 'CONTRÔLEUR',  roleColor: '#7c3aed', seed: 1, mmr: 2950 },
  { name: 'Glitch',   rank: 'IMMORTAL 2',  role: 'SENTINELLE',  roleColor: '#28d17c', seed: 0, mmr: 2910 },
  { name: 'Reaper',   rank: 'IMMORTAL 1',  role: 'INITIATEUR',  roleColor: '#3a8aff', seed: 3, mmr: 2880 },
  { name: 'Aurora',   rank: 'IMMORTAL 2',  role: 'DUELLISTE',   roleColor: '#ef2434', seed: 2, mmr: 2840 },
];

/* ============================== ROOT ============================== */
function MatchFlowView({ onClose }) {
  const { useState, useEffect, useRef } = React;
  const [stage, setStage] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const stages = ['RECHERCHE', 'MATCH TROUVÉ', 'CONFIRMATION', 'CHARGEMENT', 'EN MATCH'];

  // auto-advance through stages 0..3 (stage 4 stays)
  useEffect(() => {
    if (!autoplay) return;
    const durations = [10000, 8000, 7000, 10000, 999999];
    const t = setTimeout(() => setStage(s => Math.min(s + 1, 4)), durations[stage]);
    return () => clearTimeout(t);
  }, [stage, autoplay]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#050507',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'mfFadeIn 0.4s ease'
    }}>
      <style>{`
        @keyframes mfFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes mfPulse { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.05);opacity:1} }
        @keyframes mfPing { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        @keyframes mfShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes mfBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes mfSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes mfScan { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes mfDot { 0%,20%{opacity:0.3} 50%{opacity:1} 80%,100%{opacity:0.3} }
        .mf-shimmer { background: linear-gradient(90deg, transparent, rgba(239,36,52,0.4), transparent); background-size: 200% 100%; animation: mfShimmer 2s linear infinite; }
      `}</style>

      {/* ---------- HEADER ---------- */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <window.RushLogo size={26}/>
          <div className="display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>RUSH STACK</div>
          <span style={{ color: '#3a3a42', fontSize: 12 }}>/</span>
          <span className="mono-up" style={{ fontSize: 11, color: '#ef2434', fontWeight: 600 }}>EN PARTIE</span>
        </div>

        {/* Stage stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {stages.map((s, i) => {
            const active = i === stage;
            const done = i < stage;
            return (
              <React.Fragment key={s}>
                <button onClick={()=>{ setAutoplay(false); setStage(i); }} style={{
                  padding: '6px 12px', borderRadius: 4,
                  background: active ? 'rgba(239,36,52,0.15)' : 'transparent',
                  border: active ? '1px solid #ef2434' : '1px solid transparent',
                  color: active ? '#ef2434' : done ? '#c0c0c8' : '#5a5a62',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  fontFamily: 'Rajdhani', display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: done ? '#28d17c' : active ? '#ef2434' : 'transparent',
                    border: !done && !active ? '1px solid #5a5a62' : 'none',
                    display: 'grid', placeItems: 'center', fontSize: 8, color: '#0a0a0c', fontWeight: 700
                  }}>{done ? '✓' : i+1}</span>
                  {s}
                </button>
                {i < stages.length-1 && <span style={{ color: '#26262c' }}>—</span>}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={()=>setAutoplay(a=>!a)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding: '6px 12px', borderRadius: 4,
            border: '1px solid #2a2a31', background: 'transparent',
            color: autoplay ? '#28d17c' : '#8a8a93',
            fontSize: 10, fontWeight: 600, fontFamily: 'Rajdhani', letterSpacing: '0.08em'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: autoplay ? '#28d17c' : '#5a5a62' }}/>
            AUTO {autoplay ? 'ON' : 'OFF'}
          </button>
          <button onClick={onClose} style={{
            padding: '6px 12px', borderRadius: 4,
            border: '1px solid #2a2a31', color: '#c0c0c8',
            fontSize: 10, fontWeight: 600, fontFamily: 'Rajdhani', letterSpacing: '0.08em'
          }}>QUITTER ✕</button>
        </div>
      </header>

      {/* ---------- STAGE BODY ---------- */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {stage === 0 && <Stage1Search/>}
        {stage === 1 && <Stage2Found onAccept={()=>setStage(2)}/>}
        {stage === 2 && <Stage3Confirmation/>}
        {stage === 3 && <Stage4Loading/>}
        {stage === 4 && <Stage5InMatch onLeave={onClose}/>}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* STAGE 1 - RECHERCHE */
/* ====================================================================== */
function Stage1Search() {
  const { useState, useEffect } = React;
  const [secs, setSecs] = useState(18);
  const [found, setFound] = useState(8);
  useEffect(() => {
    const t = setInterval(() => {
      setSecs(s => s + 1);
      setFound(p => Math.random() > 0.6 ? Math.min(p + 1, 10) : p);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{
      width:'100%', height:'100%', position:'relative',
      background: 'radial-gradient(ellipse at center, #1a0608 0%, #050507 70%)',
      display: 'grid', placeItems: 'center', overflow: 'hidden'
    }}>
      {/* Grid floor */}
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.4}}>
        <defs>
          <pattern id="sgrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 L0 0 0 60" fill="none" stroke="#2a0a14" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sgrid)"/>
      </svg>

      {/* Scan rings */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: 400, height: 400, borderRadius: '50%',
            border: '1px solid rgba(239,36,52,0.4)',
            animation: `mfPing 3s ease-out infinite`,
            animationDelay: `${i * 1}s`
          }}/>
        ))}
      </div>

      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <div style={{ marginBottom: 36, animation: 'mfSlideUp 0.5s' }}>
          <div className="mono-up" style={{ fontSize: 11, color: '#ef2434', letterSpacing: '0.3em', marginBottom: 12, fontWeight: 700 }}>
            ◢ RUSH STACK · VALORANT ◣
          </div>
          <div className="display" style={{ fontSize: 48, fontWeight: 700, letterSpacing: '0.04em' }}>
            RECHERCHE DE PARTIE
          </div>
          <div style={{ color: '#8a8a93', fontSize: 14, marginTop: 10, display: 'flex', justifyContent: 'center', gap: 4 }}>
            <span>Analyse des serveurs en cours</span>
            <span style={{animation: 'mfDot 1.4s infinite', animationDelay:'0s'}}>.</span>
            <span style={{animation: 'mfDot 1.4s infinite', animationDelay:'0.2s'}}>.</span>
            <span style={{animation: 'mfDot 1.4s infinite', animationDelay:'0.4s'}}>.</span>
          </div>
        </div>

        {/* BIG TIMER */}
        <BigTimer secs={secs} fmt={fmt}/>

        {/* Info row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 64, marginTop: 40,
          animation: 'mfSlideUp 0.7s'
        }}>
          <InfoStat label="MMR" value="3,250" sub="Plage 3,150 – 3,350"/>
          <InfoStat label="JOUEURS TROUVÉS" value={`${found} / 10`} sub="Équilibrage en cours" accent/>
          <InfoStat label="RÉGION" value="EUROPE" sub="Paris · 23ms"/>
          <InfoStat label="MODE" value="COMPÉTITIF" sub="5v5 · Au choix"/>
        </div>

        <button style={{
          marginTop: 50, padding: '14px 32px', borderRadius: 6,
          border: '1px solid #2a2a31', background: 'rgba(0,0,0,0.4)',
          color: '#c0c0c8', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.15em', fontFamily: 'Rajdhani'
        }}>ANNULER LA RECHERCHE</button>
      </div>
    </div>
  );
}

function BigTimer({ secs, fmt }) {
  const radius = 150;
  const circ = 2 * Math.PI * radius;
  const progress = (secs % 45) / 45;
  return (
    <div style={{ position: 'relative', width: 360, height: 360, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
      <svg width="360" height="360" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="bigGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6"/>
          </filter>
          <linearGradient id="bigRingG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff3a48"/>
            <stop offset="1" stopColor="#7a0814"/>
          </linearGradient>
        </defs>
        <circle cx="180" cy="180" r={radius+24} fill="none" stroke="#2a0810" strokeWidth="1"/>
        <circle cx="180" cy="180" r={radius+14} fill="none" stroke="#3a0a14" strokeWidth="1" strokeDasharray="2 8"/>
        <circle cx="180" cy="180" r={radius} fill="none" stroke="#220a10" strokeWidth="3"/>
        <circle cx="180" cy="180" r={radius} fill="none" stroke="url(#bigRingG)" strokeWidth="14"
          strokeDasharray={`${circ*progress} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 180 180)" filter="url(#bigGlow)" opacity="0.6"/>
        <circle cx="180" cy="180" r={radius} fill="none" stroke="url(#bigRingG)" strokeWidth="4"
          strokeDasharray={`${circ*progress} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 180 180)"/>
        {[...Array(60)].map((_,i)=>{
          const a = (i/60) * Math.PI * 2 - Math.PI/2;
          const r2 = radius + 30;
          return <line key={i} x1={180 + Math.cos(a)*r2} y1={180 + Math.sin(a)*r2} x2={180 + Math.cos(a)*(r2+6)} y2={180 + Math.sin(a)*(r2+6)} stroke="#3a0a14" strokeWidth={i%5===0?2:0.6}/>;
        })}
      </svg>
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <div className="display" style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, letterSpacing: '0.04em' }}>{fmt(secs)}</div>
        <div className="mono-up" style={{ fontSize: 11, color: '#8a8a93', marginTop: 8, letterSpacing: '0.2em' }}>TEMPS ÉCOULÉ</div>
        <div className="mono-up" style={{ fontSize: 10, color: '#5a5a62', marginTop: 4 }}>EST. 00:45</div>
      </div>
    </div>
  );
}

function InfoStat({ label, value, sub, accent }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 140 }}>
      <div className="mono-up" style={{ fontSize: 10, color: '#5a5a62', marginBottom: 6, letterSpacing: '0.15em' }}>{label}</div>
      <div className="display" style={{ fontSize: 22, fontWeight: 700, color: accent ? '#ef2434' : '#fff' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6a6a72', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* ====================================================================== */
/* STAGE 2 - MATCH TROUVÉ ! */
/* ====================================================================== */
function Stage2Found({ onAccept }) {
  const { useState, useEffect } = React;
  const [count, setCount] = useState(15);
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    if (accepted) return;
    const t = setInterval(() => setCount(c => Math.max(0, c-1)), 1000);
    return () => clearInterval(t);
  }, [accepted]);

  return (
    <div style={{
      width:'100%', height:'100%', position:'relative',
      background: 'radial-gradient(ellipse at center, #2a0a14 0%, #0a0608 60%, #050507 100%)',
      display: 'grid', placeItems: 'center'
    }}>
      {/* Strobing rings */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        {[0,1].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: 600, height: 600, borderRadius: '50%',
            border: '2px solid rgba(239,36,52,0.5)',
            animation: `mfPing 2.4s ease-out infinite`,
            animationDelay: `${i * 1.2}s`
          }}/>
        ))}
      </div>

      {/* Scan lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(239,36,52,0.02) 3px, rgba(239,36,52,0.02) 4px)',
        pointerEvents: 'none'
      }}/>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, animation: 'mfSlideUp 0.4s' }}>
        <div className="mono-up" style={{ color: '#ef2434', fontSize: 13, letterSpacing: '0.4em', marginBottom: 12, animation: 'mfBlink 1.2s infinite' }}>
          ◢◣ NOTIFICATION SYSTÈME ◢◣
        </div>
        <div className="display" style={{
          fontSize: 96, fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1,
          background: 'linear-gradient(180deg, #fff 0%, #ef2434 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textShadow: '0 0 60px rgba(239,36,52,0.5)',
          marginBottom: 8
        }}>MATCH TROUVÉ</div>
        <div style={{ fontSize: 16, color: '#c0c0c8', letterSpacing: '0.1em', marginBottom: 40 }}>
          Une partie a été assignée à votre équipe
        </div>

        {/* Map preview */}
        <MapPreview/>

        {/* Match details strip */}
        <div style={{
          display: 'flex', gap: 0, marginTop: 28, marginBottom: 36,
          border: '1px solid #2a2a31', borderRadius: 6, overflow: 'hidden',
          background: 'rgba(0,0,0,0.4)'
        }}>
          <DetailCell label="MODE" value="COMPÉTITIF"/>
          <DetailCell label="MAP" value="ASCENT"/>
          <DetailCell label="ÉQUIPE" value="5v5"/>
          <DetailCell label="DURÉE EST." value="42 min"/>
          <DetailCell label="MMR MOYEN" value="3,178"/>
          <DetailCell label="SERVEUR" value="EU-PAR-04"/>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: 22 }}>
          <div className="mono-up" style={{ fontSize: 11, color: '#8a8a93', marginBottom: 6, letterSpacing: '0.15em' }}>
            TEMPS POUR ACCEPTER
          </div>
          <div className="display" style={{
            fontSize: 36, fontWeight: 700,
            color: count <= 5 ? '#ef2434' : '#fff',
            animation: count <= 5 ? 'mfBlink 0.8s infinite' : 'none'
          }}>00:{String(count).padStart(2,'0')}</div>
        </div>

        {/* Buttons */}
        {!accepted ? (
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <button onClick={()=>setAccepted(true)} style={{
              padding: '18px 56px', borderRadius: 8,
              background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
              fontSize: 16, fontWeight: 700, letterSpacing: '0.15em',
              fontFamily: 'Rajdhani', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(239,36,52,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: 'mfPulse 1.6s ease-in-out infinite',
              border: 'none'
            }}>✓ ACCEPTER</button>
            <button style={{
              padding: '18px 32px', borderRadius: 8,
              border: '1px solid #3a3a42', background: 'rgba(0,0,0,0.4)',
              color: '#c0c0c8', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.12em', fontFamily: 'Rajdhani'
            }}>REFUSER</button>
          </div>
        ) : (
          <div>
            <div className="display" style={{ fontSize: 18, color: '#28d17c', marginBottom: 12 }}>
              ✓ ACCEPTÉ — En attente des autres joueurs
            </div>
            <button onClick={onAccept} style={{
              padding: '12px 28px', borderRadius: 6,
              background: 'rgba(40,209,124,0.1)', border: '1px solid #28d17c',
              color: '#28d17c', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              fontFamily: 'Rajdhani'
            }}>CONTINUER →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MapPreview() {
  return (
    <div style={{
      display: 'inline-block', borderRadius: 10, overflow: 'hidden',
      border: '1px solid #2a2a31', background: '#0a0608',
      width: 540, height: 200
    }}>
      <svg viewBox="0 0 540 200" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="mapG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0a14"/>
            <stop offset="1" stopColor="#0a0608"/>
          </linearGradient>
        </defs>
        <rect width="540" height="200" fill="url(#mapG)"/>
        {/* Map layout */}
        <g opacity="0.7">
          <rect x="60" y="60" width="100" height="80" fill="none" stroke="#ef2434" strokeWidth="1.5"/>
          <rect x="180" y="40" width="180" height="120" fill="none" stroke="#ef2434" strokeWidth="1.5"/>
          <rect x="380" y="60" width="100" height="80" fill="none" stroke="#ef2434" strokeWidth="1.5"/>
          <line x1="160" y1="100" x2="180" y2="100" stroke="#ef2434" strokeWidth="1.5"/>
          <line x1="360" y1="100" x2="380" y2="100" stroke="#ef2434" strokeWidth="1.5"/>
          <line x1="270" y1="160" x2="270" y2="180" stroke="#ef2434" strokeWidth="1.5"/>
          {/* Site labels */}
          <text x="110" y="105" textAnchor="middle" fill="#ef2434" fontFamily="Rajdhani" fontWeight="700" fontSize="20" letterSpacing="0.1em">A</text>
          <text x="430" y="105" textAnchor="middle" fill="#ef2434" fontFamily="Rajdhani" fontWeight="700" fontSize="20" letterSpacing="0.1em">B</text>
          <text x="270" y="190" textAnchor="middle" fill="#8a8a93" fontFamily="Rajdhani" fontSize="9" letterSpacing="0.2em">SPAWN</text>
        </g>
        {/* Map name */}
        <text x="270" y="30" textAnchor="middle" fill="#fff" fontFamily="Rajdhani" fontWeight="700" fontSize="14" letterSpacing="0.3em">ASCENT · A-SITE & B-SITE</text>
        {/* corner dots */}
        <circle cx="20" cy="20" r="2" fill="#ef2434"/>
        <circle cx="520" cy="20" r="2" fill="#ef2434"/>
        <circle cx="20" cy="180" r="2" fill="#ef2434"/>
        <circle cx="520" cy="180" r="2" fill="#ef2434"/>
      </svg>
    </div>
  );
}

function DetailCell({ label, value }) {
  return (
    <div style={{ flex: 1, padding: '12px 16px', borderRight: '1px solid #1f1f24', textAlign: 'left' }}>
      <div className="mono-up" style={{ fontSize: 9, color: '#5a5a62', marginBottom: 4 }}>{label}</div>
      <div className="display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>{value}</div>
    </div>
  );
}

/* ====================================================================== */
/* STAGE 3 - CONFIRMATION */
/* ====================================================================== */
function Stage3Confirmation() {
  const { useState, useEffect } = React;
  const [states, setStates] = useState(() => {
    const init = Array(10).fill('pending');
    init[0] = 'accepted'; // me
    return init;
  });
  const [count, setCount] = useState(8);

  useEffect(() => {
    const seq = [1, 5, 2, 6, 7, 3, 8, 4, 9]; // order of acceptance
    seq.forEach((idx, i) => {
      setTimeout(() => setStates(s => { const c = [...s]; c[idx] = 'accepted'; return c; }), 500 + i * 700);
    });
    const t = setInterval(() => setCount(c => Math.max(0, c-1)), 1000);
    return () => clearInterval(t);
  }, []);

  const acceptedCount = states.filter(s => s === 'accepted').length;
  const all = [...ALLIES.map(p => ({...p, team:'A'})), ...ENEMIES.map(p => ({...p, team:'B'}))];

  return (
    <div style={{
      width:'100%', height:'100%', position:'relative', overflow:'auto',
      background: 'radial-gradient(ellipse at top, #14080a 0%, #050507 80%)',
      padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32, animation: 'mfSlideUp 0.4s' }}>
        <div className="mono-up" style={{ color: '#ef2434', fontSize: 11, letterSpacing: '0.3em', fontWeight: 700, marginBottom: 8 }}>
          ◢ CONFIRMATION REQUISE ◣
        </div>
        <div className="display" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '0.03em', marginBottom: 10 }}>
          EN ATTENTE DES JOUEURS
        </div>
        <div style={{ fontSize: 14, color: '#8a8a93' }}>
          Les autres joueurs doivent accepter le match pour démarrer la partie
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 720, marginBottom: 40, animation: 'mfSlideUp 0.5s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="display" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em' }}>
            <span style={{ color: '#28d17c', fontSize: 22 }}>{acceptedCount}</span>
            <span style={{ color: '#5a5a62' }}> / 10 JOUEURS PRÊTS</span>
          </div>
          <div className="mono-up" style={{ fontSize: 11, color: count <= 10 ? '#ef2434' : '#8a8a93' }}>
            EXPIRE DANS 00:{String(count).padStart(2,'0')}
          </div>
        </div>
        <div style={{ height: 8, background: '#1a1a20', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            width: `${(acceptedCount/10)*100}%`, height: '100%',
            background: 'linear-gradient(90deg, #c1121f, #ef2434, #ff5070)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 20px rgba(239,36,52,0.5)'
          }}/>
          <div className="mf-shimmer" style={{ position: 'absolute', inset: 0 }}/>
        </div>
      </div>

      {/* Teams */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 40, width: '100%', maxWidth: 1200, animation: 'mfSlideUp 0.6s' }}>
        <TeamColumn label="ÉQUIPE ALLIÉE" color="#28d17c" players={ALLIES.map((p,i) => ({...p, state: states[i]}))}/>
        <div style={{ display: 'grid', placeItems: 'center', padding: '0 16px' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef2434, #7a0814)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 0 30px rgba(239,36,52,0.5)',
            fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 26, letterSpacing: '0.05em'
          }}>VS</div>
        </div>
        <TeamColumn label="ÉQUIPE ENNEMIE" color="#ef2434" players={ENEMIES.map((p,i) => ({...p, state: states[5+i]}))}/>
      </div>
    </div>
  );
}

function TeamColumn({ label, color, players }) {
  const { Avatar } = window;
  return (
    <div>
      <div className="display" style={{
        fontSize: 13, fontWeight: 700, letterSpacing: '0.18em',
        color, marginBottom: 16, textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
      }}>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${color}66)` }}/>
        {label}
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}66, transparent)` }}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', borderRadius: 8,
            background: p.me ? 'rgba(239,36,52,0.08)' : 'rgba(255,255,255,0.02)',
            border: p.me ? '1px solid rgba(239,36,52,0.3)' : '1px solid #1f1f24',
            transition: 'all 0.3s',
            opacity: p.state === 'pending' ? 0.55 : 1
          }}>
            <div style={{ position: 'relative' }}>
              <Avatar seed={p.seed} size={42} ring={p.state === 'accepted' ? '#28d17c' : p.me ? '#ef2434' : null}/>
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: '50%',
                background: p.state === 'accepted' ? '#28d17c' : '#1a1a20',
                border: '2px solid #050507',
                display: 'grid', placeItems: 'center',
                fontSize: 10, fontWeight: 700, color: '#0a0a0c'
              }}>
                {p.state === 'accepted' ? '✓' : (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5a5a62', animation: 'mfBlink 1.2s infinite' }}/>
                )}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="display" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                {p.name}
                {p.me && <span style={{ fontSize: 9, padding: '1px 5px', background: '#ef2434', borderRadius: 2, letterSpacing: '0.1em' }}>TOI</span>}
              </div>
              <div style={{ fontSize: 11, color: '#8a8a93', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: p.roleColor, fontWeight: 600 }}>{p.role}</span>
                <span>·</span>
                <span>{p.rank}</span>
              </div>
            </div>
            <div className="mono-up" style={{
              fontSize: 10, fontWeight: 700,
              color: p.state === 'accepted' ? '#28d17c' : '#5a5a62'
            }}>
              {p.state === 'accepted' ? 'PRÊT' : 'EN ATTENTE'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* STAGE 4 - CHARGEMENT */
/* ====================================================================== */
function Stage4Loading() {
  const { useState, useEffect } = React;
  const [pct, setPct] = useState(8);
  useEffect(() => {
    const t = setInterval(() => setPct(p => Math.min(100, p + Math.random() * 4 + 1)), 250);
    return () => clearInterval(t);
  }, []);
  const tips = [
    "Communiquez avec votre équipe pour coordonner vos attaques.",
    "L'économie est aussi importante que l'aim — gérez vos crédits.",
    "Apprenez les angles de chaque map pour anticiper l'adversaire.",
    "Un agent ne fait pas tout — c'est votre setup d'équipe qui compte."
  ];
  const [tip, setTip] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTip(i => (i+1) % tips.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden' }}>
      {/* Map background */}
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          <radialGradient id="lbgg" cx="0.5" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#3a1018"/>
            <stop offset="1" stopColor="#050507"/>
          </radialGradient>
          <pattern id="lgrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0 L0 0 0 80" fill="none" stroke="#2a0a14" strokeWidth="0.8" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#lbgg)"/>
        <rect width="1920" height="1080" fill="url(#lgrid)"/>
        {/* Big map layout */}
        <g opacity="0.4" transform="translate(560 220)">
          <rect x="0" y="100" width="200" height="180" fill="none" stroke="#ef2434" strokeWidth="2"/>
          <rect x="280" y="40" width="240" height="300" fill="none" stroke="#ef2434" strokeWidth="2"/>
          <rect x="600" y="100" width="200" height="180" fill="none" stroke="#ef2434" strokeWidth="2"/>
          <line x1="200" y1="190" x2="280" y2="190" stroke="#ef2434" strokeWidth="2"/>
          <line x1="520" y1="190" x2="600" y2="190" stroke="#ef2434" strokeWidth="2"/>
          <text x="100" y="200" textAnchor="middle" fill="#ef2434" fontFamily="Rajdhani" fontWeight="700" fontSize="58" letterSpacing="0.15em">A</text>
          <text x="700" y="200" textAnchor="middle" fill="#ef2434" fontFamily="Rajdhani" fontWeight="700" fontSize="58" letterSpacing="0.15em">B</text>
          <text x="400" y="200" textAnchor="middle" fill="#8a8a93" fontFamily="Rajdhani" fontWeight="500" fontSize="14" letterSpacing="0.3em">MID</text>
        </g>
        {/* particles */}
        {[...Array(80)].map((_,i)=>(
          <circle key={i} cx={Math.random()*1920} cy={Math.random()*1080} r={Math.random()*1.5+0.3} fill="#ef2434" opacity={Math.random()*0.4+0.1}/>
        ))}
      </svg>

      <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
        {/* TOP — Map info */}
        <div style={{ padding: '40px 60px', textAlign: 'center', animation: 'mfSlideUp 0.5s' }}>
          <div className="mono-up" style={{ color: '#ef2434', fontSize: 11, letterSpacing: '0.4em', fontWeight: 700, marginBottom: 10 }}>
            ◢ CHARGEMENT DE LA PARTIE ◣
          </div>
          <div className="display" style={{ fontSize: 72, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, marginBottom: 6,
            textShadow: '0 0 40px rgba(239,36,52,0.5)' }}>
            ASCENT
          </div>
          <div style={{ fontSize: 13, color: '#8a8a93', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Compétitif · Serveur EU-PAR-04 · Match #284,931
          </div>
        </div>

        {/* MIDDLE — VS roster */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 40, width: '100%', alignItems: 'center' }}>
            <LoadingRoster players={ALLIES} side="left" color="#28d17c" label="ÉQUIPE ALLIÉE"/>
            <div style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 120, fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1, 
                background: 'linear-gradient(180deg, #ef2434, #7a0814)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VS</div>
              <div className="mono-up" style={{ fontSize: 11, color: '#8a8a93', letterSpacing: '0.3em' }}>FIRST TO 13</div>
            </div>
            <LoadingRoster players={ENEMIES} side="right" color="#ef2434" label="ÉQUIPE ENNEMIE"/>
          </div>
        </div>

        {/* BOTTOM — Loading bar + tip */}
        <div style={{ padding: '30px 60px 40px', animation: 'mfSlideUp 0.7s' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Tip */}
            <div style={{
              padding: '16px 22px', marginBottom: 18,
              background: 'rgba(0,0,0,0.4)', border: '1px solid #2a2a31',
              borderLeft: '3px solid #ef2434', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div className="display" style={{ color: '#ef2434', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', whiteSpace: 'nowrap' }}>ASTUCE</div>
              <div style={{ flex: 1, fontSize: 14, color: '#c0c0c8', lineHeight: 1.5 }}>{tips[tip]}</div>
            </div>

            {/* Progress */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
              <div className="display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em' }}>
                CHARGEMENT DES ASSETS...
              </div>
              <div className="display" style={{ fontSize: 22, fontWeight: 700, color: '#ef2434' }}>{Math.floor(pct)}%</div>
            </div>
            <div style={{ height: 10, background: '#1a1a20', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: 'linear-gradient(90deg, #c1121f, #ef2434, #ff5070)',
                transition: 'width 0.25s ease',
                boxShadow: '0 0 20px rgba(239,36,52,0.6)'
              }}/>
              <div className="mf-shimmer" style={{ position: 'absolute', inset: 0 }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5a5a62', marginTop: 8 }}>
              <span>◆ TEXTURES</span>
              <span>◆ AUDIO</span>
              <span>◆ AGENTS</span>
              <span>◆ MAP</span>
              <span>◆ CONNEXION SERVEUR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingRoster({ players, side, color, label }) {
  const { Avatar } = window;
  return (
    <div>
      <div className="display" style={{
        fontSize: 13, fontWeight: 700, letterSpacing: '0.18em',
        color, marginBottom: 18, textAlign: side === 'left' ? 'right' : 'left'
      }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {players.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            flexDirection: side === 'left' ? 'row-reverse' : 'row',
            padding: '10px 14px', borderRadius: 8,
            background: p.me ? 'rgba(239,36,52,0.08)' : 'rgba(0,0,0,0.4)',
            border: p.me ? '1px solid rgba(239,36,52,0.4)' : '1px solid #1f1f24',
            backdropFilter: 'blur(4px)'
          }}>
            {/* Agent portrait */}
            <div style={{
              width: 54, height: 54, borderRadius: 6,
              background: `linear-gradient(135deg, ${p.roleColor}, ${p.roleColor}33)`,
              padding: 2, position: 'relative'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 4, overflow:'hidden' }}>
                <Avatar seed={p.seed} size={50}/>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: side === 'left' ? 'right' : 'left', minWidth: 140 }}>
              <div className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>
                {p.name}{p.me && <span style={{ marginLeft: 6, fontSize: 9, padding: '1px 5px', background: '#ef2434', borderRadius: 2 }}>TOI</span>}
              </div>
              <div style={{ fontSize: 11, color: p.roleColor, fontWeight: 600, letterSpacing: '0.05em' }}>
                {p.role}
              </div>
              <div style={{ fontSize: 10, color: '#8a8a93' }}>{p.rank} · {p.mmr.toLocaleString()} MMR</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* STAGE 5 - EN MATCH (HUD) */
/* ====================================================================== */
function Stage5InMatch({ onLeave }) {
  const { useState, useEffect } = React;
  const [scoreA, setScoreA] = useState(7);
  const [scoreB, setScoreB] = useState(4);
  const [round, setRound] = useState(12);
  const [time, setTime] = useState(78);
  const [hp, setHp] = useState(85);
  const [shield, setShield] = useState(50);

  useEffect(() => {
    const t = setInterval(() => setTime(s => s > 0 ? s - 1 : 100), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(1,'0')}:${String(s%60).padStart(2,'0')}`;

  const killFeed = [
    { killer: 'NeyZ', team: 'A', weapon: 'VANDAL', victim: 'Vortex', vTeam: 'B', headshot: true },
    { killer: 'Zerox', team: 'A', weapon: 'PHANTOM', victim: 'Reaper', vTeam: 'B', headshot: false, me: true },
    { killer: 'Aurora', team: 'B', weapon: 'OPERATOR', victim: 'Bl4ze', vTeam: 'A', headshot: true },
  ];

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden', background:'#08080a' }}>
      {/* Game viewport placeholder */}
      <GameViewport/>

      {/* TOP HUD — Score bar */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
        padding: '8px 4px'
      }}>
        {/* Ally team agents */}
        <div style={{ display:'flex', gap: 4, padding: '0 12px' }}>
          {ALLIES.map((p, i) => (
            <div key={i} title={p.name} style={{
              width: 30, height: 30, borderRadius: 4,
              background: `linear-gradient(135deg, ${p.roleColor}55, ${p.roleColor}22)`,
              border: '1px solid #28d17c',
              position: 'relative'
            }}>
              {i < 3 ? null : <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 4 }}/>}
              {p.me && <div style={{ position: 'absolute', inset: 0, border: '1.5px solid #ef2434', borderRadius: 4 }}/>}
              <svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="11" r="5" fill={p.roleColor}/><path d="M5 28 Q15 18 25 28" fill={p.roleColor}/></svg>
            </div>
          ))}
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', borderLeft: '1px solid #2a2a31', borderRight: '1px solid #2a2a31' }}>
          <div className="display" style={{ fontSize: 36, fontWeight: 700, color: '#28d17c', minWidth: 40, textAlign: 'center' }}>{String(scoreA).padStart(2,'0')}</div>
          <div style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: 28, fontWeight: 700, color: time <= 10 ? '#ef2434' : '#fff', lineHeight: 1, animation: time <= 10 ? 'mfBlink 0.6s infinite' : 'none' }}>{fmt(time)}</div>
            <div className="mono-up" style={{ fontSize: 9, color: '#8a8a93', marginTop: 4, letterSpacing: '0.2em' }}>ROUND {round} · ATK</div>
          </div>
          <div className="display" style={{ fontSize: 36, fontWeight: 700, color: '#ef2434', minWidth: 40, textAlign: 'center' }}>{String(scoreB).padStart(2,'0')}</div>
        </div>

        {/* Enemy team agents */}
        <div style={{ display:'flex', gap: 4, padding: '0 12px' }}>
          {ENEMIES.map((p, i) => (
            <div key={i} title={p.name} style={{
              width: 30, height: 30, borderRadius: 4,
              background: `linear-gradient(135deg, ${p.roleColor}55, ${p.roleColor}22)`,
              border: '1px solid #ef2434',
              position: 'relative'
            }}>
              {i < 4 ? null : <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', borderRadius: 4 }}>
                <svg width="30" height="30" viewBox="0 0 30 30"><line x1="9" y1="9" x2="21" y2="21" stroke="#ef2434" strokeWidth="2"/><line x1="21" y1="9" x2="9" y2="21" stroke="#ef2434" strokeWidth="2"/></svg>
              </div>}
              <svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="11" r="5" fill={p.roleColor}/><path d="M5 28 Q15 18 25 28" fill={p.roleColor}/></svg>
            </div>
          ))}
        </div>
      </div>

      {/* TOP LEFT — Minimap */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        width: 200, height: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
        padding: 8
      }}>
        <svg viewBox="0 0 184 184" style={{ width: '100%', height: '100%' }}>
          <rect width="184" height="184" fill="#0a0608"/>
          <g opacity="0.5">
            <rect x="20" y="60" width="50" height="40" fill="none" stroke="#ef2434" strokeWidth="1"/>
            <rect x="80" y="40" width="60" height="80" fill="none" stroke="#ef2434" strokeWidth="1"/>
            <rect x="150" y="60" width="20" height="40" fill="none" stroke="#ef2434" strokeWidth="1"/>
            <line x1="70" y1="80" x2="80" y2="80" stroke="#ef2434"/>
            <line x1="140" y1="80" x2="150" y2="80" stroke="#ef2434"/>
            <text x="45" y="84" textAnchor="middle" fill="#ef2434" fontFamily="Rajdhani" fontWeight="700" fontSize="12">A</text>
            <text x="160" y="84" textAnchor="middle" fill="#ef2434" fontFamily="Rajdhani" fontWeight="700" fontSize="12">B</text>
          </g>
          {/* Allies dots */}
          {[[40,80],[60,90],[100,70],[105,100],[110,60]].map(([x,y],i)=>(
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="#28d17c" opacity="0.3"/>
              <circle cx={x} cy={y} r="3" fill="#28d17c"/>
            </g>
          ))}
          {/* Enemies (some unknown) */}
          {[[155,75],[145,90]].map(([x,y],i)=>(
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="#ef2434"/>
            </g>
          ))}
          {/* Me */}
          <polygon points="100,72 95,82 105,82" fill="#ffd860"/>
          <text x="6" y="14" fill="#8a8a93" fontFamily="Rajdhani" fontSize="8" letterSpacing="0.1em">ASCENT</text>
        </svg>
      </div>

      {/* TOP RIGHT — Kill feed */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 4,
        minWidth: 280
      }}>
        {killFeed.map((k, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4,
            padding: '6px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
            fontSize: 12,
            borderRight: k.me ? '3px solid #ef2434' : 'none'
          }}>
            <span className="display" style={{ color: k.team === 'A' ? '#28d17c' : '#ef2434', fontWeight: 700 }}>{k.killer}</span>
            <span style={{ color: '#5a5a62', fontFamily: 'Rajdhani', fontSize: 11 }}>◀ {k.weapon}{k.headshot ? ' ✦' : ''} ▶</span>
            <span className="display" style={{ color: k.vTeam === 'A' ? '#28d17c' : '#ef2434', fontWeight: 700 }}>{k.victim}</span>
          </div>
        ))}
      </div>

      {/* BOTTOM LEFT — Player status */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24,
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
        padding: '14px 18px',
        minWidth: 360
      }}>
        <window.Avatar seed={0} size={56} ring="#ef2434"/>
        <div style={{ flex: 1 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
            <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>Zerox</div>
            <span style={{ fontSize: 9, padding: '1px 5px', background: '#ef2434', borderRadius: 2, fontFamily: 'Rajdhani', letterSpacing: '0.1em' }}>DUELLISTE</span>
          </div>
          {/* HP bar */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#8a8a93', marginBottom: 2 }}>
              <span className="mono-up">VIE</span><span className="display" style={{color:'#fff', fontWeight: 700}}>{hp} / 100</span>
            </div>
            <div style={{ height: 6, background: '#26262c', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${hp}%`, height: '100%', background: hp > 50 ? '#28d17c' : hp > 25 ? '#ffd860' : '#ef2434' }}/>
            </div>
          </div>
          {/* Shield */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#8a8a93', marginBottom: 2 }}>
              <span className="mono-up">ARMURE</span><span className="display" style={{color:'#fff', fontWeight: 700}}>{shield} / 50</span>
            </div>
            <div style={{ height: 6, background: '#26262c', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${(shield/50)*100}%`, height: '100%', background: '#3a8aff' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CENTER — Abilities */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8
      }}>
        {[
          { key: 'C', name: 'BLINK', ready: 1, max: 2 },
          { key: 'Q', name: 'BLAZE', ready: 1, max: 1 },
          { key: 'E', name: 'DASH', ready: 0, max: 1 },
          { key: 'X', name: 'ULTIMATE', ready: 6, max: 7, ult: true },
        ].map(a => (
          <div key={a.key} style={{
            width: 64, height: 64,
            background: a.ready === 0 ? 'rgba(0,0,0,0.6)' : a.ult ? 'rgba(239,36,52,0.2)' : 'rgba(0,0,0,0.6)',
            border: a.ready === 0 ? '1px solid #2a2a31' : a.ult ? '1.5px solid #ef2434' : '1px solid rgba(40,209,124,0.5)',
            borderRadius: 6, position: 'relative',
            display: 'grid', placeItems: 'center',
            opacity: a.ready === 0 ? 0.4 : 1,
            boxShadow: a.ult && a.ready >= a.max ? '0 0 20px rgba(239,36,52,0.6)' : 'none'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 22, fontWeight: 700, color: a.ult ? '#ef2434' : '#fff' }}>{a.key}</div>
              <div className="mono-up" style={{ fontSize: 7, color: '#8a8a93', marginTop: 2 }}>{a.name}</div>
            </div>
            <div style={{ position:'absolute', top: 2, right: 4, fontSize: 9, color: a.ult ? '#ef2434' : '#28d17c', fontFamily: 'Rajdhani', fontWeight: 700 }}>
              {a.ready}/{a.max}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM RIGHT — Weapon + credits */}
      <div style={{
        position: 'absolute', bottom: 24, right: 24,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
        padding: '14px 18px', minWidth: 240
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
          <div className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.05em' }}>PHANTOM</div>
          <div className="mono-up" style={{ fontSize: 9, color: '#8a8a93' }}>RIFLE</div>
        </div>
        {/* Bullet representation */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
          {[...Array(30)].map((_,i) => (
            <div key={i} style={{ flex: 1, height: 3, background: i < 23 ? '#fff' : '#3a3a42', borderRadius: 1 }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <div>
            <div className="mono-up" style={{ fontSize: 9, color: '#8a8a93' }}>MUNITIONS</div>
            <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>23 / 90</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono-up" style={{ fontSize: 9, color: '#8a8a93' }}>CRÉDITS</div>
            <div className="display" style={{ fontSize: 18, fontWeight: 700, color: '#ffd860' }}>2,450 ◆</div>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }}>
        <svg width="24" height="24"><line x1="0" y1="12" x2="8" y2="12" stroke="#28d17c" strokeWidth="1.5"/><line x1="16" y1="12" x2="24" y2="12" stroke="#28d17c" strokeWidth="1.5"/><line x1="12" y1="0" x2="12" y2="8" stroke="#28d17c" strokeWidth="1.5"/><line x1="12" y1="16" x2="12" y2="24" stroke="#28d17c" strokeWidth="1.5"/><circle cx="12" cy="12" r="1" fill="#28d17c"/></svg>
      </div>

      {/* CTA to end demo */}
      <button onClick={onLeave} style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, 60px)',
        padding: '10px 22px', borderRadius: 6,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        border: '1px solid #2a2a31', color: '#c0c0c8',
        fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.15em'
      }}>QUITTER LA PARTIE</button>
    </div>
  );
}

function GameViewport() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #5a3a28 0%, #3a1a10 60%, #1a0808 100%)'
    }}>
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a3a28"/>
            <stop offset="0.4" stopColor="#3a1a10"/>
            <stop offset="0.6" stopColor="#1a0808"/>
          </linearGradient>
        </defs>
        {/* Sky */}
        <rect width="1920" height="640" fill="url(#sky)"/>
        {/* Sun glow */}
        <circle cx="1400" cy="320" r="180" fill="#ff8050" opacity="0.4"/>
        <circle cx="1400" cy="320" r="80" fill="#ffb070" opacity="0.6"/>
        {/* Ground */}
        <polygon points="0,640 1920,640 1920,1080 0,1080" fill="#0a0608"/>
        {/* Distant buildings */}
        <polygon points="200,640 200,460 280,460 280,420 350,420 350,460 420,460 420,640" fill="#1a0a08"/>
        <polygon points="450,640 450,400 600,400 600,640" fill="#0a0608"/>
        <polygon points="650,640 650,380 720,380 720,340 820,340 820,640" fill="#1a0a08"/>
        <polygon points="900,640 900,360 1080,360 1080,640" fill="#0a0608"/>
        <polygon points="1120,640 1120,400 1200,400 1200,640" fill="#0a0608"/>
        <polygon points="1240,640 1240,420 1340,420 1340,440 1420,440 1420,640" fill="#1a0a08"/>
        <polygon points="1460,640 1460,380 1580,380 1580,640" fill="#0a0608"/>
        <polygon points="1620,640 1620,420 1720,420 1720,640" fill="#1a0a08"/>
        {/* Foreground wall left */}
        <polygon points="0,640 0,1080 320,1080 380,720 200,640" fill="#1a0a08"/>
        {/* Foreground crate */}
        <rect x="780" y="700" width="180" height="220" fill="#2a1810" stroke="#0a0608" strokeWidth="2"/>
        <rect x="980" y="780" width="120" height="140" fill="#2a1810" stroke="#0a0608" strokeWidth="2"/>
        {/* Right wall */}
        <polygon points="1920,640 1920,1080 1500,1080 1480,720 1720,640" fill="#1a0a08"/>
        {/* Bomb site marker */}
        <g transform="translate(1100 800)">
          <circle cx="0" cy="0" r="50" fill="none" stroke="#ef2434" strokeWidth="2" strokeDasharray="6 6" opacity="0.6"/>
          <text x="0" y="6" textAnchor="middle" fill="#ef2434" fontFamily="Rajdhani" fontWeight="700" fontSize="32">A</text>
        </g>
        {/* Dust particles */}
        {[...Array(50)].map((_,i)=>(
          <circle key={i} cx={Math.random()*1920} cy={300+Math.random()*700} r={Math.random()*1.2+0.3} fill="#ffaa70" opacity={Math.random()*0.4+0.1}/>
        ))}
        {/* Vignette */}
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0.5" stopColor="#000" stopOpacity="0"/>
          <stop offset="1" stopColor="#000" stopOpacity="0.7"/>
        </radialGradient>
        <rect width="1920" height="1080" fill="url(#vig)"/>
      </svg>
    </div>
  );
}

window.MatchFlowView = MatchFlowView;
