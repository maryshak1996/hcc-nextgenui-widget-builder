import * as React from 'react';
import {
  applyPatternFlyThemeToDocument,
  PatternFlyThemePreferences,
  readStoredPatternFlyThemePreferences,
  writeStoredPatternFlyThemePreferences,
} from '@app/theme/patternFlyTheme';

interface PatternFlyThemeContextValue {
  preferences: PatternFlyThemePreferences;
  setPreferences: (next: PatternFlyThemePreferences) => void;
  updatePreferences: (patch: Partial<PatternFlyThemePreferences>) => void;
}

const PatternFlyThemeContext = React.createContext<PatternFlyThemeContextValue | null>(null);

const PatternFlyThemeProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferencesState] = React.useState<PatternFlyThemePreferences>(() =>
    readStoredPatternFlyThemePreferences(),
  );

  const applyPreferences = React.useCallback((nextPreferences: PatternFlyThemePreferences) => {
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const normalized = applyPatternFlyThemeToDocument(nextPreferences, { prefersDark });
    writeStoredPatternFlyThemePreferences(normalized);
    setPreferencesState(normalized);
    return normalized;
  }, []);

  React.useLayoutEffect(() => {
    applyPreferences(readStoredPatternFlyThemePreferences());
  }, [applyPreferences]);

  React.useEffect(() => {
    if (!preferences.matchSystemColorScheme || typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyPatternFlyThemeToDocument(preferences, { prefersDark: mediaQuery.matches });

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [preferences]);

  const setPreferences = React.useCallback(
    (next: PatternFlyThemePreferences) => {
      applyPreferences(next);
    },
    [applyPreferences],
  );

  const updatePreferences = React.useCallback(
    (patch: Partial<PatternFlyThemePreferences>) => {
      applyPreferences({ ...preferences, ...patch });
    },
    [applyPreferences, preferences],
  );

  const value = React.useMemo(
    () => ({
      preferences,
      setPreferences,
      updatePreferences,
    }),
    [preferences, setPreferences, updatePreferences],
  );

  return <PatternFlyThemeContext.Provider value={value}>{children}</PatternFlyThemeContext.Provider>;
};

function usePatternFlyTheme(): PatternFlyThemeContextValue {
  const context = React.useContext(PatternFlyThemeContext);
  if (!context) {
    throw new Error('usePatternFlyTheme must be used within PatternFlyThemeProvider');
  }
  return context;
}

export { PatternFlyThemeProvider, usePatternFlyTheme };
