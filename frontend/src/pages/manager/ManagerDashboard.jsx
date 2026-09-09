import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import { AlertCircle, ArrowRight, BarChart3, Ticket, Users, TrendingUp } from 'lucide-react';

export const ManagerDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [analyticsRes, ticketsRes] = await Promise.all([
          api.analytics.getManagerReports(),
          api.tickets.list({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' })
        ]);

        if (analyticsRes.success) {
          setOverview(analyticsRes.overview);
        }
        if (ticketsRes.success) {
          setTickets(ticketsRes.tickets || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusCounts = overview?.statusCounts || {};
  const priorityCounts = overview?.priorityCounts || {};
  const sla = overview?.sla || {};
  const escalations = overview?.escalations || {};
  const csat = overview?.csat || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Operations Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Monitor overall support performance, SLA health, and escalation activity across the team.</p>
        </div>
        <Link to="/manager/analytics" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#284428] hover:bg-[#1e311e]">
          <BarChart3 className="w-4 h-4" />
          Reports
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">Total</span><Ticket className="w-4 h-4 text-slate-400" /></div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{overview?.totalTickets || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-blue-600">Open</span><Ticket className="w-4 h-4 text-blue-500" /></div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{statusCounts.open || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-amber-600">In Progress</span><TrendingUp className="w-4 h-4 text-amber-500" /></div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{statusCounts.inProgress || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-emerald-600">Resolved</span><TrendingUp className="w-4 h-4 text-emerald-500" /></div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{statusCounts.resolved || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-rose-600">SLA Breaches</span><TrendingUp className="w-4 h-4 text-rose-500" /></div>
          <p className="text-2xl font-bold text-rose-700 mt-2">{sla.breached || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-violet-600">Escalated</span><Users className="w-4 h-4 text-violet-500" /></div>
          <p className="text-2xl font-bold text-violet-700 mt-2">{escalations.active || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Priority Mix</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>Low</span><span>{priorityCounts.low || 0}</span></div>
            <div className="flex items-center justify-between"><span>Medium</span><span>{priorityCounts.medium || 0}</span></div>
            <div className="flex items-center justify-between"><span>High</span><span>{priorityCounts.high || 0}</span></div>
            <div className="flex items-center justify-between"><span>Urgent</span><span>{priorityCounts.urgent || 0}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">SLA Health</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>Met</span><span>{sla.met || 0}</span></div>
            <div className="flex items-center justify-between"><span>Breached</span><span>{sla.breached || 0}</span></div>
            <div className="flex items-center justify-between"><span>Breach rate</span><span>{sla.breachRate || 0}%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">CSAT</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>Ratings</span><span>{csat.totalRatings || 0}</span></div>
            <div className="flex items-center justify-between"><span>Average</span><span>{csat.avgRating || 0}</span></div>
            <div className="flex items-center justify-between"><span>5-star</span><span>{csat.distribution?.[5] || 0}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Recent Tickets</h2>
          <Link to="/manager/tickets" className="text-xs font-semibold text-[#284428] hover:underline flex items-center gap-1">
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4">Escalation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900"><Link to={`/manager/tickets/${ticket._id}`} className="hover:underline">{ticket.subject}</Link></td>
                    <td className="py-3 px-4">{ticket.customerId?.name || 'Customer'}</td>
                    <td className="py-3 px-4"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="py-3 px-4"><StatusBadge status={ticket.status} /></td>
                    <td className="py-3 px-4"><SlaBadge slaDeadline={ticket.slaDeadline} slaBreached={ticket.slaBreached} resolvedAt={ticket.resolvedAt} status={ticket.status} /></td>
                    <td className="py-3 px-4"><EscalationBadge isEscalated={ticket.isEscalated} escalationStatus={ticket.escalationStatus} level={ticket.escalationLevel} /></td>
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

export default ManagerDashboard;
