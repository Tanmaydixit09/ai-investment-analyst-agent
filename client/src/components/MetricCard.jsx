const TONE_STYLES = {
  neutral: { strip: 'bg-signal-slate', text: 'text-paper-50' },
  positive: { strip: 'bg-signal-green', text: 'text-signal-green' },
  negative: { strip: 'bg-signal-red', text: 'text-signal-red' },
  buy: { strip: 'bg-signal-green', text: 'text-signal-green' },
  hold: { strip: 'bg-signal-amber', text: 'text-signal-amber' },
  sell: { strip: 'bg-signal-red', text: 'text-signal-red' },
};

/**
 * Generic single-metric display card: a label, a large value, and an
 * optional helper line. `tone` drives the top accent strip and value
 * color — the recurring "readout strip" motif used across every card in
 * the dashboard. `confidence` (0-1), when provided, renders a thin bar
 * beneath the value (used only by the Score card).
 *
 * @param {{label: string, value: string, helperText?: string, tone?: keyof typeof TONE_STYLES, confidence?: number}} props
 */
export default function MetricCard({ label, value, helperText, tone = 'neutral', confidence }) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.neutral;

  return (
    <div className="relative overflow-hidden rounded-lg border border-ink-800 bg-ink-900 p-4">
      <span className={`absolute top-0 left-0 right-0 h-[3px] ${styles.strip}`} aria-hidden="true" />
      <p className="text-[11px] font-mono uppercase tracking-wider text-fog-200">{label}</p>
      <p className={`mt-1 font-mono font-data text-2xl font-medium ${styles.text}`}>{value}</p>
      {helperText && <p className="mt-1 text-xs text-fog-200">{helperText}</p>}
      {typeof confidence === 'number' && (
        <div className="mt-3 h-1 w-full rounded-full bg-ink-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${styles.strip}`}
            style={{ width: `${Math.round(confidence * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
