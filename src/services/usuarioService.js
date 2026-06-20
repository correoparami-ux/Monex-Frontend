const USERS_BASE_URL = import.meta.env.VITE_USERS_API_URL;

const API_URL = `${USERS_BASE_URL}/api/auth/register`;
const API_CONFIG_TARJETA = `${USERS_BASE_URL}/api/tarjeta/configuracion`;
const API_USERS = `${USERS_BASE_URL}/api/users`;
const API_RECUPERAR = `${USERS_BASE_URL}/api/auth/recuperar`;

export async function registrarUsuario({ username, email, password }) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al registrar usuario");
    }

    return await response.json();
}

export async function obtenerConfiguracionTarjeta() {
    const token = localStorage.getItem("token");

    const response = await fetch(API_CONFIG_TARJETA, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Debe configurar su tarjeta de crédito para acceder a esta información");
    }

    return await response.json();
}

export async function guardarConfiguracionTarjeta({
    fechaFacturacion,
    sueldoMes,
    cupoTarjeta,
}) {
    const token = localStorage.getItem("token");

    const response = await fetch(API_CONFIG_TARJETA, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            fechaFacturacion,
            sueldoMes,
            cupoTarjeta,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al guardar configuración de tarjeta");
    }

    return await response.json();
}

export async function eliminarConfiguracionTarjeta() {
    const token = localStorage.getItem("token");

    const response = await fetch(API_CONFIG_TARJETA, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok && response.status !== 404) {
        const error = await response.text();
        throw new Error(error || "Error al eliminar configuración de tarjeta");
    }

    return response;
}

export async function actualizarRolUsuario(usuario, role) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No hay token de autenticación.");
    }

    const id =
        usuario?.id ||
        usuario?._id ||
        usuario?.userId ||
        usuario?.idUsuario ||
        usuario?.usuarioId ||
        usuario?.usuario_id ||
        usuario?.id_user ||
        usuario?.id_usuario;

    if (!id) {
        throw new Error("No se pudo identificar el usuario.");
    }

    const roleValue = String(role || "").trim().toUpperCase();

    if (roleValue !== "USER" && roleValue !== "ADMIN") {
        throw new Error("Rol inválido. Solo se permite USER o ADMIN.");
    }

    const response = await fetch(`${API_USERS}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            role: roleValue,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Error al actualizar el rol (status ${response.status})`);
    }

    return await response.json();
}

export async function enviarCodigoRecuperacion(email) {
    const response = await fetch(`${API_RECUPERAR}/enviar-codigo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al enviar código de recuperación");
    }

    return await response.json();
}

export async function verificarCodigoRecuperacion(email, codigo) {
    const response = await fetch(`${API_RECUPERAR}/verificar-codigo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, codigo }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Código inválido o expirado");
    }

    return await response.json();
}

export async function cambiarContraseña(email, codigo, newPassword) {
    const response = await fetch(`${API_RECUPERAR}/cambiar-contrasena`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, codigo, newPassword }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al cambiar la contraseña");
    }

    return await response.json();
}