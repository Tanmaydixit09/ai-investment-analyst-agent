const RECOMMENDATION_TONE = {
  BUY: { badge: 'bg-signal-green/15 text-signal-green border-signal-green/40', strip: 'bg-signal-green' },
  HOLD: { badge: 'bg-signal-amber/15 text-signal-amber border-signal-amber/40', strip: 'bg-signal-amber' },
  SELL: { badge: 'bg-signal-red/15 text-signal-red border-signal-red/40', strip: 'bg-signal-red' },
};

/**
 * Displays Gemini's natural-language explanation of the (already-decided,
 * deterministic) recommendation. Styled as the dashboard's editorial
 * centerpiece — the one place body text gets room to breathe, since it's
 * the actual payoff of the research request.
 *
 * @param {{explanation: string, recommendation: 'BUY'|'HOLD'|'SELL'}} props
 */
export default function AnalysisPanel({ explanation, recommendation }) {
  const tone = RECOMMENDATION_TONE[recommendation] ?? RECOMMENDATION_TONE.HOLD;

  return (
    <div className="relative overflow-hidden rounded-lg border border-ink-800 bg-ink-900 p-6 sm:p-8">
      <span className={`absolute top-0 left-0 right-0 h-[3px] ${tone.strip}`} aria-hidden="true" />
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-fog-200">Analysis</p>
        {recommendation && (
          <span className={`rounded-full border px-3 py-1 font-mono text-xs font-medium ${tone.badge}`}>
            {recommendation}
          </span>
        )}
      </div>
      <p className="font-body text-base leading-relaxed text-paper-50 whitespace-pre-line">
        {explanation || 'No explanation was generated for this request.'}
      </p>
    </div>
  );
}
