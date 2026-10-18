import {
    validarParticipante,
    generarId,
    calcularEstadisticas,
    crearTarjeta,
    leerCookie,
    guardarCookie,
    borrarCookie
} from "./utilidades.js";
import { participantes } from "./datos.js";

const porId = (id) => document.getElementById(id);
const formulario = porId("formulario");
const nombreInput = porId("nombre");
const edadInput = porId("edad");
const tipoInput = porId("tipo");
const experienciaInput = porId("experiencia");
const erroresElemento = porId("errores");
const listado = porId("listado");
const estadoListado = porId("estadoListado");
const busquedaInput = porId("busqueda");
const filtroModalidadInput = porId("filtroModalidad");
const estadoJson = porId("estadoJson");
const datosJson = porId("datosJson");
const iframePanel = porId("panelEvento");
const estadoPreferencias = porId("estadoPreferencias");
const temaInput = porId("tema");
const tamanoInput = porId("tamanoLetra");
const estadoAyuda = porId("estadoAyuda");

const elementosEstadisticas = {
    total: porId("total"), menores: porId("menores"), mayores: porId("mayores"),
    edadMedia: porId("edadMedia"), edadMinima: porId("edadMinima"), edadMaxima: porId("edadMaxima"),
    presencial: porId("presencial"), online: porId("onlineTotal"), estudiantes: porId("estudiantes"),
    profesionales: porId("profesionales"), invitados: porId("invitados"),
    experienciaMediaPresencial: porId("experienciaMediaPresencial"), primerMenor: porId("primerMenor")
};

const elementosNecesarios = [
    formulario,
    nombreInput,
    edadInput,
    tipoInput,
    experienciaInput,
    erroresElemento,
    listado,
    estadoListado,
    busquedaInput,
    filtroModalidadInput,
    estadoJson,
    datosJson,
    iframePanel,
    estadoPreferencias,
    temaInput,
    tamanoInput,
    estadoAyuda,
    elementosEstadisticas.total,
    elementosEstadisticas.menores,
    elementosEstadisticas.mayores,
    elementosEstadisticas.edadMedia,
    elementosEstadisticas.edadMinima,
    elementosEstadisticas.edadMaxima,
    elementosEstadisticas.presencial,
    elementosEstadisticas.online,
    elementosEstadisticas.estudiantes,
    elementosEstadisticas.profesionales,
    elementosEstadisticas.invitados,
    elementosEstadisticas.experienciaMediaPresencial,
    elementosEstadisticas.primerMenor
];

for (const elemento of elementosNecesarios) {
    if (!elemento) {
        throw new Error("Falta un elemento necesario en el HTML del gestor de participantes.");
    }
}

const origenAplicacion = window.location.origin;
const COOKIE_TEMA = "gestorTema";
const COOKIE_TAMANO = "gestorTamano";
const diasPreferencias = 30;
let ventanaAyuda = null;
let panelPreparado = false;

function mostrarErrores(errores) {
    erroresElemento.textContent = Object.values(errores).join(" ");
    formulario.querySelectorAll("[aria-invalid='true']").forEach((campo) => {
        campo.removeAttribute("aria-invalid");
    });
    for (const nombreCampo of Object.keys(errores)) {
        const campo = formulario.querySelector(`[name="${nombreCampo}"]`);
        if (campo) {
            campo.setAttribute("aria-invalid", "true");
        }
    }
}

function mostrarParticipantes() {
    listado.replaceChildren();
    const textoBusqueda = busquedaInput.value.trim().toLocaleLowerCase("es");
    const modalidadSeleccionada = filtroModalidadInput.value;
    let mostrados = 0;

    for (const participante of participantes) {
        const coincideNombre = participante.nombre.toLocaleLowerCase("es").includes(textoBusqueda);
        const coincideModalidad = modalidadSeleccionada === "" || participante.modalidad === modalidadSeleccionada;
        if (coincideNombre && coincideModalidad) {
            listado.append(crearTarjeta(participante));
            mostrados++;
        }
    }

    estadoListado.textContent = mostrados === 0
        ? (participantes.length === 0 ? "No hay participantes inscritos." : "No hay participantes que coincidan con la búsqueda.")
        : `${mostrados} ${mostrados === 1 ? "participante" : "participantes"} mostrados.`;
}

function actualizarEstadisticas() {
    const estadisticas = calcularEstadisticas(participantes);
    for (const clave of ["total", "menores", "mayores", "presencial", "online", "estudiantes", "profesionales", "invitados", "edadMinima", "edadMaxima"]) {
        elementosEstadisticas[clave].textContent = estadisticas[clave] === null ? "Sin datos" : estadisticas[clave];
    }
    elementosEstadisticas.edadMedia.textContent = estadisticas.edadMedia === null
        ? "Sin datos" : estadisticas.edadMedia.toLocaleString("es-ES", { maximumFractionDigits: 2 });
    elementosEstadisticas.experienciaMediaPresencial.textContent = estadisticas.experienciaMediaPresencial === null
        ? "Sin datos" : estadisticas.experienciaMediaPresencial.toLocaleString("es-ES", { maximumFractionDigits: 2 });
    elementosEstadisticas.primerMenor.textContent = estadisticas.primerMenor === null ? "Ninguno" : estadisticas.primerMenor.nombre;
}

function crearResumenPanel() {
    let ultimo = null;
    for (const participante of participantes) {
        if (
            ultimo === null ||
            new Date(participante.fechaInscripcion) > new Date(ultimo.fechaInscripcion)
        ) {
            ultimo = participante;
        }
    }
    const estadisticas = calcularEstadisticas(participantes);
    return {
        total: participantes.length,
        presencial: estadisticas.presencial,
        online: estadisticas.online,
        ultimo: ultimo === null ? null : { nombre: ultimo.nombre, fechaInscripcion: ultimo.fechaInscripcion }
    };
}

function enviarResumenPanel() {
    if (panelPreparado && iframePanel.contentWindow) {
        iframePanel.contentWindow.postMessage({ tipo: "resumen", datos: crearResumenPanel() }, origenAplicacion);
    }
}

function actualizarInterfaz() {
    mostrarParticipantes();
    actualizarEstadisticas();
    enviarResumenPanel();
}

function convertirNumero(texto) {
    return texto.trim() === "" ? "" : Number(texto);
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const modalidad = formulario.querySelector("input[name='modalidad']:checked");
    const nuevoParticipante = {
        nombre: nombreInput.value.trim(), edad: convertirNumero(edadInput.value), tipo: tipoInput.value,
        modalidad: modalidad ? modalidad.value : "", experiencia: convertirNumero(experienciaInput.value)
    };
    const errores = validarParticipante(nuevoParticipante);
    if (Object.keys(errores).length > 0) {
        mostrarErrores(errores);
        return;
    }
    try {
        nuevoParticipante.id = generarId(participantes);
    } catch (error) {
        mostrarErrores({ id: "No se ha podido generar un identificador único. Inténtalo de nuevo." });
        return;
    }
    nuevoParticipante.fechaInscripcion = new Date().toISOString();
    participantes.push(nuevoParticipante);
    formulario.reset();
    mostrarErrores({});
    actualizarInterfaz();
});

listado.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) {
        return;
    }
    const boton = evento.target.closest(".borrarParticipante");
    if (!boton) {
        return;
    }
    const id = Number(boton.dataset.id);
    const indice = participantes.findIndex((participante) => participante.id === id);
    if (indice === -1) {
        return;
    }
    if (!window.confirm(`¿Quieres borrar a ${participantes[indice].nombre}?`)) {
        return;
    }
    participantes.splice(indice, 1);
    actualizarInterfaz();
});

busquedaInput.addEventListener("input", mostrarParticipantes);
filtroModalidadInput.addEventListener("change", mostrarParticipantes);

function validarColeccionImportada(valor) {
    if (!Array.isArray(valor)) {
        throw new Error("El JSON debe contener un array de participantes.");
    }
    const ids = [];
    for (let indice = 0; indice < valor.length; indice++) {
        const participante = valor[indice];
        if (
            participante === null ||
            typeof participante !== "object" ||
            Array.isArray(participante)
        ) {
            throw new Error(`El elemento ${indice + 1} no es un objeto de participante.`);
        }
        const errores = validarParticipante(participante);
        if (Object.keys(errores).length > 0) {
            throw new Error(
                `Participante ${indice + 1}: ${Object.values(errores).join(" ")}`
            );
        }
        if (
            !Number.isInteger(participante.id) ||
            participante.id < 100000 ||
            participante.id > 999999
        ) {
            throw new Error(`El identificador del participante ${indice + 1} debe ser un entero entre 100000 y 999999.`);
        }
        let idRepetido = false;
        for (const idGuardado of ids) {
            if (idGuardado === participante.id) {
                idRepetido = true;
                break;
            }
        }
        if (idRepetido) {
            throw new Error(
                `El identificador ${participante.id} está repetido.`
            );
        }
        ids.push(participante.id);
        if (typeof participante.fechaInscripcion !== "string") {
            throw new Error(`La fecha del participante ${indice + 1} debe ser un texto ISO.`);
        }
        const fecha = new Date(participante.fechaInscripcion);
        if (
            !Number.isFinite(fecha.getTime()) ||
            fecha.toISOString() !== participante.fechaInscripcion
        ) {
            throw new Error(`La fecha del participante ${indice + 1} no es válida.`);
        }
    }
    return valor;
}

porId("exportarJson").addEventListener("click", () => {
    datosJson.value = JSON.stringify(participantes, null, 2);
    estadoJson.textContent = "Colección completa exportada al área de texto.";
});

porId("importarJson").addEventListener("click", () => {
    try {
        const importados = validarColeccionImportada(JSON.parse(datosJson.value));
        participantes.length = 0;
        for (const participante of importados) participantes.push(participante);
        estadoJson.textContent = `Importación correcta: ${participantes.length} participantes.`;
        actualizarInterfaz();
    } catch (error) {
        let mensaje = error.message;
        if (error instanceof SyntaxError) {
            mensaje = "El texto no es JSON válido.";
        }
        estadoJson.textContent = `No se ha importado la colección. ${mensaje}`;
    }
});

function aplicarPreferencias(tema, tamano) {
    document.documentElement.dataset.tema = tema;
    document.documentElement.dataset.tamano = tamano;
    temaInput.value = tema;
    tamanoInput.value = tamano;
}

function leerPreferencias() {
    const temaGuardado = leerCookie(COOKIE_TEMA);
    const tamanoGuardado = leerCookie(COOKIE_TAMANO);
    const temaValido = temaGuardado === "claro" || temaGuardado === "oscuro";
    const tamanoValido = tamanoGuardado === "normal" || tamanoGuardado === "grande";
    aplicarPreferencias(temaValido ? temaGuardado : "claro", tamanoValido ? tamanoGuardado : "normal");
}

porId("guardarPreferencias").addEventListener("click", () => {
    const tema = temaInput.value;
    const tamano = tamanoInput.value;
    aplicarPreferencias(tema, tamano);
    guardarCookie(COOKIE_TEMA, tema, diasPreferencias);
    guardarCookie(COOKIE_TAMANO, tamano, diasPreferencias);
    const guardadas = leerCookie(COOKIE_TEMA) === tema && leerCookie(COOKIE_TAMANO) === tamano;
    estadoPreferencias.textContent = guardadas
        ? "Preferencias aplicadas y guardadas durante 30 días."
        : "Preferencias aplicadas durante esta visita, pero el navegador no permitió guardarlas.";
});

porId("restablecerPreferencias").addEventListener("click", () => {
    borrarCookie(COOKIE_TEMA);
    borrarCookie(COOKIE_TAMANO);
    aplicarPreferencias("claro", "normal");
    const borradas = leerCookie(COOKIE_TEMA) === null && leerCookie(COOKIE_TAMANO) === null;
    estadoPreferencias.textContent = borradas
        ? "Preferencias predeterminadas aplicadas; cookies eliminadas."
        : "Preferencias predeterminadas aplicadas; el navegador no permitió confirmar la eliminación.";
});

window.addEventListener("message", (evento) => {
    if (evento.origin !== origenAplicacion) {
        return;
    }
    if (evento.source === iframePanel.contentWindow) {
        if (
            evento.data === null ||
            typeof evento.data !== "object" ||
            Array.isArray(evento.data) ||
            evento.data.tipo !== "panel-preparado"
        ) {
            return;
        }
        panelPreparado = true;
        enviarResumenPanel();
    }
});

iframePanel.addEventListener("load", () => {
    panelPreparado = false;
});

porId("abrirAyuda").addEventListener("click", () => {
    if (ventanaAyuda === null || ventanaAyuda.closed) {
        ventanaAyuda = window.open("./ayuda.html", "ayudaGestor", "width=760,height=680,resizable=yes,scrollbars=yes");
    }
    if (ventanaAyuda === null) {
        estadoAyuda.textContent = "El navegador bloqueó la ventana de ayuda. Permite ventanas emergentes para este sitio.";
    } else {
        ventanaAyuda.focus();
        estadoAyuda.textContent = "Ventana de ayuda abierta.";
    }
});

porId("cerrarAyuda").addEventListener("click", () => {
    if (ventanaAyuda !== null && !ventanaAyuda.closed) {
        ventanaAyuda.close();
        estadoAyuda.textContent = "Ventana de ayuda cerrada.";
    } else {
        estadoAyuda.textContent = "La ventana de ayuda ya está cerrada.";
    }
});

leerPreferencias();
actualizarInterfaz();
