1. for login and sync logic

- remove daily sync logic
- login will not always required, it will be required on first time if there is no local data yet, or when user want to sync data manually, otherwise the app can use freely without login
- when click sync button, it will check is user logged in or not
  - if logged in it will sync
  - if not it will show login screen, after user successfully login, it will sync

2. refactor component

- example, currently has structure like `src/components/Button.svelte` but i want to change it to `src/components/button/Button.svelte`, inside `button` folder will contain these files (if necessary)
  - `Button.svelte`
  - `styles.ts` (for style)
  - `types.ts` (for type and interface)
  - `index.ts` (for export)
  - `constants.ts` (for constant, eg. const MONTH = ['Jan', ...])
  - `helpers.ts` (for util function and business heavy function)
- apply this to all components in `src/components`, `src/features`, `src/screens`
