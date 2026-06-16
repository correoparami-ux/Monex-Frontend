import warningIcon from "../../assets/icon/logoWarning.png";
import "../../css/components/DeleteCategoryModal.css";

export function DeleteCategoryModal({
    categoria,
    cerrarModal,
    eliminarCategoriaConfirmada,
}) {
    return (
        <div className="modal_overlay">
            <div className="modal_eliminar">

                <img
                    src={warningIcon}
                    alt="warning"
                    className="icono_warning"
                />

                <h2>
                    ¿Estás seguro que deseas eliminar esta categoría?
                </h2>

                <p className="texto_advertencia">
                    Esta acción no se puede deshacer.
                </p>

                <div className="info_categoria_eliminar">
                    <p>
                        <strong>Nombre:</strong>{" "}
                        {categoria?.name || categoria?.nombre}
                    </p>
                    <p>
                        <strong>Descripción:</strong>{" "}
                        {categoria?.description ||
                            categoria?.descripcion ||
                            "Sin descripción"}
                    </p>
                </div>

                <div className="modal_botones">
                    <button
                        className="btn_cancelar_modal"
                        onClick={cerrarModal}
                    >
                        Cancelar
                    </button>

                    <button
                        className="btn_confirmar_eliminar"
                        onClick={() =>
                            eliminarCategoriaConfirmada(categoria.id)
                        }
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}