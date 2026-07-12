import { useState } from 'react';

/**
 * Self-contained search input. Holds its own text-field state (what the
 * user is typing) but not the search RESULT state — that stays in
 * DashboardPage, since it's shared with other components. Calls
 * `onSearch(company)` on submit; disables itself while `loading` is true
 * so a second search can't be fired mid-request.
 */
export default function TickerSearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a company name, e.g. Apple"
          disabled={loading}
          className="w-full rounded-lg border border-ink-800 bg-ink-900 px-4 py-3 text-base text-paper-50 placeholder:text-fog-200/60 outline-none focus:border-signal-amber focus:ring-1 focus:ring-signal-amber disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="shrink-0 rounded-lg bg-signal-amber px-6 py-3 font-body font-medium text-ink-950 transition hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
      >
        {loading ? 'Researching…' : 'Research'}
      </button>
    </form>
  );
}
