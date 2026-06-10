/**
 * @zaptime/core-shared
 *
 * Framework-agnostic foundation shared by `@zaptime/core` (Vue) and
 * `@zaptime/react-core` (React). Contains the HTTP API client, the pure
 * calendar/locale logic, the default configuration and all shared types.
 *
 * This package has no framework dependency and is consumed (and bundled) by
 * the framework packages rather than published on its own.
 */

// --- API client (pure fetch helpers) ---------------------------------------
export * from "./api/api";

// --- Pure calendar / locale logic -------------------------------------------
export * from "./utils/calendar";
export * from "./utils/dfnsConfig";
export * from "./utils/localeLogic";
export { default as mergeObjects } from "./utils/mergeObjects";

// --- Default configuration --------------------------------------------------
export { default as defaultConfig } from "./defaultConfig";

// --- Types (named) ----------------------------------------------------------
export * from "./types/InitData";
export * from "./types/ApiResponses";

// --- Types (default re-exported as named) -----------------------------------
export type { default as Day } from "./types/Day";
export type { default as TimeSlot } from "./types/TimeSlot";
export type { default as CalendarState } from "./types/CalendarState";
export type { default as Status } from "./types/Status";
export type { default as DfnsConfig } from "./types/DfnsConfig";
export type { default as ZaptimeConfig } from "./types/ZaptimeConfig";
export type { default as ZaptimeLocale } from "./types/ZaptimeLocale";
export type { default as ZaptimeTheme } from "./types/ZaptimeTheme";
