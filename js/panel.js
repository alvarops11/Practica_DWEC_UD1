const estado = document.getElementById("estadoPanel");
const datosPanel = document.getElementById("datosPanel");
const totalPanel = document.getElementById("totalPanel");
const presencialPanel = document.getElementById("presencialPanel");
const onlinePanel = document.getElementById("onlinePanel");
const ultimaInscripcion = document.getElementById("ultimaInscripcion");
const origenPadre = window.location.origin;

function esResumenValido(mensaje) {
    if (
        mensaje === null ||
        typeof mensaje !== "object" ||
        Array.isArray(mensaje)
    ) {
        return false;
    }
    if (mensaje.tipo !== "resumen") {
        return false;
    }

    const datos = mensaje.datos;
    if (
        datos === null ||
        typeof datos !== "object" ||
        Array.isArray(datos)
    ) {
        return false;
    }
    if (!Number.isInteger(datos.total) || datos.total < 0) {
        return false;
    }
    if (!Number.isInteger(datos.presencial) || datos.presencial < 0) {
        return false;
    }
    if (!Number.isInteger(datos.online) || datos.online < 0) {
        return false;
    }
    if (datos.presencial + datos.online !== datos.total) {
        return false;
    }
    if (datos.ultimo === null) {
        return datos.total === 0;
    }

    const ultimo = datos.ultimo;
    if (
        ultimo === null ||
        typeof ultimo !== "object" ||
        Array.isArray(ultimo)
    ) {
        return false;
    }
    if (
        typeof ultimo.nombre !== "string" ||
        ultimo.nombre.trim().length < 2 ||
        ultimo.nombre.length > 60
    ) {
        return false;
    }
    if (typeof ultimo.fechaInscripcion !== "string") {
        return false;
    }

    const fecha = new Date(ultimo.fechaInscripcion);
    if (!Number.isFinite(fecha.getTime())) {
        return false;
    }
    if (fecha.toISOString() !== ultimo.fechaInscripcion) {
        return false;
    }
    if (datos.total === 0) {
        return false;
    }
    return true;
}

window.addEventListener("message", (evento) => {
    if (evento.origin !== origenPadre) {
        return;
    }
    if (evento.source !== window.parent) {
        return;
    }
    if (!esResumenValido(evento.data)) {
        return;
    }
    const datos = evento.data.datos;
    totalPanel.textContent = datos.total;
    presencialPanel.textContent = datos.presencial;
    onlinePanel.textContent = datos.online;
    if (datos.ultimo === null) {
        estado.textContent = "Sin inscripciones";
        ultimaInscripcion.textContent = "";
    } else {
        const fecha = new Date(datos.ultimo.fechaInscripcion);
        estado.textContent = "Resumen actualizado";
        ultimaInscripcion.textContent = `Inscripción más reciente: ${datos.ultimo.nombre} · ${fecha.toLocaleString("es-ES")}`;
    }
    datosPanel.hidden = false;
});

// El receptor queda registrado antes de avisar al documento principal.
window.parent.postMessage({ tipo: "panel-preparado" }, origenPadre);
