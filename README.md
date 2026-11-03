# MingaMax

Calculadora de gastos compartidos: app web para dividir los gastos de una salida (de pesca o de lo que sea) entre 2 a 5 personas:

- Cada gasto tiene quién lo pagó y quiénes lo comparten.
- Calcula el total, cuánto pagó y cuánto le toca a cada uno, y los pagos mínimos para quedar a mano.
- Guarda el alias o CBU de cada participante.
- Genera un PDF con el detalle para compartir por WhatsApp.
- Funciona sin conexión y se puede instalar en el celular o la laptop.

Los datos quedan guardados solo en el navegador de cada dispositivo.

## Instalar

- **Android (Chrome):** abrir la página, menú ⋮ → *Agregar a la pantalla principal* / *Instalar app*.
- **Laptop (Chrome o Edge):** ícono de instalar en la barra de direcciones.

Después de abrirla una vez con internet, funciona sin conexión.

## Publicar cambios

1. Editar `index.html`.
2. Subir `CACHE_VERSION` en `sw.js` y `APP_VERSION` en `index.html` (la versión se ve abajo de todo en la app).
3. Commit y push a `main`. GitHub Pages publica solo.

Los dispositivos toman la versión nueva al abrir la app con conexión.

## Archivos

- `index.html`: la app completa (HTML, CSS y JS).
- `sw.js`: service worker para el modo sin conexión.
- `manifest.webmanifest` e `icons/`: datos para instalarla.
- `vendor/jspdf.umd.min.js`: jsPDF 2.5.1 (licencia MIT), para generar el PDF.
