#!/usr/bin/env bash
# Concatenate module files into theme.css in the correct cascade order.
# Run this after editing any module file.

DIR="$(cd "$(dirname "$0")" && pwd)"

cat \
  "$DIR/tokens.css" \
  "$DIR/workspace.css" \
  "$DIR/sidebar.css" \
  "$DIR/tabs.css" \
  "$DIR/view-header.css" \
  "$DIR/editor.css" \
  "$DIR/content.css" \
  "$DIR/modals.css" \
  "$DIR/plugins.css" \
  > "$DIR/theme.css"

echo "Built theme.css ($(wc -l < "$DIR/theme.css") lines)"
