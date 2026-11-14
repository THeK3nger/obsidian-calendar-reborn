import type { IGranularity, IPeriodicGranularity } from "src/lib/daily-notes";
import {
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_QUARTERLY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_YEARLY_NOTE_FORMAT,
} from "src/lib/daily-notes";

/** Settings key under which each periodic note type is stored. */
export type Periodicity = "weekly" | "monthly" | "quarterly" | "yearly";

export interface IPeriodicityInfo {
  periodicity: Periodicity;
  granularity: IPeriodicGranularity;
  /** Capitalized adjective, e.g. "Weekly". */
  label: string;
  /** The period's noun, e.g. "week". */
  unit: string;
  defaultFormat: string;
}

export const PERIODICITIES: readonly IPeriodicityInfo[] = [
  {
    periodicity: "weekly",
    granularity: "week",
    label: "Weekly",
    unit: "week",
    defaultFormat: DEFAULT_WEEKLY_NOTE_FORMAT,
  },
  {
    periodicity: "monthly",
    granularity: "month",
    label: "Monthly",
    unit: "month",
    defaultFormat: DEFAULT_MONTHLY_NOTE_FORMAT,
  },
  {
    periodicity: "quarterly",
    granularity: "quarter",
    label: "Quarterly",
    unit: "quarter",
    defaultFormat: DEFAULT_QUARTERLY_NOTE_FORMAT,
  },
  {
    periodicity: "yearly",
    granularity: "year",
    label: "Yearly",
    unit: "year",
    defaultFormat: DEFAULT_YEARLY_NOTE_FORMAT,
  },
];

export const GRANULARITY_LABELS: Record<IGranularity, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  quarter: "Quarterly",
  year: "Yearly",
};
