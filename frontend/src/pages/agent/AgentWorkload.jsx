import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AlertCircle, BriefcaseBusiness, Clock3, Gauge, Users, TriangleAlert } from 'lucide-react';

export const AgentWorkload = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.analytics.getAgentWorkload();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to load workload data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const agents = data?.agents || [];
  const summary = agents[0] || null;

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Workload Overview</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Live ticket distribution by assigned agent, SLA risk, and escalation load.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">Assigned</span><BriefcaseBusiness className="w-4 h-4 text-slate-400" /></div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{summary.totalAssigned || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">Open</span><Gauge className="w-4 h-4 text-blue-500" /></div>
            <p className="text-2xl font-bold text-blue-700 mt-2">{summary.open || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">In Progress</span><Clock3 className="w-4 h-4 text-amber-500" /></div>
            <p className="text-2xl font-bold text-amber-700 mt-2">{summary.inProgress || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">Resolved</span><BriefcaseBusiness className="w-4 h-4 text-emerald-500" /></div>
            <p className="text-2xl font-bold text-emerald-700 mt-2">{summary.resolved || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">SLA Breaches</span><TriangleAlert className="w-4 h-4 text-rose-500" /></div>
            <p className="text-2xl font-bold text-rose-700 mt-2">{summary.slaBreaches || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] uppercase text-slate-500">Escalated</span><Users className="w-4 h-4 text-violet-500" /></div>
            <p className="text-2xl font-bold text-violet-700 mt-2">{summary.escalated || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {agents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No workload data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Assigned</th>
                  <th className="py-3 px-4">Open</th>
                  <th className="py-3 px-4">In Progress</th>
                  <th className="py-3 px-4">Resolved</th>
                  <th className="py-3 px-4">Urgent</th>
                  <th className="py-3 px-4">SLA Breaches</th>
                  <th className="py-3 px-4">Escalated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((agent) => (
                  <tr key={agent.agentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{agent.name}</td>
                    <td className="py-3 px-4">{agent.totalAssigned}</td>
                    <td className="py-3 px-4">{agent.open}</td>
                    <td className="py-3 px-4">{agent.inProgress}</td>
                    <td className="py-3 px-4">{agent.resolved}</td>
                    <td className="py-3 px-4">{agent.urgent}</td>
                    <td className="py-3 px-4">{agent.slaBreaches}</td>
                    <td className="py-3 px-4">{agent.escalated}</td>
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

export default AgentWorkload;
