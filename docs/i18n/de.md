# Deutsch — abgeleitet vom Französischen

> **Verbindlich ist das Französische.** Diese Datei folgt exakt den Schlüsseln aus
> [`./fr.md`](./fr.md), in derselben Reihenfolge. Textänderungen entstehen zuerst dort, dann
> hier. Standard: [`./README.md`](./README.md).
>
> Die Werte in `{ }` setzt der Code ein (Beträge, Fristen, Mengen) — sie werden nicht übersetzt,
> nur platziert. Der Betrag kommt **immer** aus `formatEuros()`: nie eine Zahl von Hand.

## 0. SHIPPING_NOTICE

> Wird angezeigt, solange nur nach Frankreich geliefert wird (siehe README §0). Auf Deutsch ist
> das keine Selbstverständlichkeit — der Hinweis steht deshalb sichtbar über dem Kaufbutton.

- `SHIPPING_NOTICE.TITLE` — Lieferung nur nach Frankreich
- `SHIPPING_NOTICE.BODY` — Wir liefern zurzeit nur nach Festlandfrankreich. Nach Deutschland und in andere Länder versenden wir noch nicht.

## 1. META

- `META.BRAND` — Alure
- `META.TAGLINE` — Der zweiteilige Swimbait, gemacht für Raubfische
- `META.DESCRIPTION` — Alure: der zweiteilige Swimbait mit naturgetreuem Lauf, für das Angeln auf Schwarzbarsch und Barsch.
- `META.LANG` — de
- `META.LOCALE` — de_DE
- `META.LANG_NAME` — Deutsch

## 2. NAV

- `NAV.HOME` — Startseite
- `NAV.PRODUCT` — Der Köder
- `NAV.ABOUT` — Über uns
- `NAV.TRACKING` — Sendungsverfolgung
- `NAV.TRACKING_LONG` — Sendungsverfolgung
- `NAV.FAQ` — FAQ
- `NAV.CONTACT` — Kontakt
- `NAV.LEGAL` — Impressum
- `NAV.TERMS` — AGB
- `NAV.WITHDRAWAL` — Widerruf
- `NAV.PRIVACY` — Datenschutz
- `NAV.FOOTER_LEGAL_LINE` — Alure — französisches Kleinstunternehmen. TVA non applicable, art. 293 B du CGI (keine Umsatzsteuer nach der französischen Kleinunternehmerregelung).

## 3. HOME

- `HOME.H1` — Der zweiteilige Swimbait, gemacht für Raubfische
- `HOME.SUBTITLE` — Schwarzbarsch, Barsch. {longueur} · {poids}. {prixSolo} pro Köder — einen kaufen, die beiden anderen zum Preis von einem, Versand inklusive ({delai}).
- `HOME.CTA` — Köder ansehen

### 3D-Karussell

- `HOME.CAROUSEL_LABEL` — Die Farben des Alure-Köders in 3D
- `HOME.CAROUSEL_ROLE` — Karussell
- `HOME.PREV` — Vorheriger Köder
- `HOME.NEXT` — Nächster Köder
- `HOME.SHOW_LURE` — Köder {nom} anzeigen
- `HOME.LOADING` — Köder wird geladen…
- `HOME.NO_WEBGL` — Ihr Browser zeigt keine 3D an. Die Fotos des Köders finden Sie auf der Produktseite.
- `HOME.MODEL_FAILED` — Das 3D-Modell konnte nicht geladen werden. Die Fotos des Köders finden Sie auf der Produktseite.

### Ansichtswahl

- `HOME.VIEWS_LABEL` — Blickwinkel auf den Köder
- `HOME.VIEW_RIGHT` — Rechts
- `HOME.VIEW_LEFT` — Links
- `HOME.VIEW_TOP` — Oben
- `HOME.VIEW_BOTTOM` — Unten
- `HOME.VIEW_FRONT` — Vorne
- `HOME.VIEW_BACK` — Hinten
- `HOME.VIEW_RIGHT_DESC` — rechte Flanke
- `HOME.VIEW_LEFT_DESC` — linke Flanke
- `HOME.VIEW_TOP_DESC` — von oben, der Rücken
- `HOME.VIEW_BOTTOM_DESC` — von unten, Bauch und Haken
- `HOME.VIEW_FRONT_DESC` — von vorn, Kopf zu Ihnen
- `HOME.VIEW_BACK_DESC` — von hinten, Schwanzflosse zu Ihnen
- `HOME.MODEL_ALT` — Der Alure-Köder in der 3D-Ansicht, Modell {nom}. Er schwimmt auf der Stelle. Ansicht: {vue}.

## 4. PRODUCT — Seite /leurre

- `PRODUCT.TITLE` — Zweiteiliger Swimbait — {prixSolo} inklusive Versand
- `PRODUCT.DESCRIPTION` — Der Alure-Köder: zweiteiliger Swimbait, gemacht für Raubfische. {prixSolo} pro Köder, oder die Kollektion mit allen {nbColoris} Farben für {prixCollection}, mit der Sammlerfarbe gratis dazu. Versand inklusive ({delai}), Zahlung per Karte oder PayPal, 14 Tage Widerrufsrecht.
- `PRODUCT.SPECS` — {longueur} · {poids}
- `PRODUCT.COLORWAY_LABEL` — Farbe:
- `PRODUCT.SOLD_OUT` — Ausverkauft
- `PRODUCT.DELIVERY_BANNER` — Lieferung {delai}
- `PRODUCT.DELAY_VALUE` — 10 bis 20 Werktage
- `PRODUCT.BUY` — Kaufen
- `PRODUCT.BUY_LOADING` — Weiterleitung zur Zahlung…
- `PRODUCT.BUY_LOADING_SHORT` — Weiterleitung…
- `PRODUCT.PAYMENT_HINT` — Zahlung per Karte oder PayPal, über Stripe.
- `OFFER.SOLO_TITLE` — Ein Köder
- `OFFER.SOLO_DETAIL` — In der Farbe {coloris}.
- `OFFER.COLLECTION_TITLE` — Die Kollektion
- `OFFER.COLLECTION_DETAIL` — Alle {nbColoris} Farben, dazu der {collector} gratis.
- `OFFER.PER_LURE_EXACT` — Das sind {montant} pro Köder.
- `OFFER.PER_LURE_AT_MOST` — Das sind weniger als {montant} pro Köder.
- `OFFER.LEGEND` — Ihr Angebot
- `OFFER.RULE` — Einen Köder kaufen, die beiden anderen zum Preis von einem
- `PROGRESS.STEP_FIRST` — Ihr erster Köder
- `PROGRESS.STEP_OTHERS` — Die beiden anderen zum Preis von einem
- `PROGRESS.STEP_OTHERS_DONE` — +{montant} — alle 3 Farben gehören Ihnen
- `PROGRESS.STEP_COLLECTOR` — Der {collector}
- `PROGRESS.COLLECTOR_DONE` — gratis zu Ihrer Kollektion
- `PROGRESS.COLLECTOR_TODO` — gratis, sobald die 3 Farben zusammen sind
- `PAYMENT.CARD` — Kartenzahlung
- `PAYMENT.PAYPAL` — PayPal
- `PAYMENT.SAFETY` — Zahlung über Stripe — Ihre Kartendaten laufen nie über diese Website.
- `PRODUCT.COLLECTOR_LOCKED` — Nehmen Sie die Kollektion, dann schalten Sie den {collector} frei.
- `PRODUCT.COLLECTOR_EARNED` — Der {collector} liegt Ihrer Bestellung gratis bei.
- `PRODUCT.VIEWER_NO_WEBGL` — Ihr Browser zeigt keine 3D an. Die Beschreibung nebenan stellt den Köder im Detail vor.
- `PRODUCT.COLLECTOR_ALT` — Der Alure-Sammlerköder in der 3D-Ansicht, Modell {nom}, gratis zur vollständigen Kollektion. Er schwimmt auf der Stelle.
- `PRODUCT.REASSURANCE_RETURN` — 14 Tage Widerrufsrecht
- `PRODUCT.REASSURANCE_PAYMENT` — Zahlung über Stripe oder PayPal
- `PRODUCT.REASSURANCE_TRACKING` — Sendungsverfolgung per E-Mail

## 5. PRICING

- `PRICING.RULE` — Einen Köder kaufen, die beiden anderen zum Preis von einem
- `PRICING.TAX_LINE` — Versand inklusive · TVA non applicable, art. 293 B du CGI (keine Umsatzsteuer nach der französischen Kleinunternehmerregelung).
- `PRICING.SAVINGS` — Sie sparen {montant}.

## 6. FAQ

- `FAQ.Q_DELIVERY_TIME` — Wie lange dauert die Lieferung?
- `FAQ.A_DELIVERY_TIME` — Rechnen Sie mit {delai} ab Ihrer Bestellung. Wir versenden über unseren Lieferanten. Das erklärt die Dauer und den Preis des Köders. Die Frist steht vor dem Kauf da und noch einmal in Ihrer Bestätigungsmail.
- `FAQ.Q_SHIPPING_COST` — Was kostet die Lieferung?
- `FAQ.A_SHIPPING_COST` — Nichts: Der Versand innerhalb Frankreichs ist im angezeigten Preis enthalten, egal welches Angebot Sie wählen.
- `FAQ.Q_BULK` — Wird es günstiger, wenn ich mehrere nehme?
- `FAQ.A_BULK` — Ja, deutlich. Ein einzelner Köder kostet {prixSolo}. Die Kollektion mit allen {nbColoris} Farben kostet {prixCollection} — einen Köder kaufen, die beiden anderen zum Preis von einem — und den {collector} legen wir gratis dazu. Die Summe sehen Sie vor der Zahlung, Versand inklusive.
- `FAQ.Q_SIZE` — Welche Länge und welches Gewicht hat der Köder?
- `FAQ.A_SIZE` — {longueur} bei {poids}. Ein kompaktes Format: Es lässt sich leicht werfen und fängt beim gleichmäßigen Einholen ebenso gut wie beim animierten Führen.
- `FAQ.Q_TRACK` — Wie verfolge ich meine Bestellung?
- `FAQ.A_TRACK` — Sobald wir versenden, bekommen Sie per E-Mail eine internationale Sendungsnummer. Die Seite Sendungsverfolgung erklärt jeden Schritt, von der Bestätigung bis zur Zustellung.
- `FAQ.Q_RETURN` — Kann ich es mir nach Erhalt anders überlegen?
- `FAQ.A_RETURN` — Ja. Sie haben nach Erhalt 14 Tage Widerrufsrecht, ohne Begründung. Schicken Sie den unbenutzten Köder in seiner Verpackung zurück. Sobald er bei uns ankommt, erstatten wir den vollen Betrag. Die Kosten der Rücksendung tragen Sie.
- `FAQ.Q_LOST` — Was passiert, wenn mein Paket nicht ankommt?
- `FAQ.A_LOST` — Ist Ihre Bestellung nach 30 Werktagen nicht geliefert, antworten Sie einfach auf Ihre Bestätigungsmail: Wir schicken einen neuen Köder oder erstatten den Betrag — Sie entscheiden.
- `FAQ.Q_PAYMENT` — Welche Zahlungsmittel akzeptieren Sie?
- `FAQ.A_PAYMENT` — Kartenzahlung und PayPal. Die Zahlung läuft über Stripe und ist durchgehend verschlüsselt: Ihre Kartennummer erreicht unsere Website nie.
- `FAQ.Q_WHO` — Wer ist Alure?
- `FAQ.A_WHO` — Ein französisches Kleinstunternehmen, geführt von Raubfischanglern. Wir verkaufen einen einzigen Köder, den wir ausgesucht haben, statt eines ganzen Katalogs.

## 7. TRACKING — Seite /suivi

- `TRACKING.TITLE` — Sendungsverfolgung
- `TRACKING.INTRO` — Sobald wir versenden, bekommen Sie per E-Mail eine internationale Sendungsnummer. Hier steht, was jeder Schritt bedeutet.

## 8. THANKS — Seite /merci

- `THANKS.TITLE` — Danke für Ihre Bestellung
- `THANKS.BODY` — Wenn Ihre Zahlung bestätigt wurde, bekommen Sie in den nächsten Minuten eine Bestätigungsmail. Sie ist maßgeblich.
- `THANKS.CTA` — Zurück zur Startseite

## 9. CONTACT

- `CONTACT.TITLE` — Schreiben Sie uns
- `CONTACT.ORDER_NUMBER` — Bestellnummer (optional)
- `CONTACT.EMAIL` — Ihre E-Mail-Adresse
- `CONTACT.MESSAGE` — Ihre Nachricht
- `CONTACT.SUBMIT` — Anfrage senden
- `CONTACT.SENDING` — Wird gesendet…
- `CONTACT.SUCCESS` — Ihre Nachricht ist unterwegs. Wir antworten an die angegebene Adresse.
- `CONTACT.ERROR` — Ihre Nachricht wurde nicht gesendet. Versuchen Sie es gleich noch einmal.

## 10. LEGAL

- `LEGAL.NOTICE_TITLE` — Impressum
- `LEGAL.TERMS_TITLE` — Allgemeine Geschäftsbedingungen
- `LEGAL.WITHDRAWAL_TITLE` — Widerrufsrecht
- `LEGAL.PRIVACY_TITLE` — Datenschutzerklärung
- `LEGAL.TRANSLATION_DISCLAIMER` — Verbindlich sind Impressum und AGB in ihrer französischen Fassung. Diese Übersetzung dient nur der Information und ist nicht vertraglich bindend.

## 11. EMAILS

### Bestätigung an den Kunden

- `EMAIL.CONFIRM_SUBJECT` — Ihre Alure-Bestellung ist bestätigt
- `EMAIL.CONFIRM_GREETING` — Guten Tag,
- `EMAIL.CONFIRM_LEAD` — Ihre Bestellung ist bestätigt — danke für Ihr Vertrauen.
- `EMAIL.CONFIRM_RECAP` — Übersicht:
- `EMAIL.CONFIRM_COLORWAY` — Farbe: {coloris}
- `EMAIL.CONFIRM_OFFER` — Angebot: {offre}
- `EMAIL.CONFIRM_TOTAL` — Gezahlter Betrag: {montant} (Versand inklusive — TVA non applicable, art. 293 B du CGI, keine Umsatzsteuer nach der französischen Kleinunternehmerregelung)
- `EMAIL.CONFIRM_DELIVERY` — Lieferung: {delai}, wie vor Ihrem Kauf angegeben.
- `EMAIL.CONFIRM_TRACKING` — Sobald wir versenden, bekommen Sie die Sendungsnummer per E-Mail.
- `EMAIL.CONFIRM_WITHDRAWAL` — Sie haben nach Erhalt 14 Tage Widerrufsrecht.

### Interne Benachrichtigung (wird nie übersetzt — Camil liest sie)

- `EMAIL.INTERNAL_SUBJECT` — Commande à traiter — {resume}

## 12. STATES

- `STATES.LOADING` — Wird geladen…
- `STATES.FORM_INVALID` — Wählen Sie eine Farbe und ein Angebot.
- `STATES.PAYMENT_FAILED` — Die Zahlung konnte nicht starten. Versuchen Sie es gleich noch einmal.
- `STATES.PAYMENT_UNAVAILABLE` — Die Zahlung ist vorübergehend nicht verfügbar. Versuchen Sie es später noch einmal.
- `STATES.PAYMENT_BAD_RESPONSE` — Ungültige Antwort vom Zahlungsdienst. Versuchen Sie es gleich noch einmal.
- `STATES.PAYMENT_OFFLINE` — Die Zahlung konnte nicht starten (Verbindung unterbrochen). Versuchen Sie es noch einmal.
- `STATES.RATE_LIMITED` — Zu viele Versuche. Versuchen Sie es in einer Minute noch einmal.
- `STATES.NOT_FOUND_TITLE` — Seite nicht gefunden
- `STATES.NOT_FOUND_BODY` — Diese Seite gibt es nicht oder nicht mehr.
- `STATES.NOT_FOUND_CTA` — Zurück zur Startseite

## 13. LANG_SWITCHER

- `LANG.LABEL` — Sprache wechseln — aktuell Deutsch
- `LANG.FR` — Français
- `LANG.EN` — English
- `LANG.ES` — Español
- `LANG.DE` — Deutsch
- `LANG.NL` — Nederlands
