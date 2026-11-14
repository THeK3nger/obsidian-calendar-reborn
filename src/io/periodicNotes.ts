import type { Moment } from "moment";
import type { TFile } from "obsidian";
import {
  createPeriodicNote,
  getAllPeriodicNotes,
  getPeriodicNote,
  getPeriodicNoteSettings,
} from "src/lib/daily-notes";
import type { IGranularity } from "src/lib/daily-notes";

import { GRANULARITY_LABELS } from "src/periodicity";
import type { ISettings } from "src/settings";
import { createConfirmationDialog } from "src/ui/modal";

/**
 * Look up the note for `date`, scanning the notes folder. Used where no
 * cached index is at hand, such as commands.
 */
export function findPeriodicNote(
  granularity: IGranularity,
  date: Moment
): TFile | null {
  try {
    return getPeriodicNote(granularity, date, getAllPeriodicNotes(granularity));
  } catch {
    // The notes folder doesn't exist yet.
    return null;
  }
}

/**
 * Open `existing`, or create the note for the period containing `date`
 * (after confirmation, if enabled) and open it. `onOpen` is called with the
 * opened file.
 */
export async function openOrCreatePeriodicNote(
  granularity: IGranularity,
  date: Moment,
  existing: TFile | null,
  inNewSplit: boolean,
  settings: ISettings,
  onOpen?: (file: TFile) => void
): Promise<void> {
  const { workspace } = window.app;

  const openFile = async (file: TFile) => {
    const leaf = workspace.getLeaf(inNewSplit ? "split" : false);
    await leaf.openFile(file, { active: true });
    onOpen?.(file);
  };

  if (existing) {
    await openFile(existing);
    return;
  }

  const periodStart = date.clone().startOf(granularity);
  const createFile = async () => {
    const file = await createPeriodicNote(granularity, periodStart);
    if (file) {
      await openFile(file);
    }
  };

  if (!settings.shouldConfirmBeforeCreate) {
    await createFile();
    return;
  }

  const { format } = getPeriodicNoteSettings(granularity);
  createConfirmationDialog({
    cta: "Create",
    onAccept: createFile,
    text: `File ${periodStart.format(format)} does not exist. Would you like to create it?`,
    title: `New ${GRANULARITY_LABELS[granularity]} Note`,
  });
}
