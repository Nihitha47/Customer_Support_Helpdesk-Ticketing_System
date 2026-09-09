import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import EmptyState from '../../components/EmptyState';
import { AlertCircle, Search } from 'lucide-react';

const statusTabs = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Closed', value: 'Closed' }
];

export const ManagerTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [agentsRes, categoriesRes] = await Promise.all([
          api.auth.getAgents(),
          api.categories.getAll(true)
        ]);

        if (agentsRes.success) setAgents(agentsRes.agents || []);
        if (categoriesRes.success) setCategories(categoriesRes.categories || []);
      } catch (err) {
        console.warn('Meta load failed', err.message);
      }
    };

    loadMeta();
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const params = { sortBy: 'createdAt', sortOrder: 'desc', limit: 100 };
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        if (categoryFilter) params.category = categoryFilter;
        if (agentFilter) params.assignedAgentId = agentFilter;
        if (searchTerm) params.search = searchTerm;

        const res = await api.tickets.list(params);
        if (res.success) setTickets(res.tickets || []);
      } catch (err) {
        setError(err.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, agentFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">All Tickets</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Review the full support queue, SLA health, and operational risk across the organization.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
        <div className="flex items-center gap-1 border-b border-slate-100 pb-3 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${statusFilter === tab.value ? 'bg-[#eaf1ea] text-[#1e311e]' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject or description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#284428] focus:border-[#284428]"
            />
          </div>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#284428]">
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#284428]">
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>{category.name}</option>
            ))}
          </select>

          <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#284428]">
            <option value="">All Agents</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>{agent.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No tickets found" description="No support tickets match the selected operational filters." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Assigned</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4">Escalation</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900"><Link to={`/manager/tickets/${ticket._id}`} className="hover:underline">{ticket.subject}</Link></td>
                    <td className="py-3 px-4">{ticket.customerId?.name || 'Customer'}</td>
                    <td className="py-3 px-4">{ticket.assignedAgentId?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="py-3 px-4"><StatusBadge status={ticket.status} /></td>
                    <td className="py-3 px-4"><SlaBadge slaDeadline={ticket.slaDeadline} slaBreached={ticket.slaBreached} resolvedAt={ticket.resolvedAt} status={ticket.status} /></td>
                    <td className="py-3 px-4"><EscalationBadge isEscalated={ticket.isEscalated} escalationStatus={ticket.escalationStatus} level={ticket.escalationLevel} /></td>
                    <td className="py-3 px-4 text-right"><Link to={`/manager/tickets/${ticket._id}`} className="text-xs font-semibold text-[#284428] hover:underline">Review</Link></td>
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

export default ManagerTickets;
