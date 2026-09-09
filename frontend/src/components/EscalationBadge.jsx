import React from 'react';
import { ArrowUpCircle, Clock, CheckCircle2 } from 'lucide-react';

export const EscalationBadge = ({ isEscalated, escalationStatus, level }) => {
  if (!isEscalated && (!escalationStatus || escalationStatus === 'None')) {
    return null;
  }

  if (escalationStatus === 'Resolved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
        <CheckCircle2 className="w-3 h-3 text-slate-500" />
        Escalation Resolved
      </span>
    );
  }

  if (escalationStatus === 'Under Review') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300">
        <Clock className="w-3 h-3 text-amber-600" />
        Escalation Under Review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 animate-pulse">
      <ArrowUpCircle className="w-3.5 h-3.5 text-rose-600" />
      Escalated {level > 1 ? `(L${level})` : ''}
    </span>
  );
};

export default EscalationBadge;
