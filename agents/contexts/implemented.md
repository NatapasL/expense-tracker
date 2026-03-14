# Implemented Steps

- [x] **Step 1: Project Initialization & Theming**
  - Verified SvelteKit + TailwindCSS setup.
  - Configured PWA baseline using `vite-plugin-pwa` and `@sveltejs/adapter-static` for SPA.
  - Setup global dark theme mimicking Discord's color palette in `app.css`.

- [x] **Step 2: Architecture & Folder Structure**
  - Created required folders within `src/` (`components`, `feature`, `screens`, `routes`, `libs`).
  - Created base layout structure in `routes/+layout.svelte` and `screens/LayoutScreen.svelte`.
- [x] **Step 3: Database Setup**
  - Installed `dexie`.
  - Set up Dexie.js configuration in `libs/dexie.ts` defining `Item` and `Category` tables.
  - Implemented the Category seed logic to populate default categories on first DB creation.
- [x] **Step 4: Authentication & Sync Logic**
  - Added Google Identity Services library to `src/app.html`.
  - Created `src/libs/auth.svelte.ts` to manage Google OAuth login state and tokens.
  - Created `src/libs/sync.ts` to implement Daily Sync logic using Google Sheets & Drive APIs.
- [x] **Step 5: Core UI Components**
  - Built reusable UI building blocks in `src/components/` (Button, Input, Card, Modal, Header).
  - Used Svelte 5 snippets and proper types for components.
  - Applied Discord theme color palette.
  - Fixed CSS import path in `+layout.svelte`.
- [x] **Step 6: Login Route & Screen**
  - Implemented `screens/LoginScreen.svelte` featuring a Google login button.
  - Mapped screen to `routes/login/+page.svelte`.
  - Implemented auth guard in `routes/+layout.svelte` via `$effect` utilizing `$page.url.pathname` and `auth.isAuthenticated` state.
- [x] **Step 7: Index Route & Screen**
  - Implemented `screens/IndexScreen.svelte` mapped to `routes/+page.svelte`.
  - Built the list view with grouping by date and category, total calculation, and the "Add Expense" FAB.
- [x] **Step 8: View/Add/Edit Detail Screens**
  - Implemented `screens/ViewExpenseScreen.svelte` with hero icon/amount card, details card, edit & delete buttons, and delete confirmation modal.
  - Implemented `screens/AddEditExpenseScreen.svelte` with large amount input, category grid picker, date picker, and description field. Handles both add (POST) and edit (PUT) modes.
  - Wired up routes: `routes/expense/new/+page.svelte`, `routes/expense/[id]/+page.svelte`, `routes/expense/[id]/edit/+page.svelte`.
  - Disabled `svelte/no-goto-without-base` ESLint rule in `eslint.config.js` since base path is manually handled.
- [x] **Step 9: Summary & Analytics Screen**
  - Implemented `screens/SummaryScreen.svelte` with monthly metrics (total spent, daily average).
  - Built reactive category breakdown with progress bars and weekly spending charts.
  - Added bottom navigation bar in `screens/LayoutScreen.svelte` for quick access to Home and Summary.
  - Set global currency symbol to `฿` in `libs/constants.ts`.
  - Created route `routes/summary/+page.svelte`.
- [x] **Step 10: Category Management**
  - Implemented `screens/CategoryListScreen.svelte` for managing categories with delete protection for in-use categories.
  - Implemented `screens/AddEditCategoryScreen.svelte` with custom emoji icon and color palette selection.
  - Wired up routes for listing, creating, and editing categories.
  - Added navigation to category management from the Summary screen.

## Additional Requirement 1

- [x] **Step 1: Month Selection on Index Page**
  - Updated `Header` component to support clickable title and callback.
  - Implemented `selectedDate` state in `IndexScreen.svelte`.
  - Added Month Selection Modal to allow browsing expenses by month/year.
  - Updated DB query to reactfully filter expenses based on the selected month.
  - Verified total calculations and list updates correctly.

- [x] **Step 2: Month Selection on Summary Page**
  - Implemented month selection on the Summary page similar to the Index page.
  - Updated all analytics (Total Spent, Daily Average, Category Breakdown, Weekly Totals) to reflect the selected month.
  - Verified UI interactions and data reactivity in the browser.

- [x] **Step 3: Rename Entity and App Brand**
  - Performed a global rename of "Item" entity to "Expense" in code, database schema, and UI labels.
  - Updated database version to 2 to handle the `expenses` table rename.
  - Updated app branding and display name to "Chiisa" in PWA manifest and UI.
  - Configured Google Sheets sync to use `expense_tracker` as the file name and `Expenses` as the sheet name.
  - Verified all references and functionality across all screens.

- [x] **Step 4: Sync Button Implementation**
  - Exported `syncToGoogleSheets` from `libs/sync.ts`.
  - Added manual Sync button to `IndexScreen.svelte` header.
  - Added manual Sync button to `SummaryScreen.svelte` header alongside the category management button.
  - Implemented loading state and error handling for manual sync.
  - Verified UI and functionality in the browser.
