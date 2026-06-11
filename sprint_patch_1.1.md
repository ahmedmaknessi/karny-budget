# KARNY BUDGET — SPRINT PATCH 1.1
> Auth Overhaul · Light Mode · Icon System

---

## PRIME DIRECTIVES (unchanged)

```
1. SURGICAL DIFFS ONLY — output changed lines with file path headers.
2. OFFLINE FIRST — every mutation: SQLite (Drizzle) → sync_queue → Supabase.
3. TYPED STRICTLY — no `any`.
4. AWAIT INSTRUCTION — after each task group, run AUDIT, STOP, wait for GO.
5. ASK BEFORE ASSUMING — one focused question if ambiguous. Do not guess.
```

---

## PATCH SCOPE

| # | Area | Change |
|---|---|---|
| 1 | Auth | Replace email/password with OTP (phone or email). Add Google OAuth. |
| 2 | Theme | Add full light mode. System-aware default. Manual override in Settings. |
| 3 | Icons | Remove all emojis from UI. Replace with Lucide React Native icon set. |

---

## TASK GROUP 1 — AUTH OVERHAUL

### Context

Current state: email + password + magic link.
Target state: OTP-based signup (email OTP via Supabase) + Google OAuth.
No passwords stored. No magic link. Clean, modern, professional.

### Supabase Config (do in dashboard before coding)

```
Auth → Providers → Email: enable "Confirm email" with OTP (6-digit code)
Auth → Providers → Google: enable, paste OAuth client ID + secret
Auth → Email Templates → "Confirm signup": subject "Your Karny code", body: "{{.Token}}"
Auth → URL Config → Redirect URL: exp://localhost:8081 (dev) + karny-budget://auth (prod)
```

### Files to Create / Modify

```
app/(auth)/login.tsx          MODIFY — replace current form
app/(auth)/verify.tsx         CREATE — OTP entry screen
lib/auth/otp.ts               CREATE — OTP request + verify helpers
lib/auth/google.ts            CREATE — Google OAuth helper
app.json                      MODIFY — add scheme: "karny-budget"
```

### Logic

**OTP flow:**
```
login.tsx:
  Input: email address only (no password field)
  CTA: "Send Code" (lime button)
  → supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
  → navigate to verify.tsx passing email as param

verify.tsx:
  Display: "Enter the 6-digit code sent to {email}"
  Input: 6 OTP boxes (auto-advance on each digit, auto-submit on 6th)
  CTA: "Verify" (lime button)
  Resend link: visible after 30s countdown
  → supabase.auth.verifyOtp({ email, token, type: 'email' })
  → on success: session stored → navigate to (app) or onboarding
  → on error: shake animation (Reanimated) on OTP boxes + error toast
```

**Google OAuth flow:**
```
lib/auth/google.ts:
  Use expo-auth-session + expo-web-browser
  → Google.useIdTokenAuthRequest with your clientId
  → on success: supabase.auth.signInWithIdToken({ provider: 'google', token })
  → session stored → navigate to (app) or onboarding

login.tsx:
  Add "Continue with Google" button below OTP section
  Style: surface2 bg, white text, Google 'G' icon (Lucide or SVG)
  Divider: "or" between OTP and Google button
```

**Session handling (unchanged contract):**
```
expo-secure-store: persist session tokens
app/(auth)/_layout.tsx: redirect to (app) if session exists
```

### Dependencies to Add

```bash
npx expo install expo-auth-session expo-web-browser expo-crypto
```

### Design Specs

```
OTP input boxes:
  6 boxes, gap-3, rounded-xl
  Box size: 52×56px
  Border: border-border (inactive) → border-accent (focused) → border-success (filled)
  Font: DMMono_400Regular, text-2xl, text-center
  Background: surface2

"Send Code" / "Verify" buttons: full-width, bg-accent, text-primary, DMSans_500Medium
"Continue with Google": full-width, bg-surface2, text-text, border border-border
Resend countdown: text-textMuted, text-sm, centered below boxes
```

---

## TASK GROUP 2 — LIGHT MODE

### Design Tokens — Full Dual Theme

```typescript
// constants/theme.ts — REPLACE existing colors with themed structure

export const darkColors = {
  primary:   '#0A0A0A',
  accent:    '#C8F135',
  accentFg:  '#0A0A0A',   // text on accent bg — always dark
  surface:   '#111827',
  surface2:  '#1F2937',
  text:      '#F5F5F5',
  textMuted: '#9CA3AF',
  danger:    '#EF4444',
  dangerFg:  '#FFFFFF',
  success:   '#10B981',
  border:    '#374151',
  overlay:   'rgba(0,0,0,0.6)',
}

export const lightColors = {
  primary:   '#F9FAFB',
  accent:    '#5C8A00',   // darkened lime for WCAG AA on light bg (4.5:1 contrast)
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
}
```

> **Accessibility rule:** All text/background combos must meet WCAG AA (4.5:1 for body, 3:1 for large text).
> Light mode accent is `#5C8A00` — NOT `#C8F135` (fails contrast on white). Dark mode keeps `#C8F135`.

### Theme Architecture

```
lib/theme/context.tsx         CREATE — ThemeContext, useTheme hook, ThemeProvider
lib/theme/useColors.ts        CREATE — returns active color set based on current theme
constants/theme.ts            MODIFY — export darkColors, lightColors, fonts, spacing, radius
store/ui.ts                   MODIFY — add theme: 'dark' | 'light' | 'system' field
app/_layout.tsx               MODIFY — wrap with ThemeProvider, detect system scheme
components/layout/ScreenWrapper.tsx  MODIFY — use useColors() for bg
```

**ThemeProvider logic:**
```typescript
// lib/theme/context.tsx
- Read theme pref from AsyncStorage on mount
- If 'system': use Appearance.getColorScheme() → watch Appearance.addChangeListener
- Expose: { colors, theme, setTheme }
- setTheme: persist to AsyncStorage + update state
```

**useColors hook:**
```typescript
// lib/theme/useColors.ts
export const useColors = () => {
  const { theme } = useTheme()
  return theme === 'dark' ? darkColors : lightColors
}
// Usage in every component: const c = useColors()
// Then: style={{ backgroundColor: c.surface }}
// Or NativeWind dynamic: className={`bg-[${c.surface}]`}  ← use inline style for dynamic colors
```

### NativeWind + Dynamic Colors

NativeWind static classes work for layout. For theme-reactive colors use inline styles via `useColors()`.

```typescript
// Pattern — apply everywhere
const c = useColors()

<View style={{ backgroundColor: c.surface }} className="rounded-2xl p-4">
  <Text style={{ color: c.text, fontFamily: fonts.body }}>Label</Text>
  <Text style={{ color: c.textMuted, fontFamily: fonts.mono }}>1,234.500 TND</Text>
</View>
```

### Settings Screen Theme Toggle

```
Settings → Appearance section
Options: System (default) | Light | Dark
Rendered as: 3-option segmented control (custom, not native picker)
Active option: accent bg, accentFg text
On change: setTheme(value) → persists + immediately applies
```

### Components to Update (apply useColors to all)

```
ALL screens and components — systematic pass
Priority order:
  1. ScreenWrapper, Header, TabBar
  2. TransactionCard, BudgetCard, GoalCard, AccountPill
  3. AddTransactionSheet, AddBudgetSheet, AddGoalSheet
  4. Dashboard cards (TotalBalance, BudgetRing)
  5. Auth screens (login, verify)
  6. Settings screen
  7. EmptyState, SkeletonCard, ConflictModal, SyncDot
```

---

## TASK GROUP 3 — ICON SYSTEM

### Library

```
Use: lucide-react-native
Install: npx expo install lucide-react-native
Peer dep: react-native-svg (already installed with Victory Native XL)
```

### Removal Rules

```
REMOVE all emoji usage from:
  - Category icons (was: food 🍔, transport 🚗, etc.)
  - Goal cards (was: 🏠 emoji prefix)
  - Empty states (was: emoji illustrations)
  - Tab bar (if any emoji used)
  - Any other UI location

REPLACE with: Lucide icons sized, colored, and stroked consistently
```

### Icon Spec

```typescript
// Standard icon props — apply everywhere
size:        24   // default for lists and cards
strokeWidth: 1.5  // thinner = more refined, never use default 2
color:       c.textMuted  // inactive / decorative icons
             c.accent     // active / highlighted icons
             c.text       // primary action icons
             c.danger     // destructive action icons
```

### Category Icon Map

```typescript
// constants/categories.ts — replace emoji field with iconName (Lucide)

{ name: 'Food & Drink',    icon: 'UtensilsCrossed', color: '#F59E0B' },
{ name: 'Transport',       icon: 'Car',             color: '#3B82F6' },
{ name: 'Housing',         icon: 'Home',            color: '#8B5CF6' },
{ name: 'Health',          icon: 'HeartPulse',      color: '#EF4444' },
{ name: 'Entertainment',   icon: 'Tv2',             color: '#EC4899' },
{ name: 'Shopping',        icon: 'ShoppingBag',     color: '#F97316' },
{ name: 'Education',       icon: 'GraduationCap',   color: '#06B6D4' },
{ name: 'Savings',         icon: 'PiggyBank',       color: '#10B981' },
{ name: 'Salary',          icon: 'Banknote',        color: '#10B981' },
{ name: 'Other',           icon: 'LayoutGrid',      color: '#6B7280' },
```

### Dynamic Icon Renderer

```typescript
// components/ui/CategoryIcon.tsx — CREATE

import { icons } from 'lucide-react-native'

type Props = {
  name: string       // Lucide icon name string
  size?: number
  color?: string
  bgColor?: string   // optional circle bg
}

export const CategoryIcon = ({ name, size = 24, color, bgColor }: Props) => {
  const LucideIcon = icons[name as keyof typeof icons]
  if (!LucideIcon) return null

  if (bgColor) {
    return (
      <View style={{ backgroundColor: bgColor, borderRadius: 999, padding: 8 }}>
        <LucideIcon size={size} color={color} strokeWidth={1.5} />
      </View>
    )
  }
  return <LucideIcon size={size} color={color} strokeWidth={1.5} />
}
```

### Tab Bar Icons

```typescript
Dashboard      → LayoutDashboard
Transactions   → ArrowLeftRight
Budgets        → Target
Goals          → TrendingUp
Settings       → Settings2
```

### Other Icon Replacements

```
Account types:
  CASH          → Wallet
  BANK          → Building2
  MOBILE_WALLET → Smartphone

Actions:
  Add / FAB     → Plus (inside lime circle)
  Delete        → Trash2
  Edit          → Pencil
  Export PDF    → FileText
  Export CSV    → Sheet
  Share         → Share2
  Sync          → RefreshCw (animated spin when syncing)
  Filter        → SlidersHorizontal
  Search        → Search
  Back          → ChevronLeft
  Close sheet   → X
  Notification  → Bell
  Biometrics    → Fingerprint
  Language      → Globe2
  Appearance    → Sun / Moon / Monitor (for light/dark/system)
  Logout        → LogOut
```

---

## AUDITS

### AUDIT 1.1 — Auth

```
[ ] login.tsx: no password field, email input + "Send Code" + Google button
[ ] verify.tsx: 6 OTP boxes, auto-advance, auto-submit on 6th digit
[ ] OTP received in email within 30s
[ ] Correct OTP → session created → navigates to app/onboarding
[ ] Wrong OTP → shake animation + error toast
[ ] Resend: hidden for 30s, visible after countdown, sends new OTP
[ ] Google button → browser opens → Google consent → returns to app with session
[ ] Session persists in expo-secure-store across app restart
[ ] scheme "karny-budget" in app.json
[ ] No TypeScript errors: npx tsc --noEmit
```

**→ STOP. Paste AUDIT 1.1 results. Wait for `PROCEED 1.2`.**

---

### AUDIT 1.2 — Light Mode

```
[ ] System mode: follows device appearance change in real time
[ ] Manual Light: all screens render with lightColors tokens
[ ] Manual Dark: all screens render with darkColors tokens
[ ] Light mode accent (#5C8A00) passes WCAG AA on white bg (verify at webaim.org/resources/contrastchecker)
[ ] No hardcoded color strings remain in any component (grep for '#' in components/)
[ ] Settings screen: appearance segmented control works, selection persists on restart
[ ] ScreenWrapper, Header, TabBar all themed correctly
[ ] All 5 main screens themed: Dashboard, Transactions, Budgets, Goals, Settings
[ ] All sheets (Add*Sheet) themed: correct surface bg, correct input borders
[ ] Skeleton loader adapts to theme (light skeleton on light bg)
[ ] No white flash on dark mode startup
[ ] No black flash on light mode startup
```

**→ STOP. Paste AUDIT 1.2 results. Wait for `PROCEED 1.3`.**

---

### AUDIT 1.3 — Icons

```
[ ] Zero emojis in any rendered UI (grep for emoji unicode ranges in components/ and constants/)
[ ] CategoryIcon component renders all 10 default categories with correct Lucide icons
[ ] All category icons render with strokeWidth=1.5
[ ] Tab bar: 5 correct Lucide icons, themed active/inactive color
[ ] Account type icons: Wallet / Building2 / Smartphone render correctly
[ ] FAB: Plus icon centered in lime circle
[ ] Swipe actions: Trash2 (delete), Pencil (edit) — correct size and color
[ ] Settings screen: all rows have correct Lucide icons
[ ] Icons adapt to theme: correct color in both light and dark mode
[ ] No missing icon (no blank spaces where icons should be)
[ ] react-native-svg renders without errors on physical device
```

**→ STOP. Paste AUDIT 1.3 results. Wait for `PROCEED SPRINT 2` (next sprint).**

---

*KARNY BUDGET — PATCH 1.1*
*Ahmed Maknessi / karny.app — May 2026*
