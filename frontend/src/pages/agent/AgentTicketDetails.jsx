import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import { AlertCircle, ArrowLeft, MessageSquare, NotebookPen, Send } from 'lucide-react';

export const AgentTicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  const loadTicketData = async () => {
    try {
      const [ticketRes, commentsRes, notesRes] = await Promise.all([
        api.tickets.getById(id),
        api.tickets.getComments(id),
        api.tickets.getNotes(id)
      ]);

      if (ticketRes.success) {
        setTicket(ticketRes.ticket);
        setStatus(ticketRes.ticket.status);
      }
      if (commentsRes.success) setComments(commentsRes.comments || []);
      if (notesRes.success) setNotes(notesRes.notes || []);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.tickets.addComment(id, newComment.trim());
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewComment('');
      }
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await api.tickets.addNote(id, newNote.trim());
      if (res.success && res.internalNote) {
        setNotes((prev) => [...prev, res.internalNote]);
        setNewNote('');
      }
    } catch (err) {
      setError(err.message || 'Failed to add internal note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!status) return;
    setUpdatingStatus(true);
    try {
      const res = await api.tickets.updateStatus(id, status);
      if (res.success && res.ticket) {
        setTicket(res.ticket);
      }
    } catch (err) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
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
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-sm text-slate-700">Ticket could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/agent/tickets" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to queue
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#284428]"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updatingStatus}
              className="px-3 py-2 text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] rounded-md disabled:opacity-50"
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Customer</span>
            <span className="mt-1 block font-semibold text-slate-800">{ticket.customerId?.name || 'Customer'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Assigned Agent</span>
            <span className="mt-1 block font-semibold text-slate-800">{ticket.assignedAgentId?.name || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Category</span>
            <span className="mt-1 block font-semibold text-slate-800">{ticket.category}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Created</span>
            <span className="mt-1 block font-semibold text-slate-800">{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Issue Description</h3>
          <div className="p-4 bg-slate-50/75 rounded-md border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <MessageSquare className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Public Conversation</h2>
          </div>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No public replies yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-800">{comment.userId?.name || 'User'}</span>
                    <span className="text-[11px] text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{comment.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Add Public Reply</label>
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add an update for the customer..."
              className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-900 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]"
            />
            <div className="flex justify-end">
              <button type="submit" disabled={submittingComment || !newComment.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />
                {submittingComment ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <NotebookPen className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Internal Notes</h2>
          </div>

          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No internal notes recorded.</p>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-emerald-900">{note.authorId?.name || 'Agent'}</span>
                    <span className="text-[11px] text-slate-400">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{note.note}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleNoteSubmit} className="pt-3 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Add Internal Note</label>
            <textarea
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Document investigation steps, decisions, or internal context..."
              className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-900 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]"
            />
            <div className="flex justify-end">
              <button type="submit" disabled={submittingNote || !newNote.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] disabled:opacity-50">
                <NotebookPen className="w-3.5 h-3.5" />
                {submittingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentTicketDetails;
