import React from 'react';

const priorityConfig = {
  Low: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200'
  },
  Medium: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200'
  },
  High: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  Urgent: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-300'
  }
};

export const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;
