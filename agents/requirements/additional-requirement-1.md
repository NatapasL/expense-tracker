1. in index page click on current month will show popup to select month, and when select it will show list of items in that month
2. in summary page it will display summary in each month and can change month like index page
3. rename entity item to expense
4. rename app name that display into `Chiisa`
5. for sync logic

- for first time user, after login if there is no data, it will try to sync data from google sheet
  - if there is no google sheet, it will create new google sheet, with template that ready to use
  - if there is google sheet, it will sync data from google sheet
- add flag to each entity to indicate is it already sync to google sheet or not
- first time user open app each day it will update the unsynced data into google sheet, update flag to sync, and then get data from google sheet to update local data
- expense item in google sheet will not be deleted, but marked as deleted (soft delete approach)

6. add sync button in index page and summary page
