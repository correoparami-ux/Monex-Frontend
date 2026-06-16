import { useEffect, useState } from "react";
import { SideBarSwitcher } from "../../components/SideBar/SideBarSwitcher";
import { Navbar } from "../../components/Navbar/Navbar";
import { EditcategoriesModal } from "../../components/Modal/EditcategoriesModal";
import { AddCategoryModal } from "../../components/Modal/AddCategoryModal";
import { DeleteCategoryModal } from "../../components/Modal/DeleteCategoryModal";
import AddExpenseModal from "../../components/Modal/AddExpenseModal";
import CreditCardConfigModal from "../../components/Modal/CreditCardConfigModal";
import lupa from "../../assets/icon/material-symbols_search.png";
import {
    obtenerCategoriasPaginadas,
    editarCategoria,
    crearCategoria,
    eliminarCategoria,
} from "../../services/categoriesService";
import "../../css/pages/categories.css";

export function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);

    const [paginaActual, setPaginaActual] = useState(0);
    const categoriasPorPagina = 5;
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);

    const [modalEditar, setModalEditar] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

    const [nombreEditado, setNombreEditado] = useState("");
    const [descripcionEditada, setDescripcionEditada] = useState("");

    const [modalAgregar, setModalAgregar] = useState(false);
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [descripcionNueva, setDescripcionNueva] = useState("");

    const [modalEliminar, setModalEliminar] = useState(false);
    const [categoriaEliminar, setCategoriaEliminar] = useState(null);

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    const cargarCategorias = async (pagina = paginaActual) => {
        try {
            setLoading(true);

            const data = await obtenerCategoriasPaginadas(pagina, categoriasPorPagina);

            setCategorias(data.content || []);
            setTotalPaginas(data.totalPages || 0);
            setTotalElementos(data.totalElements || 0);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCategorias(paginaActual);
    }, [paginaActual]);

    useEffect(() => {
        setPaginaActual(0);
    }, [busqueda]);

    const abrirModalEditar = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setNombreEditado(categoria.name || categoria.nombre || "");
        setDescripcionEditada(categoria.description || categoria.descripcion || "");
        setModalEditar(true);
    };

    const cerrarModalEditar = () => {
        setModalEditar(false);
        setCategoriaSeleccionada(null);
        setNombreEditado("");
        setDescripcionEditada("");
    };

    const guardarCambios = async () => {
        try {
            if (!nombreEditado.trim()) {
                alert("El nombre de la categoría no puede estar vacío");
                return;
            }

            await editarCategoria(
                categoriaSeleccionada.id,
                nombreEditado,
                descripcionEditada
            );

            cerrarModalEditar();
            cargarCategorias(paginaActual);
        } catch (error) {
            console.error("Error al editar categoría:", error);
            alert("Error al editar categoría");
        }
    };

    const abrirModalAgregar = () => {
        setNombreNuevo("");
        setDescripcionNueva("");
        setModalAgregar(true);
    };

    const cerrarModalAgregar = () => {
        setModalAgregar(false);
        setNombreNuevo("");
        setDescripcionNueva("");
    };

    const guardarCategoria = async () => {
        try {
            if (!nombreNuevo.trim()) {
                alert("El nombre de la categoría no puede estar vacío");
                return;
            }

            await crearCategoria(nombreNuevo, descripcionNueva);

            cerrarModalAgregar();
            setPaginaActual(0);
            cargarCategorias(0);
        } catch (error) {
            console.error("Error al crear categoría:", error);
            alert("Error al crear categoría");
        }
    };

    const abrirModalEliminar = (categoria) => {
        setCategoriaEliminar(categoria);
        setModalEliminar(true);
    };

    const cerrarModalEliminar = () => {
        setModalEliminar(false);
        setCategoriaEliminar(null);
    };

    const eliminarConfirmado = async (id) => {
        try {
            await eliminarCategoria(id);

            cerrarModalEliminar();

            const nuevaPagina =
                categorias.length === 1 && paginaActual > 0
                    ? paginaActual - 1
                    : paginaActual;

            setPaginaActual(nuevaPagina);
            cargarCategorias(nuevaPagina);
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            alert("Error al eliminar categoría");
        }
    };

    const categoriasFiltradas = categorias.filter((categoria) =>
        (categoria.name || categoria.nombre || "")
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    const indiceInicial = paginaActual * categoriasPorPagina;
    const indiceFinal = indiceInicial + categorias.length;

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
                />

                <CreditCardConfigModal
                    isOpen={isConfigModalOpen}
                    onClose={() => setIsConfigModalOpen(false)}
                />

                <div className="contenido_Categorias">
                    <h1>Categoría</h1>
                    <p>Organiza y gestiona las categorías de tus gastos</p>

                    <div className="barra_Categorias">
                        <div className="input_con_icono">
                            <img src={lupa} alt="buscar" className="icono_buscar" />

                            <input
                                type="text"
                                placeholder="Buscar categoría..."
                                className="input_Buscar"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn_Agregar_Categoria"
                            onClick={abrirModalAgregar}
                        >
                            + Agregar Categoría
                        </button>
                    </div>

                    <div className="tabla_Categorias">
                        {loading ? (
                            <p className="mensaje_Sin_Categorias">Cargando categorías...</p>
                        ) : categorias.length === 0 ? (
                            <p className="mensaje_Sin_Categorias">No hay categorías registradas</p>
                        ) : categoriasFiltradas.length === 0 ? (
                            <p className="mensaje_Sin_Categorias">No se encontraron resultados</p>
                        ) : (
                            <>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nombre de categoría</th>
                                            <th>Descripción de categoría</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {categoriasFiltradas.map((categoria) => (
                                            <tr key={categoria.id}>
                                                <td>{categoria.name || categoria.nombre || "Sin nombre"}</td>

                                                <td>
                                                    {categoria.description ||
                                                        categoria.descripcion ||
                                                        "Sin descripción"}
                                                </td>

                                                <td>
                                                    <button
                                                        className="btn_editar"
                                                        onClick={() => abrirModalEditar(categoria)}
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className="btn_eliminar"
                                                        onClick={() => abrirModalEliminar(categoria)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="paginacion_Categorias">
                                    <p>
                                        Mostrando {indiceInicial + 1} a{" "}
                                        {Math.min(indiceFinal, totalElementos)} de{" "}
                                        {totalElementos} categorías
                                    </p>

                                    <div className="botones_paginacion_Categorias">
                                        <button
                                            disabled={paginaActual === 0}
                                            onClick={() => setPaginaActual(paginaActual - 1)}
                                        >
                                            ← Anterior
                                        </button>

                                        {Array.from({ length: totalPaginas }, (_, index) => (
                                            <button
                                                key={index}
                                                className={
                                                    paginaActual === index
                                                        ? "pagina_activa_Categorias"
                                                        : ""
                                                }
                                                onClick={() => setPaginaActual(index)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}

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

            {modalEditar && (
                <EditcategoriesModal
                    nombreEditado={nombreEditado}
                    setNombreEditado={setNombreEditado}
                    descripcionEditada={descripcionEditada}
                    setDescripcionEditada={setDescripcionEditada}
                    cerrarModalEditar={cerrarModalEditar}
                    guardarCambios={guardarCambios}
                />
            )}

            {modalAgregar && (
                <AddCategoryModal
                    nombre={nombreNuevo}
                    setNombre={setNombreNuevo}
                    descripcion={descripcionNueva}
                    setDescripcion={setDescripcionNueva}
                    cerrarModal={cerrarModalAgregar}
                    guardarCategoria={guardarCategoria}
                />
            )}

            {modalEliminar && (
                <DeleteCategoryModal
                    categoria={categoriaEliminar}
                    cerrarModal={cerrarModalEliminar}
                    eliminarCategoriaConfirmada={eliminarConfirmado}
                />
            )}
        </div>
    );
}