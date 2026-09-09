import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, User, Menu } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const roleLabels = {
    customer: { label: 'Customer Portal', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    agent: { label: 'Support Agent Workspace', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
    manager: { label: 'Operations Management', badge: 'bg-amber-50 text-amber-800 border-amber-200' }
  };

  const roleInfo = roleLabels[user?.role] || { label: 'Helpdesk Portal', badge: 'bg-slate-50 text-slate-700 border-slate-200' };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#284428] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              HD
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">
                Enterprise Helpdesk
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-500">
                Support & Ticketing System
              </span>
            </div>
          </div>
        </div>

        {/* Right user & role info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleInfo.badge}`}
          >
            {roleInfo.label}
          </span>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
            <div className="w-7 h-7 rounded-full bg-[#eaf1ea] text-[#284428] flex items-center justify-center font-medium text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium text-slate-800 leading-tight">
                {user?.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
            title="Sign out of account"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
