import { useState } from 'react';
import TickerSearchBar from '../components/TickerSearchBar.jsx';
import MetricCard from '../components/MetricCard.jsx';
import NewsList from '../components/NewsList.jsx';
import AnalysisPanel from '../components/AnalysisPanel.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { fetchResearch } from '../api/client.js';
import { formatCurrency, formatMarketCap, formatPercent, formatRatio, formatChange } from '../utils/formatters.js';

const RECOMMENDATION_TONE = { BUY: 'buy', HOLD: 'hold', SELL: 'sell' };

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSearch(company) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResearch(company);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.userMessage || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const quote = result?.financials?.quote;
  const fundamentals = result?.financials?.fundamentals;
  const score = result?.score;
  const recommendation = result?.recommendation;

  return (
    <div className="space-y-10">
      <section className={result || loading ? '' : 'py-16 text-center'}>
        {!result && !loading && (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal-amber mb-3">
              Deterministic scoring &middot; AI explanation
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Research any public company
            </h2>
            <p className="text-fog-200 mb-8 max-w-lg mx-auto">
              Enter a company name. The score and recommendation are calculated from real financial
              data — Gemini only explains the result.
            </p>
          </>
        )}
        <div className={result || loading ? '' : 'max-w-xl mx-auto'}>
          <TickerSearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-signal-red/40 bg-signal-red/10 p-4 text-sm text-signal-red">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          <LoadingSkeleton variant="metricGrid" />
          <LoadingSkeleton variant="panel" />
          <LoadingSkeleton variant="list" />
        </div>
      )}

      {!loading && result && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-lg font-semibold">
              {result.company}{' '}
              <span className="font-mono text-sm font-normal text-fog-200">({result.ticker})</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Current Price"
              value={formatCurrency(quote?.price, quote?.currency)}
              helperText={formatChange(quote?.change, quote?.changePercent)}
              tone={quote?.change > 0 ? 'positive' : quote?.change < 0 ? 'negative' : 'neutral'}
            />
            <MetricCard label="Market Cap" value={formatMarketCap(quote?.marketCap ?? fundamentals?.marketCap)} />
            <MetricCard label="P/E Ratio" value={formatRatio(fundamentals?.peRatio)} />
            <MetricCard
              label="Revenue Growth"
              value={formatPercent(fundamentals?.revenueGrowth, { signed: true })}
              tone={fundamentals?.revenueGrowth > 0 ? 'positive' : fundamentals?.revenueGrowth < 0 ? 'negative' : 'neutral'}
            />
            <MetricCard label="Profit Margin" value={formatPercent(fundamentals?.profitMargins)} />
            <MetricCard label="Debt / Equity" value={formatRatio(fundamentals?.debtToEquity)} />
            <MetricCard
              label="Score"
              value={score ? `${score.score}/100` : '—'}
              helperText={score ? `Data completeness: ${Math.round(score.confidence * 100)}%` : undefined}
              tone={RECOMMENDATION_TONE[recommendation] ?? 'neutral'}
              confidence={score?.confidence}
            />
            <MetricCard
              label="Recommendation"
              value={recommendation ?? '—'}
              tone={RECOMMENDATION_TONE[recommendation] ?? 'neutral'}
            />
          </div>

          <AnalysisPanel explanation={result.explanation} recommendation={recommendation} />

          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-fog-200 mb-2">Recent News</p>
            <NewsList news={result.news} />
          </div>
        </div>
      )}
    </div>
  );
}
