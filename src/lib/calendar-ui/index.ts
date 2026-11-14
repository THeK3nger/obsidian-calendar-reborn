import Calendar from "./components/Calendar.svelte";
import type { ICalendarSource, IDot, IDayMetadata } from "./types";

export { Calendar };
export type { ICalendarSource, IDot, IDayMetadata };
export { configureGlobalMomentLocale } from "./localization";
export type { ILocaleOverride, IWeekStartOption } from "./localization";
