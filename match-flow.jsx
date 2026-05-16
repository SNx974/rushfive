/* ==================================================================
   MATCH FLOW v2 — Custom Rush Stack flow
   Stages:
     1. lobby    → 10 joueurs trouvés, shuffle, formation 5v5
     2. mapban   → Capitaine de chaque équipe ban des maps
     3. ingame   → Map sélectionnée, host désigne le lobby, lance la game
     4. report   → Chaque équipe report le résultat
     5. confirm  → Validation croisée, distribution MMR
   Tchats équipe & global persistants à travers les stages.
   ================================================================== */
const { useState, useEffect, useRef, useMemo } = React;

/* ============================== POOL DE JOUEURS ============================== */
const POOL_10 = [
  { id: 'p1',  name: 'Zerox',    tag: 'FR', rank: 'IMMORTAL 3', mmr: 3250, seed: 0, you: true },
  { id: 'p2',  name: 'Vyx',      tag: 'FR', rank: 'IMMORTAL 2', mmr: 3180, seed: 1 },
  { id: 'p3',  name: 'Ashen',    tag: 'DE', rank: 'IMMORTAL 3', mmr: 3290, seed: 2 },
  { id: 'p4',  name: 'Korr',     tag: 'UK', rank: 'IMMORTAL 1', mmr: 3120, seed: 4 },
  { id: 'p5',  name: 'Drizzt',   tag: 'IT', rank: 'IMMORTAL 2', mmr: 3210, seed: 5 },
  { id: 'p6',  name: 'Sh4dow',   tag: 'ES', rank: 'IMMORTAL 3', mmr: 3270, seed: 3 },
  { id: 'p7',  name: 'Reaper',   tag: 'FR', rank: 'IMMORTAL 2', mmr: 3220, seed: 2 },
  { id: 'p8',  name: 'Aurora',   tag: 'SE', rank: 'IMMORTAL 1', mmr: 3140, seed: 1 },
  { id: 'p9',  name: 'Phantom',  tag: 'BE', rank: 'IMMORTAL 3', mmr: 3260, seed: 3 },
  { id: 'p10', name: 'Glitch',   tag: 'NL', rank: 'IMMORTAL 2', mmr: 3190, seed: 0 },
];

/* ============================== ROOT ============================== */
function MatchFlow({ onClose }) {
  const { Icon, RushLogo } = window;
  const [stage, setStage] = useState('lobby');
  const [teams, setTeams] = useState({ A: POOL_10.slice(0, 5), B: POOL_10.slice(5) });
  const [bannedMaps, setBannedMaps] = useState([]); // ['ascent', 'bind', ...]
  const [pickedMap, setPickedMap] = useState(null);
  const [host, setHost] = useState(null);
  const [reports, setReports] = useState({ A: null, B: null }); // 'win' | 'loss'
  const [finalResult, setFinalResult] = useState(null); // 'A' | 'B'

  // Persisted chats across stages
  const [teamChat, setTeamChat] = useState([
    { author: 'Vyx', text: 'GL HF tout le monde 🔥', time: '20:34', team: 'A' },
    { author: 'Ashen', text: 'On focus B en attaque', time: '20:34', team: 'A' },
  ]);
  const [globalChat, setGlobalChat] = useState([
    { author: 'Sh4dow', text: 'gl', time: '20:34', team: 'B' },
    { author: 'Zerox', text: 'gl hf 👊', time: '20:34', team: 'A' },
  ]);

  const myTeam = teams.A.some(p => p.you) ? 'A' : 'B';
  const captains = { A: teams.A[0]?.id, B: teams.B[0]?.id };
  const captainOfMyTeam = teams[myTeam][0];
  const iAmCaptain = captainOfMyTeam?.you;

  const stages = [
    { id: 'lobby',   label: 'LOBBY' },
    { id: 'mapban',  label: 'BAN DE MAP' },
    { id: 'ingame',  label: 'EN MATCH' },
    { id: 'report',  label: 'RÉSULTATS' },
    { id: 'confirm', label: 'MMR' },
  ];

  const idx = stages.findIndex(s => s.id === stage);
  const next = () => setStage(stages[Math.min(idx + 1, stages.length - 1)].id);
  const goto = (id) => setStage(id);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#06050a', overflow: 'auto' }}>

      {/* ============ STAGE BAR ============ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,5,10,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(239,36,52,0.2)',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', gap: 24
      }}>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#8a8a93', fontSize: 12, fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.08em'
        }}>
          <Icon.ChevronLeft width="14" height="14"/> QUITTER
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RushLogo size={22}/>
          <span className="display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>RUSH STACK</span>
        </div>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)' }}/>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {stages.map((s, i) => {
            const active = i === idx;
            const done = i < idx;
            return (
              <button key={s.id} onClick={()=>goto(s.id)} style={{
                flex: 1, padding: '6px 8px', borderRadius: 4,
                background: active ? 'rgba(239,36,52,0.15)' : 'transparent',
                border: active ? '1px solid #ef2434' : done ? '1px solid rgba(40,209,124,0.4)' : '1px solid rgba(255,255,255,0.06)',
                color: active ? '#ef2434' : done ? '#28d17c' : '#5a5a62',
                fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: active ? '#ef2434' : done ? '#28d17c' : 'rgba(255,255,255,0.05)',
                  color: active || done ? '#fff' : '#5a5a62',
                  display: 'grid', placeItems: 'center', fontSize: 9
                }}>{done ? '✓' : i + 1}</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ STAGE BODY (3-col layout: chat équipe / contenu / chat global) ============ */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', minHeight: 'calc(100vh - 56px)' }}>

        <ChatPanel
          title="TCHAT ÉQUIPE"
          subtitle={`Équipe ${myTeam} · 5 joueurs`}
          messages={teamChat.filter(m => m.team === myTeam)}
          onSend={(text)=> setTeamChat(c => [...c, { author: 'Zerox', text, time: now(), team: myTeam }])}
          accent="#28d17c"
        />

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {stage === 'lobby' && (
            <LobbyStage
              teams={teams}
              setTeams={setTeams}
              captains={captains}
              onNext={next}
            />
          )}
          {stage === 'mapban' && (
            <MapBanStage
              teams={teams}
              myTeam={myTeam}
              iAmCaptain={iAmCaptain}
              bannedMaps={bannedMaps}
              setBannedMaps={setBannedMaps}
              pickedMap={pickedMap}
              setPickedMap={setPickedMap}
              onNext={next}
            />
          )}
          {stage === 'ingame' && (
            <InGameStage
              teams={teams}
              myTeam={myTeam}
              pickedMap={pickedMap}
              host={host}
              setHost={setHost}
              onNext={next}
            />
          )}
          {stage === 'report' && (
            <ReportStage
              teams={teams}
              myTeam={myTeam}
              reports={reports}
              setReports={setReports}
              onNext={(result)=>{ setFinalResult(result); next(); }}
            />
          )}
          {stage === 'confirm' && (
            <ConfirmStage
              teams={teams}
              myTeam={myTeam}
              finalResult={finalResult}
              onHome={onClose}
            />
          )}
        </div>

        <ChatPanel
          title="TCHAT GLOBAL"
          subtitle="10 joueurs · lobby"
          messages={globalChat}
          onSend={(text)=> setGlobalChat(c => [...c, { author: 'Zerox', text, time: now(), team: myTeam }])}
          accent="#ef2434"
          showTeams
        />
      </div>
    </div>
  );
}

function now() {
  const d = new Date();
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

/* ==============================================================
   CHAT PANEL — colonne latérale
   ============================================================== */
function ChatPanel({ title, subtitle, messages, onSend, accent, showTeams }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', position: 'sticky', top: 56 }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent }}/>
          <div className="display" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: accent }}>{title}</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{subtitle}</div>
      </div>

      <div ref={listRef} style={{
        flex: 1, overflow: 'auto', padding: 14,
        display: 'flex', flexDirection: 'column', gap: 10
      }}>
        {messages.map((m, i) => (
          <ChatMessage key={i} msg={m} showTeams={showTeams}/>
        ))}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--muted-2)', fontSize: 11, padding: 20 }}>
            Aucun message pour l'instant
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6 }}>
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if (e.key === 'Enter') submit(); }}
          placeholder="Tapez votre message..."
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 6,
            border: '1px solid var(--line)', background: 'rgba(0,0,0,0.4)',
            color: '#fff', fontSize: 12, outline: 'none', fontFamily: 'Inter, sans-serif'
          }}/>
        <button onClick={submit} style={{
          padding: '0 14px', borderRadius: 6,
          background: accent, color: '#0a0a0c',
          fontWeight: 700, fontSize: 11, fontFamily: 'Rajdhani', letterSpacing: '0.08em'
        }}>→</button>
      </div>
    </div>
  );
}

function ChatMessage({ msg, showTeams }) {
  const teamColor = msg.team === 'A' ? '#28d17c' : '#ef2434';
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
        {showTeams && (
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 2,
            background: `${teamColor}22`, color: teamColor,
            fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: '0.04em'
          }}>{msg.team}</span>
        )}
        <span style={{ fontWeight: 700, color: showTeams ? teamColor : '#fff' }}>{msg.author}</span>
        <span style={{ fontSize: 10, color: 'var(--muted-2)', marginLeft: 'auto' }}>{msg.time}</span>
      </div>
      <div style={{ color: '#c0c0c8', lineHeight: 1.4 }}>{msg.text}</div>
    </div>
  );
}

/* ==============================================================
   STAGE 1 — LOBBY (10 joueurs trouvés, shuffle, formation 5v5)
   ============================================================== */
function LobbyStage({ teams, setTeams, captains, onNext }) {
  const { Avatar, Icon } = window;
  const [shuffling, setShuffling] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);

  const shuffle = () => {
    setShuffling(true);
    let count = 0;
    const t = setInterval(() => {
      const all = [...teams.A, ...teams.B];
      const sorted = [...all].sort(() => Math.random() - 0.5);
      setTeams({ A: sorted.slice(0, 5), B: sorted.slice(5) });
      count++;
      setShuffleCount(s => s + 1);
      if (count >= 8) {
        clearInterval(t);
        setShuffling(false);
      }
    }, 120);
  };

  const totalA = teams.A.reduce((s,p)=>s+p.mmr,0);
  const totalB = teams.B.reduce((s,p)=>s+p.mmr,0);
  const diff = Math.abs(totalA - totalB);

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="mono-up" style={{ color: '#ef2434', fontSize: 11, letterSpacing: '0.2em', marginBottom: 10 }}>
          10 JOUEURS TROUVÉS
        </div>
        <h1 className="display" style={{ fontSize: 44, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em' }}>
          LOBBY — FORMATION DES ÉQUIPES
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
          Mélangez les joueurs pour équilibrer les équipes selon le MMR
        </p>
      </div>

      {/* VS Layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 24, alignItems: 'stretch',
        marginBottom: 24
      }}>
        {/* TEAM A */}
        <TeamCard team="A" players={teams.A} captainId={captains.A} totalMmr={totalA} shuffling={shuffling} accent="#28d17c"/>

        {/* VS divider */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: '0 6px'
        }}>
          <div style={{
            position: 'relative',
            width: 72, height: 72, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,36,52,0.2), transparent 70%)',
            display: 'grid', placeItems: 'center'
          }}>
            <div className="display" style={{
              fontSize: 36, fontWeight: 700, color: '#ef2434',
              textShadow: '0 0 24px rgba(239,36,52,0.6)'
            }}>VS</div>
          </div>
          <div style={{
            padding: '6px 12px', borderRadius: 4,
            background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)',
            textAlign: 'center'
          }}>
            <div className="mono-up" style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>ÉCART MMR</div>
            <div className="display" style={{
              fontSize: 18, fontWeight: 700,
              color: diff < 100 ? '#28d17c' : diff < 200 ? '#ffd860' : '#ef2434'
            }}>±{diff}</div>
          </div>
        </div>

        {/* TEAM B */}
        <TeamCard team="B" players={teams.B} captainId={captains.B} totalMmr={totalB} shuffling={shuffling} accent="#ef2434"/>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={shuffle} disabled={shuffling} style={{
          padding: '14px 28px', borderRadius: 6,
          background: 'rgba(255,255,255,0.04)', color: '#c0c0c8',
          border: '1px solid #3a3a42',
          fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
          display: 'flex', alignItems: 'center', gap: 10, opacity: shuffling ? 0.5 : 1
        }}>
          <span style={{
            display: 'inline-block',
            transform: shuffling ? `rotate(${shuffleCount*45}deg)` : 'none',
            transition: 'transform .1s'
          }}>🔀</span>
          {shuffling ? 'MÉLANGE EN COURS...' : 'MÉLANGER LES ÉQUIPES'}
        </button>

        <button onClick={onNext} style={{
          padding: '14px 36px', borderRadius: 6,
          background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
          fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em',
          boxShadow: '0 6px 20px rgba(239,36,52,0.4)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>VALIDER LES ÉQUIPES <Icon.ChevronRight width="16" height="16"/></button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--muted)' }}>
        Les capitaines sont désignés automatiquement (joueur avec le plus haut MMR de chaque équipe)
      </div>
    </div>
  );
}

function TeamCard({ team, players, captainId, totalMmr, shuffling, accent }) {
  const { Avatar } = window;
  return (
    <div style={{
      background: 'var(--panel)', border: `1px solid ${accent}33`,
      borderRadius: 12, padding: 18,
      transition: 'all 0.2s',
      transform: shuffling ? 'scale(0.99)' : 'scale(1)',
      boxShadow: shuffling ? `0 0 30px ${accent}33` : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="display" style={{
            fontSize: 22, fontWeight: 700, color: accent, letterSpacing: '0.06em'
          }}>ÉQUIPE {team}</div>
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 3,
            background: `${accent}22`, color: accent,
            fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: '0.08em'
          }}>5 JOUEURS</span>
        </div>
        <div>
          <div className="mono-up" style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'right' }}>MMR TOTAL</div>
          <div className="display" style={{ fontSize: 16, fontWeight: 700, textAlign: 'right' }}>{totalMmr.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.map((p) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 6,
            background: p.you ? `${accent}11` : 'rgba(255,255,255,0.02)',
            border: p.you ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.2s'
          }}>
            <Avatar seed={p.seed} size={32} ring={p.you ? accent : null}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: p.you ? 700 : 600, fontSize: 13 }}>{p.name}</span>
                {p.id === captainId && (
                  <span title="Capitaine" style={{
                    fontSize: 9, padding: '1px 5px', borderRadius: 2,
                    background: 'linear-gradient(90deg, #ffd860, #c89020)',
                    color: '#0a0a0c', fontWeight: 700, fontFamily: 'Rajdhani', letterSpacing: '0.05em'
                  }}>★ CAP</span>
                )}
                {p.you && <span style={{ fontSize: 9, color: accent, fontWeight: 600 }}>· VOUS</span>}
                <span style={{ fontSize: 9, color: 'var(--muted-2)', padding: '1px 4px', border: '1px solid #2a2a31', borderRadius: 2 }}>{p.tag}</span>
              </div>
              <div className="display" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                {p.rank} · {p.mmr} MMR
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================================================
   STAGE 2 — MAPBAN
   ============================================================== */
const MAPS = [
  { id: 'ascent',   name: 'ASCENT',   color: '#d4a464' },
  { id: 'bind',     name: 'BIND',     color: '#bf6a3a' },
  { id: 'haven',    name: 'HAVEN',    color: '#a04abf' },
  { id: 'split',    name: 'SPLIT',    color: '#7ab6ff' },
  { id: 'icebox',   name: 'ICEBOX',   color: '#7ad6ff' },
  { id: 'breeze',   name: 'BREEZE',   color: '#28d17c' },
  { id: 'fracture', name: 'FRACTURE', color: '#ef2434' },
  { id: 'lotus',    name: 'LOTUS',    color: '#ff8040' },
  { id: 'pearl',    name: 'PEARL',    color: '#bbd6ff' },
];

function MapBanStage({ teams, myTeam, iAmCaptain, bannedMaps, setBannedMaps, pickedMap, setPickedMap, onNext }) {
  const { Icon } = window;
  // Ban order: A bans, B bans, A bans, B bans, A bans, B bans, A picks (or random)
  const banOrder = ['A','B','A','B','A','B','A','B']; // 8 bans, last map = pick
  const turn = bannedMaps.length < banOrder.length ? banOrder[bannedMaps.length] : null;
  const remaining = MAPS.filter(m => !bannedMaps.includes(m.id));
  const isMyTurn = turn === myTeam;

  useEffect(() => {
    // Auto-pick last remaining map when only one left
    if (remaining.length === 1 && !pickedMap) {
      setPickedMap(remaining[0].id);
    }
  }, [remaining.length]);

  const banMap = (mapId) => {
    if (!isMyTurn || !iAmCaptain || pickedMap) return;
    setBannedMaps([...bannedMaps, mapId]);
  };

  const currentMap = MAPS.find(m => m.id === pickedMap);

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div className="mono-up" style={{ color: '#ef2434', fontSize: 11, letterSpacing: '0.2em', marginBottom: 8 }}>
          PHASE DE BAN
        </div>
        <h1 className="display" style={{ fontSize: 38, fontWeight: 700, margin: '0 0 6px', letterSpacing: '0.02em' }}>
          SÉLECTION DE LA MAP
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
          Les capitaines bannissent à tour de rôle · la dernière map restante est jouée
        </p>
      </div>

      {/* Turn indicator */}
      {!pickedMap && (
        <div style={{
          textAlign: 'center', margin: '20px auto',
          padding: '12px 20px', borderRadius: 8,
          background: turn === 'A' ? 'rgba(40,209,124,0.08)' : 'rgba(239,36,52,0.08)',
          border: `1px solid ${turn === 'A' ? 'rgba(40,209,124,0.4)' : 'rgba(239,36,52,0.4)'}`,
          display: 'inline-block'
        }}>
          <div className="mono-up" style={{
            fontSize: 11, letterSpacing: '0.18em',
            color: turn === 'A' ? '#28d17c' : '#ef2434'
          }}>
            {isMyTurn ? '▼ À VOTRE TOUR DE BANNIR' : `▼ TOUR DU CAPITAINE ÉQUIPE ${turn}`} · BAN {bannedMaps.length + 1}/8
          </div>
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: 28 }}></div>

      {/* Picked map showcase */}
      {pickedMap && currentMap && (
        <div style={{
          position: 'relative', marginBottom: 24,
          borderRadius: 12, overflow: 'hidden',
          background: `linear-gradient(135deg, ${currentMap.color}33, ${currentMap.color}08)`,
          border: `2px solid ${currentMap.color}`,
          padding: '40px 32px', textAlign: 'center',
          boxShadow: `0 0 60px ${currentMap.color}33`
        }}>
          <MapTile mapId={currentMap.id} large/>
          <div className="mono-up" style={{ fontSize: 11, color: currentMap.color, letterSpacing: '0.2em', marginTop: 16 }}>★ MAP SÉLECTIONNÉE ★</div>
          <h2 className="display" style={{ fontSize: 56, fontWeight: 700, margin: '8px 0', letterSpacing: '0.04em', color: '#fff' }}>{currentMap.name}</h2>
          <button onClick={onNext} style={{
            marginTop: 16, padding: '12px 36px', borderRadius: 6,
            background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
            fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em',
            boxShadow: '0 6px 20px rgba(239,36,52,0.4)'
          }}>CONTINUER VERS LE MATCH →</button>
        </div>
      )}

      {/* Map grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        marginBottom: 24
      }}>
        {MAPS.map(m => {
          const banned = bannedMaps.includes(m.id);
          const banIdx = bannedMaps.indexOf(m.id);
          const bannedBy = banIdx >= 0 ? banOrder[banIdx] : null;
          const picked = pickedMap === m.id;
          const clickable = !banned && !picked && isMyTurn && iAmCaptain && !pickedMap;

          return (
            <button key={m.id}
              onClick={()=>clickable && banMap(m.id)}
              disabled={!clickable}
              style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: 10, padding: 0,
                background: 'var(--panel)',
                border: picked ? `2px solid ${m.color}` : banned ? '1px solid rgba(239,36,52,0.3)' : '1px solid var(--line)',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'all 0.2s',
                aspectRatio: '16/10'
              }}>
              <div style={{ position: 'absolute', inset: 0, opacity: banned ? 0.2 : 1, transition: 'opacity 0.2s' }}>
                <MapTile mapId={m.id}/>
              </div>
              {/* Overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: banned
                  ? 'linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.8))'
                  : 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85))',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 14
              }}>
                {banned && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-8deg)',
                    padding: '6px 18px', borderRadius: 4,
                    background: bannedBy === 'A' ? 'rgba(40,209,124,0.2)' : 'rgba(239,36,52,0.2)',
                    border: `2px solid ${bannedBy === 'A' ? '#28d17c' : '#ef2434'}`,
                    color: bannedBy === 'A' ? '#28d17c' : '#ef2434',
                    fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, letterSpacing: '0.18em'
                  }}>BANNIE · {bannedBy}</div>
                )}
                <div className="display" style={{
                  fontSize: 20, fontWeight: 700, color: '#fff',
                  letterSpacing: '0.04em', textAlign: 'left'
                }}>{m.name}</div>
              </div>
              {clickable && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  padding: '4px 8px', borderRadius: 3,
                  background: 'rgba(239,36,52,0.85)', color: '#fff',
                  fontSize: 9, fontWeight: 700, fontFamily: 'Rajdhani', letterSpacing: '0.08em'
                }}>BANNIR</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Ban order strip */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 8, padding: 14
      }}>
        <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 10, letterSpacing: '0.14em' }}>
          ORDRE DES BANS
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {banOrder.map((t, i) => {
            const done = i < bannedMaps.length;
            const current = i === bannedMaps.length && !pickedMap;
            const mapName = done ? MAPS.find(m => m.id === bannedMaps[i])?.name : null;
            return (
              <div key={i} style={{
                flex: '1 1 80px',
                padding: '6px 8px', borderRadius: 4,
                background: done ? (t === 'A' ? 'rgba(40,209,124,0.08)' : 'rgba(239,36,52,0.08)') : current ? 'rgba(239,36,52,0.15)' : 'rgba(255,255,255,0.02)',
                border: current ? '1px solid #ef2434' : '1px solid var(--line)',
                textAlign: 'center'
              }}>
                <div className="mono-up" style={{ fontSize: 9, color: t === 'A' ? '#28d17c' : '#ef2434', letterSpacing: '0.1em' }}>
                  CAP {t}
                </div>
                <div style={{ fontSize: 10, color: done ? '#fff' : 'var(--muted-2)', marginTop: 2 }}>
                  {mapName || (current ? '...' : '—')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* MAP TILE — petit SVG décoratif par map */
function MapTile({ mapId, large }) {
  const tiles = {
    ascent: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#3a2614"/>
        <g fill="#d4a464" opacity="0.6">
          <rect x="20" y="30" width="50" height="40"/>
          <rect x="120" y="20" width="60" height="50"/>
          <rect x="60" y="80" width="80" height="25"/>
        </g>
        <g fill="#1a0a04" opacity="0.4"><path d="M0 90 L200 90 L200 120 L0 120 Z"/></g>
      </svg>
    ),
    bind: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#5a3414"/>
        <g fill="#bf6a3a" opacity="0.7"><path d="M0 60 Q40 40 80 60 T160 60 T200 60 L200 120 L0 120 Z"/></g>
        <circle cx="60" cy="40" r="8" fill="#ffc090" opacity="0.6"/>
      </svg>
    ),
    haven: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#2a0a3a"/>
        <g fill="#a04abf" opacity="0.6"><rect x="30" y="30" width="50" height="50"/><rect x="100" y="20" width="40" height="60"/><rect x="160" y="40" width="30" height="40"/></g>
      </svg>
    ),
    split: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#1a3a5a"/>
        <g fill="#7ab6ff" opacity="0.5"><rect x="0" y="50" width="200" height="3"/><rect x="40" y="20" width="40" height="80"/><rect x="120" y="20" width="40" height="80"/></g>
      </svg>
    ),
    icebox: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#0a2a3a"/>
        <g fill="#7ad6ff" opacity="0.4"><polygon points="20,30 60,80 100,30 140,80 180,30 200,120 0,120"/></g>
      </svg>
    ),
    breeze: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#1a3a2a"/>
        <g fill="#28d17c" opacity="0.5"><circle cx="50" cy="50" r="25"/><circle cx="150" cy="60" r="30"/></g>
      </svg>
    ),
    fracture: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#3a0a14"/>
        <g stroke="#ef2434" strokeWidth="2" fill="none" opacity="0.7"><path d="M0 60 L60 30 L100 70 L140 40 L200 70"/><path d="M0 90 L80 70 L120 100 L200 80"/></g>
      </svg>
    ),
    lotus: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#3a2614"/>
        <g fill="#ff8040" opacity="0.5"><circle cx="100" cy="60" r="30"/><path d="M70 60 Q100 30 130 60 Q100 90 70 60"/></g>
      </svg>
    ),
    pearl: (
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{width:'100%',height:'100%'}}>
        <rect width="200" height="120" fill="#1a2a3a"/>
        <g fill="#bbd6ff" opacity="0.4"><circle cx="100" cy="60" r="40"/><circle cx="100" cy="60" r="25" fill="#1a2a3a"/></g>
      </svg>
    ),
  };
  if (large) return (
    <div style={{ display: 'inline-block', width: 240, height: 140, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
      {tiles[mapId]}
    </div>
  );
  return tiles[mapId] || null;
}

/* ==============================================================
   STAGE 3 — IN-GAME (map + host designation + launch)
   ============================================================== */
function InGameStage({ teams, myTeam, pickedMap, host, setHost, onNext }) {
  const { Avatar, Icon } = window;
  const map = MAPS.find(m => m.id === pickedMap) || MAPS[0];
  const [launched, setLaunched] = useState(false);
  const [matchTimer, setMatchTimer] = useState(0);
  const [hostChoice, setHostChoice] = useState(null);

  useEffect(() => {
    if (!launched) return;
    const t = setInterval(() => setMatchTimer(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [launched]);

  const fmtT = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const allPlayers = [...teams.A, ...teams.B];

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Map header */}
      <div style={{
        position: 'relative', borderRadius: 12, overflow: 'hidden',
        background: `linear-gradient(135deg, ${map.color}22, transparent)`,
        border: `1px solid ${map.color}55`,
        padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{ width: 140, height: 84, borderRadius: 6, overflow: 'hidden', border: `1px solid ${map.color}` }}>
          <MapTile mapId={map.id}/>
        </div>
        <div style={{ flex: 1 }}>
          <div className="mono-up" style={{ fontSize: 10, color: map.color, letterSpacing: '0.18em', marginBottom: 4 }}>MAP EN COURS</div>
          <h2 className="display" style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>{map.name}</h2>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Compétitif · BO24 · MMR moyen 3,220</div>
        </div>
        {launched && (
          <div style={{ textAlign: 'right' }}>
            <div className="mono-up" style={{ fontSize: 10, color: '#28d17c', letterSpacing: '0.14em' }}>● EN MATCH</div>
            <div className="display" style={{ fontSize: 32, fontWeight: 700 }}>{fmtT(matchTimer)}</div>
          </div>
        )}
      </div>

      {!launched ? (
        <>
          {/* Host designation */}
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)',
            borderRadius: 12, padding: 20, marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 4 }}>
                  🎯 DÉSIGNER L'HÔTE DU LOBBY
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Choisissez qui va créer la partie privée et inviter les autres joueurs
                </div>
              </div>
              {host && (
                <button onClick={()=>setLaunched(true)} style={{
                  padding: '12px 24px', borderRadius: 6,
                  background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
                  fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em',
                  boxShadow: '0 4px 16px rgba(239,36,52,0.4)'
                }}>LANCER LE MATCH →</button>
              )}
            </div>

            {/* Player grid for host selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {allPlayers.map(p => {
                const selected = host === p.id;
                return (
                  <button key={p.id} onClick={()=>setHost(p.id)} style={{
                    padding: '12px 10px', borderRadius: 6,
                    background: selected ? 'rgba(239,36,52,0.12)' : 'rgba(255,255,255,0.02)',
                    border: selected ? '1px solid #ef2434' : '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
                  }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar seed={p.seed} size={36}/>
                      {selected && (
                        <div style={{
                          position: 'absolute', bottom: -2, right: -2,
                          width: 16, height: 16, borderRadius: '50%',
                          background: '#ef2434', border: '2px solid #06050a',
                          display: 'grid', placeItems: 'center',
                          fontSize: 10, color: '#fff'
                        }}>★</div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: p.you ? '#ef2434' : '#fff' }}>{p.name}</div>
                    <div className="mono-up" style={{ fontSize: 8, color: 'var(--muted)' }}>ÉQUIPE {teams.A.find(x=>x.id===p.id) ? 'A' : 'B'}</div>
                  </button>
                );
              })}
            </div>

            {host && (
              <div style={{
                marginTop: 14, padding: 12, borderRadius: 6,
                background: 'rgba(239,36,52,0.08)', border: '1px solid rgba(239,36,52,0.3)',
                fontSize: 12, color: '#c0c0c8'
              }}>
                <strong style={{ color: '#ef2434' }}>★ {allPlayers.find(p=>p.id===host)?.name}</strong> a été désigné comme hôte.
                Le code lobby sera : <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: 3, color: '#fff', fontFamily: 'monospace' }}>RUSH-{(Math.random()*9000+1000)|0}</code>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* In-Match UI */}
          <div style={{
            background: 'var(--panel)', border: '1px solid rgba(40,209,124,0.3)',
            borderRadius: 12, padding: 24, marginBottom: 20,
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(40,209,124,0.12)',
              border: '1px solid rgba(40,209,124,0.4)',
              marginBottom: 16
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28d17c', boxShadow: '0 0 8px #28d17c' }}/>
              <span className="mono-up" style={{ fontSize: 10, color: '#28d17c', letterSpacing: '0.16em' }}>MATCH EN COURS</span>
            </div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.04em' }}>
              LA PARTIE EST LANCÉE
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 24px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Bonne chance ! Une fois le match terminé sur le jeu, cliquez sur "Fin de game" pour reporter le résultat.
            </p>

            <button onClick={onNext} style={{
              padding: '16px 40px', borderRadius: 6,
              background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
              fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em',
              boxShadow: '0 6px 24px rgba(239,36,52,0.4)',
              display: 'inline-flex', alignItems: 'center', gap: 12
            }}>
              ⛔ FIN DE GAME · REPORTER LE RÉSULTAT
            </button>
          </div>
        </>
      )}

      {/* Teams roster */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <RosterMini team="A" players={teams.A} accent="#28d17c" host={host}/>
        <RosterMini team="B" players={teams.B} accent="#ef2434" host={host}/>
      </div>
    </div>
  );
}

function RosterMini({ team, players, accent, host }) {
  const { Avatar } = window;
  return (
    <div style={{
      background: 'var(--panel)', border: `1px solid ${accent}33`,
      borderRadius: 8, padding: 14
    }}>
      <div className="display" style={{
        fontSize: 13, fontWeight: 700, color: accent,
        letterSpacing: '0.06em', marginBottom: 10
      }}>ÉQUIPE {team}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px', borderRadius: 4,
            background: p.you ? `${accent}11` : 'transparent'
          }}>
            <Avatar seed={p.seed} size={24}/>
            <div style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{p.name}</div>
            {host === p.id && (
              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 2, background: 'rgba(239,36,52,0.2)', color: '#ef2434', fontWeight: 700, fontFamily: 'Rajdhani', letterSpacing: '0.06em' }}>HÔTE</span>
            )}
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{p.mmr}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================================================
   STAGE 4 — REPORT (each team reports the result)
   ============================================================== */
function ReportStage({ teams, myTeam, reports, setReports, onNext }) {
  const { Icon } = window;
  const myReport = reports[myTeam];
  const otherReport = reports[myTeam === 'A' ? 'B' : 'A'];

  // Simulate other team auto-report after delay
  const [autoReporting, setAutoReporting] = useState(false);
  useEffect(() => {
    if (myReport && !otherReport && !autoReporting) {
      setAutoReporting(true);
      const t = setTimeout(() => {
        const other = myTeam === 'A' ? 'B' : 'A';
        // Other team reports the opposite (consistent: if I say I won, they say I won → they report 'loss')
        setReports(r => ({ ...r, [other]: myReport === 'win' ? 'loss' : 'win' }));
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [myReport]);

  const submitReport = (result) => {
    setReports({ ...reports, [myTeam]: result });
  };

  // When both have reported, advance
  useEffect(() => {
    if (reports.A && reports.B) {
      // Determine final result
      const aWon = reports.A === 'win' && reports.B === 'loss';
      const bWon = reports.B === 'win' && reports.A === 'loss';
      if (aWon || bWon) {
        const winner = aWon ? 'A' : 'B';
        setTimeout(() => onNext(winner), 1800);
      }
    }
  }, [reports]);

  const conflict = reports.A && reports.B &&
    ((reports.A === 'win' && reports.B === 'win') || (reports.A === 'loss' && reports.B === 'loss'));

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="mono-up" style={{ color: '#ef2434', fontSize: 11, letterSpacing: '0.2em', marginBottom: 10 }}>
          RAPPORT DE RÉSULTAT
        </div>
        <h1 className="display" style={{ fontSize: 38, fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.02em' }}>
          QUEL EST LE RÉSULTAT FINAL ?
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
          Chaque équipe doit reporter son résultat · validation croisée pour éviter la triche
        </p>
      </div>

      {!myReport ? (
        <>
          {/* Vote buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            <ResultChoice
              onClick={()=>submitReport('win')}
              icon="🏆"
              title="NOUS AVONS GAGNÉ"
              subtitle="Notre équipe a remporté le match"
              accent="#28d17c"/>
            <ResultChoice
              onClick={()=>submitReport('loss')}
              icon="💀"
              title="NOUS AVONS PERDU"
              subtitle="L'équipe adverse a remporté le match"
              accent="#ef2434"/>
          </div>
        </>
      ) : (
        <div style={{
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 12, padding: 32, marginBottom: 20, textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {myReport === 'win' ? '🏆' : '💀'}
          </div>
          <div className="display" style={{ fontSize: 22, fontWeight: 700, color: myReport === 'win' ? '#28d17c' : '#ef2434', marginBottom: 8 }}>
            VOTRE VOTE : {myReport === 'win' ? 'VICTOIRE' : 'DÉFAITE'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            En attente du vote de l'équipe adverse...
          </div>
        </div>
      )}

      {/* Status bars per team */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 12, padding: 20
      }}>
        <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 14, letterSpacing: '0.14em' }}>
          STATUT DES RAPPORTS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ReportRow team="A" status={reports.A} captain={teams.A[0]} accent="#28d17c" isMe={myTeam === 'A'}/>
          <ReportRow team="B" status={reports.B} captain={teams.B[0]} accent="#ef2434" isMe={myTeam === 'B'}/>
        </div>

        {conflict && (
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 6,
            background: 'rgba(255,216,96,0.08)', border: '1px solid rgba(255,216,96,0.4)'
          }}>
            <div className="mono-up" style={{ fontSize: 10, color: '#ffd860', letterSpacing: '0.14em', marginBottom: 6 }}>⚠ CONFLIT DÉTECTÉ</div>
            <div style={{ fontSize: 12, color: '#c0c0c8' }}>
              Les deux équipes ont reporté des résultats incompatibles. Un screenshot du match va être demandé et un modérateur va arbitrer.
            </div>
          </div>
        )}

        {reports.A && reports.B && !conflict && (
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 6,
            background: 'rgba(40,209,124,0.08)', border: '1px solid rgba(40,209,124,0.4)',
            textAlign: 'center'
          }}>
            <div className="mono-up" style={{ fontSize: 10, color: '#28d17c', letterSpacing: '0.14em', marginBottom: 4 }}>✓ RÉSULTAT CONFIRMÉ</div>
            <div style={{ fontSize: 12, color: '#c0c0c8' }}>Distribution du MMR en cours...</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultChoice({ onClick, icon, title, subtitle, accent }) {
  return (
    <button onClick={onClick} style={{
      padding: '32px 24px', borderRadius: 12,
      background: `linear-gradient(180deg, ${accent}11, ${accent}03)`,
      border: `2px solid ${accent}66`,
      transition: 'all 0.2s', cursor: 'pointer',
      textAlign: 'center'
    }}
    onMouseEnter={e=>{
      e.currentTarget.style.background = `linear-gradient(180deg, ${accent}22, ${accent}08)`;
      e.currentTarget.style.borderColor = accent;
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 24px ${accent}33`;
    }}
    onMouseLeave={e=>{
      e.currentTarget.style.background = `linear-gradient(180deg, ${accent}11, ${accent}03)`;
      e.currentTarget.style.borderColor = `${accent}66`;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{icon}</div>
      <div className="display" style={{ fontSize: 20, fontWeight: 700, color: accent, letterSpacing: '0.04em', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitle}</div>
    </button>
  );
}

function ReportRow({ team, status, captain, accent, isMe }) {
  const { Avatar } = window;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: 12, borderRadius: 6,
      background: status ? `${accent}08` : 'rgba(255,255,255,0.02)',
      border: status ? `1px solid ${accent}33` : '1px solid var(--line)'
    }}>
      <div className="display" style={{
        fontSize: 18, fontWeight: 700, color: accent,
        width: 60
      }}>ÉQ. {team}</div>
      <Avatar seed={captain.seed} size={28}/>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{captain.name} <span style={{ fontSize: 9, color: '#ffd860', marginLeft: 4 }}>★ CAP</span></div>
        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{isMe ? 'Votre capitaine' : 'Capitaine adverse'}</div>
      </div>
      <div style={{ flex: 1 }}/>
      {status ? (
        <div style={{
          padding: '6px 14px', borderRadius: 4,
          background: status === 'win' ? 'rgba(40,209,124,0.15)' : 'rgba(239,36,52,0.15)',
          color: status === 'win' ? '#28d17c' : '#ef2434',
          fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em'
        }}>
          ✓ {status === 'win' ? 'VICTOIRE' : 'DÉFAITE'}
        </div>
      ) : (
        <div style={{
          padding: '6px 14px', borderRadius: 4,
          background: 'rgba(255,255,255,0.04)', color: 'var(--muted)',
          fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ffd860', animation: 'pulse 1.5s infinite' }}/>
          EN ATTENTE
        </div>
      )}
    </div>
  );
}

/* ==============================================================
   STAGE 5 — CONFIRM & MMR DISTRIBUTION
   ============================================================== */
function ConfirmStage({ teams, myTeam, finalResult, onHome }) {
  const { Avatar, ImmortalBadge, Icon } = window;
  // Fallback: si on accède direct à ce stage, on assume une victoire de notre équipe
  const safeResult = finalResult || myTeam;
  const won = safeResult === myTeam;
  const baseGain = won ? 24 : -18;

  // Animate MMR
  const [animProgress, setAnimProgress] = useState(0);
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2000;
    const t = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimProgress(eased);
      if (p >= 1) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, []);

  const myPlayer = [...teams.A, ...teams.B].find(p => p.you);
  const myDelta = Math.round(baseGain * animProgress);

  const distributions = useMemo(() => {
    const result = {};
    const winningTeam = teams[safeResult] || teams.A;
    [...teams.A, ...teams.B].forEach(p => {
      const winner = winningTeam.some(x => x.id === p.id);
      const base = winner ? 24 : -18;
      const variance = Math.round((Math.random() - 0.5) * 8);
      result[p.id] = base + variance;
    });
    return result;
  }, [safeResult]);

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Result hero */}
      <div style={{
        textAlign: 'center', marginBottom: 28,
        padding: '32px 20px', borderRadius: 12,
        background: `radial-gradient(ellipse at top, ${won ? 'rgba(40,209,124,0.2)' : 'rgba(239,36,52,0.2)'}, transparent 70%)`,
      }}>
        <div className="mono-up" style={{
          fontSize: 11, color: won ? '#28d17c' : '#ef2434',
          letterSpacing: '0.3em', marginBottom: 10
        }}>{won ? '★ ★ ★' : '— FIN DE MATCH —'}</div>
        <h1 className="display" style={{
          fontSize: 86, fontWeight: 700, margin: '0 0 10px',
          letterSpacing: '0.04em', lineHeight: 0.9,
          background: won
            ? 'linear-gradient(180deg, #28d17c, #1aa860)'
            : 'linear-gradient(180deg, #ef2434, #7a0814)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>{won ? 'VICTOIRE' : 'DÉFAITE'}</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          Équipe {safeResult} remporte la partie · Résultat validé par les deux capitaines
        </div>
      </div>

      {/* My MMR change */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 12, padding: 24, marginBottom: 20,
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, alignItems: 'center'
      }}>
        <ImmortalBadge size={56}/>
        <div>
          <div className="mono-up" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14em', marginBottom: 4 }}>VOTRE PROGRESSION</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div className="display" style={{ fontSize: 32, fontWeight: 700 }}>{(myPlayer?.mmr || 3250) + myDelta}</div>
            <div className="display" style={{
              fontSize: 18, fontWeight: 700,
              color: won ? '#28d17c' : '#ef2434'
            }}>{myDelta > 0 ? '+' : ''}{myDelta} MMR</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            IMMORTAL 3 · 226 MMR avant RADIANT
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <RewardPill icon="✦" label="XP" value="+1,240"/>
          <RewardPill icon="◈" label="CRÉDITS" value={won ? '+250' : '+80'}/>
        </div>
      </div>

      {/* All players MMR distribution */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 12, padding: 20, marginBottom: 24
      }}>
        <div className="display" style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', marginBottom: 14
        }}>RÉPARTITION DU MMR</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {['A', 'B'].map(t => {
            const teamWon = safeResult === t;
            const accent = t === 'A' ? '#28d17c' : '#ef2434';
            return (
              <div key={t}>
                <div className="mono-up" style={{
                  fontSize: 10, color: accent, letterSpacing: '0.14em',
                  marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6
                }}>
                  ÉQUIPE {t} {teamWon && <span style={{ fontSize: 10 }}>🏆</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {teams[t].map(p => {
                    const delta = Math.round(distributions[p.id] * animProgress);
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 4,
                        background: p.you ? `${accent}11` : 'transparent',
                        border: p.you ? `1px solid ${accent}` : '1px solid transparent'
                      }}>
                        <Avatar seed={p.seed} size={24}/>
                        <div style={{ flex: 1, fontSize: 11, fontWeight: p.you ? 700 : 500 }}>{p.name}</div>
                        <div className="display" style={{
                          fontSize: 13, fontWeight: 700,
                          color: delta > 0 ? '#28d17c' : '#ef2434',
                          minWidth: 50, textAlign: 'right'
                        }}>{delta > 0 ? '+' : ''}{delta}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onHome} style={{
          padding: '14px 36px', borderRadius: 6,
          background: 'linear-gradient(180deg, #ef2434, #c1121f)', color: '#fff',
          fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em',
          boxShadow: '0 6px 20px rgba(239,36,52,0.4)'
        }}>RETOUR À L'ACCUEIL</button>
        <button style={{
          padding: '14px 28px', borderRadius: 6,
          background: 'rgba(255,255,255,0.04)', color: '#c0c0c8',
          border: '1px solid #3a3a42',
          fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em'
        }}>RELANCER UNE QUEUE</button>
      </div>
    </div>
  );
}

function RewardPill({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 4,
      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)'
    }}>
      <span style={{ color: '#ef2434', fontSize: 14 }}>{icon}</span>
      <div className="mono-up" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>{label}</div>
      <div className="display" style={{ fontSize: 12, fontWeight: 700, marginLeft: 'auto' }}>{value}</div>
    </div>
  );
}

window.MatchFlowView = MatchFlow;
