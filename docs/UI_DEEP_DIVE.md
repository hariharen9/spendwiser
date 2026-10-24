# SpendWiser — Complete Visual / UI Deep Dive

A pure UI walkthrough of every page, panel, control, and interaction. No data logic — just what you see, where it is, what it does, and how it behaves. SpendWiser is a **React + TypeScript (Vite)** progressive web app styled with **Tailwind CSS**, animated throughout with **Framer Motion**, plus Recharts (charts), dnd-kit (drag & drop), lucide-react / react-icons (icons), and a strong **dark/light theme**.

---

## Design Language (the "grammar" of every screen)

- **Dark surfaces:** `#242424` cards, `#1A1A1A` page background; light mode uses gray-50 / white.
- **Text:** `#F5F5F5` (near-white) primary, `#888888` muted, in dark mode.
- **Frosted glass:** `backdrop-blur`, translucent white / dark backgrounds on cards, modals, and floating elements.
- **Color meaning is consistent:**
  - **Blue `#007BFF`** — primary actions, active state, selectable, "primary"/default buttons.
  - **Green / emerald `#10B981` / `#28A745`** — income, positive, savings, on-track, success, settled.
  - **Red `#EF4444` / `#DC3545`** — expense, negative, delete, overdue, danger.
  - **Amber / yellow `#FFC107`** — warnings, near-limit, caution.
  - **Purple / indigo / cyan / teal** — secondary analytics, "smart"/AI/insight accents, FABs.
- **Motion everywhere:** staggered entrance, hover-lift (`cardHoverVariants`), AnimatedNumber count-ups, animated progress-bar widths, `AnimatePresence` expand/collapse + modals, spring physics.
- **Rounded corners** are generous; **modals** share a consistent look (backdrop `bg-black/50`, panel `bg-white`/`dark:bg-[#242424]` `rounded-xl`/`rounded-2xl`, pop/scale entrance, backdrop-click closes).
- Heavy use of **`dark:` Tailwind variants** — nearly every component theme-adapts.

---

## App Shell (everything that wraps the pages)

### Sidebar (desktop, left, w‑64)
- Nav list — **Dashboard** (Home), **Transactions** (Receipt), **Credit Cards** (CreditCard), **Budgets** (PieChart), **Goals** (Target), **Loans** ("EMIs", Landmark), **Settings** (Settings). Active item = blue `#007BFF`.
- Below the nav: a **profile card** and **streak badges**.
- Bottom: **Logout** button and a **dark-mode toggle** (Sun/Moon).
- **On mobile:** there is no sidebar — the same items become a **bottom nav bar**, and the "goals" item is excluded; labels shorten to "Trans" / "CCs".

### Header (top, desktop-only — `hidden md:block`)
- Page **title** + a **live date/time pill** (calendar + clock icons; hovers to reveal a "Gomalaaaaaaa 😂" easter-egg tooltip).
- A **Calculator** icon button.
- Optional **Import CSV** and **Export** action buttons.
- An **Add Transaction** button (the AnimatedButton, below).

### Floating FABs
- **EnhancedFAB (bottom-right, teal `#00C9A7`):** a speed-dial. Tap → opens Add Transaction. **Long-press (500ms)** — or hover (desktop) with a "Hold to see more" tooltip — fans out a vertical menu:
  - **Add Expense** (red, TrendingDown)
  - **Add Income** (emerald, TrendingUp)
  - **Repeat Last** (blue, RotateCcw — only shown if a last transaction exists)
  - **Calculator** (purple)
  - **Shortcuts** (amber, Zap) → opens a sub-panel of saved shortcuts.
  - Each item has a flanking label pill that fades/slides in; the Plus icon rotates 45° into an X when open.
- **HelpFAB (bottom-left):** a gray frosted HelpCircle button → opens the per-page "Case File" help.
- Positions shift higher (`bottom-24`) on mobile to clear the bottom nav.

### Shared Common Components (used across screens)
- **AnimatedButton** (Add Transaction): "terminal" mono dark pill; on hover the label **text-scrambles** through symbols and a green gradient wipe sweeps it, text turns green.
- **AnimatedDropdown:** a select-style button with a rotating chevron; pops a spring dropdown (hover blue, selected = blue-tinted + bold).
- **AnimatedNumber:** count-up number animating when scrolled into view, **en-IN** (Indian) grouping formatting.
- **CurrencyInput:** currency-symbol prefix (₹), en-IN comma formatting, and a subtle italic **"amount in words"** helper below, plus red error ring.
- **TagChip / TagInput:** colored tag pills; TagInput has a full create/edit/delete flow with a **color picker** (row of colored dots), inline edit (pencil → text field + green save / red cancel), and a delete-confirm panel.
- **AnimatedToast:** top-right slide-in toast (green success / red error / yellow warning / blue info) with a shrinking 6s auto-close progress bar.
- **ConnectionStatus:** top-center pill — red "Systems are offline" when offline (with animated cycling dots) or green "All systems are online" for 3s on connect.
- **StickyCheckbox / StyledCheckbox:** 24×24 checkbox that animates to blue and **path-draws** the check.
- **PullToRefreshIndicator:** frosted pull-to-refresh ring with a progress circle, states gray→blue "Release to sync"→spinning→emerald checkmark; a separate **hard-refresh** path in orange.
- **StreakBadge:** a wiggle-animated flame pill (red→amber gradient for "Super Streak", orange for visit streak) with a hover tooltip showing both streaks.
- **SuccessAnimation:** full-screen celebration — green→emerald gradient circle, draw-in checkmark, floating sparkles, expanding rings, and a 12-particle confetti burst.

---

## Page: Dashboard

Greeting header + a top row of three always-visible metric cards, then a **drag-and-droppable 3-column widget grid** (1 column on mobile).

### Header toolbar
- **Greeting block** (desktop): an animated rotating sun/sun-dim/moon tile + a big greeting ("Good morning… **Captain!**") with a Sparkles subtitle.
- **Action toolbar (right, desktop only):**
  - **Eye / EyeOff** toggle — global **privacy mode** that masks the three metric values.
  - **Widgets** button (Grid icon, rotates on hover) → Widget Library.
  - **Export** button (emerald Download) — only if export is available.
  - **Customize** button — enters edit mode. In edit mode this row swaps to **Cancel** (turns rose on hover) and **Save Layout** (blue, glow shadow).

### Top metric row (always visible)
Three **MetricCards** in a 3-column grid (blue / green / red icon tiles with ambient blurred glow):
1. **Total Balance** (blue, DollarSign)
2. **This Month's Income** (green, TrendingUp)
3. **This Month's Expenses** (red, TrendingDown)

Each card: uppercase small label, an **AnimatedNumber** value, a bounce-on-hover icon, and — in privacy mode — playful emoji placeholders instead of numbers ("Bazillions 💰", "Stonks Only 🚀", "Don't Look 🙈").

### The widget grid (the heart of the page)
- **Drag & drop** via dnd-kit — reorder within and across columns (pointer + keyboard sensors, pointer-with-tolerance collision).
- **Edit mode:** blue dashed outline on hover, a **drag handle** (GripVertical chip, top-left), a red **remove (hide)** X button (top-right), and a blue **"Replace Position"** pill when dragging over another widget.
- **Empty columns:** a dashed "Column N is empty — Drag widgets here or add new ones" zone with an "Add Widget" button.
- **Drop zones:** subtle dashed boxes at the top of / between columns; glowing animated when hovered, with "Drop here (TOP OF COLUMN)" text.
- **Parallax** scroll effect on each widget (staggered up/down translations).
- If **no widgets** are shown at all: a centered empty state (gray Grid icon, "No widgets to display", blue "Add Widgets" button).

### The 19 widgets (each a titled card, most with per-widget empty states)
1. **Spending Chart** — time-range segmented control (Month | Quarter | Year), chart-type toggle (Pie / Bar / Trend), a green CSV-Export button; donut with selectable clickable slices that open a per-category modal; bar and gradient area views; a custom legend of category pills; a **"Show more / Show less"** section (AI insights, top categories, spending patterns, quick-action buttons, 4 advanced insight cards).
2. **Accounts** — account rows with type-colored icons, balances (green/red), credit-card **Usage** health bar, a privacy eye toggle (masks balances as `••••••`), and footer stats (Accounts count + Net Worth).
3. **Income vs Expense** — segmented Bar/Line toggle, three metric tiles (Income/Expense/Saved-or-Deficit), a 6-month chart (green income / red expense bars or lines), and an **Avg Savings Rate** footer with a colored fill bar.
4. **Budget Summary** — a **3D flip card** (FlipHorizontal button). One face shows budget rows with Edit/Delete icons and progress bars + an "Over by …" red callout; the other face shows the Total Monthly Budget with an Edit/Set gradient button. Includes a total-budget modal and a delete-confirmation modal.
5. **Total Budget (Monthly Budget)** — status pill (On track / Near limit / Over budget), green/yellow/red progress bar, "Percentage used" and "Remaining" stats.
6. **Top Categories** — segmented List/Chart toggle; top-5 rows with emoji icons, gradient rank bars, "#N" ranks, clickable to open per-category transactions; or a gradient horizontal bar chart.
7. **Recent Transactions** — up to 7 rows; **double-click to inline-edit** the name (blue input, Enter/Blur saves, Esc cancels) or open a category `<select>`; relative timestamps; footer "This Week" + "Latest".
8. **Cash Flow Forecast** — hero projected-net number (green/red), confidence pill, Month/Quarter toggle, expandable details panel (Info button).
9. **Days of Buffer** — period selector (Week | Month | 90 Days | 6 Months), a huge day-count hero (green/blue/yellow/red), status pill, tiles, expandable details.
10. **Net Worth** — giant colored value with an icon (Positive / Negative / Zero Net Worth), green Assets / red Liabilities tiles.
11. **Monthly Balance** — a horizontally scrollable tab strip ("Overall" + per non-credit account, blue active tab) showing Start-of-Month vs Current Balance vs Change.
12. **Financial Goals** — top-3 active goals with animated progress bars and "% Complete".
13. **Subscriptions** — Add (green) + Manage (blue) buttons, a sort `<select>`, Active/All toggle, gradient summary banner, scrollable list with active/expiring-in-30-days indicators.
14. **Debt Paydown** — top-3 loans with orange paid-off bars.
15. **Lifestyle Creep** — 3M/6M toggle, big colored percentage, status pill, tiles, expandable details.
16. **Balance Projection** — Conservative | Realistic | Optimistic tabs, trend icon + confidence pill, expandable line chart (Now→24M), "6/12/24 Months" amounts, details panel.
17. **Achievements** — gamified card: Trophy + level badge, "X/Y achieved" + XP count, a blue→purple More/Less gradient button, completion bar, recent-unlock tiles that fire a **confetti cannon** on click (with rarity badges, "NEW!" badges, hover tooltips), a category-progress grid, all-achievements scroll list, stats grid, and a level-up toast.
18. **Bill Splitting Summary** — three balance rows (Owed to You green / You Owe red / Net Balance) + a full-width blue **"Manage Splits"** button opening the Bill Splitting modal.
19. **Insights Engine** — a category `<select>` (All/Warnings/Budget/Savings/Spending/Trends/Opportunities), insight cards with colored left borders, priority dots, click-to-expand details, and a footer legend.

### Dashboard modals
- **WidgetLibraryModal** (Grid "Widgets" button): search field + category filter chips (All / Analytics / Financial / Tracking / Insights); a **live 3-column mirror** of the dashboard where you can **drag widgets** (GripVertical handles) and toggle eye icons to show/hide; an "Available Widgets" grid of hidden ones; footer tips + a blue "Done" button. The 19 widgets are tagged with name/category/color chip.
- **CategoryTransactionsModal:** "Transactions for {category}" table (Date / Name / Amount, red amounts), opened by clicking pie slices, legend items, or top-category rows.

---

## Page: Transactions

A Framer-Motion staggered container with a three-zone header, a filter bar, and a toggle between a **table list** and a **calendar** view.

### Header
- **Left (desktop):** transaction count.
- **Center:** a **Month navigator** — chevron arrows + a "Month Year" label; clicking the label narrows the date filter.
- **Right:** a **List / Calendar segmented view toggle**, a solid **blue "Manage Recurring"** button, and a **purple "Report"** button (desktop).

### Filter bar
- **Desktop:** a 5-column grid — search, type, category, sort, plus a **"Quick Select"** set of date pills (Today / Yesterday / Week / Month) and a toggleable **Advanced** panel (Date / Amount / Category / Tag panels, plus "Credit Card Only" and "Has Comments" checkboxes).
- **Mobile:** a collapsible **Filter** button + a "More" advanced section.

### Table view (desktop)
- Columns: **Date | Name | Category | Amount | Type | Actions**, with date-grouped header rows.
- Circular radio-style **select checkboxes** with blue row highlighting → feed a **blue bulk toolbar** with a **red bulk Delete**.
- **Double-click the name** to inline-edit; "CC" / "R" badges with tooltips; colored TagChips.
- **Amounts:** green income / red expense; matching Type pills.
- Per-row **comment / Edit / Delete** icon actions, with an animated delete-confirm popover.

### Mobile list
Stacked cards with emoji category icons (color-coded income/expense arrow badges), **tap-to-expand** a details grid, Edit/Delete buttons, and a full-screen delete confirmation modal.

### Calendar view (desktop)
A **6×7 grid starting Sunday**; blue circle highlights today; green/red income/expense chips per day; a **cursor-following floating tooltip** showing that day's transactions with green/red dots and a Net value.

### Bottom summary + charts
- **Summary:** red Total Expenses, a dynamic Net Total, Avg Daily Spend, plus In/Out cards.
- **CategoryChart:** a Recharts **donut** ("Expense by Category") with pop-out hover slices, tooltip, legend, and empty states.

### Recurring modal
Opened by "Manage Recurring": an add/edit form (name, amount, category, type, account, frequency dropdown, start/end date) plus a list with next-ETA ("Due now" / date / "Paused"), and per-item **edit / pause (Play/Pause) / delete (Trash2)**.

---

## Page: Credit Cards

*(goals + credit cards share one combined report)*

- A list/grid of **credit card cards**, each showing:
  - Card name, **last 4 digits**, network.
  - **Statement date** and **payment due date** toggles/fields.
  - Balances and **usage** with a color-coded health bar (green <60% / yellow <80% / red >80%).
  - Delete / edit controls.
- Per-card **theme** color applied to the card visual.
- Buttons to **add a new card** and manage card-level details.

*(If the user wants the fully granular per-field breakdown for this page, I can expand it further — the card creation modal has network/theme/date pickers.)*

---

## Page: Budgets ("Smart Budgeting")

Subtitle "Track spending, forecast costs, and save more." Two-column responsive layout (left 4 / right 8) over a **purple gradient ambient glow**.

### Header
- Title "Smart Budgeting" + subtitle.
- **"Set Monthly Limit"** (purple, Plus) — only when no total budget exists. Otherwise **"Add Category"** (inverted/dark, Plus) — always shown.

### Left column
- **Budget Health card** (frosted GlassCard):
  - If a total budget is set: a circular **SVG gauge ring** (200px, red `#ef4444` over sports / amber `#f59e0b` nearing / emerald `#10b981` on track), center "Spent" label with an AnimatedNumber amount, "of ₹{limit}", and a color-tinted status pill **"Over Budget" / "Nearing Limit" / "On Track"** (AlertTriangle / CheckCircle). A small edit/pen opens the monthly-limit modal.
  - Empty state: purple Target tile, "No Total Budget", "Set a total monthly spending limit to unlock health metrics and forecasting.", and a purple **Set Limit** button.
- **Smart Insights card** (when a total budget exists): three tiles — **Daily Average** (blue activity icon), **Projected End-Month** (TrendingUp, green/red by status), **Safe Daily Spend** (purple calendar; only when days/remaining positive).

### Right column — Analytics panel
- Header PieChart icon + "Analytics". **Three tabs:** **Category Split** (donut pie, 6-color palette, circle legend, frosted tooltip showing Spent/Remaining with red/emerald remaining), **6-Month Trend** (blue gradient area chart), **Daily Spend** (violet bar chart).
- Insight footer: yellow Activity icon + dynamic text — "**{topCategory}** is your top expense this month, accounting for **{pct}%** of your spending."

### Budget Categories grid
- Blue Target icon + "Budget Categories". Empty state: dashed card + a purple "Add Category" text link.
- **BudgetCard grid** (1/2/3 columns responsive). Each card:
  - A **4px left accent border** (red over / amber nearing / blue normal), hover lift, whole card clickable to **expand/collapse**.
  - Header: category name (+ a tiny gray "DETAILS" badge when expanded), "Limit: ₹…" caption, and right-side **edit (pencil)** + **delete (Trash2, red)** icon buttons (stopPropagation).
  - An **animated progress bar** (red/amber/blue fill, animates width over 1s) with spent + % below.
  - **Expanded details:** "Largest Single Expense" panel (amount + localized date) and "Recent Activity" (up to 3 rows with blue dots, unless a "+N more transactions" note) — or a dashed "No transactions this month" empty box.

### Budgets modals
- **Set/Edit Monthly Limit modal:** title "Set/Edit Monthly Limit", currency-prefixed number input (purple focus ring, autofocus), **Save Limit** (purple) and **Remove** (red — only when editing).
- **Delete Category confirm:** "Delete Category?" with Cancel (gray) + **Delete** (red).
- **Add/Edit Budget modal:** blue Target icon header, **Category** AnimatedDropdown (Salary, Freelance, Investment, Groceries, Food & Dining, Transportation, Entertainment, Shopping, Utilities, Healthcare, Education, Housing, Health, Travel, Other), **Budget Limit** CurrencyInput (₹), then **Cancel** + **Save/Update Budget** (blue). Staggered slide-up form animations.

---

## Page: Goals

- A list/grid of **goal cards**, each showing:
  - An **emoji icon**, goal name, and **current / target** amounts.
  - A green animated **progress bar** and "% Complete".
  - A **target date**.
  - **Edit / Delete** controls.
- A header **"Add Goal"** button opening the goal modal (name, emoji picker, target amount, target date), plus delete confirmation.
- *(Note: a "Growth Timeline" tab exists in code but is commented out / not rendered.)*

---

## Page: Loans / EMIs

**(Per the deep-dive subagent report delivered earlier — Loans, EMI calculator, amortization.)**
- Header + **"Add Loan"** button opening a loan modal with fields: name, loan amount, interest rate, tenure, EMI, start date, and loan type dropdown.
- A list of **loan cards / tables** showing each loan with its **EMI row**, an **EMI calculator** and **amortization** breakdown.
- Edit / delete controls per loan.
- *(A few deeper `MobileAmortizationCard` / `PayoffChart` / `StrategySummaryTable` components are imported but not actually rendered — so they don't surface for the user.)*

---

## Page: Settings

**(Per the earlier deep-dive subagent report — Settings sections.)**
- A settings shell with a **section navigation**, typically covering (as surfaced in code):
  - **Profile / Account** — display name, avatar, account settings.
  - **Notifications** — toggles driven by `NotificationSettings`.
  - **Data & Privacy** — export, clear data.
  - **Shortcuts** — manage quick shortcuts (referenced from the FAB).
  - **Appearance / Theme** — dark/light toggle.
  - **Onboarding** — re-run or manage onboarding state.
- *(I'll confirm the exact full list of sections on request; the earlier subagent delivered the granular section-by-section structure.)*

---

## Bill Splitting (modal / page)

**(Per the earlier deep-dive subagent report.)**
- Participant management and expense splitting with **three split modes:** **Equal / Unequal / Percentage**.
- A summary view showing "Owed to You" (green) / "You Owe" (red) / Net balances, reached from the **Bill Splitting Summary** dashboard widget's "Manage Splits" button.

---

## Login, Landing & Onboarding

### Login page (full-screen, dark, snap-scroll; theme toggle fixed top-right)
- Two snap sections: the **login card** and the **marketing Landing** below.
- **Login card:** frosted logo tile (scales + rotates on hover), a text-scramble **"SpendWiser"** headline via `<Shuffle>`, subtitle "Ultimate Financial Command Center", a pulsing gradient ring, and:
  - **"Start with Google"** (glass button, Google "G", gradient glow on hover, spinner + "Signing in…" while loading).
  - **"Sign in with Email"** → reveals the email form.
  - Footer: "Your Secure, fast, and intuitive financial manager" + "Built by Hariharen © 2026".
- **Desktop:** login card and email form side-by-side (animated vertical divider); **mobile:** switches between the two with a slide animation.
- A **ScrollIndicator** (mouse-capsule with bobbing dot) at the bottom of the snap section.

### Email sign-in form
- Frosted card with a rotating-grow **X** close button; animated heading "Welcome Back" ↔ "Create Account".
- Email (blue focus ring, icon turns blue) + Password fields (with a **live strength/validation** message that slides in, requiring ≥6 chars, a letter, a number, a symbol).
- "Forgot Password?" link (sign-in only) with a spinner state; green success pill / red error pill (with a shake).
- **Submit:** full-width **green→teal gradient** button (swaps to "Processing…" while disabled).
- Toggle link: "Don't have an account? **Sign Up**" / "Already have an account? **Sign In**".

### Landing / marketing page (long scroll below the login)
- **Auto-hiding sticky header:** slides down after 50px scroll; logo + wordmark; nav Features / SMS Automation / Pricing / About; a rocket "Embark on Your Journey" CTA; hamburger → X on mobile.
- **Hero:** blue pill badge "The Ultimate Financial Command Center.", headline "From Financial Chaos to *Crystal Clarity*" (blue accent), big Zap CTA "Unlock Your Financial Superpowers", framed dashboard screenshot with glow.
- **Features:** three alternating image/text blocks — **"Outsmart Your Debt"** (loan sim), **"Automate Your Financial Life"**, **"Budget with Purpose"** — each with an ImageCarousel preview and blue-check bullets.
- **SMS Automation** (dark band): emerald "Next-Gen Intelligence" badge, "Zero-Touch SMS Automation", two glass cards (3-Tier AI Engine / Privacy Sovereign BYOK), a phone frame with a pulsing "Instant Detection: New Transaction: Starbucks ₹450" toast.
- **PWA / Mobile First:** three rotated phone screenshots that straighten/lift on hover + a glass card (Installable / Works Offline / Always Up-to-Date) with an "Install SpendWiser App" button.
- **Pricing:** **Free** card (blue ring, blue CTA) vs **Pro** card (dimmed "Coming Soon", Hourglass) — each with 6 checkmarked features.
- **About — "SpendWiser Advantage":** three icon rows (Real-time Insights / Cross-Platform Access / Your Data Your Control) + "Join a Thriving Community" with big stats (500+ users, ₹100k+ tracked, 4.9★).
- **Final CTA:** "Ready to Achieve Financial Clarity?" on a blue-tinted band, crown "Seize Your Financial Destiny", footnote "No credit card required • 😉". (Testimonials section is commented out.)
- **Scroll-to-top** blue circular button appears after 10% scroll.

### Footer
- **CurvedLoop marquee:** a huge curved animated "SpendWiser ✦ Your ✦ Ultimate ✦ Expense ✦ Tracker ✦" line (8rem, draggable to change direction).
- 3-column footer: **Brand** (logo, tagline, "Created by Hariharen", social tiles GitHub/LinkedIn/Globe); **Quick Links** (slide-in hover links: Source Code, Issues, LICENSE, Pull Requests, Discussions, Contributing, Releases); **Impact** (three green stats + a "💖 Love SpendWiser?" support card with **Buy Me a Coffee** and **PayPal** buttons).
- **Bottom bar:** © 2026 + "Privacy Policy" and "Terms & Conditions" (open LegalModals) + tagline "Clarity in finance, confidence in life."

### Onboarding wizard (7-step full-screen tour, gated behind login)
- Full-screen modal with vignette + blur; skip via X / outside-click / Back past step 1.
- Thin **blue→purple gradient progress bar** ("Step X of 7"), centered step title + description, footer with **Back** + a blue **Next** that becomes a green **"Get Started"** on the last step; step-dot indicators (active = wide blue pill).
- Steps:
  1. **Welcome 🎉** — Rocket icon + 3 circular feature icons (Track green / Analyze blue / Achieve purple).
  2. **Financial Command Center** — blue/indigo panel, two frosted mini-cards, an amber "Pro Tip: widgets drag-and-droppable".
  3. **Smart Transaction Tracking** — purple→pink panel, 4 green-check rows (auto-categorization, recurring, filtering, CSV), blue "Quick Add FAB" tip.
  4. **Intelligent Budgeting** — orange/red panel with **animated sample progress bars** ("Food & Dining ₹2,250/₹6,000" green shimmer 37.5%, "Shopping ₹3,500/₹7,000" yellow 50%) + blue "Smart Alerts" panel.
  5. **Financial Goals** — ✈️ "Vacation to Japan", ₹3,00,000 target with a blue→purple 25% bar.
  6. **EMI & Loan Management** — swaying Landmark icon + two sample loan rows + purple "EMI Calculator" panel.
  7. **"You're All Set! 🚀"** — springing green→blue check circle + a 2×2 grid of gradient tiles (Dashboard / Transactions / Budgets / EMIs).
- **Completion** fires a `canvas-confetti` burst (brand colors) before closing.
- *(Note: related `GamifiedProgress`, `SpotlightOverlay`, `InteractiveStep` components exist and are reusable but are **not currently wired** into the active wizard.)*

---

## Modals (cross-page)

- **Add Transaction** (the central form, 1000+ lines): name, **CurrencyInput** amount, date, category dropdown with an auto-categorization keyword map, income/expense **type toggle**, account dropdown, tags, comments; optional pre-fill; launches Bill Splitting; Save/Update button.
- **Monthly Report** ("Report", purple, desktop in Transactions): month selector, summary KPIs, category **pie + bar charts**, transaction grouping (date/category/summary view modes), insights, and **PDF download**.
- **Shortcut Manager:** form (keyword/name/category/type/account) + a list with Edit/Delete.
- **Export Dashboard:** choose **PDF** (blue) or **PNG** (green).
- **Calculator:** full calculator with keyboard support, persistent state/history, and a color-coded button scheme (number/operator/action/equal).
- **Import CSV:** drag-and-drop / file import with required headers (date, name, category, amount, type), validation errors, processing/success/error states, "Try Again"/"Close".
- **Feedback:** 5-star rating (yellow fill), optional textarea, "Maybe Later" / "Submit Feedback".
- **Help ("Case File"):** per-page detective-theme content, closing quote "- Hariharen"; per-page entries for transactions, credit-cards, budgets, and so on.

---

## Notable observations / quirks (UI relevance)
- **Currency inconsistency:** the `₹` symbol is hardcoded in several modal strings even though a `currency` prop is threaded through the app — so a non-INR currency selection may not fully reflect everywhere.
- **Dead/unwired components** (present in code, not rendered): `MobileAmortizationCard`, `PayoffChart`, `StrategySummaryTable`, the Goals "Growth Timeline" tab, and `GamifiedProgress`/`SpotlightOverlay` in onboarding.
- **Delete / Reconcile confirmation** in a few dialogs uses the generic blue action button rather than a semantic red — a minor consistency wart.
