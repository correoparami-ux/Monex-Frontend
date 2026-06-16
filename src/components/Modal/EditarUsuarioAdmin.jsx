import React from "react";
import "../../css/components/EditarUsuarioAdmin.css";

export function EditarUsuarioAdmin({
    usuario,
    cerrarModal,
    rolEditado,
    setRolEditado,
    guardarCambios,
    guardando,
}) {
    if (!usuario) return null;

    const roleOptions = [
        { value: "USER", label: "USER" },
        { value: "ADMIN", label: "ADMIN" },
    ];

    const obtenerRolUsuario = (usuario) => {
        if (!usuario) return "USER";

        let rol = "";

        if (usuario.role) rol = usuario.role;
        else if (usuario.rol) rol = usuario.rol;
        else if (Array.isArray(usuario.roles) && usuario.roles.length > 0) {
            const first = usuario.roles[0];

            if (typeof first === "string") {
                rol = first;
            } else if (typeof first === "object") {
                rol = first.name || first.role || first.rol || "";
            }
        } else if (typeof usuario.roles === "string") {
            rol = usuario.roles;
        }

        const rolNormalizado = String(rol || "USER").trim().toUpperCase();

        return rolNormalizado === "ADMIN" ? "ADMIN" : "USER";
    };

    const currentRole =
        String(rolEditado || obtenerRolUsuario(usuario) || "USER")
            .trim()
            .toUpperCase() === "ADMIN"
            ? "ADMIN"
            : "USER";

    const cambiarRol = (e) => {
        const nuevoRol = e.target.value.toUpperCase();

        if (nuevoRol === "USER" || nuevoRol === "ADMIN") {
            setRolEditado(nuevoRol);
        }
    };

    return (
        <div className="modal_overlay">
            <div className="modal_editar_usuario">
                <button className="btn_cerrar_modal" onClick={cerrarModal} disabled={guardando}>
                    X
                </button>

                <h2>Editar rol de usuario</h2>

                <p className="modal_texto">
                    {usuario.username || usuario.name || usuario.email || "Usuario"}
                </p>

                <label>Rol</label>

                <select value={currentRole} onChange={cambiarRol} disabled={guardando}>
                    {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="modal_botones">
                    <button className="btn_cancelar_modal" onClick={cerrarModal} disabled={guardando}>
                        Cancelar
                    </button>

                    <button className="btn_guardar_modal" onClick={guardarCambios} disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}