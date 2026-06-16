import iconoNombre from "../../assets/icon/editarCategoriaNombre.png";
import iconoDescripcion from "../../assets/icon/editarCategoriaDescripcion.png";
import "../../css/components/AddCategoryModal.css";

export function AddCategoryModal({
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    cerrarModal,
    guardarCategoria,
}) {
    return (
        <div className="modal_overlay">
            <div className="modal_agregar">
                <button className="btn_cerrar_modal" onClick={cerrarModal}>
                    X
                </button>

                <h2>Registrar categoría</h2>

                <label>Nombre</label>
                <div className="input_con_icono_modal">
                    <input
                        type="text"
                        placeholder="Ej: Almuerzo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                    <img src={iconoNombre} alt="nombre" />
                </div>

                <label>Descripción</label>
                <div className="input_con_icono_modal">
                    <input
                        type="text"
                        placeholder="Ej: Descripción del gasto"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                    <img src={iconoDescripcion} alt="descripcion" />
                </div>

                <div className="modal_botones">
                    <button className="btn_cancelar_modal" onClick={cerrarModal}>
                        Cancelar
                    </button>

                    <button className="btn_guardar_modal" onClick={guardarCategoria}>
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}