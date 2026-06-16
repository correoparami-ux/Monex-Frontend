import iconoNombre from "../../assets/icon/editarCategoriaNombre.png";
import iconoDescripcion from "../../assets/icon/editarCategoriaDescripcion.png";
import "../../css/components/EditcategoriesModal.css";

export function EditcategoriesModal({
    nombreEditado,
    setNombreEditado,
    descripcionEditada,
    setDescripcionEditada,
    cerrarModalEditar,
    guardarCambios,
}) {
    return (
        <div className="modal_overlay">
            <div className="modal_editar">
                <button
                    className="btn_cerrar_modal"
                    onClick={cerrarModalEditar}
                >
                    X
                </button>

                <h2>Editar categoría</h2>

                <label>Nombre</label>
                <div className="input_con_icono_modal">
                    <input
                        type="text"
                        value={nombreEditado}
                        placeholder="Ej: Almuerzo"
                        onChange={(e) => setNombreEditado(e.target.value)}
                    />
                    <img src={iconoNombre} alt="Editar nombre" />
                </div>

                <label>Descripción</label>
                <div className="input_con_icono_modal">
                    <input
                        type="text"
                        value={descripcionEditada}
                        placeholder="Ej: Descripción del gasto"
                        onChange={(e) => setDescripcionEditada(e.target.value)}
                    />
                    <img src={iconoDescripcion} alt="Editar descripción" />
                </div>

                <div className="modal_botones">
                    <button
                        className="btn_cancelar_modal"
                        onClick={cerrarModalEditar}
                    >
                        Cancelar
                    </button>

                    <button
                        className="btn_guardar_modal"
                        onClick={guardarCambios}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}