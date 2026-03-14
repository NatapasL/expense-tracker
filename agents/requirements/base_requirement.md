# Overview

### initial

i want to make a money tracker app for my personal use
this app will be use to track only expense
this app is pwa app
use indexdb as database
the main data will be keep in google sheet
first time user will need to login with google account
data in indexdb will be sync to google sheet once a day (if user open the app)
app will be in dark theme, color palette can be like discord app

### added

this app is design is mobile first and compact that can use in small screen
when built into production make it this app will be static spa that can deploy using github page
when using it as pwa, it will be offline first that it can use without internet

# Pages

the app will have 6 pages

1. login page

- login using google

2. index page which is page that list the expense in current month

- can change to group item by date or by category and each type of group will display total amount
- each item will have amount, category, date, and description
- when click on item it will open detail page
- has add button to add new expense in place that easy to tap when using mobile
- display total in that month

3. view detail page

- has back button to go back to index page
- has edit button to edit expense
- has delete button to delete expense

4. add/edit detail page

- has cancel button to back to view detail page (edit) or index page (add)
- has save button
- field is similar to view detail page

5. summary page

- can be display total use in month by each category, has total in each week, and average used per day

6. has CRUD pages for categories

# Entities

1. item

- amount
- category
- date
- description

2. category

- name
- color
- icon (use emoji as icon)

# Seed

category seed is

- food
- transportation
- education
- health
- home / utilities
- family
- work
- miscellaneous
- game
- toy
- entertainment

# Techstack and library

- pwa
- sveltekit
- tailwindcss
- google sheet
- indexdb (dexie.js)
- typescript

# Folder structure

- src
  - components - generic, reusable small compnents
  - feature - feature specific components that can be used in multiple screen
  - screens - composite components that represent a screen
  - routes - just for routing with no real business logic, it will render screens
  - libs - shared libraries
