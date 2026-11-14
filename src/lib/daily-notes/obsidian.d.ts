import "obsidian";
import type { IPeriodicNoteSettings } from "./types";

declare module "obsidian" {
  export interface FoldPosition {
    from: number;
    to: number;
  }

  export interface FoldInfo {
    folds: FoldPosition[];
  }

  /**
   * Obsidian's internal `app.foldManager`. Used to persist a file's fold
   * state when creating notes from a template.
   */
  export interface FoldManager {
    load(file: TFile): FoldInfo | null;
    save(file: TFile, foldInfo: FoldInfo | null): Promise<void>;
  }

  /**
   * Obsidian's `app.plugins` registry of community plugins.
   */
  export interface CommunityPluginManager {
    /** IDs of the community plugins the user has enabled. */
    enabledPlugins: Set<string>;
    getPlugin(id: string): Plugin | undefined;
    plugins: Record<string, Plugin | undefined>;
  }

  /**
   * Obsidian's `app.internalPlugins` registry. The library only reads
   * the "daily-notes" instance options.
   */
  export interface DailyNotesInstance {
    options?: IPeriodicNoteSettings;
  }

  export interface InternalPluginEntry {
    enabled: boolean;
    instance: DailyNotesInstance;
  }

  export interface InternalPlugins {
    plugins: Record<string, InternalPluginEntry | undefined>;
    getPluginById(id: "daily-notes"): InternalPluginEntry | undefined;
    getPluginById(id: string): InternalPluginEntry | undefined;
  }

  export interface App {
    foldManager: FoldManager;
    internalPlugins: InternalPlugins;
    plugins: CommunityPluginManager;
  }
}
