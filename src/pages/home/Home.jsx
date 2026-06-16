import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SideBarSwitcher } from "../../components/SideBar/SideBarSwitcher";
import { Navbar } from "../../components/Navbar/Navbar";
import AddExpenseModal from "../../components/Modal/AddExpenseModal";
import CreditCardConfigModal from "../../components/Modal/CreditCardConfigModal";

import { obtenerGastos } from "../../services/expensesService";
import { obtenerConfiguracionTarjeta } from "../../services/usuarioService";

import receiptIcon from "../../assets/icon/Group.png";
import tarjetaCreditoIcon from "../../assets/icon/tarjetaCredito.png";

import "../../css/pages/home.css";

export function Home() {

    const navigate = useNavigate();

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [ultimosGastos, setUltimosGastos] = useState([]);
    const [loadingGastos, setLoadingGastos] = useState(true);
    const [totalMes, setTotalMes] = useState(0);
    
    const [sueldoMes, setSueldoMes] = useState(0);

    const [cantidadGastosMes, setCantidadGastosMes] = useState(0);

    const [totalCreditoMes, setTotalCreditoMes] = useState(0);
    
    const [cantidadGastosCreditoMes, setCantidadGastosCreditoMes] = useState(0);

    const cargarDatosHome = async () => {

        try {

            setLoadingGastos(true);

            const data = await obtenerGastos();

            const gastos = Array.isArray(data)
                ? data
                : [];

            const gastosOrdenados = [...gastos].sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

            setUltimosGastos(
                gastosOrdenados.slice(0, 5)

            );

            const fechaActual = new Date();

            const mesActual =
                fechaActual.getMonth();

            const anioActual =
                fechaActual.getFullYear();

            let contadorGastos = 0;
            let contadorGastosCredito = 0;

            const totalDelMes = gastos.reduce(
                (total, gasto) => {

                    const fechaGasto = new Date(
                        gasto.date
                    );

                    const esDelMesActual =
                        fechaGasto.getMonth() ===
                        mesActual &&
                        fechaGasto.getFullYear() ===
                        anioActual;

                    const incluirEnTotal =
                        gasto.paymentMethod ===
                        "EFECTIVO" ||
                        gasto.paymentMethod ===
                        "DEBITO";

                    if (
                        esDelMesActual &&
                        incluirEnTotal
                    ) {

                        contadorGastos++;

                        return (
                            total +
                            Number(
                                gasto.amount || 0
                            )
                        );
                    }

                    return total;
                },
                0
            );

            const totalCreditoDelMes =
                gastos.reduce(
                    (total, gasto) => {

                        const fechaGasto =
                            new Date(gasto.date);

                        const esDelMesActual =
                            fechaGasto.getMonth() ===
                            mesActual &&
                            fechaGasto.getFullYear() ===
                            anioActual;

                        if (
                            esDelMesActual &&
                            gasto.paymentMethod ===
                            "CREDITO"
                        ) {

                            contadorGastosCredito++;

                            return (
                                total +
                                Number(
                                    gasto.amount || 0
                                )
                            );
                        }

                        return total;
                    },
                    0
                );

            setTotalMes(totalDelMes);

            setCantidadGastosMes(
                contadorGastos
            );

            setTotalCreditoMes(
                totalCreditoDelMes
            );

            setCantidadGastosCreditoMes(
                contadorGastosCredito
            );

            try {

                const config =
                    await obtenerConfiguracionTarjeta();

                setSueldoMes(
                    Number(
                        config?.sueldoMes || 0
                    )
                );

            } catch (error) {

                setSueldoMes(0);
            }

        } catch (error) {

            console.error(
                "Error al cargar datos del Home:",
                error
            );

        } finally {

            setLoadingGastos(false);
        }
    };

    useEffect(() => {

        cargarDatosHome();

    }, []);

    const formatAmount = (amount) => {

        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {
            return "$0";
        }

        return Number(amount).toLocaleString(
            "es-CL",
            {
                style: "currency",
                currency: "CLP",
            }
        );
    };

    const formatPaymentMethod = (
        method
    ) => {

        const methods = {
            EFECTIVO: "Efectivo",
            DEBITO: "Débito",
            CREDITO: "Crédito",
        };

        return (
            methods[method] ||
            "Sin método"
        );
    };

    const porcentajePresupuesto =
        sueldoMes > 0
            ? (totalMes / sueldoMes) * 100
            : 0;

    return (

        <div className="contenedor_Home">

            <SideBarSwitcher />

            <div className="contenido_Home home_page_content">

                <Navbar
                    onOpenExpenseModal={() =>
                        setIsExpenseModalOpen(
                            true
                        )
                    }
                    onOpenConfigModal={() =>
                        setIsConfigModalOpen(
                            true
                        )
                    }
                />

                <AddExpenseModal
                    isOpen={
                        isExpenseModalOpen
                    }
                    onClose={() =>
                        setIsExpenseModalOpen(
                            false
                        )
                    }
                    onExpenseCreated={
                        cargarDatosHome
                    }
                />

                <CreditCardConfigModal
                    isOpen={
                        isConfigModalOpen
                    }
                    onClose={() =>
                        setIsConfigModalOpen(
                            false
                        )
                    }
                    onConfigSaved={
                        cargarDatosHome
                    }
                />

                <h1>
                    Bienvenido, Usuario
                </h1>

                <div className="layout_home">

                    <div className="col_izquierda">

                        <div className="box_grafico_lineal_home">

                            <h1>
                                Total Gastos del Mes/Sueldo del Mes
                            </h1>

                            <div className="resumen_total_mes_home">

                                <div>

                                    <span className="total_mes_home" style={{ whiteSpace: "nowrap", display: "inline-block" }}>
                                        {formatAmount(totalMes)} / {formatAmount(sueldoMes)}
                                    </span>

                                    <p
                                        className={
                                            porcentajePresupuesto >=
                                                100
                                                ? "texto_presupuesto_home alerta_presupuesto"
                                                : "texto_presupuesto_home"
                                        }
                                    >
                                        {porcentajePresupuesto >=
                                            100
                                            ? "Presupuesto superado"
                                            : `${porcentajePresupuesto.toFixed(
                                                0
                                            )}% de tu presupuesto utilizado`}
                                    </p>
                                </div>

                                <div className="texto_base_presupuesto_home">

                                    <img
                                        src={
                                            receiptIcon
                                        }
                                        alt="Resumen gastos"
                                        className="icono_resumen_home"
                                    />

                                    <p>
                                        Basado en{" "}
                                        {
                                            cantidadGastosMes
                                        }{" "}
                                        gastos registrados
                                        con efectivo y
                                        débito
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="contendor_ultimos_gastos">

                            <div className="header_ultimos_gastos">

                                <h1>
                                    Últimos Gastos
                                </h1>

                                <div className="decoracion_header_gastos">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>

                            {loadingGastos ? (

                                <p>
                                    Cargando últimos gastos...
                                </p>

                            ) : ultimosGastos.length === 0 ? (

                                <p>
                                    No hay gastos registrados
                                </p>

                            ) : (

                                <>
                                    <table className="tabla_ultimos_gastos_home">

                                        <tbody>

                                            {ultimosGastos.map(
                                                (gasto) => (

                                                    <tr
                                                        key={
                                                            gasto.id
                                                        }
                                                    >
                                                        <td className="info_gasto_home">

                                                            <strong>
                                                                {gasto.name ||
                                                                    "Sin nombre"}
                                                            </strong>

                                                            <span>
                                                                {gasto.date ||
                                                                    "Sin fecha"}
                                                            </span>
                                                        </td>

                                                        <td className="monto_gasto_home">

                                                            <strong>
                                                                Monto:
                                                            </strong>{" "}

                                                            {formatAmount(
                                                                gasto.amount
                                                            )}
                                                        </td>

                                                        <td className="metodo_gasto_home">

                                                            <strong>
                                                                Método de pago:
                                                            </strong>{" "}

                                                            {formatPaymentMethod(
                                                                gasto.paymentMethod
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="contenedor_btn_ver_todos">

                                        <button
                                            className="btn_ver_todos_home"
                                            onClick={() =>
                                                navigate("/Gastos")
                                            }
                                        >
                                            Ver todos &gt;
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="col_derecha">

                        <div className="box_grafico_torta_home">

                            <div className="contenido_info_home">

                                <div className="info_destacada_home">

                                    <strong>
                                        Configuración requerida
                                    </strong>

                                    <p>
                                        Para estimar correctamente
                                        el pago mensual de la
                                        tarjeta, debes registrar
                                        previamente los datos en
                                        el formulario{" "}

                                        <strong>
                                            “Datos de la tarjeta”
                                        </strong>,

                                        ubicado en la parte
                                        superior derecha
                                        del sistema.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="contenedor_pago_tarjeta_home">

                            <h2>
                                Gastos Con Tarjeta de Crédito del Mes
                            </h2>

                            <div className="contenido_pago_tarjeta_home">

                                <div>

                                    <span className="monto_pago_tarjeta_home">
                                        {formatAmount(
                                            totalCreditoMes
                                        )}
                                    </span>

                                    <p className="cantidad_pago_tarjeta_home">

                                        {
                                            cantidadGastosCreditoMes
                                        }{" "}

                                        Compras con crédito
                                    </p>
                                </div>

                                <img
                                    src={
                                        tarjetaCreditoIcon
                                    }
                                    alt="Tarjeta de crédito"
                                    className="icono_tarjeta_credito_home"
                                />
                            </div>

                            <button
                                className="btn_detalle_tarjeta_home"
                                onClick={() =>
                                    navigate("/est_monthly")
                                }
                            >
                                Ver Detalle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;