# Additional Requirement 3 Context

Read `agents/contexts/instruction.md` first.

## Important

- Do only single step at a time
- Update `agents/contexts/implemented.md` after finishing each step

## Breakdown

### Login and Sync Logic

1. [x] Remove daily sync logic (currently in `IndexScreen.svelte` or `libs/sync.ts`).
2. [x] Update login requirement logic:
   - Allow app use without login if local data exists.
   - Require login only if no local data exists on first load.
   - Require login when user clicks manual sync button if not logged in.
3. [x] Update sync button behavior:
   - Check login status.
   - If logged in, perform sync.
   - If not, show login screen/modal, and sync after successful login.

### Component Structure Refactoring

Refactor all components in the following directories to use the folder-based structure:
`Component.svelte` -> `component/Index.svelte` (or `Component.svelte`) with `index.ts`, `styles.ts`, `types.ts`, `constants.ts`, `helpers.ts` as needed. Move tailwind classes to `styles.ts`.

4. [ ] Refactor components in `src/components/`:
   - `Button.svelte`
   - `Card.svelte`
   - `Header.svelte`
   - `Input.svelte`
   - `Modal.svelte`
5. [x] Refactor components in `src/feature/`.
6. [ ] Refactor components in `src/screens/`:
   - `AddEditCategoryScreen.svelte`
   - `AddEditExpenseScreen.svelte`
   - `CategoryListScreen.svelte`
   - `IndexScreen.svelte`
   - `LayoutScreen.svelte`
   - `LoginScreen.svelte`
   - `SummaryScreen.svelte`
   - `ViewExpenseScreen.svelte`
