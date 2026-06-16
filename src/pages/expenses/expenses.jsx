import { useState, useEffect } from "react";
import { SideBarSwitcher } from "../../components/SideBar/SideBarSwitcher";
import { Navbar } from "../../components/Navbar/Navbar";
import AddExpenseModal from "../../components/Modal/AddExpenseModal";
import EditExpenseModal from "../../components/Modal/EditExpenseModal";
import { DeleteExpenseModal } from "../../components/Modal/DeleteExpenseModal";
import CreditCardConfigModal from "../../components/Modal/CreditCardConfigModal";
import lupa from "../../assets/icon/material-symbols_search.png";

import {
    obtenerGastosPaginados,
    actualizarGasto
} from "../../services/expensesService";

import { obtenerCategorias } from "../../services/categoriesService";
import "../../css/pages/expenses.css";

const EXPENSES_BASE_URL = import.meta.env.VITE_EXPENSES_API_URL;

export function Expenses() {
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
    const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("");
    const [fechaFiltro, setFechaFiltro] = useState("");

    const [paginaActual, setPaginaActual] = useState(0);
    const gastosPorPagina = 5;
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [gastoEditandoId, setGastoEditandoId] = useState(null);
    const [gastoEliminar, setGastoEliminar] = useState(null);

    const [nombreEditado, setNombreEditado] = useState("");
    const [categoriaEditada, setCategoriaEditada] = useState("");
    const [montoEditado, setMontoEditado] = useState("");
    const [comisionEditada, setComisionEditada] = useState("0");
    const [fechaEditada, setFechaEditada] = useState("");
    const [metodoPagoEditado, setMetodoPagoEditado] = useState("EFECTIVO");
    const [cuotasEditadas, setCuotasEditadas] = useState("1");

    const fetchExpenses = async (pagina = paginaActual) => {
        try {
            setLoading(true);

            const data = await obtenerGastosPaginados({
                page: pagina,
                size: gastosPorPagina,
                categoryId: categoriaFiltro || null,
                startDate: fechaFiltro || null,
                endDate: fechaFiltro || null
            });

            setExpenses(data.content || []);
            setTotalPaginas(data.totalPages || 0);
            setTotalElementos(data.totalElements || 0);
            setError(null);
        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategorias = async () => {
        try {
            const data = await obtenerCategorias();
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al obtener categorías:", err);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    useEffect(() => {
        fetchExpenses(paginaActual);
    }, [paginaActual, categoriaFiltro, fechaFiltro]);

    useEffect(() => {
        setPaginaActual(0);
    }, [busqueda, categoriaFiltro, fechaFiltro]);

    const formatPaymentMethod = (method) => {
        const methods = {
            EFECTIVO: "Efectivo",
            DEBITO: "Débito",
            CREDITO: "Crédito"
        };

        return methods[method] || "Sin método";
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined || amount === "") {
            return "$0";
        }

        return Number(amount).toLocaleString("es-CL", {
            style: "currency",
            currency: "CLP"
        });
    };

    const formatCommission = (commission) => {
        if (commission === null || commission === undefined || commission === "") {
            return "0.00%";
        }

        return `${Number(commission).toFixed(2)}%`;
    };

    const shouldShowCreditFields = (paymentMethod) => {
        return paymentMethod === "CREDITO";
    };

    const handleEdit = (expense) => {
        setGastoEditandoId(expense.id);
        setNombreEditado(expense.name || "");
        setCategoriaEditada(String(expense.categoryId || ""));
        setMontoEditado(String(expense.amount || ""));
        setComisionEditada(String(expense.commission || "0"));
        setFechaEditada(expense.date || "");
        setMetodoPagoEditado(expense.paymentMethod || "EFECTIVO");
        setCuotasEditadas(String(expense.installments || "1"));
        setIsEditExpenseModalOpen(true);
    };

    const cerrarModalEditarGasto = () => {
        setIsEditExpenseModalOpen(false);
        setGastoEditandoId(null);
    };

    const guardarCambiosGasto = async () => {
        try {
            const categoriaSeleccionada = categorias.find(
                (cat) => Number(cat.id) === Number(categoriaEditada)
            );

            const gastoActualizado = {
                name: nombreEditado,
                categoryId: Number(categoriaEditada),
                categoryName:
                    categoriaSeleccionada?.name ||
                    categoriaSeleccionada?.nombre ||
                    "",
                amount: Number(montoEditado),
                commission:
                    metodoPagoEditado === "CREDITO"
                        ? Number(comisionEditada || 0)
                        : 0,
                date: fechaEditada,
                paymentMethod: metodoPagoEditado,
                installments:
                    metodoPagoEditado === "CREDITO"
                        ? Number(cuotasEditadas || 1)
                        : 1
            };

            await actualizarGasto(gastoEditandoId, gastoActualizado);

            cerrarModalEditarGasto();
            fetchExpenses(paginaActual);
        } catch (err) {
            console.error("Error al actualizar gasto:", err);
            alert("Error al actualizar gasto");
        }
    };

    const handleDelete = (expense) => {
        setGastoEliminar(expense);
        setIsDeleteExpenseModalOpen(true);
    };

    const cerrarModalEliminarGasto = () => {
        setIsDeleteExpenseModalOpen(false);
        setGastoEliminar(null);
    };

    const eliminarGastoConfirmado = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${EXPENSES_BASE_URL}/api/expenses/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error("Error al eliminar el gasto");
            }

            cerrarModalEliminarGasto();

            const nuevaPagina =
                expenses.length === 1 && paginaActual > 0
                    ? paginaActual - 1
                    : paginaActual;

            setPaginaActual(nuevaPagina);
            fetchExpenses(nuevaPagina);
        } catch (err) {
            console.error(err);
            alert("Error al eliminar el gasto");
        }
    };

    const expensesFiltrados = expenses.filter((expense) => {
        const nombre = expense.name || "";
        const id = String(expense.id || "");

        return (
            nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            id.includes(busqueda)
        );
    });

    const indiceInicial = paginaActual * gastosPorPagina;
    const indiceFinal = indiceInicial + expenses.length;

    return (
        <div className="contenedor_Home">
            <SideBarSwitcher />

            <div className="contenido_Home">
                <Navbar 
                    onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                    onOpenConfigModal={() => setIsConfigModalOpen(true)}
                />

                <AddExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => setIsExpenseModalOpen(false)}
                    onExpenseCreated={() => fetchExpenses(paginaActual)}
                />

                <CreditCardConfigModal
                    isOpen={isConfigModalOpen}
                    onClose={() => setIsConfigModalOpen(false)}
                    onConfigSaved={() => fetchExpenses(paginaActual)}
                />

                <div className="contenido_Gastos">
                    <h1>Gastos</h1>

                    <p>
                        Consulta y gestiona todos tus gastos registrados
                    </p>

                    <div className="barra_Gastos">
                        <div className="input_con_icono_gastos">
                            <img
                                src={lupa}
                                alt="buscar"
                                className="icono_buscar_gastos"
                            />

                            <input
                                type="text"
                                placeholder="Buscar gasto por nombre"
                                className="input_Buscar_Gastos"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <input
                            className="input_Fecha_Gastos"
                            type="date"
                            value={fechaFiltro}
                            onChange={(e) => setFechaFiltro(e.target.value)}
                        />

                        <select
                            className="select_Gastos"
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                        >
                            <option value="">
                                Todas las categorías
                            </option>

                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name || cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="tabla_expenses">
                        {loading && (
                            <p className="mensaje_Sin_Gastos">
                                Cargando gastos...
                            </p>
                        )}

                        {error && (
                            <p className="mensaje_Sin_Gastos">
                                {error}
                            </p>
                        )}

                        {!loading &&
                            !error &&
                            expensesFiltrados.length === 0 && (
                                <p className="mensaje_Sin_Gastos">
                                    No hay gastos registrados
                                </p>
                            )}

                        {!loading &&
                            !error &&
                            expensesFiltrados.length > 0 && (
                                <>
                                    <table>
                                        <thead className="nav_tabla_gastos">
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Categoría</th>
                                                <th>Fecha del gasto</th>
                                                <th>Método de pago</th>
                                                <th>Monto</th>
                                                <th>Comisión</th>
                                                <th>Cuotas</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>

                                        <tbody className="body_tabla_gastos">
                                            {expensesFiltrados.map((expense) => (
                                                <tr key={expense.id}>
                                                    <td>{expense.name || "Sin nombre"}</td>

                                                    <td>
                                                        {expense.categoryName ||
                                                            expense.category?.name ||
                                                            `Categoría ${expense.categoryId}`}
                                                    </td>

                                                    <td>{expense.date || "Sin fecha"}</td>

                                                    <td>
                                                        {formatPaymentMethod(
                                                            expense.paymentMethod
                                                        )}
                                                    </td>

                                                    <td>{formatAmount(expense.amount)}</td>

                                                    <td>
                                                        {shouldShowCreditFields(
                                                            expense.paymentMethod
                                                        )
                                                            ? formatCommission(
                                                                expense.commission
                                                            )
                                                            : "No aplica"}
                                                    </td>

                                                    <td>
                                                        {shouldShowCreditFields(
                                                            expense.paymentMethod
                                                        )
                                                            ? expense.installments
                                                            : "No aplica"}
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="boton_editar_expenses"
                                                            onClick={() => handleEdit(expense)}
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            className="boton_eliminar_expenses"
                                                            onClick={() => handleDelete(expense)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="paginacion_gastos">
                                        <p>
                                            Mostrando {indiceInicial + 1} a{" "}
                                            {Math.min(indiceFinal, totalElementos)}{" "}
                                            de {totalElementos} gastos
                                        </p>

                                        <div className="botones_paginacion_gastos">
                                            <button
                                                disabled={paginaActual === 0}
                                                onClick={() => setPaginaActual(paginaActual - 1)}
                                            >
                                                ← Anterior
                                            </button>

                                            {Array.from(
                                                { length: totalPaginas },
                                                (_, index) => (
                                                    <button
                                                        key={index}
                                                        className={
                                                            paginaActual === index
                                                                ? "pagina_activa"
                                                                : ""
                                                        }
                                                        onClick={() => setPaginaActual(index)}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                )
                                            )}

                                            <button
                                                disabled={paginaActual + 1 >= totalPaginas}
                                                onClick={() => setPaginaActual(paginaActual + 1)}
                                            >
                                                Siguiente →
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                    </div>
                </div>
            </div>

            <EditExpenseModal
                isOpen={isEditExpenseModalOpen}
                categorias={categorias}
                nombreEditado={nombreEditado}
                setNombreEditado={setNombreEditado}
                categoriaEditada={categoriaEditada}
                setCategoriaEditada={setCategoriaEditada}
                montoEditado={montoEditado}
                setMontoEditado={setMontoEditado}
                comisionEditada={comisionEditada}
                setComisionEditada={setComisionEditada}
                fechaEditada={fechaEditada}
                setFechaEditada={setFechaEditada}
                metodoPagoEditado={metodoPagoEditado}
                setMetodoPagoEditado={setMetodoPagoEditado}
                cuotasEditadas={cuotasEditadas}
                setCuotasEditadas={setCuotasEditadas}
                cerrarModalEditarGasto={cerrarModalEditarGasto}
                guardarCambiosGasto={guardarCambiosGasto}
            />

            {isDeleteExpenseModalOpen && (
                <DeleteExpenseModal
                    gasto={gastoEliminar}
                    cerrarModal={cerrarModalEliminarGasto}
                    eliminarGastoConfirmado={eliminarGastoConfirmado}
                />
            )}
        </div>
    );
}