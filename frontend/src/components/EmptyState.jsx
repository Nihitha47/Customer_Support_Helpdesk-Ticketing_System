import React from 'react';
import { Inbox, AlertCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  actionLabel,
  onAction,
  variant = 'default'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-slate-200 shadow-xs">
      <div
        className={`p-3 rounded-full mb-3 ${
          variant === 'error'
            ? 'bg-rose-50 text-rose-600'
            : 'bg-slate-50 text-slate-500'
        }`}
      >
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#284428] hover:bg-[#1e311e] transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
