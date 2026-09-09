import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const SlaBadge = ({ slaDeadline, slaBreached, resolvedAt, status }) => {
  if (slaBreached) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        SLA Breached
      </span>
    );
  }

  if (status === 'Resolved' || status === 'Closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        SLA Fulfilled
      </span>
    );
  }

  if (!slaDeadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 bg-slate-50 border border-slate-200">
        <Clock className="w-3 h-3" />
        No SLA Set
      </span>
    );
  }

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        Breach Imminent / Passed
      </span>
    );
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeText = '';
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    timeText = `${days}d ${diffHours % 24}h remaining`;
  } else if (diffHours > 0) {
    timeText = `${diffHours}h ${diffMinutes}m remaining`;
  } else {
    timeText = `${diffMinutes}m remaining`;
  }

  const isWarning = diffHours < 4;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isWarning
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
      }`}
    >
      <Clock className={`w-3 h-3 ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`} />
      {timeText}
    </span>
  );
};

export default SlaBadge;
