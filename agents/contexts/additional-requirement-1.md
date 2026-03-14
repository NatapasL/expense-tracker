Read the `agents/contexts/instruction.md` first.

# Additional Requirement 1

This document breaks down the implementation of additional features and logic changes for the Chiisa app.

# Important

- Do only single step at a time
- Update `agents/contexts/implemented.md` after finishing each step

## Breakdown

### Step 1: Month Selection on Index Page

- Implement a month selection popup triggered by clicking the current month display on the Index page.
- Update the expense list to filter and display items for the selected month.
- Ensure the "Total Spent" calculation updates accordingly.
- _Update `agents/contexts/implemented.md`_

### Step 2: Month Selection on Summary Page

- Implement month selection on the Summary page similar to the Index page.
- Update all analytics (Total by category, Weekly totals, Daily average) to reflect the selected month.
- _Update `agents/contexts/implemented.md`_

### Step 3: Rename Entity and App Brand

- Global rename of "Item" entity to "Expense" in code, database schema, and UI labels.
- Update app branding and display name to "Chiisa".
- _Update `agents/contexts/implemented.md`_

### Step 4: Sync Button Implementation

- Add a manual "Sync" button to both the Index and Summary pages.
- Ensure the button triggers the sync logic immediately.
- _Update `agents/contexts/implemented.md`_

### Step 5: Advanced Sync Logic

- **Initialization:** For first-time users (no local data), attempt to sync from Google Sheets after login.
  - If a sheet exists, download and populate local IndexedDB.
  - If no sheet exists, create a new one using a predefined template.
- **Tracking:** Add a `synced` boolean flag to `Expense` and `Category` entities to track sync status.
- **Daily Sync:** When the app is opened, automatically:
  - Upload all unsynced local data to Google Sheets.
  - Update the `synced` flag for uploaded items.
  - Download any remote updates to keep local data in sync.
- **Soft Delete:** Implement a soft-delete approach for Google Sheets. Expenses marked as deleted in the sheet should not be physically removed.
- _Update `agents/contexts/implemented.md`_
