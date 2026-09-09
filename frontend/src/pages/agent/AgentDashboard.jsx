import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import EmptyState from '../../components/EmptyState';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Inbox,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ticketsRes, workloadRes] = await Promise.all([
          api.tickets.list({ limit: 10, sortBy: 'priority', sortOrder: 'desc' }),
          api.analytics.getAgentWorkload()
        ]);

        if (ticketsRes.success) {
          setTickets(ticketsRes.tickets || []);
        }

        if (workloadRes.success && workloadRes.agents?.length > 0) {
          setWorkload(workloadRes.agents[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load agent dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const assignedCount = workload?.totalAssigned || tickets.length;
  const inProgressCount = workload?.inProgress || tickets.filter((t) => t.status === 'In Progress').length;
  const openCount = workload?.open || tickets.filter((t) => t.status === 'Open').length;
  const urgentCount = workload?.urgent || tickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length;
  const slaBreaches = workload?.slaBreaches || tickets.filter((t) => t.slaBreached).length;
  const resolvedCount = workload?.resolved || tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Agent Operational Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor your assigned tickets, prioritize urgent SLAs, and maintain resolution standards.
          </p>
        </div>
        <Link
          to="/agent/tickets"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#284428] hover:bg-[#1e311e] shadow-xs transition-colors"
        >
          View Full Queue
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workload Operational Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Active Load
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{openCount + inProgressCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Open + In Progress</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            In Progress
          </span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{inProgressCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Under handling</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
            Awaiting Action
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">{openCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Status: Open</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Urgent Items
          </span>
          <p className="text-2xl font-bold text-rose-700 mt-1">{urgentCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Requires attention</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            SLA Breached
          </span>
          <p className="text-2xl font-bold text-rose-800 mt-1">{slaBreaches}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Past deadline</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Resolved
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Completed</span>
        </div>
      </div>

      {/* Priority Ticket Queue */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Assigned Active Tickets
          </h2>
          <Link
            to="/agent/tickets"
            className="text-xs font-semibold text-[#284428] hover:underline flex items-center gap-1"
          >
            Manage all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tickets currently assigned"
              description="Your queue is currently clear. Check the unassigned queue to claim new customer requests."
              actionLabel="Check Queue"
              onAction={() => window.location.assign('/agent/tickets?scope=unassigned')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/agent/tickets/${ticket._id}`}
                          className="hover:underline text-slate-900 truncate max-w-[200px] sm:max-w-xs"
                        >
                          {ticket.subject}
                        </Link>
                        <EscalationBadge
                          isEscalated={ticket.isEscalated}
                          escalationStatus={ticket.escalationStatus}
                          level={ticket.escalationLevel}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ticket.customerId?.name || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ticket.category}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3 px-4">
                      <SlaBadge
                        slaDeadline={ticket.slaDeadline}
                        slaBreached={ticket.slaBreached}
                        resolvedAt={ticket.resolvedAt}
                        status={ticket.status}
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/agent/tickets/${ticket._id}`}
                        className="text-xs font-semibold text-[#284428] hover:underline"
                      >
                        Handle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
