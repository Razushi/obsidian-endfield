# vault-skeleton

Vault files the config depends on but that live outside `.obsidian/`.
Obsidian ignores everything under `.obsidian/`, so these are inert here —
copy them into the vault root to make the config work.

```
cp -r ".obsidian/vault-skeleton/99 - Templates" .
```

Currently just `99 - Templates/daily-note.md`, referenced by
`daily-notes.json` → `"template": "99 - Templates/daily-note"`.

If you edit the real template in the vault, copy it back here — one file,
not worth a sync script.
