import { NavLink } from 'react-router-dom';
import {
  Activity,
  Boxes,
  Building2,
  CalendarClock,
  FileText,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  Package,
  Search,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { Role } from '@/store/types';

interface NavItem {
  name: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Every entry here points at a route that exists in App.tsx. */
const NAV: Record<Role, NavItem[]> = {
  FOUNDER: [
    { name: 'Dashboard', to: '/founder', icon: LayoutDashboard, end: true },
    { name: 'Application', to: '/founder/application', icon: FileText },
    { name: 'My Mentor', to: '/founder/mentor', icon: GraduationCap },
    { name: 'Milestones', to: '/founder/progress', icon: Target },
    { name: 'Funding & Resources', to: '/founder/funding', icon: IndianRupee },
  ],
  ADMIN: [
    { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Applications', to: '/admin/applications', icon: FileText },
    { name: 'Startups', to: '/admin/startups', icon: Building2 },
    { name: 'Mentors', to: '/admin/mentors', icon: Users },
    { name: 'Programs', to: '/admin/programs', icon: Boxes },
    { name: 'Funding', to: '/admin/funding', icon: IndianRupee },
    { name: 'Resources', to: '/admin/resources', icon: Package },
    { name: 'Activity Log', to: '/admin/activity', icon: Activity },
  ],
  MENTOR: [
    { name: 'Dashboard', to: '/mentor', icon: LayoutDashboard, end: true },
    { name: 'My Startups', to: '/mentor/startups', icon: Building2 },
    { name: 'Sessions', to: '/mentor/sessions', icon: CalendarClock },
  ],
  INVESTOR: [
    { name: 'Browse Startups', to: '/investor', icon: Search, end: true },
    {
      name: 'Opportunities',
      to: '/investor/opportunities',
      icon: IndianRupee,
    },
  ],
};

/** Clicking the brand returns to the active role's dashboard, not out of the app. */
const ROLE_HOME: Record<Role, string> = {
  FOUNDER: '/founder',
  ADMIN: '/admin',
  MENTOR: '/mentor',
  INVESTOR: '/investor',
};

export function Sidebar() {
  const { state } = useStore();
  const links = NAV[state.activeRole];

  return (
    <div className="w-60 h-full border-r border-white/5 bg-black/40 backdrop-blur-md flex flex-col py-5 shrink-0">
      <NavLink
        to={ROLE_HOME[state.activeRole]}
        className="px-5 mb-7 flex items-center gap-3 group"
      >
        <div className="p-1 bg-white rounded-xl shadow-md border border-white/40 flex items-center justify-center shrink-0">
          <img
            src="/launchnest-logo.jpg"
            alt=""
            className="h-9 w-9 object-contain rounded-lg group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-white leading-tight">
            Launch
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Nest
            </span>
          </span>
          <span className="text-[9px] font-mono font-bold text-purple-300 tracking-[0.14em] uppercase mt-0.5">
            SIIMS
          </span>
        </div>
      </NavLink>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm
              ${
                isActive
                  ? 'bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'
              }
            `}
          >
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
