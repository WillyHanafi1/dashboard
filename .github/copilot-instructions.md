# Invoice Management Dashboard - AI Coding Instructions

## Project Architecture

This is a **Next.js 15 App Router** invoice management dashboard with **Supabase** backend, built using TypeScript, Tailwind CSS, and shadcn/ui components. The app features dark/light theme support with **next-themes** and data visualization via **Tremor React** charts.

### Key Architectural Decisions

- **Mock Data Fallback Pattern**: All data fetching gracefully degrades to mock data when Supabase is unavailable. Check `lib/invoiceQueries.ts` - every query returns `mockInvoices` if Supabase env vars are missing or contain "placeholder"
- **Indonesian Business Context**: This is an Indonesian invoice system using "Faktur" terminology. The database table is `MainFaktur`, status values are "Lunas" (paid) and "Menunggu Persetujuan" (pending approval), and currency formatting uses IDR
- **Theme-First Design**: All components must support both dark (default) and light themes. Charts require special handling in `globals.css` with explicit `.dark` and `.light` selectors

## Critical Developer Workflows

### Development Commands
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build (strict TypeScript/ESLint)
npm run lint         # ESLint check
```

### Environment Setup
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
**Important**: Missing or placeholder values trigger mock data mode automatically.

### Database Schema
The `MainFaktur` table uses Indonesian column names:
- `NomorFaktur` (invoice number)
- `NamaVendor` (vendor name)
- `TanggalFaktur` / `TanggalJatuhTempo` (dates in YYYY-MM-DD)
- `TotalTagihan` (amount)
- `StatusPembayaran` (must be "Lunas" or "Menunggu Persetujuan")

See `SUPABASE_SETUP.md` for complete schema and RLS policies.

## Project-Specific Conventions

### File Organization
- **`app/`**: Next.js App Router pages. `layout.tsx` wraps everything with `ThemeProvider` and uses `suppressHydrationWarning` to prevent theme flash
  - **`app/dashboard/page.tsx`**: Landing/welcome page with navigation cards
  - **`app/dashboard/faktur/page.tsx`**: Main invoice management page with KPIs, charts, and table
  - **`app/dashboard/vendor/page.tsx`**: Vendor management (placeholder)
- **`components/`**: React components. `ui/` contains shadcn components (never edit directly - regenerate with shadcn CLI)
- **`lib/`**: Business logic and utilities. `invoiceQueries.ts` is the single source of truth for data fetching and calculations
- **`types/invoice.ts`**: TypeScript interfaces matching Indonesian database columns

### Theme Implementation Pattern
```tsx
// All client components using theme must:
'use client'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null // Prevents hydration mismatch
```

See `components/ThemeToggle.tsx` for reference implementation.

### Chart Styling Requirements
Tremor charts need explicit CSS overrides for theme support in `globals.css`:
```css
.dark .tremor-AreaChart text { fill: rgb(248 250 252) !important; }
.light .tremor-AreaChart text { fill: rgb(15 23 42) !important; }
```
**Always test charts in both themes** - text visibility is the most common issue.

### Data Flow Pattern
1. **Fetch**: `fetchInvoices()` returns `Invoice[]` (from Supabase or mock)
2. **Calculate**: `calculateInvoiceStats()` computes KPIs
3. **Transform**: `generateChartData()` / `generateVendorData()` prepare chart-ready data
4. **Format**: `formatCurrency()` uses Indonesian locale (IDR)

All data operations happen client-side in `app/dashboard/faktur/page.tsx` using React hooks.

## Integration Points

### Supabase Authentication
- Login/signup flows in `app/login/` and `app/signup/`
- Session management via `supabase.auth.onAuthStateChange()` in `components/Header.tsx`
- Protected routes check auth state on mount (see `app/dashboard/layout.tsx`)

### shadcn/ui Components
Install new components with: `npx shadcn-ui@latest add [component-name]`
Components auto-generate in `components/ui/` with theme CSS variables from `globals.css`.

### Tremor Chart Configuration
- **Color Palette**: Use semantic colors - `emerald`/`green` for paid, `amber`/`yellow` for pending, `blue` for vendors
- **Custom Tooltips**: Always provide `customTooltip` prop with `bg-background` and `border-border` for theme consistency
- **Safelist**: Tailwind config includes Tremor color safelist to prevent purging dynamic classes

## Common Patterns

### Loading States
Use skeleton UI with `animate-pulse` class on card placeholders (see `InvoiceCharts.tsx` loading state).

### Error Handling
Display errors via shadcn `Alert` component with `variant="destructive"` (see `app/dashboard/faktur/page.tsx`).

### Currency Formatting
Always use `formatCurrency()` from `lib/invoiceQueries.ts` - it handles IDR locale and removes decimal places.

### Status Display
Map "Lunas" → green/emerald colors, "Menunggu Persetujuan" → amber colors consistently across UI.

## Key Files Reference

- **`lib/invoiceQueries.ts`**: Core business logic for data fetching, KPI calculations, chart data generation
- **`app/globals.css`**: Theme CSS variables and critical Tremor chart overrides
- **`tailwind.config.js`**: Tremor safelist configuration (lines 80-103) - required for chart colors
- **`components/theme-provider.tsx`**: Theme configuration with `defaultTheme="dark"` and `storageKey="dashboard-theme"`
- **`types/invoice.ts`**: TypeScript contracts for all invoice-related data structures

## Testing Checklist

When making changes:
1. Test in both dark (default) and light themes
2. Verify mock data fallback works (set invalid Supabase URL)
3. Check chart visibility and tooltip styling
4. Validate Indonesian currency formatting (IDR, no decimals)
5. Ensure mobile responsiveness (especially charts and tables)
