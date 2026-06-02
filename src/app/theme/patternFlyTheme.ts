export type PatternFlyBrandTheme = 'default' | 'felt';
export type PatternFlyColorScheme = 'light' | 'dark';
export type PatternFlyContrastMode = 'default' | 'high-contrast' | 'glass';
export type PatternFlyIconSet = 'patternfly' | 'rh-ui';

export interface PatternFlyThemePreferences {
  brandTheme: PatternFlyBrandTheme;
  colorScheme: PatternFlyColorScheme;
  contrastMode: PatternFlyContrastMode;
  iconSet: PatternFlyIconSet;
  matchSystemColorScheme: boolean;
}

export const PATTERNFLY_THEME_STORAGE_KEY = 'hcc-patternfly-theme-preferences-v3';

export const DEFAULT_PATTERNFLY_THEME_PREFERENCES: PatternFlyThemePreferences = {
  brandTheme: 'felt',
  colorScheme: 'light',
  contrastMode: 'default',
  iconSet: 'rh-ui',
  matchSystemColorScheme: false,
};

const BRAND_THEME_CLASS = 'pf-v6-theme-felt';
const COLOR_SCHEME_CLASS = 'pf-v6-theme-dark';
const HIGH_CONTRAST_CLASS = 'pf-v6-theme-high-contrast';
const GLASS_CLASS = 'pf-v6-theme-glass';
const RH_UI_ICON_CLASS = 'pf-v6-icon-set-rh-ui';

const MANAGED_HTML_CLASSES = [
  BRAND_THEME_CLASS,
  COLOR_SCHEME_CLASS,
  HIGH_CONTRAST_CLASS,
  GLASS_CLASS,
  RH_UI_ICON_CLASS,
] as const;

export function readStoredPatternFlyThemePreferences(): PatternFlyThemePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PATTERNFLY_THEME_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(PATTERNFLY_THEME_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PATTERNFLY_THEME_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<PatternFlyThemePreferences>;
    return normalizePatternFlyThemePreferences(parsed);
  } catch {
    return DEFAULT_PATTERNFLY_THEME_PREFERENCES;
  }
}

export function writeStoredPatternFlyThemePreferences(preferences: PatternFlyThemePreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PATTERNFLY_THEME_STORAGE_KEY, JSON.stringify(preferences));
}

export function normalizePatternFlyThemePreferences(
  preferences: Partial<PatternFlyThemePreferences> | undefined,
): PatternFlyThemePreferences {
  const brandTheme = preferences?.brandTheme === 'felt' ? 'felt' : 'default';
  const colorScheme = preferences?.colorScheme === 'dark' ? 'dark' : 'light';
  const contrastMode =
    preferences?.contrastMode === 'high-contrast' || preferences?.contrastMode === 'glass'
      ? preferences.contrastMode
      : 'default';
  const iconSet = preferences?.iconSet === 'rh-ui' ? 'rh-ui' : 'patternfly';

  return {
    brandTheme,
    colorScheme,
    contrastMode,
    iconSet: brandTheme === 'felt' && iconSet === 'patternfly' ? 'rh-ui' : iconSet,
    matchSystemColorScheme: Boolean(preferences?.matchSystemColorScheme),
  };
}

export function resolvePatternFlyColorScheme(
  preferences: PatternFlyThemePreferences,
  prefersDark: boolean,
): PatternFlyColorScheme {
  if (preferences.matchSystemColorScheme) {
    return prefersDark ? 'dark' : 'light';
  }

  return preferences.colorScheme;
}

export function applyPatternFlyThemeToDocument(
  preferences: PatternFlyThemePreferences,
  options?: { prefersDark?: boolean },
): PatternFlyThemePreferences {
  if (typeof document === 'undefined') {
    return preferences;
  }

  const resolved = normalizePatternFlyThemePreferences({
    ...preferences,
    colorScheme: resolvePatternFlyColorScheme(preferences, Boolean(options?.prefersDark)),
  });

  const html = document.documentElement;
  MANAGED_HTML_CLASSES.forEach((className) => html.classList.remove(className));

  if (resolved.brandTheme === 'felt') {
    html.classList.add(BRAND_THEME_CLASS);
  }

  if (resolved.colorScheme === 'dark') {
    html.classList.add(COLOR_SCHEME_CLASS);
  }

  if (resolved.contrastMode === 'high-contrast') {
    html.classList.add(HIGH_CONTRAST_CLASS);
  } else if (resolved.contrastMode === 'glass') {
    html.classList.add(GLASS_CLASS);
  }

  if (resolved.iconSet === 'rh-ui') {
    html.classList.add(RH_UI_ICON_CLASS);
  }

  return resolved;
}
