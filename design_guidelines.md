# Risk Management Dashboard Design Guidelines - Awash Bank

## Design Approach
**Selected Approach:** Design System - Material Design principles adapted for corporate/enterprise banking environment
**Justification:** Enterprise dashboard requiring consistency, data density, and professional credibility. User focus is on utility, efficiency, and information clarity.

## Brand Identity
**Primary Color:** #10047a (Deep Blue - trust, stability, banking authority)
**Secondary Color:** #F7923A (Warm Orange - action, highlights, progress indicators)
**Application:** Primary for navigation, headers, critical actions. Secondary for CTAs, progress states, alerts.

## Theme System
**Dual Theme Support:** Light (default) and Dark mode with global toggle
**Dark Palette:**
- Background: slate-900, slate-800
- Cards: slate-800/slate-700
- Text: slate-100, slate-300
**Light Palette:**
- Background: slate-50, white
- Cards: white with subtle shadows
- Text: slate-900, slate-600

## Typography
**Font Stack:** System fonts via Tailwind default (inter-based)
**Hierarchy:**
- Page Titles: text-2xl font-bold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base
- Labels/Meta: text-sm text-slate-600

## Layout System
**Spacing Units:** Tailwind units of 4, 6, 8, 12 (p-4, p-6, p-8, gap-4, space-y-6, etc.)
**Structure:**
- Fixed sidebar (collapsible): 256px desktop, off-canvas mobile
- Top navbar: 64px height with logo, search, theme toggle, profile
- Main content: max-w-7xl with responsive padding (px-4 md:px-6 lg:px-8)
- Grid layouts: 1 column mobile → 2-3 columns tablet → 3-4 columns desktop

## Component Library

### Core UI Elements
**Cards:** rounded-xl shadow-lg p-6 transition duration-300 ease-in-out hover:shadow-xl
**Buttons:** Primary (bg-primary), Secondary (border with secondary color), rounded-lg px-6 py-3
**Inputs:** rounded-lg border-2 focus:border-primary transition-colors p-3
**Tables:** Striped rows, hover states, sticky headers, responsive horizontal scroll on mobile

### Navigation
**Sidebar:** Fixed left, collapsible icon menu on mobile, grouped navigation items with icons, active state with border-l-4 border-secondary
**Top Bar:** Logo left, search center-left, theme toggle + profile right, shadow-md separator

### Data Visualization
**Charts:** Recharts library using primary/secondary color palette
- Line charts: 12-month trend analysis
- Pie charts: Risk distribution by category
- Bar charts: Business unit comparisons
**KPI Cards:** Large metric display, trend indicators (↑↓), mini sparklines where applicable

### Forms
**Layout:** Two-column on desktop, single column mobile
**Validation:** Inline error messages in red-500, success states in green-500
**Auto-calculations:** Real-time inherent_risk display (likelihood × impact) with visual feedback

### File Upload
**Interface:** Drag-and-drop zone with dashed border-2 border-primary/50, hover:border-primary, rounded-xl p-8
**Preview:** Table display of parsed data with column mapping dropdowns
**Validation:** Error chips with counts, expandable error details

### Modals & Overlays
**Dialogs:** Centered, rounded-2xl, shadow-2xl, max-w-2xl, backdrop blur
**Confirmations:** Simple with action buttons (destructive actions in red)

## Page-Specific Layouts

### Overview Dashboard
**Grid:** 1 col mobile → 3 cols desktop (gap-6)
**Sections:**
1. KPI Row: 4 metric cards showing Total Risks, High/Medium/Low counts
2. Trend Chart: Full-width line chart (last 12 months)
3. Distribution Pie: 2-column split with pie chart + legend
4. Top Business Units: Horizontal bar chart
5. Recent Activity: Timeline-style list

### Risk Register
**Toolbar:** Filter chips (rounded-full px-4 py-2), search input, bulk action dropdown, export button
**Table:** Full-width, sortable headers, row actions (edit/delete icons), pagination at bottom
**Density:** Comfortable spacing with hover highlighting entire row

### Mobile Optimization
**Dashboard:** Compact KPI tiles (2 cols), simplified charts, bottom navigation for key actions
**Tables:** Card-based view instead of table on mobile (<768px)
**Navigation:** Hamburger menu, slide-out drawer

## Interaction Patterns
**Transitions:** duration-300 ease-in-out for all state changes
**Loading States:** Skeleton loaders matching component structure, shimmer effect
**Notifications:** Toast messages top-right, auto-dismiss, status-colored backgrounds
**Hover States:** shadow-lg elevation increase, subtle scale (scale-105)

## Accessibility
**Contrast:** WCAG AA minimum, high-contrast theme option
**Focus:** Visible ring-2 ring-primary on all interactive elements
**Keyboard Nav:** Tab order follows visual hierarchy, skip-to-content link
**Labels:** aria-labels on icon-only buttons, form labels always visible

## Images
**Hero/Header Images:** Not applicable - dashboard/enterprise application
**Icons:** Use Heroicons (outline style) for consistency throughout interface
**Avatars:** User profile images rounded-full, fallback to initials
**Empty States:** Illustration placeholders for empty tables/charts with helpful CTAs