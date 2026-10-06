import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { Action, ActionMeta } from './actions';
import { reducer } from './reducer';
import { loadState, saveState } from './persist';
import { createSeedState } from './seed';
import type { AppState, DemoIdentity, Mentor, Role, User } from './types';

/** Omit that distributes over the action union instead of collapsing it. */
type DistributiveOmit<T, K extends keyof never> = T extends unknown
  ? Omit<T, K>
  : never;

/** What callers dispatch: an action minus the meta the provider injects. */
export type AppAction = DistributiveOmit<Action, 'meta'>;

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export interface Actor {
  id: string;
  name: string;
  role: Role;
  email: string;
  /** Set when the active role is MENTOR. */
  mentor: Mentor | null;
  /** Set when the active role is FOUNDER or ADMIN. */
  user: User | null;
}

interface StoreValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
  actor: Actor;
  identity: DemoIdentity;
  setRole: (role: Role) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | undefined>(undefined);

function init(): AppState {
  return loadState() ?? createSeedState();
}

function resolveActor(state: AppState): Actor {
  const identity =
    state.identities.find((i) => i.role === state.activeRole) ??
    state.identities[0];

  if (identity.role === 'MENTOR') {
    const mentor =
      state.mentors.find((m) => m.id === identity.refId) ?? state.mentors[0];
    return {
      id: mentor.id,
      name: `${mentor.firstName} ${mentor.lastName}`,
      role: 'MENTOR',
      email: mentor.email,
      mentor,
      user: null,
    };
  }

  const user =
    state.users.find((u) => u.id === identity.refId) ?? state.users[0];
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: identity.role,
    email: user.email,
    mentor: null,
    user,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, init);

  // Persist on every committed change so a refresh restores exactly what the
  // user was looking at, including the active role.
  useEffect(() => {
    saveState(state);
  }, [state]);

  const actor = useMemo(() => resolveActor(state), [state]);

  const dispatch = useCallback(
    (action: AppAction) => {
      const meta: ActionMeta = {
        id: uid(),
        auxIds: [uid(), uid(), uid(), uid(), uid()],
        at: new Date().toISOString(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
      };
      rawDispatch({ ...action, meta } as Action);
    },
    [actor],
  );

  const setRole = useCallback(
    (role: Role) => dispatch({ type: 'SET_ROLE', role }),
    [dispatch],
  );

  const resetDemo = useCallback(
    () => dispatch({ type: 'RESET_DEMO' }),
    [dispatch],
  );

  const identity = useMemo(
    () =>
      state.identities.find((i) => i.role === state.activeRole) ??
      state.identities[0],
    [state.identities, state.activeRole],
  );

  const value = useMemo<StoreValue>(
    () => ({ state, dispatch, actor, identity, setRole, resetDemo }),
    [state, dispatch, actor, identity, setRole, resetDemo],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside a StoreProvider');
  return ctx;
}

/** Convenience for components that only need to read. */
export function useAppState(): AppState {
  return useStore().state;
}

/** Convenience for components that only need to write. */
export function useDispatch(): (action: AppAction) => void {
  return useStore().dispatch;
}

/** The person the active role represents. */
export function useActor(): Actor {
  return useStore().actor;
}
