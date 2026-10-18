# Gestor de participantes · DWEC UD1

Aplicación cliente para gestionar inscripciones de un evento. Usa HTML, CSS y JavaScript nativo en módulos ES; no requiere Node.js ni dependencias de ejecución.

## Ejecución

Sirve la carpeta raíz mediante HTTP y abre `index.html` con el mismo host y puerto que `panel.html` y `ayuda.html`. Por ejemplo, en Visual Studio Code se puede iniciar **Live Server** desde `index.html`. También se puede ejecutar `python -m http.server 8000` desde la raíz y abrir `http://localhost:8000/`. No abras los archivos con `file://`: los módulos, las cookies y la comunicación del iframe necesitan un origen HTTP consistente.

## Estructura y funcionalidades

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Formulario, listado, estadísticas, JSON, preferencias y panel incrustado. Carga `js/app.js` como módulo cuando el HTML ya se ha analizado. |
| `css/estilos.css` | Estilos adaptables, tema claro/oscuro y tamaño de letra. |
| `js/app.js` | Interfaz, validación de importación, eventos, cookies, ventana de ayuda y protocolo de mensajes del panel. |
| `js/utilidades.js` | Validación del formulario, IDs, estadísticas, tarjetas y operaciones de cookies. La validación y el cálculo no consultan el DOM. |
| `js/datos.js` | Tres participantes de ejemplo en memoria. Los cambios de la colección se pierden al recargar. |
| `panel.html`, `js/panel.js` | Resumen aislado en iframe. El hijo registra su receptor y avisa de que está listo; el principal envía el resumen con `postMessage`. Ambos lados validan origen, ventana emisora y estructura. |
| `ayuda.html`, `js/ayuda.js` | Ayuda e información descriptiva de `navigator.language`, `location.origin` y `screen.width`/`screen.height`. |
| `docs/arquitectura-y-funcionalidades.md` | Decisiones y funcionamiento técnico del proyecto. |

### Alta, baja, filtros y estadísticas

El alta convierte los números explícitamente y valida todos los campos en `validarParticipante`. Ante errores muestra un resumen y marca los campos, conservando lo escrito. Las tarjetas se construyen con `createElement`, `textContent` y `append`; la baja solicita confirmación. La búsqueda no distingue mayúsculas y minúsculas y se combina con el filtro de modalidad. Si no hay resultados, se indica en el listado. `calcularEstadisticas` recorre la colección completa con bucles, contadores y acumuladores; no depende del filtro.

### JSON

**Exportar colección** escribe `JSON.stringify` en el área de texto. **Importar colección** usa `JSON.parse` dentro de `try/catch`, comprueba que todo sea un array válido, incluidos los IDs únicos y las fechas ISO, y solo entonces sustituye los datos. Un error deja la colección anterior intacta; `[]` es una importación válida.

### Panel, preferencias y ayuda

El panel acepta únicamente mensajes del padre con el origen actual y una estructura de resumen válida. El padre solo acepta el aviso de preparación desde la ventana del iframe. Ambos envíos usan un `targetOrigin` concreto (`location.origin`). Las preferencias se aplican a la interfaz aunque el navegador bloquee cookies; las dos cookies independientes duran 30 días y su guardado y borrado se verifican leyéndolas de nuevo. La ayuda se abre con `window.open`, reutiliza su ventana mientras siga abierta e informa si el navegador bloqueó la apertura.

Las comprobaciones están escritas como pasos separados con `if` y bloques `{}`. Para importar, primero se comprueba el tipo de cada dato, después se valida el ID y luego la fecha. La fecha se considera correcta si `Date` la puede interpretar y `toISOString()` devuelve exactamente el mismo texto. Los IDs repetidos se detectan recorriendo un array.

## Casos de prueba manuales

Realiza las pruebas desde HTTP y con DevTools abierto. Cada caso indica pasos y resultado esperado.

1. **Carga inicial:** abrir `index.html`. Se muestran tres participantes, el total es 3 y el panel del iframe presenta los mismos recuentos y la inscripción más reciente.
2. **Alta válida:** registrar `Lucía Pérez`, edad `17`, tipo `estudiante`, modalidad `presencial` y experiencia `3.5`. Se añade una tarjeta con fecha y hora localizadas; aumentan las estadísticas y se actualiza el iframe.
3. **Validación:** probar nombre de un carácter, edad vacía, edad `18.5`, edad `121`, experiencia vacía y experiencia `10.1`; probar también una modalidad sin seleccionar. Cada alta inválida muestra un error, conserva los valores y no altera el total. Edad `0` y experiencia `0` sí son válidas.
4. **Clasificación de experiencia:** dar de alta valores `3.99`, `4`, `6.99` y `7`. Deben verse, respectivamente, Inicial, Intermedia, Intermedia y Avanzada. La edad `17` es menor y `18` es mayor.
5. **Búsqueda y filtro:** buscar `ana` y elegir modalidad presencial; aparece Ana. Cambiar el término a uno inexistente muestra el mensaje de que no hay coincidencias. Borrar la búsqueda y seleccionar Online deja solo participantes online. Las estadísticas no cambian por filtrar.
6. **Baja y cancelación:** pulsar borrar y cancelar en `confirm`; no cambia nada. Repetir y aceptar; solo desaparece el participante elegido y se actualizan estadísticas y panel.
7. **Estadísticas vacías:** exportar, escribir `[]` e importar. Se muestra el estado vacío; edades y medias indican “Sin datos”, el primer menor indica “Ninguno” y el panel indica “Sin inscripciones”.
8. **JSON inválido y entrada hostil:** con una colección visible, importar `{`, `null`, un objeto con edad de texto, un ID fuera de rango, IDs duplicados, una fecha imposible o un elemento extraído a `null`. Aparece un error legible y la lista anterior no cambia. Un array válido con varias personas se importa completo.
9. **Cookies:** elegir tema oscuro y tamaño grande y guardar; ambos cambios se aplican y las cookies `gestorTema` y `gestorTamano` se ven en Application/Storage con `Max-Age`, `Path=/` y `SameSite=Lax`. Recargar y comprobar persistencia. Restablecer elimina las cookies y aplica claro/normal. Borrar manualmente una cookie o cambiar su valor por uno desconocido y recargar: se usa el valor predeterminado para esa preferencia. Repetir en contexto que bloquee cookies: los cambios se aplican a la visita y se informa de que no se guardaron.
10. **Mensajes rechazados:** con DevTools, enviar al iframe un mensaje con origen incorrecto, emisor distinto o estructura incompleta; el panel no cambia ni aparecen excepciones. Enviar al principal un aviso con origen/ventana incorrectos; el panel no queda marcado como preparado.
11. **Ventana de ayuda:** abrir la ayuda, volver a pulsar abrir (se reutiliza), cerrar desde el gestor y volver a cerrar (se informa de que ya estaba cerrada). Si el navegador bloquea pop-ups, se muestra el aviso. Verificar los tres datos del navegador en la página de ayuda.
12. **Depuración y Network:** poner un breakpoint en `validarParticipante` de `js/utilidades.js`, enviar el formulario y explicar las variables observadas. En Network, recargar desde el servidor HTTP y conservar una captura donde se vean las solicitudes correctas para `index.html`, `js/app.js`, `css/estilos.css` y `panel.html`, sin 404. Adjuntar ambas evidencias a la entrega; no se generan automáticamente.

### Comprobación realizada en navegador

El 18/10/2026 se ejecutó la aplicación con servidor HTTP local y Playwright. Se comprobaron la carga inicial y el resumen del iframe; rechazo de un nombre inválido conservando los campos; alta válida y actualización de estadísticas/panel; combinación de búsqueda y filtro; mensaje sin coincidencias; cancelación y confirmación de una baja; exportación, importación válida, rechazo de JSON mal formado sin perder datos e importación del array vacío; persistencia y eliminación de cookies; apertura y cierre de la ayuda. Las páginas, hojas de estilo, módulos, favicon y panel respondieron HTTP 200 y la consola quedó sin errores ni avisos tras añadir el favicon.

La comprobación confirma el funcionamiento de los flujos anteriores, pero no sustituye las capturas personales de depuración y Network que pide la entrega.

## Contenidos de las sesiones del temario

1. **Arquitectura web y JavaScript:** navegador como cliente, servidor HTTP de archivos estáticos y ejecución de la lógica en el cliente.
2. **Primeros programas JavaScript:** sentencias, expresiones, declaraciones con `const` y `let`, tipos y conversiones explícitas.
3. **Tipos, ámbito, conversiones y decisiones:** funciones y ámbito de bloque; validación numérica; `if/else`, ternario y `switch`; truthy/falsy y uso consciente de `||` frente a `??`.
4. **Bucles:** recorridos con `for`, `for...of` y `while`; contadores y acumuladores; `break` al buscar el primer menor y `continue` al omitir online.
5. **Objetos predefinidos JavaScript/navegador:** métodos de String, `Number`, `Math.random`, `Date`, `JSON.stringify`/`JSON.parse`, arrays y colecciones.
6. **Introducción al DOM:** selectores, creación y actualización segura de nodos, eventos, atributos, clases y depuración en DevTools.
7. **Ventanas, contextos y cookies:** `window.open`/`closed`/`close`, `navigator`, `location`, `screen`, cookies y mensajes con `postMessage` entre contextos del mismo origen.

El módulo `type="module"` se carga de forma diferida tras analizar el HTML, por lo que los nodos existen al consultar el DOM. Los módulos limitan sus declaraciones al ámbito del módulo y a las funciones/bloques. Las declaraciones de función tienen hoisting; las variables `let` y `const` no se pueden leer antes de su declaración por su zona temporal muerta. Los módulos y mensajes entre ventanas quedan sujetos al origen (esquema, host y puerto): el iframe comparte el origen del servidor local y aun así se comprueban `origin` y `source`. En JavaScript, `||` sustituye cualquier valor falsy, mientras que `??` solo sustituye `null` o `undefined`; para entradas numéricas se comprueba primero la cadena vacía para no convertirla accidentalmente en cero.

## Uso de IA y evidencias pendientes del autor

El enunciado requiere enlazar el chat, explicar qué decisiones se aceptaron o modificaron y aportar evidencias propias de DevTools. El enlace al chat utilizado es [Práctica DWEC UD1](https://chatgpt.com/g/g-p-6ac77d0f3f748191ac7ce8806d025086-practica-dwec-ud1/project). Añade un breve análisis personal de las decisiones que hayas revisado y de las pruebas/evidencias que hayas realizado. El código de esta práctica debe ser comprendido y modificable por su autor.

- Evidencia del breakpoint: **pendiente de captura y explicación del autor**.
- Evidencia de Network: **pendiente de captura y explicación del autor**.

## Entorno y límites

Los participantes viven solo en memoria y no sobreviven a la recarga; únicamente se persisten las preferencias. La comunicación y las cookies entre las páginas se han diseñado para servirse desde el mismo origen HTTP. La aplicación no usa frameworks ni servicios de servidor.
