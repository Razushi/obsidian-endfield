const { Plugin, moment, normalizePath } = require("obsidian");

const DAILY_NOTES_COMMAND_ID = "daily-notes";

module.exports = class DailyNoteNoFlickerPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "open-todays-daily-note-no-flicker",
      name: "Open today's daily note without flicker",
      callback: () => this.openTodaysDailyNote(),
    });

    // One command per configured path, so each can get its own hotkey.
    // The id is the bare path, matching "Hotkeys for specific files".
    const data = (await this.loadData()) || {};
    for (const path of data.files || []) {
      this.addCommand({
        id: path,
        name: `Open ${path} without flicker`,
        callback: () => this.focusOrOpen(path),
      });
    }
  }

  async openTodaysDailyNote() {
    const dailyNotePath = await this.getTodaysDailyNotePath();

    if (dailyNotePath && (await this.focusOrOpen(dailyNotePath))) {
      return;
    }

    // Not created yet — let the core command build it from the template.
    this.app.commands.executeCommandById(DAILY_NOTES_COMMAND_ID);
  }

  // Focus the tab a file is already in, instead of opening it and letting
  // Mononote bounce us back (that bounce is the visible flicker). Match on
  // both the loaded view and the view state so it works whether the tab is
  // loaded or still deferred. Returns false if the file doesn't exist.
  async focusOrOpen(path) {
    let target = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (target) {
        return;
      }
      const state = leaf.getViewState();
      const statePath = state && state.state && state.state.file;
      const viewPath = leaf.view && leaf.view.file && leaf.view.file.path;
      if (statePath === path || viewPath === path) {
        target = leaf;
      }
    });

    if (target) {
      this.app.workspace.setActiveLeaf(target, { focus: true });
      return true;
    }

    // Open in the current tab if the note exists but isn't open anywhere.
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file) {
      await this.app.workspace.getLeaf(false).openFile(file);
      return true;
    }

    return false;
  }

  async getTodaysDailyNotePath() {
    try {
      const configDir = this.app.vault.configDir || ".obsidian";
      const configPath = normalizePath(`${configDir}/daily-notes.json`);
      const settings = JSON.parse(await this.app.vault.adapter.read(configPath));
      const folder = settings.folder ? normalizePath(settings.folder) : "";
      const format = settings.format || "YYYY-MM-DD";
      const formattedDate = moment().format(format);
      const filename = formattedDate.endsWith(".md")
        ? formattedDate
        : `${formattedDate}.md`;

      return normalizePath(folder ? `${folder}/${filename}` : filename);
    } catch (error) {
      console.warn(
        "Daily Note No Flicker: failed to resolve today's daily note path.",
        error
      );
      return null;
    }
  }

};
