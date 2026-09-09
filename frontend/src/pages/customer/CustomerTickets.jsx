import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import EmptyState from '../../components/EmptyState';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';

export const CustomerTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' }
  ];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.tickets.list(params);
      if (res.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.categories.getAll();
        if (res.success) setCategories(res.categories || []);
      } catch (e) {
        // silent fallback
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View status updates, submit replies, and rate your resolved support requests.
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-3 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#eaf1ea] text-[#1e311e] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdowns and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#284428] focus:border-[#284428]"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#284428]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#284428]"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tickets found"
              description="There are no tickets matching your current search and filter settings."
              actionLabel={statusFilter || priorityFilter || categoryFilter || searchTerm ? 'Clear Filters' : 'Create Ticket'}
              onAction={() => {
                if (statusFilter || priorityFilter || categoryFilter || searchTerm) {
                  setStatusFilter('');
                  setPriorityFilter('');
                  setCategoryFilter('');
                  setSearchTerm('');
                } else {
                  window.location.assign('/customer/create');
                }
              }}
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
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/customer/tickets/${ticket._id}`}
                          className="hover:underline text-slate-900 truncate max-w-[220px] sm:max-w-xs"
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
                        View
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

export default CustomerTickets;
