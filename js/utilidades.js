
export function validarParticipante(datos) {
    const errores = {};

    // Comprobar que los datos sean un objeto válido
    if (
        datos === null ||
        typeof datos !== "object" ||
        Array.isArray(datos)
    ) {
        errores.datos = "Los datos del participante no son válidos.";
        return errores;
    }

    // Validar nombre
    if (typeof datos.nombre !== "string") {
        errores.nombre = "El nombre debe ser un texto.";
    } else {
        const nombre = datos.nombre.trim();

        if (nombre.length < 2 || nombre.length > 60) {
            errores.nombre = "El nombre debe tener entre 2 y 60 caracteres.";
        }
    }

    // Validar edad
    if (
        datos.edad === "" ||
        typeof datos.edad !== "number" ||
        !Number.isFinite(datos.edad) ||
        !Number.isInteger(datos.edad) ||
        datos.edad < 0 ||
        datos.edad > 120
    ) {
        errores.edad = "La edad debe ser un número entero entre 0 y 120.";
    }

    // Validar tipo
    if (
        typeof datos.tipo !== "string" ||
        !["estudiante", "profesional", "invitado"].includes(datos.tipo)
    ) {
        errores.tipo =
            "El tipo debe ser 'estudiante', 'profesional' o 'invitado'.";
    }

    // Validar modalidad
    if (
        typeof datos.modalidad !== "string" ||
        !["presencial", "online"].includes(datos.modalidad)
    ) {
        errores.modalidad =
            "La modalidad debe ser 'presencial' o 'online'.";
    }

    // Validar experiencia
    if (
        datos.experiencia === "" ||
        typeof datos.experiencia !== "number" ||
        !Number.isFinite(datos.experiencia) ||
        datos.experiencia < 0 ||
        datos.experiencia > 10
    ) {
        errores.experiencia =
            "La experiencia debe ser un número entre 0 y 10.";
    }

    return errores;
}

export function generarId(participantes) {
    let id;
    let intentos = 0;
    let existe = true;

    while (existe && intentos < 100) {
        id = Math.floor(Math.random() * 900000) + 100000;
        existe = false;

        for (const participante of participantes) {
            if (participante.id === id) {
                existe = true;
                break;
            }
        }

        intentos++;
    }

    if (existe) {
        throw new Error("No se ha podido generar un ID único.");
    }

    return id;
}

export function calcularEstadisticas(participantes) {
    const total = participantes.length;

    let menores = 0;
    let mayores = 0;

    let sumaEdades = 0;
    let edadMinima = Infinity;
    let edadMaxima = -Infinity;

    let presencial = 0;
    let online = 0;

    let estudiantes = 0;
    let profesionales = 0;
    let invitados = 0;

    let sumaExperienciaPresencial = 0;
    let totalExperienciaPresencial = 0;

    let primerMenor = null;

    // Recorrer todos los participantes
    for (const participante of participantes) {

        // Clasificar por edad
        if (participante.edad < 18) {
            menores++;
        } else {
            mayores++;
        }

        // Calcular suma, edad mínima y edad máxima
        sumaEdades += participante.edad;

        if (participante.edad < edadMinima) {
            edadMinima = participante.edad;
        }

        if (participante.edad > edadMaxima) {
            edadMaxima = participante.edad;
        }

        // Contar por modalidad
        if (participante.modalidad === "presencial") {
            presencial++;
        } else if (participante.modalidad === "online") {
            online++;
        }

        // Contar por tipo
        switch (participante.tipo) {
            case "estudiante":
                estudiantes++;
                break;

            case "profesional":
                profesionales++;
                break;

            case "invitado":
                invitados++;
                break;
        }

        // Calcular experiencia de los presenciales
        if (participante.modalidad === "online") {
            continue;
        }

        if (participante.modalidad === "presencial") {
            sumaExperienciaPresencial += participante.experiencia;
            totalExperienciaPresencial++;
        }
    }

    // Buscar al primer menor de edad
    for (const participante of participantes) {
        if (participante.edad < 18) {
            primerMenor = participante;
            break;
        }
    }

    // Calcular edad media
    let edadMedia = null;

    if (total > 0) {
        edadMedia = sumaEdades / total;
    }

    // Calcular experiencia media presencial
    let experienciaMediaPresencial = null;

    if (totalExperienciaPresencial > 0) {
        experienciaMediaPresencial =
            sumaExperienciaPresencial / totalExperienciaPresencial;
    }

    // Comprobar si hay participantes
    if (total === 0) {
        edadMinima = null;
        edadMaxima = null;
    }

    // Devolver todas las estadísticas
    return {
        total: total,
        menores: menores,
        mayores: mayores,
        edadMedia: edadMedia,
        edadMinima: edadMinima,
        edadMaxima: edadMaxima,
        presencial: presencial,
        online: online,
        estudiantes: estudiantes,
        profesionales: profesionales,
        invitados: invitados,
        experienciaMediaPresencial: experienciaMediaPresencial,
        primerMenor: primerMenor
    };
}

export function crearTarjeta(participante) {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("tarjeta");
    tarjeta.dataset.estadoEdad = participante.edad < 18 ? "menor" : "mayor";

    // Nombre
    const nombre = document.createElement("h3");
    nombre.textContent = participante.nombre;
    tarjeta.append(nombre);

    // ID y edad
    const datos = document.createElement("p");
    datos.textContent =
        `ID: ${participante.id} | Edad: ${participante.edad} años`;
    tarjeta.append(datos);

    // Clasificación de edad
    const edad = document.createElement("p");

    if (participante.edad < 18) {
        edad.textContent = "Menor de edad";
        edad.classList.add("etiqueta", "etiqueta-menor");
    } else {
        edad.textContent = "Mayor de edad";
        edad.classList.add("etiqueta", "etiqueta-mayor");
    }

    tarjeta.append(edad);

    // Tipo
    const tipo = document.createElement("p");
    tipo.textContent = `Tipo: ${participante.tipo}`;
    tarjeta.append(tipo);

    // Modalidad
    const modalidad = document.createElement("p");
    modalidad.textContent = `Modalidad: ${participante.modalidad}`;
    tarjeta.append(modalidad);

    // Clasificación de experiencia
    const experiencia = document.createElement("p");
    let nivelExperiencia;

    if (participante.experiencia < 4) {
        nivelExperiencia = "Inicial";
    } else if (participante.experiencia < 7) {
        nivelExperiencia = "Intermedia";
    } else {
        nivelExperiencia = "Avanzada";
    }
    experiencia.classList.add("etiqueta", `experiencia-${nivelExperiencia.toLowerCase()}`);

    experiencia.textContent =
        `Experiencia: ${participante.experiencia} - Nivel ${nivelExperiencia}`;
    tarjeta.append(experiencia);

    // Fecha de inscripción
    const fecha = document.createElement("p");
    const fechaInscripcion = new Date(participante.fechaInscripcion);

    fecha.textContent =
        `Inscripción: ${fechaInscripcion.toLocaleString("es-ES")}`;
    tarjeta.append(fecha);

    // Botón para borrar
    const botonBorrar = document.createElement("button");
    botonBorrar.textContent = "Borrar participante";
    botonBorrar.setAttribute("data-id", participante.id);
    botonBorrar.setAttribute("type", "button");
    botonBorrar.classList.add("borrarParticipante", "boton-secundario");
    tarjeta.append(botonBorrar);

    return tarjeta;
}

export function leerCookie(nombre) {
    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {
        const partes = cookie.split("=");
        const nombreCookie = partes[0];
        const valorCookie = partes.slice(1).join("=");

        if (nombreCookie === encodeURIComponent(nombre)) {
            try {
                return decodeURIComponent(valorCookie);
            } catch (error) {
                return null;
            }
        }
    }

    return null;
}

export function guardarCookie(nombre, valor, dias) {
    const maxAge = dias * 24 * 60 * 60;

    let cookie =
        encodeURIComponent(nombre) + "=" +
        encodeURIComponent(valor) +
        "; Max-Age=" + maxAge +
        "; Path=/; SameSite=Lax";

    if (location.protocol === "https:") {
        cookie += "; Secure";
    }

    document.cookie = cookie;
}

export function borrarCookie(nombre) {
    let cookie =
        encodeURIComponent(nombre) +
        "=; Max-Age=0; Path=/; SameSite=Lax";

    if (location.protocol === "https:") {
        cookie += "; Secure";
    }

    document.cookie = cookie;
}
