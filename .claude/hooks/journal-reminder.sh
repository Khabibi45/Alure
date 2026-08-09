#!/usr/bin/env bash
# Stop hook — rappelle de mettre à jour docs/PROGRESS.md en fin de session.
#
# Logique :
#  1. Si stop_hook_active vaut true dans le payload stdin (le hook a déjà bloqué
#     ce tour), on sort → pas de boucle infinie.
#  2. On lit `git status --porcelain` à la racine du projet.
#  3. Si au moins un fichier de code du site a changé (src/**, next.config.ts…)
#     ET que docs/PROGRESS.md n'a PAS changé → on bloque l'arrêt avec un rappel.
#  4. Sinon → sortie silencieuse.
#
# Pur bash + git. Toute erreur → exit 0 : le hook ne doit jamais empêcher de travailler.

set -u

payload="$(cat 2>/dev/null || true)"
case "$payload" in
  *'"stop_hook_active":true'* | *'"stop_hook_active": true'*) exit 0 ;;
esac

dir="${CLAUDE_PROJECT_DIR:-$PWD}"
status="$(git -C "$dir" status --porcelain 2>/dev/null)" || exit 0

code_changed=false
journal_changed=false

while IFS= read -r line; do
  [ -z "$line" ] && continue
  path="${line:3}"                                          # 2 chars de statut + 1 espace
  case "$path" in *" -> "*) path="${path##* -> }" ;; esac   # renommage a -> b
  path="${path%\"}"; path="${path#\"}"                      # noms spéciaux entre guillemets
  case "$path" in
    src/*.ts | src/*.tsx | src/*.css | src/**/*.ts | src/**/*.tsx | src/**/*.css | next.config.ts | middleware.ts)
      code_changed=true ;;
  esac
  case "$path" in docs/PROGRESS.md) journal_changed=true ;; esac
done <<EOF
$status
EOF

if [ "$code_changed" = true ] && [ "$journal_changed" = false ]; then
  reason="Rappel de fin de session : du code du site a ete modifie mais docs/PROGRESS.md n a pas ete mis a jour. Ajoute une entree datee en haut de docs/PROGRESS.md (ce qui a change, fichiers cles), puis mets a jour docs/ROADMAP.md si une priorite bouge. Si ce travail ne change pas reellement l etat du produit (exploration, debug sans livraison, WIP), tu peux t arreter sans rien ecrire."
  printf '{"decision":"block","reason":"%s"}' "$reason"
fi

exit 0
