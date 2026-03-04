import Link from "next/link";

export default function Home() {
  return (
    <main className="scanlines min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#050510' }}>
      {/* Animated star background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: '#ffffff',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 4 + 2}s infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Warning badge */}
        <div
          className="text-xs orbitron tracking-widest px-4 py-1 rounded"
          style={{
            border: '1px solid #ff4444',
            color: '#ff4444',
            boxShadow: '0 0 8px #ff4444',
          }}
        >
          ⚠ WARNING: MAY CAUSE EXISTENTIAL CRISIS
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="orbitron font-black flicker"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 7rem)',
              color: '#00ff88',
              textShadow: '0 0 20px #00ff88, 0 0 40px #00ff88, 0 0 80px #00ff88',
              lineHeight: 1.1,
              letterSpacing: '0.05em',
            }}
          >
            YOU SUCK
          </h1>
          <h1
            className="orbitron font-black"
            style={{
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              color: '#00ffff',
              textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
              lineHeight: 1.1,
              letterSpacing: '0.1em',
            }}
          >
            AT THIS
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-center"
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: '#888',
            fontSize: 'clamp(0.8rem, 2vw, 1.1rem)',
            letterSpacing: '0.15em',
            maxWidth: '500px',
          }}
        >
          A game for people who enjoy suffering
        </p>

        {/* Score teaser */}
        <div
          className="text-center px-6 py-3 rounded"
          style={{
            border: '1px solid rgba(0,255,136,0.2)',
            background: 'rgba(0,255,136,0.03)',
            color: '#555',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
          }}
        >
          &gt; ENEMIES ELIMINATED: 0 &nbsp;|&nbsp; TIMES DIED: ∞ &nbsp;|&nbsp; SKILL LEVEL: POTATO
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/game">
            <button
              className="btn-neon neon-border-green"
              style={{
                color: '#00ff88',
                textShadow: '0 0 10px #00ff88',
                boxShadow: '0 0 20px rgba(0,255,136,0.3)',
                minWidth: '200px',
              }}
            >
              ▶ PLAY
            </button>
          </Link>
          <Link href="/leaderboard">
            <button
              className="btn-neon neon-border-cyan"
              style={{
                color: '#00ffff',
                textShadow: '0 0 10px #00ffff',
                boxShadow: '0 0 20px rgba(0,255,255,0.3)',
                minWidth: '200px',
              }}
            >
              🏆 LEADERBOARD
            </button>
          </Link>
        </div>

        {/* Controls hint */}
        <div
          className="text-center mt-4"
          style={{
            color: '#444',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
          }}
        >
          WASD / ARROWS to move &nbsp;•&nbsp; SPACE / CLICK to shoot
        </div>

        {/* Version */}
        <div
          style={{
            color: '#333',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
          }}
        >
          v1.0.0 &nbsp;•&nbsp; BUILT FOR MAXIMUM HUMILIATION
        </div>
      </div>
    </main>
  );
}
