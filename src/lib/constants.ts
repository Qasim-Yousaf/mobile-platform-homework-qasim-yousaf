export const ALLOWED_SCREENS = ['home', 'explore', 'profile'] as const;

export const ALLOWED_FILTERS = ['All', 'Popular', 'New'] as const;

export const ALLOWED_SORTS = ['A-Z', 'Z-A'] as const;

export const ALLOWED_PREFERENCE_KEYS = ['notifications', 'darkMode'] as const;

export const COMMAND_NAMES = [
  'navigate',
  'openFlyout',
  'closeFlyout',
  'applyExploreFilter',
  'setPreference',
  'showAlert',
  'exportAuditLog',
] as const;

export const COMMANDS_REQUIRING_CONFIRMATION = ['setPreference'] as const;

export const PREFS_STORAGE_KEY = 'user_preferences';

export const TAB_ICONS: Record<string, string> = {
  Home: 'home-outline',
  Explore: 'compass-outline',
  Profile: 'person-outline',
};

export type Screen = typeof ALLOWED_SCREENS[number];
export type Filter = typeof ALLOWED_FILTERS[number];
export type Sort = typeof ALLOWED_SORTS[number];
export type PreferenceKey = typeof ALLOWED_PREFERENCE_KEYS[number];
export type CommandName = typeof COMMAND_NAMES[number];
