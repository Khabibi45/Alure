# Español — adaptado del francés

> **El francés da fe.** Este archivo deriva de [`./fr.md`](./fr.md) y sigue exactamente sus
> claves, en el mismo orden. Todo cambio de texto se hace primero en francés. Estándar:
> [`./README.md`](./README.md).
>
> Los valores entre `{ }` los inyecta el código (importes, plazos, cantidades) — no se traducen,
> se colocan. El importe lo formatea **siempre** `formatEuros()`, en euros: nunca una cifra
> escrita a mano.
>
> Tratamiento de **usted** en todo el archivo.

## 0. SHIPPING_NOTICE

> Se muestra mientras el envío se limite a Francia (véase README §0). En español el aviso es
> indispensable: nada permite al visitante deducirlo por sí mismo.

- `SHIPPING_NOTICE.TITLE` — Envío únicamente a Francia
- `SHIPPING_NOTICE.BODY` — Hoy enviamos únicamente a la Francia metropolitana.

## 1. META

- `META.BRAND` — Alure
- `META.TAGLINE` — El señuelo articulado de dos secciones, pensado para los depredadores
- `META.DESCRIPTION` — Alure, el señuelo articulado de dos secciones y nado ultrarrealista para la pesca del black bass y de la perca.
- `META.LANG` — es
- `META.LOCALE` — es_ES
- `META.LANG_NAME` — Español

## 2. NAV

- `NAV.HOME` — Inicio
- `NAV.PRODUCT` — El señuelo
- `NAV.ABOUT` — Quiénes somos
- `NAV.TRACKING` — Seguimiento
- `NAV.TRACKING_LONG` — Seguimiento del pedido
- `NAV.FAQ` — Preguntas frecuentes
- `NAV.CONTACT` — Contacto
- `NAV.LEGAL` — Aviso legal
- `NAV.TERMS` — Condiciones de venta
- `NAV.WITHDRAWAL` — Desistimiento
- `NAV.PRIVACY` — Privacidad
- `NAV.FOOTER_LEGAL_LINE` — Alure — microempresa francesa. TVA non applicable, art. 293 B du CGI (IVA no aplicable).

## 3. HOME

- `HOME.H1` — El señuelo articulado de dos secciones, pensado para los depredadores
- `HOME.SUBTITLE` — Black bass, perca. {longueur} · {poids}. {prixSolo} el señuelo — un señuelo comprado, los otros dos por el precio de uno, envío incluido ({delai}).
- `HOME.CTA` — Ver el señuelo

### Carrusel 3D

- `HOME.CAROUSEL_LABEL` — Los colores del señuelo Alure en 3D
- `HOME.CAROUSEL_ROLE` — carrusel
- `HOME.PREV` — Señuelo anterior
- `HOME.NEXT` — Señuelo siguiente
- `HOME.SHOW_LURE` — Mostrar el señuelo {nom}
- `HOME.LOADING` — Cargando el señuelo…
- `HOME.NO_WEBGL` — Su navegador no muestra 3D. Las fotos del señuelo están en la página del producto.
- `HOME.MODEL_FAILED` — El modelo 3D no se ha podido cargar. Las fotos del señuelo están en la página del producto.

### Selector de vistas

- `HOME.VIEWS_LABEL` — Ángulo de vista del señuelo
- `HOME.VIEW_RIGHT` — Derecha
- `HOME.VIEW_LEFT` — Izquierda
- `HOME.VIEW_TOP` — Arriba
- `HOME.VIEW_BOTTOM` — Abajo
- `HOME.VIEW_FRONT` — Delante
- `HOME.VIEW_BACK` — Detrás
- `HOME.VIEW_RIGHT_DESC` — flanco derecho
- `HOME.VIEW_LEFT_DESC` — flanco izquierdo
- `HOME.VIEW_TOP_DESC` — visto desde arriba, el dorso
- `HOME.VIEW_BOTTOM_DESC` — visto desde abajo, el vientre y los anzuelos
- `HOME.VIEW_FRONT_DESC` — de frente, con la cabeza hacia usted
- `HOME.VIEW_BACK_DESC` — desde atrás, con la cola hacia usted
- `HOME.MODEL_ALT` — El señuelo Alure en vista 3D, modelo {nom}. Nada sin avanzar. Vista: {vue}.

## 4. PRODUCT — page /leurre

- `PRODUCT.TITLE` — Señuelo articulado de 2 secciones — {prixSolo} con envío incluido
- `PRODUCT.DESCRIPTION` — El señuelo Alure: articulado en dos secciones, pensado para los depredadores. {prixSolo} el señuelo, o la colección de {nbColoris} colores por {prixCollection} con el color collector de regalo. Envío incluido ({delai}), pago con tarjeta o PayPal, 14 días de desistimiento.
- `PRODUCT.SPECS` — {longueur} · {poids}
- `PRODUCT.COLORWAY_LABEL` — Color:
- `PRODUCT.SOLD_OUT` — Agotado
- `PRODUCT.DELIVERY_BANNER` — Entrega en {delai}
- `PRODUCT.DELAY_VALUE` — 10 a 20 días laborables
- `PRODUCT.BUY` — Comprar
- `PRODUCT.BUY_LOADING` — Redirigiendo al pago…
- `PRODUCT.BUY_LOADING_SHORT` — Redirigiendo…
- `PRODUCT.PAYMENT_HINT` — Pago con tarjeta o PayPal, a través de Stripe.
- `OFFER.SOLO_TITLE` — Un señuelo
- `OFFER.SOLO_DETAIL` — El color {coloris}.
- `OFFER.COLLECTION_TITLE` — La colección
- `OFFER.COLLECTION_DETAIL` — Los {nbColoris} colores + el {collector} de regalo.
- `OFFER.PER_LURE_EXACT` — Sale a {montant} el señuelo.
- `OFFER.PER_LURE_AT_MOST` — Sale a menos de {montant} el señuelo.
- `OFFER.LEGEND` — Su oferta
- `OFFER.RULE` — Un señuelo comprado, los otros dos por el precio de uno
- `PROGRESS.STEP_FIRST` — Su primer señuelo
- `PROGRESS.STEP_OTHERS` — Los otros dos por el precio de uno
- `PROGRESS.STEP_OTHERS_DONE` — +{montant} — los 3 colores son suyos
- `PROGRESS.STEP_COLLECTOR` — El {collector}
- `PROGRESS.COLLECTOR_DONE` — de regalo con su colección
- `PROGRESS.COLLECTOR_TODO` — de regalo al reunir los 3 colores
- `PAYMENT.CARD` — Tarjeta bancaria
- `PAYMENT.PAYPAL` — PayPal
- `PAYMENT.SAFETY` — El pago se hace en Stripe: sus datos bancarios nunca pasan por esta web.
- `PRODUCT.COLLECTOR_LOCKED` — Elija la colección para desbloquear el {collector}.
- `PRODUCT.COLLECTOR_EARNED` — El {collector} va de regalo con su pedido.
- `PRODUCT.VIEWER_NO_WEBGL` — Su navegador no muestra 3D. La descripción de al lado detalla el señuelo.
- `PRODUCT.COLLECTOR_ALT` — El señuelo collector de Alure en vista 3D, modelo {nom}, de regalo con la colección completa. Nada sin avanzar.
- `PRODUCT.REASSURANCE_RETURN` — 14 días de desistimiento
- `PRODUCT.REASSURANCE_PAYMENT` — Pago con Stripe o PayPal
- `PRODUCT.REASSURANCE_TRACKING` — Seguimiento del pedido por correo

## 5. PRICING

- `PRICING.RULE` — Un señuelo comprado, los otros dos por el precio de uno
- `PRICING.TAX_LINE` — envío incluido · TVA non applicable, art. 293 B du CGI (IVA no aplicable).
- `PRICING.SAVINGS` — Ahorra {montant}.

## 6. FAQ

- `FAQ.Q_DELIVERY_TIME` — ¿Cuáles son los plazos de entrega?
- `FAQ.A_DELIVERY_TIME` — Cuente con {delai} desde su pedido. Enviamos desde nuestro proveedor, lo que explica ese plazo y el precio del señuelo. El plazo se anuncia antes de la compra y se recuerda en su correo de confirmación.
- `FAQ.Q_SHIPPING_COST` — ¿Cuánto cuesta el envío?
- `FAQ.A_SHIPPING_COST` — Nada: el envío a Francia está incluido en el precio mostrado, sea cual sea la oferta elegida.
- `FAQ.Q_BULK` — ¿Baja el precio si compro varios?
- `FAQ.A_BULK` — Sí, y bastante. Un señuelo solo cuesta {prixSolo}. La colección de {nbColoris} colores cuesta {prixCollection} — un señuelo comprado, los otros dos por el precio de uno — y el {collector} va de regalo. El total se muestra antes del pago, con el envío incluido.
- `FAQ.Q_SIZE` — ¿Qué tamaño y qué peso tiene el señuelo?
- `FAQ.A_SIZE` — {longueur} y {poids}. Es un formato compacto: pasa bien con equipo ligero y pesca igual de bien a recuperación lineal que animado.
- `FAQ.Q_TRACK` — ¿Cómo sigo mi pedido?
- `FAQ.A_TRACK` — En cuanto sale el envío, recibe por correo un número de seguimiento internacional. La página Seguimiento del pedido detalla cada etapa, de la confirmación a la entrega.
- `FAQ.Q_RETURN` — ¿Puedo cambiar de opinión después de recibirlo?
- `FAQ.A_RETURN` — Sí. Dispone de 14 días desde la recepción para desistir, sin justificación. Devuelva el señuelo sin usar en su embalaje y le reembolsamos el importe íntegro al recibirlo. Los gastos de devolución corren por su cuenta.
- `FAQ.Q_LOST` — ¿Y si mi paquete no llega?
- `FAQ.A_LOST` — Si su pedido no se entrega en 30 días hábiles, escríbanos respondiendo a su correo de confirmación: le enviamos otro señuelo o le reembolsamos, lo que prefiera.
- `FAQ.Q_PAYMENT` — ¿Qué medios de pago aceptan?
- `FAQ.A_PAYMENT` — Tarjeta bancaria y PayPal. El pago pasa por Stripe, que lo cifra de extremo a extremo: su número de tarjeta nunca transita por nuestra web.
- `FAQ.Q_WHO` — ¿Quién es Alure?
- `FAQ.A_WHO` — Una microempresa francesa llevada por pescadores de depredadores. Vendemos un solo señuelo, el que hemos elegido, en lugar de un catálogo entero.

## 7. TRACKING — page /suivi

- `TRACKING.TITLE` — Seguimiento del pedido
- `TRACKING.INTRO` — En cuanto sale el envío, recibe un número de seguimiento internacional por correo. Esto es lo que significa cada etapa.

## 8. THANKS — page /merci

- `THANKS.TITLE` — Gracias por su pedido
- `THANKS.BODY` — Si su pago se ha validado, recibirá un correo de confirmación en los próximos minutos. Ese correo es el que da fe.
- `THANKS.CTA` — Volver al inicio

## 9. CONTACT

- `CONTACT.TITLE` — Escríbanos
- `CONTACT.ORDER_NUMBER` — Número de pedido (opcional)
- `CONTACT.EMAIL` — Su correo electrónico
- `CONTACT.MESSAGE` — Su mensaje
- `CONTACT.SUBMIT` — Enviar mi solicitud
- `CONTACT.SENDING` — Enviando…
- `CONTACT.SUCCESS` — Su mensaje ha sido enviado. Le responderemos a la dirección indicada.
- `CONTACT.ERROR` — Su mensaje no se ha enviado. Inténtelo de nuevo en un momento.

## 10. LEGAL

- `LEGAL.NOTICE_TITLE` — Aviso legal
- `LEGAL.TERMS_TITLE` — Condiciones generales de venta
- `LEGAL.WITHDRAWAL_TITLE` — Derecho de desistimiento
- `LEGAL.PRIVACY_TITLE` — Política de privacidad
- `LEGAL.TRANSLATION_DISCLAIMER` — El aviso legal y las condiciones generales de venta dan fe en su versión francesa. Esta traducción es orientativa y no tiene valor contractual.

## 11. EMAILS

### Confirmación para el cliente

- `EMAIL.CONFIRM_SUBJECT` — Su pedido de Alure está confirmado
- `EMAIL.CONFIRM_GREETING` — Hola:
- `EMAIL.CONFIRM_LEAD` — Su pedido está confirmado. Gracias por su confianza.
- `EMAIL.CONFIRM_RECAP` — Resumen:
- `EMAIL.CONFIRM_COLORWAY` — Color: {coloris}
- `EMAIL.CONFIRM_OFFER` — Oferta: {offre}
- `EMAIL.CONFIRM_TOTAL` — Total pagado: {montant} (envío incluido — TVA non applicable, art. 293 B du CGI [IVA no aplicable])
- `EMAIL.CONFIRM_DELIVERY` — Entrega: {delai}, como se anunció antes de su compra.
- `EMAIL.CONFIRM_TRACKING` — En cuanto salga el envío, recibirá el número de seguimiento por correo.
- `EMAIL.CONFIRM_WITHDRAWAL` — Dispone de un derecho de desistimiento de 14 días desde la recepción.

### Notificación interna (nunca se traduce — la lee Camil)

- `EMAIL.INTERNAL_SUBJECT` — Commande à traiter — {resume}

## 12. STATES

- `STATES.LOADING` — Cargando…
- `STATES.FORM_INVALID` — Elija un color y una oferta.
- `STATES.PAYMENT_FAILED` — El pago no ha podido iniciarse. Inténtelo de nuevo en un momento.
- `STATES.PAYMENT_UNAVAILABLE` — El pago no está disponible por el momento. Inténtelo más tarde.
- `STATES.PAYMENT_BAD_RESPONSE` — Respuesta de pago no válida. Inténtelo de nuevo en un momento.
- `STATES.PAYMENT_OFFLINE` — El pago no ha podido iniciarse (conexión interrumpida). Inténtelo de nuevo.
- `STATES.RATE_LIMITED` — Demasiados intentos. Inténtelo de nuevo dentro de un minuto.
- `STATES.NOT_FOUND_TITLE` — Página no encontrada
- `STATES.NOT_FOUND_BODY` — Esta página no existe o ya no existe.
- `STATES.NOT_FOUND_CTA` — Volver al inicio

## 13. LANG_SWITCHER

- `LANG.LABEL` — Cambiar de idioma — actualmente Español
- `LANG.FR` — Français
- `LANG.EN` — English
- `LANG.ES` — Español
- `LANG.DE` — Deutsch
- `LANG.NL` — Nederlands
