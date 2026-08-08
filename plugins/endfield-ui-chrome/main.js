const { Plugin } = require("obsidian");

const PANEL_CONFIG = {
  "file-explorer": { label: "Vault Index" },
  outline: { label: "Outline" },
};

const PANEL_SELECTOR = Object.keys(PANEL_CONFIG)
  .map((type) => `.workspace-leaf-content[data-type="${type}"]`)
  .join(", ");

class EndfieldUiChromePlugin extends Plugin {
  async onload() {
    this.refreshQueued = false;

    document.body.classList.add("endfield-ui-chrome-enabled");

    this.registerEvent(this.app.workspace.on("layout-change", () => this.scheduleRefresh()));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.scheduleRefresh()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.scheduleRefresh()));

    const observer = new MutationObserver(() => this.scheduleRefresh());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "data-type", "aria-label", "title"],
    });

    this.register(() => observer.disconnect());
    this.register(() => this.cleanup());

    this.scheduleRefresh();
  }

  scheduleRefresh() {
    if (this.refreshQueued) {
      return;
    }

    this.refreshQueued = true;
    window.requestAnimationFrame(() => {
      this.refreshQueued = false;
      this.refreshUi();
    });
  }

  refreshUi() {
    this.decorateFileExplorerChrome();
    this.decoratePanelHeaders();
    this.decorateMarkdownHeaders();
  }

  decorateFileExplorerChrome() {
    const explorers = document.querySelectorAll('.workspace-leaf-content[data-type="file-explorer"]');

    explorers.forEach((leaf) => {
      if (!(leaf instanceof HTMLElement)) {
        return;
      }

      const navHeader = leaf.querySelector(".nav-header");
      if (!(navHeader instanceof HTMLElement)) {
        return;
      }

      let chrome = leaf.querySelector(":scope > .endfield-file-explorer-chrome");
      if (!(chrome instanceof HTMLElement)) {
        chrome = document.createElement("div");
        chrome.className = "endfield-file-explorer-chrome";

        const title = document.createElement("div");
        title.className = "endfield-file-explorer-title";
        title.textContent = "// Vault Index";

        const rule = document.createElement("div");
        rule.className = "endfield-file-explorer-rule";

        chrome.append(title, rule);
        navHeader.insertAdjacentElement("afterend", chrome);
      }
    });
  }

  decoratePanelHeaders() {
    const leaves = document.querySelectorAll(PANEL_SELECTOR);

    leaves.forEach((leaf) => {
      if (!(leaf instanceof HTMLElement)) {
        return;
      }

      const panelType = leaf.getAttribute("data-type");
      const config = panelType ? PANEL_CONFIG[panelType] : null;
      if (!config) {
        return;
      }

      const header = leaf.querySelector(".view-header");
      if (!(header instanceof HTMLElement)) {
        return;
      }

      header.classList.add("endfield-panel-header-ready");
      header.setAttribute("data-endfield-panel-type", panelType);

      let chrome = header.querySelector(":scope > .endfield-panel-header") || header.querySelector(".endfield-panel-header");
      if (!(chrome instanceof HTMLElement)) {
        chrome = this.buildPanelChrome(config.label);
        header.prepend(chrome);
      }

      const title = chrome.querySelector(".endfield-panel-title");
      if (title instanceof HTMLElement) {
        title.textContent = `// ${config.label}`;
      }
    });
  }

  decorateMarkdownHeaders() {
    const leaves = document.querySelectorAll('.workspace-leaf-content[data-type="markdown"]');

    leaves.forEach((leaf) => {
      if (!(leaf instanceof HTMLElement)) {
        return;
      }

      const header = leaf.querySelector(".view-header");
      if (!(header instanceof HTMLElement)) {
        return;
      }

      header.classList.add("endfield-note-header");

      const breadcrumb = header.querySelector(".view-header-breadcrumb");
      if (breadcrumb instanceof HTMLElement) {
        breadcrumb.classList.add("endfield-note-kicker");
      }
    });
  }

  buildPanelChrome(label) {
    const chrome = document.createElement("div");
    chrome.className = "endfield-panel-header";

    const title = document.createElement("div");
    title.className = "endfield-panel-title";
    title.textContent = `// ${label}`;

    const rule = document.createElement("div");
    rule.className = "endfield-panel-rule";

    chrome.append(title, rule);
    return chrome;
  }

  cleanup() {
    document.body.classList.remove("endfield-ui-chrome-enabled");

    document.querySelectorAll(".endfield-panel-header").forEach((chrome) => {
      if (!(chrome instanceof HTMLElement)) {
        return;
      }

      const header = chrome.parentElement;
      if (!(header instanceof HTMLElement)) {
        chrome.remove();
        return;
      }

      chrome.remove();
      header.classList.remove("endfield-panel-header-ready");
      header.removeAttribute("data-endfield-panel-type");
    });

    document.querySelectorAll(".endfield-file-explorer-chrome").forEach((chrome) => {
      if (chrome instanceof HTMLElement) {
        chrome.remove();
      }
    });

    document.querySelectorAll(".endfield-note-header").forEach((header) => {
      if (header instanceof HTMLElement) {
        header.classList.remove("endfield-note-header");
      }
    });

    document.querySelectorAll(".endfield-note-kicker").forEach((breadcrumb) => {
      if (breadcrumb instanceof HTMLElement) {
        breadcrumb.classList.remove("endfield-note-kicker");
      }
    });
  }
}

module.exports = EndfieldUiChromePlugin;
