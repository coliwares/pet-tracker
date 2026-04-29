import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="animate-fade-in py-16 text-center">
      {icon ? (
        <div className="mb-6 flex justify-center">
          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            {icon}
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Estado vacío
        </p>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h3>
        <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="mt-8 shadow-lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
