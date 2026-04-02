function ProgressBar({ completed, total, className = '' }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between text-sm text-ink-500">
        <span>{completed} / {total} lessons</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;