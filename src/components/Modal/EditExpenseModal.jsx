import "../../css/components/EditExpenseModal.css";

function EditExpenseModal({
    isOpen,
    categorias,
    nombreEditado,
    setNombreEditado,
    categoriaEditada,
    setCategoriaEditada,
    montoEditado,
    setMontoEditado,
    comisionEditada,
    setComisionEditada,
    fechaEditada,
    setFechaEditada,
    metodoPagoEditado,
    setMetodoPagoEditado,
    cuotasEditadas,
    setCuotasEditadas,
    cerrarModalEditarGasto,
    guardarCambiosGasto
}) {
    if (!isOpen) return null;

    const handleMetodoPagoChange = (e) => {
        const metodo = e.target.value;

        setMetodoPagoEditado(metodo);

        if (metodo !== "CREDITO") {
            setComisionEditada("0");
            setCuotasEditadas("1");
        }
    };

    return (
        <div className="edit-expense-overlay">
            <div className="edit-expense-modal">
                <button
                    type="button"
                    className="edit-expense-close"
                    onClick={cerrarModalEditarGasto}
                >
                    X
                </button>

                <h2>Editar gasto</h2>

                <div className="edit-expense-row">
                    <div className="edit-expense-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            value={nombreEditado}
                            placeholder="Ej: Desayuno"
                            onChange={(e) => setNombreEditado(e.target.value)}
                        />
                    </div>

                    <div className="edit-expense-group">
                        <label>Monto</label>
                        <input
                            type="text"
                            value={montoEditado}
                            placeholder="Ej: 20000"
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setMontoEditado(value);
                            }}
                        />
                    </div>
                </div>

                <div className="edit-expense-row">
                    <div className="edit-expense-group">
                        <label>Categoría</label>
                        <select
                            value={categoriaEditada}
                            onChange={(e) => setCategoriaEditada(e.target.value)}
                        >
                            <option value="">Seleccione una categoría</option>

                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name || cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="edit-expense-group">
                        <label>Fecha del gasto</label>
                        <input
                            type="date"
                            value={fechaEditada}
                            onChange={(e) => setFechaEditada(e.target.value)}
                        />
                    </div>
                </div>

                <div className="edit-expense-row">
                    <div className="edit-expense-group">
                        <label>Comisión (%)</label>
                        <input
                            type="text"
                            value={comisionEditada}
                            placeholder="Ej: 8.50"
                            disabled={metodoPagoEditado !== "CREDITO"}
                            onChange={(e) => {
                                let value = e.target.value;

                                value = value.replace(/[^0-9.]/g, "");

                                const parts = value.split(".");

                                if (parts.length > 2) {
                                    value = parts[0] + "." + parts.slice(1).join("");
                                }

                                setComisionEditada(value);
                            }}
                        />
                    </div>

                    <div className="edit-expense-group">
                        <label>Método de pago</label>
                        <select
                            value={metodoPagoEditado}
                            onChange={handleMetodoPagoChange}
                        >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="DEBITO">Débito</option>
                            <option value="CREDITO">Crédito</option>
                        </select>
                    </div>
                </div>

                <div className="edit-expense-row edit-expense-row-quotas">
                    <div className="edit-expense-group edit-expense-group-quotas">
                        <label>Cantidad de cuotas</label>
                        <input
                            type="text"
                            value={cuotasEditadas}
                            placeholder="Ej: 1"
                            disabled={metodoPagoEditado !== "CREDITO"}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setCuotasEditadas(value);
                            }}
                        />
                    </div>
                </div>

                <div className="edit-expense-buttons">
                    <button
                        type="button"
                        className="edit-expense-cancel"
                        onClick={cerrarModalEditarGasto}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="edit-expense-save"
                        onClick={guardarCambiosGasto}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditExpenseModal;