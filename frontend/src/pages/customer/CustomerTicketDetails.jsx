import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
import EscalationBadge from '../../components/EscalationBadge';
import StarRating from '../../components/StarRating';
import Modal from '../../components/Modal';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  Shield,
  ArrowUpCircle,
  Star,
  Send,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const CustomerTicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [satisfaction, setSatisfaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment submission
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Escalation modal
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [isSubmittingEscalation, setIsSubmittingEscalation] = useState(false);

  // CSAT rating submission
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessMessage, setRatingSuccessMessage] = useState('');

  const loadTicketData = async () => {
    try {
      const ticketRes = await api.tickets.getById(id);
      if (ticketRes.success) {
        setTicket(ticketRes.ticket);
      }

      const commentsRes = await api.tickets.getComments(id);
      if (commentsRes.success) {
        setComments(commentsRes.comments || []);
      }

      // If resolved or closed, check if already rated
      if (ticketRes.ticket?.status === 'Resolved' || ticketRes.ticket?.status === 'Closed') {
        const satRes = await api.tickets.getSatisfaction(id);
        if (satRes.success && satRes.rating) {
          setSatisfaction(satRes.rating);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.tickets.addComment(id, newComment.trim());
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewComment('');
      }
    } catch (err) {
      setError(err.message || 'Failed to send comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    if (!escalateReason.trim()) return;

    setIsSubmittingEscalation(true);
    try {
      const res = await api.tickets.escalate(id, escalateReason.trim());
      if (res.success && res.ticket) {
        setTicket(res.ticket);
        setIsEscalateModalOpen(false);
        setEscalateReason('');
      }
    } catch (err) {
      setError(err.message || 'Failed to escalate ticket');
    } finally {
      setIsSubmittingEscalation(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRating(true);
    try {
      const res = await api.tickets.submitSatisfaction(id, {
        rating: ratingValue,
        feedback: ratingFeedback.trim()
      });
      if (res.success && res.rating) {
        setSatisfaction(res.rating);
        setRatingSuccessMessage('Thank you for your rating and feedback!');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit satisfaction rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="p-6 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-rose-700 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">{error}</span>
        </div>
        <Link
          to="/customer/tickets"
          className="text-xs font-semibold text-[#284428] hover:underline"
        >
          Return to My Tickets
        </Link>
      </div>
    );
  }

  const isResolvedOrClosed = ticket?.status === 'Resolved' || ticket?.status === 'Closed';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/customer/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tickets
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium text-slate-400">
                #{ticket._id.substring(ticket._id.length - 8)}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <SlaBadge
                slaDeadline={ticket.slaDeadline}
                slaBreached={ticket.slaBreached}
                resolvedAt={ticket.resolvedAt}
                status={ticket.status}
              />
              <EscalationBadge
                isEscalated={ticket.isEscalated}
                escalationStatus={ticket.escalationStatus}
                level={ticket.escalationLevel}
              />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {ticket.subject}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!ticket.isEscalated && !isResolvedOrClosed && (
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Request Escalation
              </button>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-100 bg-white text-xs">
          <div>
            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
              Category
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{ticket.category}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
              Assigned Specialist
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {ticket.assignedAgentId?.name || 'Awaiting Agent Assignment'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
              Target SLA Deadline
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[10px]">
              Submitted On
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Description Body */}
        <div className="p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Initial Issue Description
          </h3>
          <div className="p-4 bg-slate-50/75 rounded-md border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>
      </div>

      {/* Customer Satisfaction Rating Card (Only shown if Resolved/Closed) */}
      {isResolvedOrClosed && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Customer Satisfaction Rating
            </h2>
          </div>

          {ratingSuccessMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{ratingSuccessMessage}</span>
            </div>
          )}

          {satisfaction ? (
            <div className="p-4 bg-emerald-50/50 rounded-md border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                  Your Submitted Rating
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(satisfaction.createdAt).toLocaleDateString()}
                </span>
              </div>
              <StarRating value={satisfaction.rating} readOnly size="md" />
              {satisfaction.feedback && (
                <p className="text-sm text-slate-700 italic mt-2">
                  "{satisfaction.feedback}"
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                This ticket has been resolved. How satisfied are you with the quality and timeliness of the support provided?
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Rating (1 to 5 stars)
                </label>
                <StarRating
                  value={ratingValue}
                  onChange={(val) => setRatingValue(val)}
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Feedback / Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Share details regarding your support experience..."
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingRating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] shadow-xs disabled:opacity-50 transition-colors"
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Satisfaction Rating'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Public Conversation & Comments */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">
              Support Conversation ({comments.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Public Reply Thread</span>
        </div>

        {/* Comment List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No replies yet. Use the message box below to submit updates or additional details.
            </p>
          ) : (
            comments.map((comment) => {
              const isCustomer = comment.userId?.role === 'customer';
              return (
                <div
                  key={comment._id}
                  className={`p-4 rounded-lg border ${
                    isCustomer
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {comment.userId?.name || 'User'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          isCustomer
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-200 text-emerald-800'
                        }`}
                      >
                        {comment.userId?.role || 'Support'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap">
                    {comment.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Box */}
        {ticket.status !== 'Closed' ? (
          <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Add Public Reply
            </label>
            <textarea
              rows={3}
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your response to the support team..."
              className="w-full rounded-md border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmittingComment ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-center text-xs text-slate-500">
            This ticket has been officially closed. No further replies can be added.
          </div>
        )}
      </div>

      {/* Escalation Request Modal */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title="Request Ticket Escalation"
      >
        <form onSubmit={handleEscalate} className="space-y-4">
          <p className="text-xs text-slate-600">
            Escalating alerts the operations management team for immediate review and reassignment. Please provide a justification for this escalation request.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Escalation Reason *
            </label>
            <textarea
              rows={4}
              required
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Explain why this ticket requires expedited manager intervention..."
              className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEscalateModalOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEscalation}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmittingEscalation ? 'Submitting...' : 'Submit Escalation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerTicketDetails;
