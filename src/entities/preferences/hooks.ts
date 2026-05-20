import { useCallback, useState } from 'react';
import { preferencesRepository } from './repository';
import type { UserPreferences } from './model';

interface UsePreferencesResult {
  prefs: UserPreferences;
  set: (patch: Partial<UserPreferences>) => void;
}

export function usePreferences(): UsePreferencesResult {
  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    preferencesRepository.get(),
  );

  const set = useCallback((patch: Partial<UserPreferences>) => {
    const next = preferencesRepository.update(patch);
    setPrefs(next);
  }, []);

  return { prefs, set };
}
