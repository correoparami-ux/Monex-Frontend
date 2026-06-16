const API_URL = `${import.meta.env.VITE_EXPENSES_API_URL}/api/expenses`;

function obtenerToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No hay token guardado. Debes iniciar sesión primero.");
    }

    return token;
}

export const crearGasto = async (gasto) => {
    const token = obtenerToken();

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gasto),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error backend:", errorText);
        console.error("Status:", response.status);
        throw new Error(errorText || "Error al crear gasto");
    }

    return await response.json();
};

export const obtenerGastos = async () => {
    const token = obtenerToken();

    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error backend:", errorText);
        console.error("Status:", response.status);
        throw new Error(errorText || "Error al obtener gastos");
    }

    return await response.json();
};

export const obtenerGastosPaginados = async ({
    page = 0,
    size = 5,
    categoryId = null,
    paymentMethod = null,
    startDate = null,
    endDate = null,
} = {}) => {
    const token = obtenerToken();

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("size", size);

    if (categoryId) {
        params.append("categoryId", categoryId);
    }

    if (paymentMethod) {
        params.append("paymentMethod", paymentMethod);
    }

    if (startDate) {
        params.append("startDate", startDate);
    }

    if (endDate) {
        params.append("endDate", endDate);
    }

    const response = await fetch(`${API_URL}/paginadas?${params.toString()}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error backend:", errorText);
        console.error("Status:", response.status);
        throw new Error(errorText || "Error al obtener gastos paginados");
    }

    return await response.json();
};

export const obtenerEstimacionMensual = async () => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/monthly-estimate`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error backend:", errorText);
        console.error("Status:", response.status);
        throw new Error(errorText || "Error al obtener estimación mensual");
    }

    return await response.json();
};

export const actualizarGasto = async (id, gasto) => {
    const token = obtenerToken();

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gasto),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error backend:", errorText);
        console.error("Status:", response.status);
        throw new Error(errorText || "Error al actualizar gasto");
    }

    return await response.json();
};