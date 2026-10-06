import { STATE_VERSION } from './seed';
import type { AppState } from './types';

const STORAGE_KEY = 'siims.demo.state';

/**
 * Reads saved state. Returns null when there is nothing usable — no saved
 * state, corrupt JSON, or a version from an older shape — and the caller
 * re-seeds in that case.
 */
export function loadState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== STATE_VERSION) return null;

    // Guard against a partially written blob. `identities` matters most:
    // resolveActor indexes into it, so an empty or missing array would throw
    // on first paint rather than fall back to the seed.
    if (
      !Array.isArray(parsed.startups) ||
      !Array.isArray(parsed.applications) ||
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.identities) ||
      parsed.identities.length === 0
    ) {
      return null;
    }

    return parsed as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private-mode failures are non-fatal; the demo keeps working
    // in memory for the rest of the session.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
