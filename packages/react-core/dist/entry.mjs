import { Err, Ok } from "ts-results-es";
import { addDays, addMonths, differenceInCalendarMonths, endOfMonth, format, getDaysInMonth, isFuture, isPast, isThisMonth, isToday, lastDayOfMonth, parseISO, startOfMonth, subDays, subMonths } from "date-fns";
import { tz } from "@date-fns/tz";
import { useSyncExternalStore } from "react";
//#region ../core-shared/src/api/api.ts
const defaultBaseUrl = "https://api.zaptime.app/";
const book$1 = async (options) => {
	const { email, token, timeSlot, firstName, lastName, seats = 1, baseUrl = defaultBaseUrl, phone, location, timezone } = options;
	try {
		return await fetch(getBookUrl(baseUrl), {
			method: "POST",
			body: JSON.stringify({
				start: timeSlot.start,
				end: timeSlot.end,
				email,
				seats,
				firstname: firstName,
				lastname: lastName,
				phone,
				location,
				timezone,
				customFields: options.customFields,
				guests: options.guests
			}),
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token
			}
		}).then((response) => response.json());
	} catch (err) {
		throw new Error("Booking time slot failed!");
	}
};
const reschedule$1 = async ({ start, end, uuid, timezone, token, baseUrl = defaultBaseUrl }) => {
	try {
		return await fetch(getRescheduleUrl(baseUrl, uuid), {
			method: "PUT",
			body: JSON.stringify({
				start,
				end,
				timezone
			}),
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token
			}
		}).then((response) => response.json());
	} catch (err) {
		throw new Error("Booking time slot failed!");
	}
};
const reserve$1 = async (options) => {
	const { email, token, timeSlot, firstName, lastName, seats = 1, baseUrl = defaultBaseUrl, phone, location, timezone } = options;
	try {
		return await fetch(getReserveUrl(baseUrl), {
			method: "POST",
			body: JSON.stringify({
				start: timeSlot.start,
				end: timeSlot.end,
				email,
				seats,
				firstname: firstName,
				lastname: lastName,
				phone,
				location,
				timezone,
				customFields: options.customFields,
				guests: options.guests
			}),
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token
			}
		}).then((response) => response.json());
	} catch (err) {
		throw new Error("Reserving time slot failed!");
	}
};
const confirm$1 = async (options) => {
	const { baseUrl = defaultBaseUrl, status, token, firstName, lastName, customFields, phone } = options;
	try {
		return await fetch(getConfirmUrl(baseUrl, status.uuid), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token
			},
			body: JSON.stringify({
				firstname: firstName,
				lastname: lastName,
				customFields,
				phone,
				guests: options.guests
			})
		}).then((response) => response.json());
	} catch (err) {
		throw new Error("Time slot confirmation failed!");
	}
};
const cancel$1 = async (token, status, baseUrl = defaultBaseUrl) => {
	try {
		return (await fetch(getCancelUrl(baseUrl, status.uuid), {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token
			}
		}).then((resposne) => resposne.json())).success;
	} catch (err) {
		throw new Error("Reserving time slot failed!");
	}
};
const refreshReserve = async (token, status, baseUrl = defaultBaseUrl) => {
	try {
		const data = await fetch(getRefreshReserveUrl(baseUrl, status.uuid), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token
			}
		}).then((response) => response.json());
		if (data.status !== 200) throw new Error("Refreshing reservation slot failed!");
		return data.success;
	} catch (err) {
		throw new Error("Refreshing reservation slot failed!");
	}
};
const getAvailableTimeSlots = async (token, from, until, baseUrl = defaultBaseUrl) => {
	try {
		const res = await fetch(getAvailableTimeSlotsUrl(baseUrl) + "?" + new URLSearchParams({
			from,
			until
		}), { headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer " + token
		} });
		if (res.status === 403) throw new Error("Disabled");
		return (await res.json()).data;
	} catch (err) {
		if (err.message === "Disabled") throw new Error("Disabled");
		throw new Error("Getting available time slots failed!");
	}
};
async function fetchRemoteConfig(token, baseUrl = defaultBaseUrl, reservationUuid) {
	if (token) try {
		const data = await (await fetch(baseUrl + "event-types/init", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token
			},
			body: JSON.stringify({ reservationUuid })
		})).json();
		if (data.success) return new Ok(data.data);
	} catch (e) {
		return new Err("invalidToken");
	}
	return new Err("invalidToken");
}
function getBookUrl(baseUrl) {
	return baseUrl + "reservations";
}
function getRescheduleUrl(baseUrl, uuid) {
	return baseUrl + "reservations/" + uuid;
}
function getReserveUrl(baseUrl) {
	return baseUrl + "reservations/prepare";
}
function getConfirmUrl(baseUrl, uuid) {
	return baseUrl + "reservations/" + uuid + "/confirm";
}
function getCancelUrl(baseUrl, uuid) {
	return baseUrl + "reservations/" + uuid;
}
function getAvailableTimeSlotsUrl(baseUrl) {
	return baseUrl + "time-slots";
}
function getRefreshReserveUrl(baseUrl, uuid) {
	return baseUrl + "reservations/" + uuid + "/refresh";
}
//#endregion
//#region ../core-shared/src/utils/localeLogic.ts
const getHeaders = (locale, dfnsConfig) => {
	let sun = "";
	if (locale && locale.headers && locale.headers.sun) sun = locale.headers.sun;
	else sun = format(new Date(2020, 11, 6), "cccccc", dfnsConfig);
	let mon = "";
	if (locale && locale.headers && locale.headers.mon) mon = locale.headers.mon;
	else mon = format(new Date(2020, 11, 7), "cccccc", dfnsConfig);
	let tue = "";
	if (locale && locale.headers && locale.headers.tue) tue = locale.headers.tue;
	else tue = format(new Date(2020, 11, 8), "cccccc", dfnsConfig);
	let wed = "";
	if (locale && locale.headers && locale.headers.wed) wed = locale.headers.wed;
	else wed = format(new Date(2020, 11, 9), "cccccc", dfnsConfig);
	let thu = "";
	if (locale && locale.headers && locale.headers.thu) thu = locale.headers.thu;
	else thu = format(new Date(2020, 11, 10), "cccccc", dfnsConfig);
	let fri = "";
	if (locale && locale.headers && locale.headers.fri) fri = locale.headers.fri;
	else fri = format(new Date(2020, 11, 11), "cccccc", dfnsConfig);
	let sat = "";
	if (locale && locale.headers && locale.headers.sat) sat = locale.headers.sat;
	else sat = format(new Date(2020, 11, 12), "cccccc", dfnsConfig);
	const autoHeaders = [
		sun,
		mon,
		tue,
		wed,
		thu,
		fri,
		sat
	];
	const startOfTheWeekIndex = getStartOfTheWeekIndex(locale);
	if (startOfTheWeekIndex !== 0) {
		const elementsToBeMoved = [];
		for (let i = 0; i < startOfTheWeekIndex; i++) {
			const shifted = autoHeaders.shift();
			elementsToBeMoved.push(shifted);
		}
		for (const shifted of elementsToBeMoved) if (shifted !== void 0) autoHeaders.push(shifted);
	}
	return autoHeaders;
};
const getStartOfTheWeekIndex = (locale) => {
	const dayToIndex = {
		sun: 0,
		mon: 1,
		tue: 2,
		wed: 3,
		thu: 4,
		fri: 5,
		sat: 6
	};
	if (locale.startDayOfWeek) return dayToIndex[locale.startDayOfWeek];
	return 0;
};
//#endregion
//#region ../core-shared/src/utils/calendar.ts
const getTimeSlotsForDivenDate = (date, timeSlots, timeZone) => {
	const collectedTimeSlots = [];
	for (const timeSlot of timeSlots) if (format(date, "d", { in: tz(timeZone) }) === format(new Date(timeSlot.start), "d", { in: tz(timeZone) })) collectedTimeSlots.push(timeSlot);
	if (collectedTimeSlots.length > 0) return collectedTimeSlots;
};
const getDays$1 = async (date, dfnsConfig, zapTimeConfig, timezone) => {
	const dayCountInMonth = getDaysInMonth(date);
	const startDateOfTheMonth = startOfMonth(date);
	let hasAnyTimeSlot = false;
	const timeSlots = await getAvailableTimeSlots(zapTimeConfig.token, getStartDate(date, zapTimeConfig, timezone), format(endOfMonth(date), "yyyy-MM-dd", { in: tz(timezone) }), zapTimeConfig.apiBaseUrl);
	if (Object.keys(timeSlots).length > 0) hasAnyTimeSlot = true;
	const startOfTheWeekIndex = zapTimeConfig && zapTimeConfig.locale !== void 0 ? getStartOfTheWeekIndex(zapTimeConfig.locale) : 0;
	const numberOfDay = parseInt(format(startDateOfTheMonth, "i", {
		...dfnsConfig,
		in: tz(timezone)
	})) - startOfTheWeekIndex + 1;
	const lastDateOfPreviousMonth = lastDayOfMonth(subMonths(startDateOfTheMonth, 1));
	const days = [];
	for (let k = 1; k < numberOfDay; k++) days.unshift({
		label: format(subDays(lastDateOfPreviousMonth, k - 1), "d", { in: tz(timezone) }),
		isPast: true
	});
	for (let i = 1; i <= dayCountInMonth; i++) {
		const iteratedDate = addDays(startDateOfTheMonth, i - 1);
		days.push({
			label: i.toString(),
			date: iteratedDate,
			isPast: isPast(iteratedDate) && !isToday(iteratedDate),
			isCurrentMonth: true,
			isToday: isToday(iteratedDate),
			timeSlots: getTimeSlotsForDivenDate(iteratedDate, timeSlots, timezone)
		});
	}
	let nextMonthRemainingDays = 0;
	if (days.length <= 35) nextMonthRemainingDays = 35 - dayCountInMonth - numberOfDay + 1 + startOfTheWeekIndex;
	else nextMonthRemainingDays = 42 - dayCountInMonth - numberOfDay + 1 + startOfTheWeekIndex;
	for (let j = 1; j <= nextMonthRemainingDays - startOfTheWeekIndex; j++) days.push({
		label: j.toString(),
		timeSlots: void 0,
		isPast: true
	});
	return {
		days,
		hasAnyTimeSlot
	};
};
const getStartDate = (date, zapTimeConfig, timezone) => {
	if (isThisMonth(date) && zapTimeConfig.closestBookableDay !== void 0) return format(addDays(date, zapTimeConfig.closestBookableDay), "yyyy-MM-dd", { in: tz(timezone) });
	return format(startOfMonth(date), "yyyy-MM-dd", { in: tz(timezone) });
};
//#endregion
//#region ../core-shared/src/utils/dfnsConfig.ts
const getDfnsConfig = async (locale) => {
	let dateFnsLocale = void 0;
	if (locale === void 0) {
		dateFnsLocale = await import("date-fns/locale/en-US");
		return { locale: dateFnsLocale.default };
	}
	if (locale === "cs") dateFnsLocale = await import("date-fns/locale/cs");
	else if (locale === "sk") dateFnsLocale = await import("date-fns/locale/sk");
	else if (locale === "pl") dateFnsLocale = await import("date-fns/locale/pl");
	else if (locale === "de") dateFnsLocale = await import("date-fns/locale/de");
	else if (locale === "pt") dateFnsLocale = await import("date-fns/locale/pt");
	else if (locale === "es") dateFnsLocale = await import("date-fns/locale/es");
	else if (locale === "ja") dateFnsLocale = await import("date-fns/locale/ja");
	else if (locale === "zh") dateFnsLocale = await import("date-fns/locale/zh-CN");
	else if (locale === "tr") dateFnsLocale = await import("date-fns/locale/tr");
	else if (locale === "sv") dateFnsLocale = await import("date-fns/locale/sv");
	else if (locale === "nl") dateFnsLocale = await import("date-fns/locale/nl");
	else if (locale === "it") dateFnsLocale = await import("date-fns/locale/it");
	else if (locale === "fi") dateFnsLocale = await import("date-fns/locale/fi");
	else if (locale === "ro") dateFnsLocale = await import("date-fns/locale/ro");
	else if (locale === "ko") dateFnsLocale = await import("date-fns/locale/ko");
	else if (locale === "vi") dateFnsLocale = await import("date-fns/locale/vi");
	else dateFnsLocale = await import("date-fns/locale/en-US");
	return { locale: dateFnsLocale.default };
};
//#endregion
//#region ../core-shared/src/utils/mergeObjects.ts
function mergeRecursive(obj1, obj2) {
	for (const p in obj2) try {
		if (obj2[p].constructor == Object) obj1[p] = mergeRecursive(obj1[p], obj2[p]);
		else obj1[p] = obj2[p];
	} catch (e) {
		obj1[p] = obj2[p];
	}
	return obj1;
}
//#endregion
//#region ../core-shared/src/defaultConfig.ts
const config = {
	token: "oG77Ft7Wv6v9stJTOw8cbMmW7zENDzXl",
	locale: {
		preset: "en",
		texts: {
			chooseDate: "Choose a date",
			noTimeSlotAvailable: "There is no time slot available for chosen month.",
			choosePreferredTime: "Choose preferred time",
			pickTime: "Pick a time",
			showNextMonth: "Show next month"
		},
		confirmationForm: {
			confirmBooking: "Confirm booking",
			reschedulingEvent: "Rescheduling event",
			addGuests: "Add guest",
			buttons: {
				confirmBooking: "Confirm booking",
				reschedule: "Reschedule",
				goBack: "Go back"
			},
			payments: {
				showBillingDetails: "Vyplnit fakturační údaje",
				price: "Price",
				cardNumber: "Card number",
				name: "Name",
				email: "Email",
				company: "Company",
				address: "Address",
				city: "City",
				zip: "Postal code",
				country: "Country",
				vatId: "Vat ID",
				crn: "CRN"
			}
		}
	},
	theme: {
		preset: "basic",
		borderRadius: "0.375rem"
	}
};
//#endregion
//#region src/store/createStore.ts
function createStore(initial) {
	let state = initial;
	const listeners = /* @__PURE__ */ new Set();
	return {
		get: () => state,
		set: (next) => {
			const value = typeof next === "function" ? next(state) : next;
			if (Object.is(value, state)) return;
			state = value;
			for (const listener of listeners) listener();
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
	};
}
/**
* Subscribe a React component to a store. The selector must return a
* referentially stable value when the underlying data has not changed
* (return the stored value directly, or a primitive) to avoid render loops.
*/
function useStoreValue(store, selector = (state) => state) {
	const getSnapshot = () => selector(store.get());
	return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
//#endregion
//#region src/store/keyedStore.ts
const DEFAULT_KEY = "__DEFAULT__";
const keyOf = (calendarId) => calendarId ?? "__DEFAULT__";
function createKeyedStore(defaultValue) {
	const store = createStore({ [DEFAULT_KEY]: defaultValue });
	const getValue = (calendarId) => {
		const current = store.get()[keyOf(calendarId)];
		return current === void 0 ? defaultValue : current;
	};
	const setValue = (calendarId, value) => {
		store.set((prev) => ({
			...prev,
			[keyOf(calendarId)]: value
		}));
	};
	const updateValue = (calendarId, updater) => {
		store.set((prev) => {
			const key = keyOf(calendarId);
			const current = prev[key] === void 0 ? defaultValue : prev[key];
			return {
				...prev,
				[key]: updater(current)
			};
		});
	};
	return {
		store,
		getValue,
		setValue,
		updateValue
	};
}
/**
* Reactively read a calendar's value from a keyed store. Returns the stored
* value directly (referentially stable until the next immutable write), so it
* is safe to use as a `useSyncExternalStore` snapshot.
*/
function useKeyedValue(keyed, calendarId) {
	const getSnapshot = () => keyed.getValue(calendarId);
	return useSyncExternalStore(keyed.store.subscribe, getSnapshot, getSnapshot);
}
//#endregion
//#region src/hooks/useSelectedTimeSlot.ts
const selectedTimeSlotStore = createKeyedStore(void 0);
/** Framework-agnostic accessors (used by the imperative API layer). */
function getSelectedTimeSlotValue(calendarId) {
	return selectedTimeSlotStore.getValue(calendarId);
}
function setSelectedTimeSlotValue(calendarId, timeSlot) {
	selectedTimeSlotStore.setValue(calendarId, timeSlot);
}
function useSelectedTimeSlot(calendarId) {
	const selectedTimeSlot = useKeyedValue(selectedTimeSlotStore, calendarId);
	const setSelectedTimeSlot = (timeSlot) => selectedTimeSlotStore.setValue(calendarId, timeSlot);
	return {
		selectedTimeSlot,
		setSelectedTimeSlot
	};
}
//#endregion
//#region src/hooks/useConfig.ts
const configStore = createKeyedStore(config);
function clone(value) {
	return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
/** Framework-agnostic accessors (used by the imperative API layer). */
function getConfigValue(calendarId) {
	return configStore.getValue(calendarId);
}
function setConfigValue(calendarId, cfg) {
	configStore.setValue(calendarId, mergeRecursive(clone(config), cfg));
}
function useConfig(calendarId) {
	const config = useKeyedValue(configStore, calendarId);
	const setConfig = (cfg) => setConfigValue(calendarId, cfg);
	return {
		config,
		setConfig
	};
}
//#endregion
//#region src/hooks/useCurrentTimezone.ts
const clientOriginalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timezoneStore = createStore(clientOriginalTimezone);
/** Framework-agnostic accessor (used by the imperative API layer). */
function getTimezoneValue() {
	return timezoneStore.get();
}
function useCurrentTimezone() {
	const timezone = useStoreValue(timezoneStore);
	const setTimezone = (tz) => timezoneStore.set(tz);
	return {
		clientOriginalTimezone,
		timezone,
		setTimezone
	};
}
//#endregion
//#region src/hooks/useLocations.ts
const locationsStore = createKeyedStore([]);
/** Framework-agnostic accessors (used by the imperative API layer / init). */
function getLocationsValue(calendarId) {
	return locationsStore.getValue(calendarId);
}
function setLocationsValue(calendarId, newLocations) {
	if (newLocations) locationsStore.setValue(calendarId, newLocations);
}
function useLocations(calendarId) {
	const locations = useKeyedValue(locationsStore, calendarId);
	const setLocations = (newLocations) => setLocationsValue(calendarId, newLocations);
	return {
		locations,
		setLocations,
		isPhoneCall: locations.length > 0 && locations.some((location) => location.value === "phone")
	};
}
//#endregion
//#region src/hooks/useReservationStatus.ts
const reservationStatusStore = createKeyedStore(void 0);
/** Framework-agnostic accessors (used by the imperative API layer). */
function getReservationStatusValue(calendarId) {
	return reservationStatusStore.getValue(calendarId);
}
function setReservationStatusValue(calendarId, status) {
	reservationStatusStore.setValue(calendarId, status);
}
//#endregion
//#region src/hooks/useReservationReschedule.ts
const reservationStore = createKeyedStore(void 0);
/** Framework-agnostic accessors (used by the imperative API layer / init). */
function getReservationValue(calendarId) {
	return reservationStore.getValue(calendarId);
}
function useReservationReschedule(calendarId) {
	const reservation = useKeyedValue(reservationStore, calendarId);
	const setSelectedReservation = (next) => reservationStore.setValue(calendarId, next);
	return {
		reservation,
		setSelectedReservation
	};
}
//#endregion
//#region src/api/useApi.ts
let reservationIntervalId = null;
/**
* Book attendee to a specific time slot.
*
* @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#book
*/
const book = async (options) => {
	const { email, firstName, lastName, seats = 1, calendarId, phone, location, customFields, guests } = options;
	const selectedTimeSlot = getSelectedTimeSlotValue(calendarId);
	const config = getConfigValue(calendarId);
	const timezone = getTimezoneValue();
	const internalLocations = getLocationsValue(calendarId);
	if (selectedTimeSlot !== void 0 && config !== void 0) try {
		const res = await book$1({
			email,
			token: config.token,
			timeSlot: selectedTimeSlot,
			firstName,
			lastName,
			seats,
			baseUrl: config.apiBaseUrl,
			phone,
			location: location ?? internalLocations[0],
			timezone,
			customFields,
			guests
		});
		if (config.redirectAfterBookingUrl !== void 0 && typeof window !== "undefined") window.location.href = config.redirectAfterBookingUrl;
		return res;
	} catch (e) {
		throw new Error("Booking a time slot failed because time slot was not selected!");
	}
	throw new Error("Booking a time slot failed because time slot was not selected!");
};
/**
* Reserve a timeslot for the attendee, automatically refreshing the
* reservation every 15 minutes until the active session ends.
*
* @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#reserve
*/
const reserve = async (options) => {
	return await startReservationInterval(options);
};
/**
* Confirm a previously reserved time slot.
*
* @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#confirm
*/
const confirm = async (options) => {
	const reservationStatus = getReservationStatusValue(options?.calendarId);
	const config = getConfigValue(options?.calendarId);
	if (reservationStatus !== void 0) {
		const res = await confirm$1({
			token: config.token,
			status: reservationStatus,
			baseUrl: config.apiBaseUrl,
			firstName: options?.firstName,
			lastName: options?.lastName,
			phone: options?.phone,
			customFields: options?.customFields,
			guests: options?.guests
		});
		stopReservationRefresh();
		return res;
	}
	throw new Error("Confirming a time slot failed because time slot was not reserved!");
};
/**
* Cancel a previously reserved time slot.
*
* @see https://docs.zaptime.app/guide/vue-working-with-time-slots.html#cancel
*/
const cancel = async (calendarId) => {
	const reservationStatus = getReservationStatusValue(calendarId);
	const config = getConfigValue(calendarId);
	if (reservationStatus !== void 0) {
		const res = await cancel$1(config.token, reservationStatus, config.apiBaseUrl);
		stopReservationRefresh();
		return res;
	}
	return false;
};
/**
* Reschedule a previously loaded reservation to the selected time slot.
*/
const reschedule = async (calendarId) => {
	const reservation = getReservationValue(calendarId);
	const config = getConfigValue(calendarId);
	const selectedTimeSlot = getSelectedTimeSlotValue(calendarId);
	const timezone = getTimezoneValue();
	if (reservation !== void 0 && selectedTimeSlot !== void 0) return await reschedule$1({
		start: selectedTimeSlot.start,
		end: selectedTimeSlot.end,
		token: config.token,
		uuid: reservation.uuid,
		baseUrl: config.apiBaseUrl,
		timezone
	});
	throw new Error("Rescheduling a time slot failed because time slot was not selected!");
};
/**
* Fetches remote Zaptime configuration. Contains additional data about the
* Event Type configuration.
*
* @see https://zaptime.docs.apiary.io/#reference/0/event-types-collection/initialize-event-type
*/
const fetchRemoteConfiguration = async (token, apiBaseUrl, reservationUuid) => {
	return await fetchRemoteConfig(token, apiBaseUrl, reservationUuid);
};
async function initReservation(options) {
	const { email, firstName, lastName, seats = 1, calendarId, location, phone, customFields, guests } = options;
	const selectedTimeSlot = getSelectedTimeSlotValue(calendarId);
	const config = getConfigValue(calendarId);
	const timezone = getTimezoneValue();
	const internalLocations = getLocationsValue(calendarId);
	if (selectedTimeSlot !== void 0 && config !== void 0) {
		const data = await reserve$1({
			email,
			token: config.token,
			timeSlot: selectedTimeSlot,
			firstName,
			lastName,
			seats,
			baseUrl: config.apiBaseUrl,
			phone,
			location: location ?? internalLocations[0],
			timezone,
			customFields,
			guests
		});
		setReservationStatusValue(calendarId, data.data);
		return data;
	}
	throw new Error("Booking a time slot failed because time slot was not selected!");
}
async function refreshReservation(options) {
	const reservationStatus = getReservationStatusValue(options.calendarId);
	const config = getConfigValue(options.calendarId);
	if (reservationStatus !== void 0) await refreshReserve(config.token, reservationStatus, config.apiBaseUrl);
}
const startReservationInterval = (options) => {
	if (reservationIntervalId) clearInterval(reservationIntervalId);
	const res = initReservation(options);
	reservationIntervalId = setInterval(() => {
		refreshReservation(options).catch(() => {
			stopReservationRefresh();
		});
	}, 900 * 1e3);
	return res;
};
/** Stop the reservation auto-refresh interval. */
const stopReservationRefresh = () => {
	if (reservationIntervalId) {
		clearInterval(reservationIntervalId);
		reservationIntervalId = null;
	}
};
//#endregion
//#region src/hooks/useCalendar.ts
function makeInitialState() {
	return {
		date: /* @__PURE__ */ new Date(),
		days: [],
		timeSlots: [],
		monthHasTimeSlots: false,
		selectedDay: null,
		loading: true,
		headers: [],
		dfnsConfig: void 0,
		attendeeState: void 0,
		initLoaded: false
	};
}
const SHARED_INITIAL_STATE = makeInitialState();
const calendarStore = createStore({ [keyOf()]: SHARED_INITIAL_STATE });
function getState(calendarId) {
	return calendarStore.get()[keyOf(calendarId)] ?? SHARED_INITIAL_STATE;
}
function patchState(calendarId, patch) {
	calendarStore.set((prev) => {
		const key = keyOf(calendarId);
		const current = prev[key] ?? makeInitialState();
		return {
			...prev,
			[key]: {
				...current,
				...patch
			}
		};
	});
}
function getFirstAvailableDayWithTimeSlot(days) {
	for (const day of days) if (day.timeSlots !== void 0 && day.timeSlots.length > 0 && !day.isPast) return day;
}
async function getDays(calendarId) {
	const { date, dfnsConfig } = getState(calendarId);
	const config = getConfigValue(calendarId);
	const timezone = getTimezoneValue();
	patchState(calendarId, {
		loading: true,
		timeSlots: [],
		selectedDay: null
	});
	if (dfnsConfig !== void 0 && dfnsConfig !== null) {
		const { days, hasAnyTimeSlot } = await getDays$1(date, dfnsConfig, config, timezone);
		const patch = {
			monthHasTimeSlots: hasAnyTimeSlot,
			days,
			loading: false
		};
		if (hasAnyTimeSlot) {
			const firstAvailableDayWithTimeSlot = getFirstAvailableDayWithTimeSlot(days);
			if (firstAvailableDayWithTimeSlot !== void 0) {
				patch.selectedDay = firstAvailableDayWithTimeSlot;
				if (firstAvailableDayWithTimeSlot.timeSlots !== void 0) patch.timeSlots = firstAvailableDayWithTimeSlot.timeSlots;
			}
		}
		patchState(calendarId, patch);
	}
}
function nextDisabled(calendarId) {
	const config = getConfigValue(calendarId);
	const newDate = addMonths(getState(calendarId).date, 1);
	const distance = differenceInCalendarMonths(newDate, /* @__PURE__ */ new Date());
	if (isFuture(newDate) && config.max !== void 0) return distance > config.max;
	return false;
}
function prevDisabled(calendarId) {
	const config = getConfigValue(calendarId);
	const newDate = addMonths(getState(calendarId).date, -1);
	const distance = differenceInCalendarMonths(/* @__PURE__ */ new Date(), newDate);
	if (isPast(newDate) && config.min !== void 0) return distance > config.min;
	return false;
}
async function next(calendarId) {
	if (nextDisabled(calendarId)) return;
	patchState(calendarId, {
		timeSlots: [],
		loading: true,
		date: addMonths(getState(calendarId).date, 1)
	});
	await getDays(calendarId);
	patchState(calendarId, { loading: false });
}
async function prev(calendarId) {
	if (prevDisabled(calendarId)) return;
	patchState(calendarId, {
		timeSlots: [],
		loading: true,
		date: addMonths(getState(calendarId).date, -1)
	});
	await getDays(calendarId);
	patchState(calendarId, { loading: false });
}
function dayClicked(calendarId, day) {
	const patch = { selectedDay: day };
	if (day.timeSlots !== void 0) patch.timeSlots = day.timeSlots;
	patchState(calendarId, patch);
}
async function setLocales(calendarId) {
	const config = getConfigValue(calendarId);
	if (config && config.locale) {
		const dfnsConfig = await getDfnsConfig(config.locale.preset || "en");
		patchState(calendarId, {
			dfnsConfig,
			headers: getHeaders(config.locale, dfnsConfig)
		});
	}
}
function clearState(calendarId) {
	patchState(calendarId, makeInitialState());
}
async function init(calendarId) {
	clearState(calendarId);
	if (getState(calendarId).days.length === 0) {
		await setLocales(calendarId);
		await getDays(calendarId);
		if (getState(calendarId).timeSlots.length <= 0) await next(calendarId);
		patchState(calendarId, { initLoaded: true });
	}
}
function useCalendar(calendarId) {
	const state = useStoreValue(calendarStore, (all) => all[keyOf(calendarId)] ?? SHARED_INITIAL_STATE);
	const { config } = useConfig(calendarId);
	const { selectedTimeSlot } = useSelectedTimeSlot(calendarId);
	const currentYear = format(state.date, "y");
	const monthName = format(state.date, "LLLL", { locale: state.dfnsConfig?.locale });
	const isSelected = (timeSlot) => selectedTimeSlot !== void 0 && selectedTimeSlot.start === timeSlot.start;
	const isSelectedDay = (day) => day === state.selectedDay;
	return {
		getDays: () => getDays(calendarId),
		init: () => init(calendarId),
		selectTimeSlot: (timeSlot) => setSelectedTimeSlotValue(calendarId, timeSlot),
		nextDisabled: nextDisabled(calendarId),
		prevDisabled: prevDisabled(calendarId),
		next: () => next(calendarId),
		prev: () => prev(calendarId),
		dayClicked: (day) => dayClicked(calendarId, day),
		dayHasTimeSlot: (day) => day.timeSlots !== void 0,
		isSelected,
		isSelectedDay,
		currentYear,
		monthName,
		config,
		state
	};
}
//#endregion
//#region src/hooks/useHourCycle.ts
let clientOriginalHourCycle = "h23";
if (typeof window !== "undefined") clientOriginalHourCycle = Intl.DateTimeFormat(navigator.language, { hour: "numeric" }).resolvedOptions().hourCycle;
const hourCycleStore = createStore(clientOriginalHourCycle);
function useHourCycle() {
	const hourCycle = useStoreValue(hourCycleStore);
	const setHourCycle = (hc) => hourCycleStore.set(hc);
	return {
		clientOriginalHourCycle,
		setHourCycle,
		hourCycle
	};
}
//#endregion
//#region src/hooks/useStripeConfig.ts
const stripeConfigStore = createKeyedStore(void 0);
function useStripeConfig(calendarId) {
	const stripeConfig = useKeyedValue(stripeConfigStore, calendarId);
	const setStripeConfig = (config) => stripeConfigStore.setValue(calendarId, config);
	return {
		stripeConfig,
		setStripeConfig
	};
}
//#endregion
//#region src/hooks/useGuests.ts
const guestsStore = createKeyedStore({
	guests: [],
	maxGuests: null
});
/** Framework-agnostic accessors (used by booking form collection / init). */
function getGuestsState(calendarId) {
	return guestsStore.getValue(calendarId);
}
function setMaxGuestsValue(calendarId, n) {
	guestsStore.updateValue(calendarId, (prev) => ({
		...prev,
		maxGuests: n
	}));
}
function useGuests(calendarId) {
	const state = useKeyedValue(guestsStore, calendarId);
	const guests = state.guests;
	const maxGuests = state.maxGuests;
	const guestsEnabled = maxGuests !== null && maxGuests > 0;
	const canAddGuest = guestsEnabled && guests.length < maxGuests;
	const setMaxGuests = (n) => setMaxGuestsValue(calendarId, n);
	const addGuest = (email) => {
		if (canAddGuest) guestsStore.updateValue(calendarId, (prev) => ({
			...prev,
			guests: [...prev.guests, email ?? ""]
		}));
	};
	const removeGuest = (index) => {
		guestsStore.updateValue(calendarId, (prev) => ({
			...prev,
			guests: prev.guests.filter((_, i) => i !== index)
		}));
	};
	const updateGuest = (index, email) => {
		guestsStore.updateValue(calendarId, (prev) => ({
			...prev,
			guests: prev.guests.map((g, i) => i === index ? email : g)
		}));
	};
	return {
		guests,
		maxGuests,
		guestsEnabled,
		canAddGuest,
		setMaxGuests,
		addGuest,
		removeGuest,
		updateGuest
	};
}
//#endregion
//#region src/hooks/useBookingForm.ts
const bookingFormStore = createKeyedStore([]);
const knownFieldsByMergeTag = [
	"FIRST_NAME",
	"LAST_NAME",
	"EMAIL",
	"PHONE"
];
/**
* Collect the values entered into the booking form, split into the well-known
* attendee fields (by merge tag) and the remaining custom fields. Mirrors the
* behaviour of `@zaptime/core`'s `collectFormValues`.
*/
function collectFormValues(calendarId) {
	const fields = bookingFormStore.getValue(calendarId);
	const byTag = (tag) => fields.find((field) => field.mergeTag === tag);
	const firstName = byTag("FIRST_NAME");
	const lastName = byTag("LAST_NAME");
	const email = byTag("EMAIL");
	const phone = byTag("PHONE");
	const customFields = fields.filter((field) => !knownFieldsByMergeTag.includes(field.mergeTag)).map((field) => ({
		uuid: field.uuid,
		value: field.value
	}));
	const { guests, maxGuests } = getGuestsState(calendarId);
	const filteredGuests = maxGuests !== null && maxGuests > 0 ? guests.filter((g) => g.trim() !== "") : void 0;
	return {
		email: email?.value ? String(email.value) : "",
		firstName: firstName?.value ? String(firstName.value) : void 0,
		lastName: lastName?.value ? String(lastName.value) : void 0,
		phone: phone?.value ? String(phone.value) : void 0,
		customFields,
		guests: filteredGuests && filteredGuests.length > 0 ? filteredGuests : void 0
	};
}
function useBookingForm(calendarId) {
	const bookingForm = useKeyedValue(bookingFormStore, calendarId);
	const setBookingForm = (customFields) => bookingFormStore.setValue(calendarId, customFields);
	const setCustomFieldValue = (uuid, value) => {
		bookingFormStore.updateValue(calendarId, (prev) => prev.map((field) => field.uuid === uuid ? {
			...field,
			value
		} : field));
	};
	return {
		setBookingForm,
		bookingForm,
		setCustomFieldValue,
		collectFormValues: () => collectFormValues(calendarId)
	};
}
//#endregion
//#region src/hooks/useBillingAddress.ts
const billingAddressStore = createKeyedStore({
	name: "",
	email: "",
	company: "",
	address: "",
	city: "",
	postalCode: "",
	country: "",
	crn: "",
	vatId: ""
});
function useBillingAddress(calendarId) {
	const billingAddress = useKeyedValue(billingAddressStore, calendarId);
	const setBillingAddress = (next) => billingAddressStore.setValue(calendarId, next);
	const updateBillingAddressField = (field, value) => billingAddressStore.updateValue(calendarId, (prev) => ({
		...prev,
		[field]: value
	}));
	return {
		billingAddress,
		setBillingAddress,
		updateBillingAddressField
	};
}
//#endregion
//#region src/hooks/useDateFormatters.ts
const dfnsConfigStore = createStore(void 0);
async function loadDateFnsConfig(locale) {
	dfnsConfigStore.set(await getDfnsConfig(locale));
}
function useDateFormatters() {
	const { timezone } = useCurrentTimezone();
	const { hourCycle } = useHourCycle();
	const dateFnsConfig = useStoreValue(dfnsConfigStore);
	const getFormattedTime = (date) => {
		if (hourCycle === "h11") return format(parseISO(date), "h:mmaaa", {
			in: tz(timezone),
			...dateFnsConfig
		});
		return format(parseISO(date), "H:mm", {
			in: tz(timezone),
			...dateFnsConfig
		});
	};
	const getFormattedDay = (date) => format(parseISO(date), "EEEE", {
		...dateFnsConfig,
		in: tz(timezone)
	});
	const getFormattedDayInMonth = (date) => format(parseISO(date), "PPPP", {
		...dateFnsConfig,
		in: tz(timezone)
	});
	return {
		getFormattedTime,
		getFormattedDay,
		getFormattedDayInMonth,
		loadDateFnsConfig
	};
}
//#endregion
export { book, cancel, confirm, fetchRemoteConfiguration, mergeRecursive as mergeObjects, reschedule, reserve, stopReservationRefresh, useBillingAddress, useBookingForm, useCalendar, useConfig, useCurrentTimezone, useDateFormatters, useGuests, useHourCycle, useLocations, useReservationReschedule, useSelectedTimeSlot, useStripeConfig };
