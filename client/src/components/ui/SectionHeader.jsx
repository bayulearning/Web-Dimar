import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function SectionHeader({ title, subtitle, actionLabel, actionTo }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-lg font-bold uppercase tracking-wide md:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent hover:underline"
        >
          {actionLabel}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
