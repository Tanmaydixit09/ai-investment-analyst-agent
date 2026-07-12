/**
 * Page shell: sticky header (wordmark + tagline), a centered content
 * container that children fill, and a slim footer naming the real data
 * sources plainly. Responsive by default via Tailwind's container padding
 * scale — no separate mobile layout logic needed at this level.
 */
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-paper-50">
      <header className="sticky top-0 z-10 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] text-signal-amber uppercase">
              Research Terminal
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
              Investment Research Agent
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-fog-200">
            <span className="h-2 w-2 rounded-full bg-signal-green" />
            Live
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10">{children}</main>

      <footer className="border-t border-ink-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-xs text-fog-200 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
          <p>Data: Yahoo Finance &middot; GNews. Analysis: Google Gemini.</p>
          <p>Scoring and recommendations are computed deterministically, not by the AI model.</p>
        </div>
      </footer>
    </div>
  );
}
