import warningIcon from "../../assets/icon/logoWarning.png";
import "../../css/components/DeleteUserModal.css";

export function DeleteUserModal({ usuario, cerrarModal, eliminarUsuarioConfirmado }) {
    if (!usuario) return null;

    return (
        <div className="modal_overlay">
            <div className="modal_eliminar_usuario">
                <img src={warningIcon} alt="warning" className="icono_warning" />

                <h2>¿Estás seguro que deseas eliminar este usuario?</h2>

                <p className="texto_advertencia">Esta acción no se puede deshacer.</p>

                <div className="info_usuario_eliminar">
                    <p><strong>Nombre:</strong> {usuario.username || usuario.name || "Sin nombre"}</p>
                    <p><strong>Email:</strong> {usuario.email || "Sin email"}</p>
                    <p><strong>Rol:</strong> {usuario.role || usuario.rol || "Sin rol"}</p>
                </div>

                <div className="modal_botones">
                    <button className="btn_cancelar_modal" onClick={cerrarModal}>
                        Cancelar
                    </button>
                    <button
                        className="btn_confirmar_eliminar"
                        onClick={() => eliminarUsuarioConfirmado(usuario.id || usuario._id)}
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
