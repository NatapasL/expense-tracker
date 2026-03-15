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
- [x] **Step 5: Enhanced Sync & Soft-Delete Logic**
  - Updated database schema (v3) with `synced`, `deleted`, and `updatedAt` flags for Expenses and Categories.
  - Implemented soft-delete for both Expenses (in `ViewExpenseScreen.svelte`) and Categories (in `CategoryListScreen.svelte`).
  - Updated all analytics and list views to filter out soft-deleted items.
  - Re-implemented `syncToGoogleSheets` in `libs/sync.ts` as a robust two-way sync process.
  - Added conflict resolution using `updatedAt` timestamps.
  - Refined `checkAndRunDailySync` to force a pull for first-time users on a new device.
  - Fixed TypeScript errors and ensured type safety in sync logic.

## Additional Requirement 2

- [x] **Step 1: Universal Currency Formatting Utility**
  - Created logic in `src/libs/utils.ts` for consistent currency display (commas and 2 decimal places).
  - Applied to Index, Summary, and View Detail screens.
- [x] **Step 2: Update Date Formatting on Index Page**
  - Updated "By Category" view in `IndexScreen.svelte` to show dates as 'DD MMM YYYY, ddd'.
- [x] **Step 3: Default Date Logic on Add Expense Page**
  - Updated `AddEditExpenseScreen.svelte` to use session storage for remembering the last used date when adding new expenses.
  - Refactored `IndexScreen.svelte` to remove date query parameters from the "Add Expense" link.
  - Ensures the last used date is remembered across consecutive additions, but not influenced by edits.
- [x] **Step 4: Auto-select Category based on Amount**
  - Implemented historical category suggestion in `AddEditExpenseScreen.svelte` based on the most frequent category for a given amount in the last 3 months.
  - Ensured auto-selection does not override manual user choice.

## Additional Requirement 3

- [x] **Step 1: Remove Daily Sync Logic**
  - Removed `checkAndRunDailySync` function from `libs/sync.ts`.
  - Confirmed manual sync button in Header still works on both Index and Summary screens.
- [x] **Step 2: Update Login Requirement Logic**
  - Updated `auth.svelte.ts` to include `hasLocalData` state and `checkLocalData` logic using Dexie.
  - Updated `+layout.svelte` auth guard to allow access if the user is authenticated OR has local data.
  - Updated `AddEditExpenseScreen.svelte` to refresh `hasLocalData` after saving.
  - Updated `handleSync` in `IndexScreen.svelte` and `SummaryScreen.svelte` to prompt for login if unauthenticated.
- [x] **Step 3: Immediate Sync After Login**
  - Modified `auth.svelte.ts` to make `login()` return a `Promise<boolean>` that resolves after the Google GIS callback completes.
  - Updated `IndexScreen.svelte` and `SummaryScreen.svelte` to `await auth.login()` and immediately proceed with syncing upon successful authentication.

- [x] **Step 4: Refactor Components Structure**
  - Refactored components in `src/components/` to a folder-based structure (`src/components/component-name/Component.svelte`).
  - Refactored `Button`, `Card`, `Header`, `Input`, and `Modal`.
  - Updated all import references in screens and features.
  - Verified with `npx eslint .` and `npm run check`.

- [x] **Step 6: Refactor AddEditCategoryScreen**
  - Refactored `AddEditCategoryScreen.svelte` into `src/screens/add-edit-category/` folder-based structure.
  - Created `styles.ts`, `constants.ts`, and `index.ts` to organize component logic and styles.
  - Ensured `styles.ts` follows the project convention of named exports ending in `Style`.
  - Updated category creation and edit routes to use the new folder-based structure.
  - Verified with `npm run check`.
