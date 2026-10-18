# Arquitectura y funcionalidades

**Fecha:** 18 de octubre de 2026

**Ámbito:** gestor de participantes DWEC UD1

## Componentes

- `index.html` contiene el formulario, la lista, las estadísticas, el área JSON, las preferencias y el iframe.
- `css/estilos.css` define la presentación adaptable y los temas.
- `js/app.js` coordina eventos, interfaz, importación/exportación, cookies, ventana de ayuda y comunicación con el iframe.
- `js/utilidades.js` contiene validación de participantes, generación de ID, cálculos con bucles, construcción segura de tarjetas y funciones de cookies.
- `js/datos.js` contiene tres participantes iniciales en memoria.
- `panel.html` y `js/panel.js` presentan el resumen recibido por `postMessage`.
- `ayuda.html` y `js/ayuda.js` explican el uso y muestran datos del navegador.
- `favicon.svg` evita la petición automática fallida de `/favicon.ico`.

## Decisiones

La importación valida el array completo antes de sustituir la colección; así un error conserva los datos anteriores. Las tarjetas se construyen con `createElement`, `textContent` y `append`. El panel confirma que su receptor está instalado y los dos contextos validan el origen y la ventana emisora antes de usar los mensajes. Las cookies de tema y tamaño son independientes, duran 30 días y se verifican después de guardar o borrar. La ventana de ayuda reutiliza la misma ventana mientras siga abierta.

Las comprobaciones se escriben con bloques `if` legibles. La importación revisa primero el participante, después sus campos, ID único y fecha. Los IDs repetidos se buscan mediante un recorrido de array. La fecha se comprueba con `Date` y comparando su representación ISO con el texto recibido.

## Verificación

El 18 de octubre de 2026 se ejecutó en un navegador real mediante un servidor HTTP local. Se verificaron el estado inicial, altas válidas e inválidas, filtros, baja cancelada y confirmada, importación/exportación válida, JSON mal formado, importación vacía, cookies, ayuda y resumen del iframe. Tras añadir `favicon.svg`, la consola quedó sin errores ni avisos y las solicitudes de los recursos de la aplicación devolvieron HTTP 200. Los casos reproducibles están en `README.md`.

La aplicación no persiste participantes al recargar; solo conserva preferencias en cookies. Todas las páginas deben servirse desde el mismo origen HTTP. Las capturas personales del breakpoint y de Network, y el análisis propio del uso de IA que exige la práctica, deben añadirse antes de entregar.
