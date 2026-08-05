---
"@zaptime/core": minor
"@zaptime/vue3": minor
---

Surface reschedule failures instead of showing a false success screen.

`reschedule()` now throws `RescheduleNotAllowedError` when the API refuses
with 403 (reschedule notice period violated, reservation already started, or
rescheduling disabled) and a generic error on any other failure, instead of
resolving with the error body. The confirmation form catches these and shows
a localized (en/cs/pl) message instead of emitting `booking-confirmed`.

New `rescheduleOverrideToken` config option: a server-issued proof that the
visitor is the reservation's organizer, forwarded with the reschedule request
so the API can apply organizer rules instead of the attendee-facing policies.
