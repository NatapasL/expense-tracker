# Agent Instructions for Money Tracker PWA

This document provides detailed instructions, constraints, and a step-by-step breakdown for the AI agent to build the Money Tracker app based on the initial requirements.

## ⚠️ Important Constraint

**After finishing EACH step in the breakdown below, you MUST write the result and mark it as completed in `contexts/implemented.md`. Do not proceed onto multiple steps without updating this file.**
**Check eslint**
**If it change frontend code, check is it work as expected**

## Overview

- **Goal:** Personal money tracker PWA to track expenses, named **Chiisa**.
- **Design Process:** Compact, Mobile-first approach. Ensure all interfaces are optimized for smaller screens before scaling up.
- **Production Build:** The app must be built as a static Single Page Application (SPA) compatible with GitHub Pages deployment.
- **PWA Features:** Must be an offline-first PWA, allowing users to use the app fully without an internet connection.
- **Theme:** Dark theme with a color palette similar to the Discord app.
- **Database:** IndexedDB (Dexie.js) for local data.
- **Sync:** Sync data to a Google Sheet. First-time users sync from sheet if it exists, otherwise create new. Daily background sync when app opens. Use a soft-delete approach (mark as deleted) in Google Sheets. Add a `synced` flag to entities.
- **Auth:** First-time users must log in with a Google account.
- **Currency:** No currency symbol. Always display 2 decimal places and use comma as thousand separator (e.g., 1,000,000.00).

## Tech Stack & Tooling Constraints

- SvelteKit (TypeScript)
- TailwindCSS
- PWA setup
- IndexedDB via Dexie.js
- Google Sheets API
- Package manager: pnpm
- _Note:_ Consult `AGENT_INSTRUCTIONS.md` to utilize the Svelte MCP for official documentation and autofixing code.

## Folder Structure Rules

The `/src` directory MUST strictly follow this structure:

- `components/`: Generic, reusable small components (e.g., buttons, inputs, icons).
- `feature/`: Feature-specific components used across multiple screens.
- `screens/`: Composite components that represent an entire page/screen.
- `routes/`: Next to no business logic. For routing only; it should simply render the corresponding screen from the `screens/` folder.
- `libs/`: Shared libraries, utilities, database schemas, and sync logic.

## Entity Schema & Seed Data

### 1. Expense

- `amount`: number
- `category`: string (reference to Category)
- `date`: Date / string
- `description`: string

### 2. Category

- `name`: string
- `color`: string (hex or theme color)
- `icon`: string (use emojis as icons)

**Default Category Seed:**
Food, Transportation, Education, Health, Home / Utilities, Family, Work, Miscellaneous, Game, Toy, Entertainment.

## Required Pages

1. **Login Page:** Google authentication.
2. **Index Page (Current Month):**
   - Displays expenses for the current month.
   - Toggle to group items by Date or Category (each group shows total amount).
   - Item display indicates amount, category, date, and description.
   - Clicking an item opens the View Detail page.
   - Displays total spent in the month.
   - Mobile-friendly floating/easy-to-tap "Add" button to add a new expense.
3. **View Detail Page:**
   - Shows expense details.
   - Back button -> navigates to Index page.
   - Edit button -> navigates to Add/Edit Detail page.
   - Delete button -> removes expense and navigates back.
4. **Add/Edit Detail Page:**
   - Form for amount, category, date, and description.
   - Save button.
   - Cancel button -> Back to View Detail (if editing) or Index (if adding).
5. **Summary Page:**
   - Total used in month grouped by category.
   - Total used per week.
   - Average used per day.
6. **Category CRUD Pages:**
   - Manage custom categories (Create, Read, Update, Delete).

## Step-by-Step Implementation Breakdown

Execute the following steps one at a time. **Remember to update `contexts/implemented.md` after completing each step!**

### Step 1: Project Initialization & Theming

- Verify SvelteKit + TailwindCSS setup.
- Configure PWA baseline.
- Setup global dark theme mimicking Discord's color palette in `app.css` or the Tailwind config.
- _Update `contexts/implemented.md`_

### Step 2: Architecture & Folder Structure

- Create the required folders within `src/` (`components`, `feature`, `screens`, `routes`, `libs`).
- Create the base layout structure in `routes/+layout.svelte` and `screens/LayoutScreen.svelte`.
- _Update `contexts/implemented.md`_

### Step 3: Database Setup

- Setup Dexie.js configuration in `libs/dexie.ts` defining `Item` and `Category` tables.
- Implement the Category seed logic to populate default categories on first application load.
- _Update `contexts/implemented.md`_

### Step 4: Authentication & Sync Logic

- Implement Google OAuth login logic.
- Implement daily sync logic from IndexedDB to Google Sheets.
- _Update `contexts/implemented.md`_

### Step 5: Core UI Components

- Build reusable UI building blocks in `components/` (e.g., Button, Input, Card, Modal, Header) using the Discord-like palette.
- _Update `contexts/implemented.md`_

### Step 6: Login Route & Screen

- Implement `screens/LoginScreen.svelte` and map to `routes/login/+page.svelte`.
- Implement auth guards to redirect unauthenticated users to the Login page.
- _Update `contexts/implemented.md`_

### Step 7: Index Route & Screen

- Implement `screens/IndexScreen.svelte` and map to `routes/+page.svelte`.
- Build the list view with grouping (by date/category), total calculation, and the "Add Expense" FAB.
- _Update `contexts/implemented.md`_

### Step 8: View/Add/Edit Detail Screens

- Implement `screens/AddEditExpenseScreen.svelte`.
- Implement `screens/ViewExpenseScreen.svelte`.
- Wire up the routes (e.g., `routes/expense/[id]`, `routes/expense/new`).
- Implement save, edit, delete, and cancel functionalities linking back to DB logic.
- _Update `contexts/implemented.md`_

### Step 9: Summary & Analytics Screen

- Implement `screens/SummaryScreen.svelte` (mapped to `routes/summary/+page.svelte`).
- Build metrics for total by category, weekly totals, and daily average.
- _Update `contexts/implemented.md`_

### Step 10: Category Management

- Implement screens and routes for creating, listing, updating, and deleting custom categories.
- Ensure category updates reflect accurately across the application.
- _Update `contexts/implemented.md`_

# Additional Requirements

## Additional 1

See `contexts/additional-requirement-1.md`

## Additional 2

See `contexts/additional-requirement-2.md`

## Additional 3

See `contexts/additional-requirement-3.md`
