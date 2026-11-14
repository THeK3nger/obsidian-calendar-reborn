# Changelog

## [Unreleased]

## v2.1.0

### New

- Calendar Reborn now includes the Periodic Notes plugin's features: weekly, monthly, quarterly and yearly notes each have their own settings (format, template, folder). Daily notes keep following the core Daily Notes plugin. I can now have a single plugin instead of two interconnected ones.
- Click the month or year in the calendar title to open the monthly or yearly note (if they are enabled).
- "Reveal active note" also works for monthly, quarterly and yearly notes.

### Migration

- On first load, settings are imported from the Periodic Notes plugin (if enabled) and from the old Calendar weekly note settings. A notice tells you that Periodic Notes can be uninstalled.

## v2.0.0 

### Behind the Scenes

- This version is **big** modernization of the codebase but it is not a rewrite. I have update all the libraries, Svelte, and removed a bunch of lint triggered by the latest Obsidian Community checks. But there is still more work to do. However, this patched everything, removed no feature and reduced the bundle to ~90kb.

## v1.5.10

- Last release before this changelog was introduced.
