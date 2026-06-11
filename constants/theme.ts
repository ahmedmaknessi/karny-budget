export type ThemeColors = {
  readonly primary:   string;
  readonly accent:    string;
  readonly accentFg:  string;
  readonly surface:   string;
  readonly surface2:  string;
  readonly text:      string;
  readonly textMuted: string;
  readonly danger:    string;
  readonly dangerFg:  string;
  readonly success:   string;
  readonly border:    string;
  readonly overlay:   string;
};

export const darkColors: ThemeColors = {
  primary:   '#0A0A0A',
  accent:    '#C8F135',
  accentFg:  '#0A0A0A',
  surface:   '#111827',
  surface2:  '#1F2937',
  text:      '#F5F5F5',
  textMuted: '#9CA3AF',
  danger:    '#EF4444',
  dangerFg:  '#FFFFFF',
  success:   '#10B981',
  border:    '#374151',
  overlay:   'rgba(0,0,0,0.6)',
} as const;

export const lightColors: ThemeColors = {
  primary:   '#F9FAFB',
  accent:    '#5C8A00',
  accentFg:  '#FFFFFF',
  surface:   '#FFFFFF',
  surface2:  '#F3F4F6',
  text:      '#111827',
  textMuted: '#6B7280',
  danger:    '#DC2626',
  dangerFg:  '#FFFFFF',
  success:   '#059669',
  border:    '#E5E7EB',
  overlay:   'rgba(0,0,0,0.4)',
} as const;

// Backward-compat alias — kept so incremental migration doesn't break
export const colors = darkColors;

export const fonts = {
  display: 'Syne_700Bold',
  body:    'DMSans_400Regular',
  bodyMd:  'DMSans_500Medium',
  mono:    'DMMono_400Regular',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;
