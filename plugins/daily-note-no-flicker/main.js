const { Plugin, moment, normalizePath } = require("obsidian");

const DAILY_NOTES_COMMAND_ID = "daily-notes";

module.exports = class DailyNoteNoFlickerPlugin extends Plugin {
  onload() {
    this.addCommand({
      id: "open-todays-daily-note-no-flicker",
      name: "Open today's daily note without flicker",
      callback: () => this.openTodaysDailyNote(),
    });
  }

  async openTodaysDailyNote() {
    const dailyNotePath = await this.getTodaysDailyNotePath();

    if (dailyNotePath) {
      // Focus the existing tab directly (like "Hotkeys for specific files"):
      // no new tab is opened, so there's no flicker and Mononote never has a
      // duplicate to bounce away. Match on both the loaded view and the view
      // state so it works whether the tab is loaded or still deferred.
      let target = null;
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (target) {
          return;
        }
        const state = leaf.getViewState();
        const statePath = state && state.state && state.state.file;
        const viewPath = leaf.view && leaf.view.file && leaf.view.file.path;
        if (statePath === dailyNotePath || viewPath === dailyNotePath) {
          target = leaf;
        }
      });

      if (target) {
        this.app.workspace.setActiveLeaf(target, { focus: true });
        return;
      }

      // Open in the current tab if the note exists but isn't open anywhere.
      const file = this.app.vault.getAbstractFileByPath(dailyNotePath);
      if (file) {
        await this.app.workspace.getLeaf(false).openFile(file);
        return;
      }
    }

    // Not created yet — let the core command build it from the template.
    this.app.commands.executeCommandById(DAILY_NOTES_COMMAND_ID);
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
