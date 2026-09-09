import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AlertCircle, BarChart3, Ticket, TrendingUp, Users, Star } from 'lucide-react';

export const ManagerAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await api.analytics.getManagerReports();
        if (res.success) {
          setOverview(res.overview);
        }
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
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
  const categories = overview?.categories || [];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Manager Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Operational and service quality metrics from live support data.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">Total</span><Ticket className="w-4 h-4 text-slate-400" /></div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{overview?.totalTickets || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-blue-600">Open</span><BarChart3 className="w-4 h-4 text-blue-500" /></div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{statusCounts.open || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-emerald-600">Resolved</span><TrendingUp className="w-4 h-4 text-emerald-500" /></div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{statusCounts.resolved || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-violet-600">Escalated</span><Users className="w-4 h-4 text-violet-500" /></div>
          <p className="text-2xl font-bold text-violet-700 mt-2">{escalations.active || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Status Overview</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>Open</span><span>{statusCounts.open || 0}</span></div>
            <div className="flex items-center justify-between"><span>In Progress</span><span>{statusCounts.inProgress || 0}</span></div>
            <div className="flex items-center justify-between"><span>Resolved</span><span>{statusCounts.resolved || 0}</span></div>
            <div className="flex items-center justify-between"><span>Closed</span><span>{statusCounts.closed || 0}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Priority Distribution</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>Low</span><span>{priorityCounts.low || 0}</span></div>
            <div className="flex items-center justify-between"><span>Medium</span><span>{priorityCounts.medium || 0}</span></div>
            <div className="flex items-center justify-between"><span>High</span><span>{priorityCounts.high || 0}</span></div>
            <div className="flex items-center justify-between"><span>Urgent</span><span>{priorityCounts.urgent || 0}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">SLA & Escalations</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>SLA Met</span><span>{sla.met || 0}</span></div>
            <div className="flex items-center justify-between"><span>SLA Breached</span><span>{sla.breached || 0}</span></div>
            <div className="flex items-center justify-between"><span>Breach %</span><span>{sla.breachRate || 0}%</span></div>
            <div className="flex items-center justify-between"><span>Escalated</span><span>{escalations.active || 0}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Category Distribution</h2>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-500">No category data available.</p>
          ) : (
            <div className="space-y-3 text-xs text-slate-600">
              {categories.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span>{item.category}</span>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Customer Satisfaction</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>Total ratings</span><span>{csat.totalRatings || 0}</span></div>
            <div className="flex items-center justify-between"><span>Avg rating</span><span>{csat.avgRating || 0}</span></div>
            <div className="flex items-center justify-between"><span>1 ★</span><span>{csat.distribution?.[1] || 0}</span></div>
            <div className="flex items-center justify-between"><span>2 ★</span><span>{csat.distribution?.[2] || 0}</span></div>
            <div className="flex items-center justify-between"><span>3 ★</span><span>{csat.distribution?.[3] || 0}</span></div>
            <div className="flex items-center justify-between"><span>4 ★</span><span>{csat.distribution?.[4] || 0}</span></div>
            <div className="flex items-center justify-between"><span>5 ★</span><span>{csat.distribution?.[5] || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;
