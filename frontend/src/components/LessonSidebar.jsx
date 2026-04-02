function formatDuration(seconds = 0) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${totalMinutes}m`;
}

function LessonSidebar({ lessons, currentLessonId, completedIds, onSelect }) {
  return (
    <div className="flex w-full flex-col gap-2 p-4">
      {lessons.map((lesson, index) => {
        const isActive = lesson.id === currentLessonId;
        const isCompleted = completedIds.has(lesson.id);

        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onSelect(lesson)}
            className={
              isActive
                ? 'flex items-center gap-3 rounded-xl bg-brand-600 px-4 py-3 text-left text-white transition-colors'
                : 'flex items-center gap-3 rounded-xl px-4 py-3 text-left text-ink-700 transition-colors hover:bg-surface-100'
            }
          >
            <span
              className={
                isCompleted
                  ? 'flex h-8 w-8 items-center justify-center rounded-full bg-success-500 text-sm font-semibold text-white'
                  : isActive
                    ? 'flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white'
                    : 'flex h-8 w-8 items-center justify-center rounded-full bg-surface-200 text-sm font-semibold text-ink-700'
              }
            >
              {isCompleted ? '?' : index + 1}
            </span>
            <span className="line-clamp-2 text-sm font-medium">{lesson.title}</span>
            <span className="ml-auto shrink-0 text-xs">{formatDuration(lesson.duration)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default LessonSidebar;