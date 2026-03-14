Read the `agents/contexts/instruction.md` first.

# Additional Requirement 2

This document breaks down the implementation of additional UI and logic enhancements for the Chiisa app.

# Important

- Do only single step at a time
- Update `agents/contexts/implemented.md` after finishing each step

## Breakdown

### Step 1: Universal Currency Formatting Utility

- Create or update a utility function in `src/libs/utils.ts` (or similar) to format currency numbers.
- Requirements: Always display 2 decimal places and use comma as thousand separator (e.g., `1000000.00` -> `1,000,000.00`).
- Remember: No currency symbol should be displayed as per `instruction.md`.
- Apply this formatting to:
  - Total spent on Index page.
  - Individual expense amounts in lists.
  - Expense amount on View Detail page.
  - All analytics on Summary page (Total by category, Weekly totals, Daily average).
- _Update `agents/contexts/implemented.md`_

### Step 2: Update Date Formatting on Index Page

- Modify the date display in `IndexScreen.svelte` when expenses are grouped by category.
- Requirements: Date format must be 'DD MMM YYYY, ddd' (e.g., '14 Mar 2026, Sun').
- Ensure this change only affects the intended display areas.
- _Update `agents/contexts/implemented.md`_

### Step 3: Default Date Logic on Add Expense Page

- Update the "Add Expense" logic (specifically for new expenses, not editing).
- Requirements: 
  - If a date has already been selected (e.g., from a filter or calendar state), use it as the default.
  - Otherwise, default to today's date.
- _Update `agents/contexts/implemented.md`_

### Step 4: Auto-select Category based on Amount

- Implement intelligent category selection in the "Add Expense" form.
- Requirements:
  - When the user fills in the `amount`, automatically select the category based on historical data.
  - Search criteria: Most frequent category for that specific amount within the last 3 months.
  - If no history exists for that amount, select the first category.
  - **Constraint:** Do not change the category if the user has already manually selected one.
- _Update `agents/contexts/implemented.md`_
