import warningIcon from "../../assets/icon/logoWarning.png";
import "../../css/components/DeleteExpenseModal.css";

export function DeleteExpenseModal({
    gasto,
    cerrarModal,
    eliminarGastoConfirmado,
}) {
    return (
        <div className="modal_overlay">
            <div className="modal_eliminar_gasto">

                <img
                    src={warningIcon}
                    alt="warning"
                    className="icono_warning"
                />

                <h2>
                    ¿Estás seguro que deseas eliminar este gasto?
                </h2>

                <p className="texto_advertencia">
                    Esta acción no se puede deshacer.
                </p>

                <div className="info_gasto_eliminar">

                    <p>
                        <strong>Nombre:</strong>{" "}
                        {gasto?.name || "Sin nombre"}
                    </p>

                    <p>
                        <strong>Categoría:</strong>{" "}
                        {gasto?.categoryName ||
                            gasto?.category?.name ||
                            `Categoría ${gasto?.categoryId}`}
                    </p>

                    <p>
                        <strong>Monto:</strong>{" "}
                        {gasto?.amount
                            ? Number(gasto.amount).toLocaleString("es-CL", {
                                  style: "currency",
                                  currency: "CLP",
                              })
                            : "$0"}
                    </p>

                    <p>
                        <strong>Fecha:</strong>{" "}
                        {gasto?.date || "Sin fecha"}
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
                            eliminarGastoConfirmado(gasto.id)
                        }
                    >
                        Sí, eliminar
                    </button>

                </div>
            </div>
        </div>
    );
}