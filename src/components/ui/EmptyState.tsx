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
    <div className="text-center py-16 animate-fade-in">
      {icon && <div className="flex justify-center mb-6">{icon}</div>}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="shadow-lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
