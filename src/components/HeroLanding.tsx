import {
  Sparkles,
  Download,
  Wand2,
  BookOpen,
  ArrowRight,
  Menu,
} from 'lucide-react'
import flowerImg from '@/assets/hero-flowers.svg'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4'

function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

export default function HeroLanding() {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* Video Background */}
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

      {/* Dark veil for readability */}
      <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />

      {/* Content Layer */}
      <div className="relative flex w-full min-h-screen" style={{ zIndex: 10 }}>

        {/* ══════════════════════════════════════
            LEFT PANEL — 52%
        ══════════════════════════════════════ */}
        <div className="relative flex w-full lg:w-[52%] flex-col min-h-screen p-4 lg:p-6">

          {/* Glass overlay for the entire left panel */}
          <div
            className="liquid-glass-strong absolute inset-4 lg:inset-6 rounded-3xl"
            style={{ zIndex: 0 }}
          />

          {/* Nav */}
          <nav
            className="relative flex items-center justify-between px-6 pt-5 pb-2"
            style={{ zIndex: 1 }}
          >
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Bloom logo" width={32} height={32} />
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

          {/* Hero Content */}
          <div
            className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
            style={{ zIndex: 1 }}
          >
            <img src="/logo.svg" alt="Bloom" width={80} height={80} />

            <h1
              className="mt-8 text-6xl lg:text-7xl font-medium tracking-[-0.05em] text-white leading-[1.05]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Innovating the
              <br />
              <em
                className="text-white/80"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
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

            {/* Feature Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {['Artistic Gallery', 'AI Generation', '3D Structures'].map((label) => (
                <span
                  key={label}
                  className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/80"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="relative px-8 pb-8 text-center" style={{ zIndex: 1 }}>
            <p className="mb-3 text-xs tracking-widest uppercase text-white/50">
              Visionary Design
            </p>
            <p
              className="text-lg font-medium text-white/80 leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              "We imagined a realm{' '}
              <span
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
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

        {/* ══════════════════════════════════════
            RIGHT PANEL — 48% (desktop only)
        ══════════════════════════════════════ */}
        <div className="hidden lg:flex w-[48%] flex-col p-6 gap-4">

          {/* Top Bar */}
          <div className="flex items-center justify-between">
            {/* Social icons pill */}
            <div className="liquid-glass flex items-center gap-1 rounded-full px-3 py-2">
              {[TwitterIcon, LinkedinIcon, InstagramIcon].map((Icon, i) => (
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

          {/* Community Card */}
          <div className="liquid-glass rounded-2xl p-5 w-56">
            <p className="text-sm font-medium text-white">Enter our ecosystem</p>
            <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
              Join a growing community of floral designers and AI pioneers
              shaping the future of botanical art.
            </p>
          </div>

          {/* Feature Section */}
          <div className="liquid-glass mt-auto rounded-[2.5rem] p-5 flex flex-col gap-3">

            {/* Processing + Growth Archive side-by-side */}
            <div className="flex gap-3">
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

            {/* Advanced Plant Sculpting card */}
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
