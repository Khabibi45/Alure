#!/usr/bin/env bash
# Hook PostToolUse : formate (prettier) + corrige le lint (eslint --fix) d'un
# fichier web après une édition de l'agent.
# Reçoit le payload JSON du hook sur stdin ; en extrait tool_input.file_path.
# Ne casse jamais la session : si un outil manque, on sort proprement (exit 0).
set -uo pipefail

payload="$(cat)"

# Extraire le chemin du fichier édité (jq préféré, puis python3, puis grep).
if command -v jq >/dev/null 2>&1; then
  file="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')"
elif command -v python3 >/dev/null 2>&1; then
  file="$(printf '%s' "$payload" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)"
else
  file="$(printf '%s' "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')"
fi

# N'agir que sur un fichier web qui existe encore, hors node_modules/.next.
case "$file" in
  */node_modules/* | */.next/*) exit 0 ;;
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.css) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# Outils LOCAUX du projet uniquement (pas de npx réseau, pas de version globale surprise).
root="${CLAUDE_PROJECT_DIR:-$PWD}"
prettier="$root/node_modules/.bin/prettier"
eslint="$root/node_modules/.bin/eslint"

[ -x "$prettier" ] && "$prettier" --write --log-level silent "$file" >/dev/null 2>&1 || true
case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs)
    [ -x "$eslint" ] && "$eslint" --fix --no-warn-ignored "$file" >/dev/null 2>&1 || true
    ;;
esac
exit 0
