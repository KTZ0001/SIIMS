import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  LayoutDashboard,
  Rocket,
  TrendingUp,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { Field, TextField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import { ROLE_LABELS, type Role } from '@/store/types';

const ROLE_HOME: Record<Role, string> = {
  FOUNDER: '/founder',
  ADMIN: '/admin',
  MENTOR: '/mentor',
  INVESTOR: '/investor',
};

const ROLE_ICONS: Record<Role, LucideIcon> = {
  FOUNDER: Rocket,
  ADMIN: LayoutDashboard,
  MENTOR: GraduationCap,
  INVESTOR: TrendingUp,
};

const ROLE_BLURB: Record<Role, string> = {
  FOUNDER: 'Submit and track an incubation application, milestones and funding.',
  ADMIN: 'Review applications, score them, accept and assign mentors.',
  MENTOR: 'Set milestones and leave feedback for assigned startups.',
  INVESTOR: 'Browse accepted startups and open funding opportunities.',
};

const ROLE_ACCENT: Record<Role, string> = {
  FOUNDER: 'from-emerald-500/60 to-teal-500/60',
  ADMIN: 'from-purple-500/60 to-fuchsia-500/60',
  MENTOR: 'from-blue-500/60 to-sky-500/60',
  INVESTOR: 'from-amber-500/60 to-orange-500/60',
};

export default function LoginPage() {
  const { state, setRole, dispatch } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [startupName, setStartupName] = useState('');

  function enterAs(role: Role) {
    setRole(role);
    navigate(ROLE_HOME[role]);
  }

  const canRegister =
    firstName.trim().length > 0 &&
    email.trim().length > 0 &&
    startupName.trim().length > 0;

  function register() {
    if (!canRegister) return;
    dispatch({
      type: 'REGISTER_FOUNDER',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      startupName: startupName.trim(),
    });
    toast(
      'Account created',
      `${startupName.trim()} is saved as a draft application.`,
    );
    navigate('/founder');
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed right-1/4 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-12">
        <header className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <img
              src="/launchnest-logo.jpg"
              alt=""
              className="h-14 w-14 rounded-xl border border-white/20 bg-white p-1 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sign in to SIIMS
          </h1>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-white/50">
            Startup Incubation &amp; Innovation Management System. Pick a role to
            enter the demo — every role reads and writes the same shared data.
          </p>
        </header>

        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                  mode === m
                    ? 'bg-purple-500/20 text-white'
                    : 'text-white/45 hover:text-white/75'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'login' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {state.identities.map((identity) => {
                const Icon = ROLE_ICONS[identity.role];
                return (
                  <button
                    key={identity.role}
                    onClick={() => enterAs(identity.role)}
                    className="group flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition-colors hover:border-purple-400/40 hover:bg-white/[0.07]"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${ROLE_ACCENT[identity.role]}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {ROLE_LABELS[identity.role]}
                        </span>
                        {identity.role === 'INVESTOR' && (
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
                            read-only
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-purple-300">
                        {identity.email}
                      </span>
                      <span className="mt-1.5 block text-[11px] leading-snug text-white/45">
                        {ROLE_BLURB[identity.role]}
                      </span>
                      <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-white/70 group-hover:text-purple-200">
                        Enter as {identity.name}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-white/30">
              This is a prototype: signing in selects a role, it does not create
              a separate session. All four roles share one connected dataset, and
              you can switch between them at any time from the top bar.
            </p>

            <p className="mt-4 text-center">
              <button
                onClick={() => navigate('/landing')}
                className="text-[11px] font-medium text-white/40 underline-offset-4 hover:text-purple-300 hover:underline"
              >
                About SIIMS
              </button>
            </p>
          </>
        ) : (
          <div className="mx-auto w-full max-w-lg rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/60 to-teal-500/60">
                <UserPlus className="h-4.5 w-4.5 text-white" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Register as a founder
                </h2>
                <p className="text-[11px] text-white/45">
                  Creates your account and an empty startup, then opens the
                  eight-step application.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required>
                  <TextField
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="Aisha"
                  />
                </Field>
                <Field label="Last name">
                  <TextField
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Khan"
                  />
                </Field>
              </div>

              <Field label="Email" required>
                <TextField
                  value={email}
                  onChange={setEmail}
                  placeholder="aisha@yourstartup.com"
                />
              </Field>

              <Field
                label="Startup name"
                required
                hint="You can change every other detail inside the application."
              >
                <TextField
                  value={startupName}
                  onChange={setStartupName}
                  placeholder="Loopcart"
                />
              </Field>

              <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-white/30" />
                <p className="text-[11px] text-white/40">
                  Role is fixed to <span className="text-white/70">Founder</span>{' '}
                  — mentors, investors and staff are onboarded by the incubation
                  center.
                </p>
              </div>

              <Button
                className="w-full"
                disabled={!canRegister}
                onClick={register}
              >
                Create account <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
