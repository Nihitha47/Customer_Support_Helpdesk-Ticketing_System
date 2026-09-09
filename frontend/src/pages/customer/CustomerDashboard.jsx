import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import EmptyState from '../../components/EmptyState';
import { Plus, Ticket, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const CustomerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.tickets.list({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
        if (res.success) {
          setTickets(res.tickets || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Compute live counts
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Customer Support Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Submit inquiries, monitor ticket resolution, and track SLA response times.
          </p>
        </div>
        <Link
          to="/customer/create"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#284428] hover:bg-[#1e311e] shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</span>
            <Ticket className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Submitted by you</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Triage</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{openCount}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Status: Open</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{inProgressCount}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Under agent review</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{resolvedCount}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Ready for review & rating</span>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Recent Support Tickets
          </h2>
          <Link
            to="/customer/tickets"
            className="text-xs font-semibold text-[#284428] hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No tickets created yet"
              description="You haven't submitted any support requests. Create your first ticket to get assistance."
              actionLabel="Create Ticket"
              onAction={() => window.location.assign('/customer/create')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA / Deadline</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[220px] sm:max-w-xs">{ticket.subject}</span>
                        <EscalationBadge
                          isEscalated={ticket.isEscalated}
                          escalationStatus={ticket.escalationStatus}
                          level={ticket.escalationLevel}
                        />
                      </div>
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
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/customer/tickets/${ticket._id}`}
                        className="text-xs font-semibold text-[#284428] hover:underline"
                      >
                        Details
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

export default CustomerDashboard;
