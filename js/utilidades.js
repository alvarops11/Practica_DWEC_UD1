function validarParticipante(datos) { 
    const errores = {};
    if (datos.nombre.trim().lenght <2 || datos.nombre.trim().lenght >60) {
        errores.nombre = "El nombre debe tener entre 2 y 60 caracteres.";
    }

    if(datos.edad < 0 || datos.edad > 120) {
        errores.edad = "La edad debe estar entre 0 y 120 años.";
    }

    if(!["estudiante", "profesional", "invitado"].includes(datos.tipo.toLowerCase())) {
        errores.tipo = "El tipo debe ser 'estudiante', 'profesional' o 'invitado'.";
    }

    if(datos.modalidad.toLowerCase() !== "presencial" && datos.modalidad.toLowerCase() !== "online") {
        errores.modalidad = "La modalidad debe ser 'presencial' o 'online'.";
    }

    if(datos.experiencia < 0 || datos.experiencia > 10) {
        errores.experiencia = "La experiencia debe estar entre 0 y 10.";
    }

    return errores;
}
function generarId(participantes) { /* ... */ }
function calcularEstadisticas(participantes) { /* ... */ }
function crearTarjeta(participante) { /* ... */ }
function leerCookie(nombre) { /* ... */ }
function guardarCookie(nombre, valor, dias) { /* ... */ }
function borrarCookie(nombre) { /* ... */ }