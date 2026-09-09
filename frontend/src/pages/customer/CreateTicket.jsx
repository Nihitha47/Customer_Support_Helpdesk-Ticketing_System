import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, AlertCircle, Clock, Send } from 'lucide-react';

export const CreateTicket = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const slaOptions = [
    { value: 'Low', label: 'Low', hours: '48h target resolution' },
    { value: 'Medium', label: 'Medium', hours: '24h target resolution' },
    { value: 'High', label: 'High', hours: '8h target resolution' },
    { value: 'Urgent', label: 'Urgent', hours: '4h target resolution' }
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.categories.getAll();
        if (res.success && res.categories) {
          setCategories(res.categories);
          if (res.categories.length > 0) {
            setCategory(res.categories[0].name);
          }
        }
      } catch (err) {
        console.warn('Failed to load categories, using defaults:', err.message);
        // Fallback default category
        setCategory('Technical Support');
      } finally {
        setLoadingCats(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subject.trim()) {
      setError('Please provide a ticket subject');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a detailed description of your issue');
      return;
    }

    if (!category) {
      setError('Please select a ticket category');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.tickets.create({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority
      });

      if (res.success && res.ticket) {
        navigate(`/customer/tickets/${res.ticket._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/customer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Create New Support Ticket
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a request to our customer engineering team. An agent will be assigned based on category and SLA target.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Ticket Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Unable to authenticate with corporate SSO portal"
              className="block w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              {loadingCats ? (
                <div className="h-9 bg-slate-100 rounded animate-pulse" />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428] bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat._id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="General Inquiry">General Inquiry</option>
                  )}
                </select>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Priority & SLA Target
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428] bg-white"
              >
                {slaOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.hours}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Issue Description *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide relevant details, error messages, and reproduction steps..."
              className="block w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#284428] focus:outline-none focus:ring-1 focus:ring-[#284428]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/customer"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-sm font-semibold text-white bg-[#284428] hover:bg-[#1e311e] shadow-xs disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
