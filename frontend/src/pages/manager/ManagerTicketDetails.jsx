import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import { AlertCircle, ArrowLeft, ArrowUpCircle, CheckCircle2, Send } from 'lucide-react';

export const ManagerTicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewStatus, setReviewStatus] = useState('Under Review');
  const [reassignAgentId, setReassignAgentId] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ticketRes, commentsRes, notesRes, agentsRes] = await Promise.all([
          api.tickets.getById(id),
          api.tickets.getComments(id),
          api.tickets.getNotes(id),
          api.auth.getAgents()
        ]);

        if (ticketRes.success) {
          setTicket(ticketRes.ticket);
          setReviewStatus(ticketRes.ticket.escalationStatus || 'Under Review');
          setPriority(ticketRes.ticket.priority || 'Medium');
        }
        if (commentsRes.success) setComments(commentsRes.comments || []);
        if (notesRes.success) setNotes(notesRes.notes || []);
        if (agentsRes.success) setAgents(agentsRes.agents || []);
      } catch (err) {
        setError(err.message || 'Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        escalationStatus: reviewStatus,
        note: note.trim() || 'Escalation reviewed by manager',
        priority: priority || undefined,
        reassignAgentId: reassignAgentId || undefined
      };

      const res = await api.tickets.reviewEscalation(id, payload);
      if (res.success && res.ticket) {
        setTicket(res.ticket);
        setNote('');
      }
    } catch (err) {
      setError(err.message || 'Failed to review escalation');
    } finally {
      setSaving(false);
    }
  };
    const handleAssign = async () => {
    if (!reassignAgentId) {
      setError('Please select an agent to assign');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await api.tickets.assign(id, reassignAgentId);

      if (res.success && res.ticket) {
        setTicket(res.ticket);
        setReassignAgentId('');
      }
    } catch (err) {
      setError(err.message || 'Failed to assign ticket');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return <div className="bg-white rounded-lg border border-slate-200 p-6 text-sm text-slate-700">Ticket could not be loaded.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/manager/tickets" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tickets
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-400">#{ticket._id.substring(ticket._id.length - 8)}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <SlaBadge slaDeadline={ticket.slaDeadline} slaBreached={ticket.slaBreached} resolvedAt={ticket.resolvedAt} status={ticket.status} />
              <EscalationBadge isEscalated={ticket.isEscalated} escalationStatus={ticket.escalationStatus} level={ticket.escalationLevel} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{ticket.subject}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-100 text-xs">
          <div><span className="text-slate-400 uppercase tracking-wider block">Customer</span><span className="font-semibold text-slate-800 mt-0.5 block">{ticket.customerId?.name || 'Customer'}</span></div>
          <div><span className="text-slate-400 uppercase tracking-wider block">Assigned</span><span className="font-semibold text-slate-800 mt-0.5 block">{ticket.assignedAgentId?.name || 'Unassigned'}</span></div>
          <div><span className="text-slate-400 uppercase tracking-wider block">Category</span><span className="font-semibold text-slate-800 mt-0.5 block">{ticket.category}</span></div>
          <div><span className="text-slate-400 uppercase tracking-wider block">Created</span><span className="font-semibold text-slate-800 mt-0.5 block">{new Date(ticket.createdAt).toLocaleString()}</span></div>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
          <div className="p-4 bg-slate-50 rounded-md border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{ticket.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleReview} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <ArrowUpCircle className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Escalation Review</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Decision</label>
            <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#284428]">
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#284428]">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Reassign to</label>
            <select value={reassignAgentId} onChange={(e) => setReassignAgentId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#284428]">
              <option value="">Keep current agent</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assign Agent
            </label>

            <button
                 type="button"
               onClick={handleAssign}
               disabled={saving || !reassignAgentId}
               className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] disabled:opacity-50"
             >
               <CheckCircle2 className="w-3.5 h-3.5" />
               {saving ? 'Assigning...' : 'Assign Ticket'}
               </button>
              </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Manager Note</label>
            <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the decision and next steps..." className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-900 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]" />
          </div>

          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] disabled:opacity-50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Submit Review'}
          </button>
        </form>

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Send className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Ticket Conversation</h2>
          </div>

          <div className="space-y-3">
            {comments.length === 0 ? <p className="text-xs text-slate-500 italic">No public comments.</p> : comments.map((comment) => (
              <div key={comment._id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-800">{comment.userId?.name || 'User'}</span>
                  <span className="text-[11px] text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{comment.message}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Internal Notes</h3>
            {notes.length === 0 ? <p className="text-xs text-slate-500 italic">No internal notes.</p> : notes.map((noteItem) => (
              <div key={noteItem._id} className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 mb-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-900">{noteItem.authorId?.name || 'Agent'}</span>
                  <span className="text-[11px] text-slate-400">{new Date(noteItem.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{noteItem.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerTicketDetails;
