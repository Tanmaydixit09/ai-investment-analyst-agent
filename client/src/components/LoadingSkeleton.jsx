/**
 * Reusable loading placeholders. A single `variant` prop selects the shape
 * so callers don't need to hand-build skeleton markup per component —
 * `<LoadingSkeleton variant="metricGrid" />` mimics the metric card grid,
 * `variant="panel"` mimics AnalysisPanel, `variant="list"` mimics NewsList.
 */

function pulseBlock(className) {
  return <div className={`animate-pulse rounded-md bg-ink-800 ${className}`} />;
}

function MetricGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-ink-800 bg-ink-900 p-4 space-y-3">
          {pulseBlock('h-2 w-16')}
          {pulseBlock('h-6 w-24')}
        </div>
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 p-6 space-y-3">
      {pulseBlock('h-3 w-32')}
      {pulseBlock('h-4 w-full')}
      {pulseBlock('h-4 w-full')}
      {pulseBlock('h-4 w-2/3')}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 divide-y divide-ink-800">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 space-y-2">
          {pulseBlock('h-4 w-3/4')}
          {pulseBlock('h-3 w-1/3')}
        </div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ variant = 'metricGrid' }) {
  if (variant === 'panel') return <PanelSkeleton />;
  if (variant === 'list') return <ListSkeleton />;
  return <MetricGridSkeleton />;
}
