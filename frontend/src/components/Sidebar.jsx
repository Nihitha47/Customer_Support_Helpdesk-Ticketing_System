import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Users,
  BarChart3,
  Tag,
  Clock,
  HelpCircle
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const navItemsByRole = {
    customer: [
      { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/customer/tickets', label: 'My Tickets', icon: Ticket },
      { to: '/customer/create', label: 'Submit Ticket', icon: PlusCircle }
    ],
    agent: [
      { to: '/agent', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/agent/tickets', label: 'Ticket Queue', icon: Ticket },
      { to: '/agent/workload', label: 'My Workload', icon: Clock }
    ],
    manager: [
      { to: '/manager', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/manager/tickets', label: 'All Tickets', icon: Ticket },
      { to: '/manager/workload', label: 'Agent Workload', icon: Users },
      { to: '/manager/analytics', label: 'Reports & Analytics', icon: BarChart3 },
      { to: '/manager/categories', label: 'Category Settings', icon: Tag }
    ]
  };

  const navItems = navItemsByRole[role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:bottom-auto lg:h-[calc(100vh-4rem)] flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#eaf1ea] text-[#1e311e] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Helpdesk System v1.0</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
