function formatDate(isoOrRfc) {
  if (!isoOrRfc) return null;
  const date = new Date(isoOrRfc);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * @param {{news: Array<{title: string, url: string, source: string, publishedAt: string|null}>}} props
 */
export default function NewsList({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="rounded-lg border border-ink-800 bg-ink-900 p-6 text-sm text-fog-200">
        No recent news was available for this company.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 divide-y divide-ink-800">
      {news.map((item, i) => {
        const date = formatDate(item.publishedAt);
        return (
          <a
            key={item.url ?? i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 transition hover:bg-ink-800/60"
          >
            <p className="font-body text-sm text-paper-50">{item.title}</p>
            <p className="mt-1 font-mono text-xs text-fog-200">
              {item.source}
              {date && <span> &middot; {date}</span>}
            </p>
          </a>
        );
      })}
    </div>
  );
}
