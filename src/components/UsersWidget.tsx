import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface UsersWidgetProps {
  user: UserProfile;
}

export const UsersWidget: React.FC<UsersWidgetProps> = ({ user }) => {
  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Users
          </h2>
        </div>
        <span className="text-[10px] font-tech text-emerald-400 font-bold flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          <span>Active Session</span>
        </span>
      </div>

      {/* User Attributes Grid */}
      <div className="grid grid-cols-12 gap-y-1.5 text-xs font-tech">
        <div className="col-span-5 text-slate-400">Current User</div>
        <div className="col-span-7 text-cyan-200 font-mono font-bold">: {user.username}</div>

        <div className="col-span-5 text-slate-400">User Type</div>
        <div className="col-span-7 text-cyan-300 font-mono">: {user.userType}</div>

        <div className="col-span-5 text-slate-400">Profile Path</div>
        <div className="col-span-7 text-cyan-200 font-mono truncate" title={user.profilePath}>
          : {user.profilePath}
        </div>

        <div className="col-span-5 text-slate-400">Domain</div>
        <div className="col-span-7 text-cyan-200 font-mono">: {user.domain}</div>

        <div className="col-span-5 text-slate-400">Logged In</div>
        <div className="col-span-7 text-cyan-400 font-mono font-medium">: {user.loggedInUptime}</div>
      </div>
    </div>
  );
};
