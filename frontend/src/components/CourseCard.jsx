import { Link } from 'react-router-dom';

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

function CourseCard({ course }) {
  const priceLabel = course.price === 0 ? 'Free' : `?${(course.price / 100).toLocaleString('en-IN')}`;
  const durationLabel = course.totalDuration ? formatDuration(course.totalDuration) : 'Self-paced';

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="aspect-video overflow-hidden rounded-t-2xl">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-100 to-brand-300" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-display text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-600">
          {course.title}
        </h3>

        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>{course.lessonCount ?? 0} lessons</span>
          <span>{durationLabel}</span>
        </div>

        <div className="mt-auto border-t border-surface-200 pt-3">
          {course.price === 0 ? (
            <span className="font-semibold text-success-600">{priceLabel}</span>
          ) : (
            <span className="font-semibold text-ink-900">{priceLabel}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;