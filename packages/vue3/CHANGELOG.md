# @zaptime/vue3

## 3.9.0

### Minor Changes

- 4631398: Add a check when no reservations are present for current month, switch to next month by default. In the month with no reservations, show button.

### Patch Changes

- Updated dependencies [4631398]
  - @zaptime/core@2.9.0

## 3.8.9

### Patch Changes

- Updated dependencies [f0a4bb7]
  - @zaptime/core@2.8.7

## 3.8.8

### Patch Changes

- 0ea0591: Support ES modules
- Updated dependencies [0ea0591]
  - @zaptime/core@2.8.6

## 3.8.7

### Patch Changes

- e2f92eb: Fix: revert to TailwindCSS V3
- Updated dependencies [6a68440]
  - @zaptime/core@2.8.5

## 3.8.6

### Patch Changes

- deb9fb7: Fix tailwind incompatibility

## 3.8.5

### Patch Changes

- f4980e3: Fix: Tailwindcss issue with layer

## 3.8.4

### Patch Changes

- chore: dependencies update
- Updated dependencies
  - @zaptime/core@2.8.4

## 3.8.3

### Patch Changes

- Fix: multiple calendar date overlap and inability to get days in multiple calendarId scenario
- Updated dependencies
  - @zaptime/core@2.8.3

## 3.8.2

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.8.2

## 3.8.1

### Patch Changes

- Fix: handle reservation and confirmation when calendarId is used properly.
- Updated dependencies
  - @zaptime/core@2.8.1

## 3.8.0

### Minor Changes

- Refresh reservation automatically in a 15 minutes interval.

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.8.0

## 3.7.1

### Patch Changes

- Performance optimizations, proper refresh when getting days
- Updated dependencies
  - @zaptime/core@2.7.1

## 3.7.0

### Minor Changes

- Feat: On loaded emit
  Feat: Return oragnizer data when event is submitted

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.7.0

## 3.6.11

### Patch Changes

- Fix: calendarId injection to booking form fields

## 3.6.10

### Patch Changes

- Fix: change keys

## 3.6.9

### Patch Changes

- Fix: currency locale

## 3.6.8

### Patch Changes

- Payments fixes

## 3.6.7

### Patch Changes

- Endpoint change

## 3.6.6

### Patch Changes

- Fix: stripe payments
- Updated dependencies
  - @zaptime/core@2.6.2

## 3.6.5

### Patch Changes

- Fix: release sync
- Updated dependencies
  - @zaptime/core@2.6.1

## 3.6.4

### Patch Changes

- Fix: formatters confing language not being set soon enough

## 3.6.3

### Patch Changes

- Fix: duplication calendar keys

## 3.6.2

### Patch Changes

- Fix: textarea, handle BE validation errors

## 3.6.1

### Patch Changes

- Fix(payments): country, crn

## 3.6.0

### Minor Changes

- Rescheduling

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.6.0

## 3.5.0

### Minor Changes

- Feat: add multiselect and radio to booking form

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.5.0

## 3.4.0

### Minor Changes

- Feat: ability to override reservation data with confirm

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.4.0

## 3.3.1

### Patch Changes

- Fix: scope tailwindcss forms

## 3.3.0

### Minor Changes

- Add Custom Fields, Location Fixes

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.3.0

## 3.2.5

### Patch Changes

- Fix locations SSR
- Updated dependencies
  - @zaptime/core@2.2.2

## 3.2.4

### Patch Changes

- Locations ssr fix

## 3.2.3

### Patch Changes

- SSR fix
- Updated dependencies
  - @zaptime/core@2.2.1

## 3.2.2

### Patch Changes

- 243a7c2: SSR fix

## 3.2.1

### Patch Changes

- Casing issue fix

## 3.2.0

### Minor Changes

- Success message neutral language, timezone added to request

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.2.0

## 3.1.0

### Minor Changes

- Add locations

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.1.0

## 3.0.9

### Patch Changes

- Parse analytics
- Updated dependencies
  - @zaptime/core@2.0.3

## 3.0.8

### Patch Changes

- Optimize timezones fetching

## 3.0.7

### Patch Changes

- Fix: compact switch in init when on mobile

## 3.0.6

### Patch Changes

- Fix border radius

## 3.0.5

### Patch Changes

- Add base api url to base config

## 3.0.4

### Patch Changes

- Fix fetching external config
- Updated dependencies
  - @zaptime/core@2.0.2

## 3.0.3

### Patch Changes

- Refactor fetching remote from vue component to core.
- Updated dependencies
  - @zaptime/core@2.0.1

## 3.0.2

### Patch Changes

- Priority merging and watch config fix

## 3.0.1

### Patch Changes

- Deep merge config with existing config when confing changes via prop

## 3.0.0

### Major Changes

- Fetch config directly in Vue component, accent colors name changed

### Patch Changes

- Updated dependencies
  - @zaptime/core@2.0.0

## 2.0.9

### Patch Changes

- Add introduction text as html, catch disabled event type error
- Updated dependencies
  - @zaptime/core@1.0.8

## 2.0.8

### Patch Changes

- 8beea6d: fix: booking time slot
- Updated dependencies [8beea6d]
  - @zaptime/core@1.0.7

## 2.0.7

### Patch Changes

- Redirect after successful booking, option to change baseUrl
- Updated dependencies
  - @zaptime/core@1.0.6

## 2.0.6

### Patch Changes

- Vue 3.4 upgrade
- Updated dependencies
  - @zaptime/core@1.0.5

## 2.0.5

### Patch Changes

- Fix: booking, smaller image size
- Updated dependencies
  - @zaptime/core@1.0.4

## 2.0.4

### Patch Changes

- Fix first selected day
- Updated dependencies
  - @zaptime/core@1.0.3

## 2.0.3

### Patch Changes

- Updated dependencies
  - @zaptime/core@1.0.2

## 2.0.2

### Patch Changes

- Fix: day formatting in confirmation form

## 2.0.1

### Patch Changes

- Updated dependencies
  - @zaptime/core@1.0.1

## 2.0.0

### Major Changes

- See docs.

### Patch Changes

- Updated dependencies
  - @zaptime/core@1.0.0

## 1.4.38

### Patch Changes

- Remove axios and use native fetch
- Updated dependencies
  - @zaptime/core@0.4.19

## 1.4.37

### Patch Changes

- Compact switcher fixed, responsivity fixes

## 1.4.36

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.18

## 1.4.35

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.17

## 1.4.34

### Patch Changes

- Fix light theme offset background

## 1.4.33

### Patch Changes

- Reactivity for merged object fix, color for selected event when external booking fixed
- Updated dependencies
  - @zaptime/core@0.4.16

## 1.4.32

### Patch Changes

- Update deps, fix types
- Updated dependencies
  - @zaptime/core@0.4.15

## 1.4.31

### Patch Changes

- Formatting refactors, New languages added, Types refactoring, Translation fixes, Picking time form external booking fixed
- Updated dependencies
  - @zaptime/core@0.4.14

## 1.4.30

### Patch Changes

- light theme logo fix, increase size for times

## 1.4.29

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.13

## 1.4.28

### Patch Changes

- add timezone to book and reserve, time formatter fix
- Updated dependencies
  - @zaptime/core@0.4.12

## 1.4.27

### Patch Changes

- Add callback for successful booking

## 1.4.26

### Patch Changes

- timezone in calendar conversion, month and day formatting
- c5f9b55: Animation fixes, better icons
- Updated dependencies
- Updated dependencies [c5f9b55]
  - @zaptime/core@0.4.11

## 1.4.25

### Patch Changes

- b29a013: Bump
- Updated dependencies [b29a013]
  - @zaptime/core@0.4.10

## 1.4.24

### Patch Changes

- 3905d5a: Animations, Timezones Support
- Updated dependencies [f66b102]
  - @zaptime/core@0.4.9

## 1.4.23

### Patch Changes

- ca376d4: Fix build

## 1.4.22

### Patch Changes

- 07a52d2: Fixed build

## 1.4.21

### Patch Changes

- Fix color for future event without day selected in current month

## 1.4.20

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.8

## 1.4.19

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.7

## 1.4.18

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.6

## 1.4.17

### Patch Changes

- Height and border radiuses fixes, Initial loading
- Updated dependencies
  - @zaptime/core@0.4.5

## 1.4.16

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.4

## 1.4.15

### Patch Changes

- Updated dependencies [dd6c044]
  - @zaptime/core@0.4.3

## 1.4.14

### Patch Changes

- Fixing broken build

## 1.4.13

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.2

## 1.4.12

### Patch Changes

- Updated dependencies
  - @zaptime/core@0.4.1
