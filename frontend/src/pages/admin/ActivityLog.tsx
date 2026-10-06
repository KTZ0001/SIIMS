import { useMemo, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useStore } from '@/store/StoreContext';
import { formatDate, relativeDays } from '@/store/selectors';
import { ROLE_LABELS, ROLES, type Role } from '@/store/types';

const ROLE_DOT: Record<Role, string> = {
  FOUNDER: 'bg-emerald-400',
  ADMIN: 'bg-purple-400',
  MENTOR: 'bg-blue-400',
  INVESTOR: 'bg-amber-400',
};

export default function AdminActivityLogPage() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role | 'ALL'>('ALL');

  const rows = useMemo(
    () =>
      state.activities
        .filter((a) => (role === 'ALL' ? true : a.actorRole === role))
        .filter((a) => {
          if (!query.trim()) return true;
          const needle = query.toLowerCase();
          return (
            a.summary.toLowerCase().includes(needle) ||
            a.actorName.toLowerCase().includes(needle) ||
            a.action.toLowerCase().includes(needle) ||
            a.entityType.toLowerCase().includes(needle)
          );
        }),
    [state.activities, query, role],
  );

  return (
    <>
      <PageHeader
        title="Activity Log"
        subtitle="Every state change in the system, across all three roles, newest first."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the log…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-400/60"
          />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', ...ROLES] as const).map((key) => (
            <button
              key={key}
              onClick={() => setRole(key)}
              className={`rounded-lg border px-2.5 py-2 text-[11px] font-medium transition-colors ${
                role === key
                  ? 'border-purple-400/50 bg-purple-500/15 text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.07]'
              }`}
            >
              {key === 'ALL' ? 'All roles' : ROLE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Nothing matches"
          message="Try a different search term or role filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                {['When', 'Actor', 'Action', 'Entity', 'Summary'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/40"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <p className="text-[11px] text-white/60">
                      {relativeDays(entry.createdAt)}
                    </p>
                    <p className="text-[10px] text-white/25">
                      {formatDate(entry.createdAt)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${ROLE_DOT[entry.actorRole]}`}
                      />
                      <span className="text-[11px] text-white/70">
                        {entry.actorName}
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <code className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-purple-200">
                      {entry.action}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-white/45">
                    {entry.entityType}
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-white/65">
                    {entry.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
