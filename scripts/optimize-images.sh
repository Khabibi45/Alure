#!/usr/bin/env bash
# Convertit des images sources (jpg/png) en WebP dimensionné, AVANT intégration.
#
# Usage :
#   scripts/optimize-images.sh <dossier-source> [largeur-max] [qualité]
#   scripts/optimize-images.sh assets-sources/ 1280 80
#
# Produit les .webp À CÔTÉ des sources (même nom). On copie ensuite dans public/
# UNIQUEMENT les .webp. Règles :
#   - largeur-max = la taille d'AFFICHAGE réelle (hero plein écran : 1920 ;
#     image de section : 1280 ; card : 800 ; icône : SVG ou 128)
#   - une image > 300 KB après conversion doit se justifier
set -euo pipefail

if ! command -v cwebp >/dev/null 2>&1; then
  echo "⛔ cwebp introuvable. Installer : brew install webp" >&2
  exit 1
fi

SRC_DIR="${1:?Usage: optimize-images.sh <dossier-source> [largeur-max] [qualité]}"
MAX_WIDTH="${2:-1280}"
QUALITY="${3:-80}"

count=0
find "$SRC_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) | while IFS= read -r img; do
  out="${img%.*}.webp"
  cwebp -q "$QUALITY" -resize "$MAX_WIDTH" 0 "$img" -o "$out" >/dev/null 2>&1
  before=$(du -k "$img" | cut -f1)
  after=$(du -k "$out" | cut -f1)
  printf '✓ %s : %s KB → %s KB\n' "$(basename "$img")" "$before" "$after"
  count=$((count + 1))
done

echo ""
echo "Terminé. Copier les .webp dans public/ (jamais les sources)."
echo "Rappel : next/image + sizes corrects + priority sur l'image LCP uniquement."
