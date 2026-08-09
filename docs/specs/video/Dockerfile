# ---------------------------------------------------------------------------
# storyboard-scroll.html est écrit SANS <!doctype>/<html>/<head> : c'est la
# contrainte du format Artifact, qui fournit lui-même cette enveloppe.
# Servi brut, un navigateur bascule en mode quirks et ignore le viewport
# mobile. On enveloppe donc le fichier au build — une seule source, deux
# destinations valides.
# ---------------------------------------------------------------------------
FROM alpine:3.20 AS build

WORKDIR /build
COPY storyboard-scroll.html .

RUN { \
      printf '%s\n' \
        '<!doctype html>' \
        '<html lang="fr">' \
        '<head>' \
        '<meta charset="utf-8">' \
        '<meta name="viewport" content="width=device-width, initial-scale=1">' \
        '<meta name="robots" content="noindex, nofollow">' \
        '<meta name="color-scheme" content="dark">' \
        '</head>' \
        '<body>'; \
      cat storyboard-scroll.html; \
      printf '%s\n' '</body>' '</html>'; \
    } > index.html \
 && grep -q '<!doctype html>' index.html \
 && grep -q '</html>' index.html \
 && grep -q '<title>' index.html \
 && grep -q 'renderPlans()' index.html

# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/index.html /usr/share/nginx/html/index.html

EXPOSE 80

# 127.0.0.1 et non localhost : dans le conteneur, localhost résout d'abord en
# ::1, alors que nginx n'écoute qu'en IPv4 — la sonde échouerait sur un
# serveur parfaitement sain.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
