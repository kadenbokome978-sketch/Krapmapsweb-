import {
  Sparkles,
  Download,
  Wand2,
  BookOpen,
  ArrowRight,
  X,
  Globe,
  Camera,
  Menu,
} from 'lucide-react'
import flowerImg from '@/assets/hero-flowers.svg'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4'

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="16" fill="rgba(255,255,255,0.08)" />
      <path
        d="M16 27C16 27 7 20.5 7 13C7 9 11 5.5 16 5.5C21 5.5 25 9 25 13C25 20.5 16 27 16 27Z"
        fill="white"
        opacity="0.92"
      />
      <path
        d="M16 27C16 27 10 19 13.5 12C15 9 16 8 16 8"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.6"
        fill="none"
      />
    </svg>
  )
}

export default function HeroLanding() {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* ── Video Background ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Subtle dark veil so text always reads */}
      <div
        className="absolute inset-0 bg-black/30"
        style={{ zIndex: 1 }}
      />

      {/* ── Content Layer ── */}
      <div
        className="relative flex w-full min-h-screen"
        style={{ zIndex: 10 }}
      >
        {/* ════════════════════════════════════════
            LEFT PANEL  –  52%
        ════════════════════════════════════════ */}
        <div className="relative flex w-full lg:w-[52%] flex-col min-h-screen p-4 lg:p-6">
          {/* Glass overlay for the entire left panel */}
          <div
            className="liquid-glass-strong absolute inset-4 lg:inset-6 rounded-3xl"
            style={{ zIndex: 0 }}
          />

          {/* ── Nav ── */}
          <nav
            className="relative flex items-center justify-between px-6 pt-5 pb-2"
            style={{ zIndex: 1 }}
          >
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="font-semibold text-2xl tracking-tighter text-white">
                bloom
              </span>
            </div>
            <button
              className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80 transition-transform hover:scale-105 active:scale-95"
              aria-label="Menu"
            >
              <Menu size={16} />
              <span>Menu</span>
            </button>
          </nav>

          {/* ── Hero Content ── */}
          <div
            className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
            style={{ zIndex: 1 }}
          >
            {/* Logo mark */}
            <LogoMark size={80} />

            {/* Heading */}
            <h1
              className="mt-8 text-6xl lg:text-7xl font-medium tracking-[-0.05em] text-white leading-[1.05]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Innovating the
              <br />
              <em
                className="not-italic text-white/80"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                }}
              >
                spirit of bloom
              </em>{' '}
              AI
            </h1>

            {/* CTA */}
            <button className="liquid-glass-strong mt-10 flex items-center gap-3 rounded-full px-7 py-3.5 text-white transition-transform hover:scale-105 active:scale-95">
              <span className="text-base font-medium">Explore Now</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <Download size={14} />
              </span>
            </button>

            {/* Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {['Artistic Gallery', 'AI Generation', '3D Structures'].map(
                (label) => (
                  <span
                    key={label}
                    className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/80"
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* ── Bottom Quote ── */}
          <div
            className="relative px-8 pb-8 text-center"
            style={{ zIndex: 1 }}
          >
            <p className="mb-3 text-xs tracking-widest uppercase text-white/50">
              Visionary Design
            </p>
            <p
              className="text-lg font-medium text-white/80 leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              "We imagined a realm{' '}
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                }}
              >
                with no ending.
              </span>
              "
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="h-px flex-1 max-w-[60px] bg-white/20" />
              <span className="text-xs tracking-widest uppercase text-white/50">
                Marcus Aurelio
              </span>
              <div className="h-px flex-1 max-w-[60px] bg-white/20" />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT PANEL  –  48%  (desktop only)
        ════════════════════════════════════════ */}
        <div className="hidden lg:flex w-[48%] flex-col p-6 gap-4">
          {/* ── Top Bar ── */}
          <div className="flex items-center justify-between">
            {/* Social icons pill */}
            <div className="liquid-glass flex items-center gap-1 rounded-full px-3 py-2">
              {[X, Globe, Camera].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:text-white/80"
                >
                  <Icon size={15} />
                </a>
              ))}
              <button className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-105 active:scale-95">
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Account button */}
            <button className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white transition-transform hover:scale-105 active:scale-95">
              <Sparkles size={15} />
              <span>Account</span>
            </button>
          </div>

          {/* ── Community Card ── */}
          <div className="liquid-glass rounded-2xl p-5 w-56">
            <p className="text-sm font-medium text-white">Enter our ecosystem</p>
            <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
              Join a growing community of floral designers and AI pioneers
              shaping the future of botanical art.
            </p>
          </div>

          {/* ── Feature Section ── */}
          <div className="liquid-glass mt-auto rounded-[2.5rem] p-5 flex flex-col gap-3">
            {/* Two side-by-side cards */}
            <div className="flex gap-3">
              {/* Processing card */}
              <div className="liquid-glass flex-1 rounded-3xl p-5 flex flex-col gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Wand2 size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Processing</p>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">
                    Real-time AI generation engine for complex floral arrangements.
                  </p>
                </div>
              </div>

              {/* Growth Archive card */}
              <div className="liquid-glass flex-1 rounded-3xl p-5 flex flex-col gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <BookOpen size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Growth Archive</p>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">
                    Catalog of thousands of curated plant species and styles.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom feature card */}
            <div className="liquid-glass rounded-3xl p-4 flex items-center gap-4">
              <img
                src={flowerImg}
                alt="Floral design preview"
                className="h-16 w-24 rounded-2xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  Advanced Plant Sculpting
                </p>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">
                  Craft intricate 3D botanical structures with precision AI tools.
                </p>
              </div>
              <button className="flex-shrink-0 liquid-glass flex h-8 w-8 items-center justify-center rounded-full text-white text-lg font-light transition-transform hover:scale-105 active:scale-95">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
