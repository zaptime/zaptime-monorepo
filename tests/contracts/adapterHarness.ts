/**
 * Harness requirements remain data until Task 3 introduces CalendarInstance.
 * Do not introduce a structurally incomplete placeholder engine type here.
 * The adapter tasks will implement runCalendarContract(createHarness), consuming
 * calendarContractScenarios as independent cases with a fresh owner per case.
 */
export const adapterHarnessContract = {
  calendar: "CalendarInstance from the framework-free core (available in Task 3)",
  flush: "flush(): Promise<void> — settle framework rendering and subscribed updates",
  unmount: "unmount(): Promise<void> — release the mounted consumer/owner and await cleanup",
  ownership: "Create a fresh instance per case; explicitly mark borrowed instances and dispose them in the test finally block",
  clock: "2030-05-01T00:00:00Z",
  timezone: "UTC",
  hourCycle: "h23",
  transport: "createFixtureFetch; advanced scenarios explicitly replace only their expected routes",
} as const;
