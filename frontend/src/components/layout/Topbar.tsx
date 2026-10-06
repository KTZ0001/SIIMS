import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronDown, LogOut, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { notificationsFor, unreadCount, relativeDays } from '@/store/selectors';
import { ROLE_LABELS, ROLES, type Role } from '@/store/types';

const ROLE_HOME: Record<Role, string> = {
  FOUNDER: '/founder',
  ADMIN: '/admin',
  MENTOR: '/mentor',
  INVESTOR: '/investor',
};

function useDismiss(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onDismiss]);
  return ref;
}

function RoleSwitcher() {
  const { state, identity, setRole, actor } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useDismiss(() => setOpen(false));

  function choose(role: Role) {
    setOpen(false);
    if (role === state.activeRole) return;
    setRole(role);
    navigate(ROLE_HOME[role]);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/70 to-pink-500/70 text-[10px] font-bold text-white">
          {actor.name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-semibold text-white">
            {actor.name}
          </span>
          <span className="block text-[10px] text-purple-300 font-medium">
            {ROLE_LABELS[state.activeRole]}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#0b0b0e] p-1.5 shadow-2xl">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Switch role — data is shared
          </p>
          {ROLES.map((role) => {
            const person = state.identities.find((i) => i.role === role);
            if (!person) return null;
            const active = role === state.activeRole;
            return (
              <button
                key={role}
                onClick={() => choose(role)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  active ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/80">
                  {person.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {ROLE_LABELS[role]}
                    </span>
                    {active && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </span>
                  <span className="block truncate text-xs text-white/50">
                    {person.name} · {person.email}
                  </span>
                  <span className="block text-[11px] text-white/35 mt-0.5">
                    {person.blurb}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="border-t border-white/5 px-3 py-2">
            <p className="text-[10px] text-white/30">
              Switching never resets data. Signed in as{' '}
              <span className="text-white/50">{identity.email}</span>
            </p>
            <button
              onClick={() => {
                setOpen(false);
                navigate('/login');
              }}
              className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-white/50 hover:text-white/80"
            >
              <LogOut className="h-3 w-3" />
              Back to sign in
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationBell() {
  const { state, actor, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useDismiss(() => setOpen(false));

  const rows = notificationsFor(state, state.activeRole, actor.id);
  const unread = unreadCount(state, state.activeRole, actor.id);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications, ${unread} unread`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell className="h-4 w-4 text-white/70" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#0b0b0e] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
            <span className="text-sm font-semibold text-white">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={() =>
                  dispatch({
                    type: 'NOTIFICATION_MARK_ALL_READ',
                    role: state.activeRole,
                    audienceId: actor.id,
                  })
                }
                className="text-[11px] font-medium text-purple-300 hover:text-purple-200"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {rows.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-white/40">
                Nothing here yet.
              </p>
            ) : (
              rows.slice(0, 12).map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    dispatch({
                      type: 'NOTIFICATION_MARK_READ',
                      notificationId: n.id,
                    });
                    if (n.link) {
                      setOpen(false);
                      navigate(n.link);
                    }
                  }}
                  className={`flex w-full gap-2.5 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                    n.read ? 'opacity-55' : ''
                  }`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      n.read ? 'bg-transparent' : 'bg-purple-400'
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-white">
                      {n.title}
                    </span>
                    <span className="block text-[11px] leading-snug text-white/55">
                      {n.message}
                    </span>
                    <span className="mt-1 block text-[10px] text-white/30">
                      {relativeDays(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResetButton() {
  const { resetDemo } = useStore();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        if (
          !window.confirm(
            'Reset the demo to its seeded state? All changes you have made will be discarded.',
          )
        ) {
          return;
        }
        resetDemo();
        navigate('/founder');
      }}
      title="Reset demo data"
      className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white/90 transition-colors"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Reset demo</span>
    </button>
  );
}

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/30 px-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white/35">
        <span className="hidden md:inline">
          Startup Incubation &amp; Innovation Management System
        </span>
        <span className="md:hidden">SIIMS</span>
      </div>
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <ResetButton />
        <NotificationBell />
        <RoleSwitcher />
      </div>
    </header>
  );
}
