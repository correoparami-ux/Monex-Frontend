// Importaciones de React, componentes, servicios y assets
import { useEffect, useState } from "react";
import { SideBarSwitcher } from "../../components/SideBar/SideBarSwitcher";
import { Navbar } from "../../components/Navbar/Navbar";
import AddExpenseModal from "../../components/Modal/AddExpenseModal";
import CreditCardConfigModal from "../../components/Modal/CreditCardConfigModal";
import { obtenerGastos } from "../../services/expensesService";
import iconAnalisis from "../../assets/icon/icon_analisis.png";
import tarjetaIcon from "../../assets/icon/tarjetaCredito.png";

// Paleta de colores para el gráfico circular (categorías)
const categoryPalette = [
    "#5BBF59",
    "#2F80ED",
    "#F2C94C",
    "#F2994A",
    "#9B51E0",
];

// Funciones auxiliares para dar formato de moneda y capitalizar textos
const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString("es-CL", {
        maximumFractionDigits: 0,
    })}`;

const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

// Parsea y normaliza las fechas recibidas para evitar errores con diferentes formatos
const parseExpenseDate = (dateValue) => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
        return Number.isNaN(dateValue.getTime()) ? null : dateValue;
    }

    if (typeof dateValue !== "string") {
        return null;
    }

    const datePart = dateValue.slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) {
        return null;
    }

    const parsedDate = new Date(year, month - 1, day);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// Extrae el arreglo de gastos sin importar la estructura exacta de la respuesta
const normalizeExpenses = (data) =>
    Array.isArray(data)
        ? data
        : data?.data ?? data?.expenses ?? [];

// Verifica si un gasto fue hecho con tarjeta de crédito
const isCreditExpense = (expense) => {
    const paymentMethod = String(
        expense?.paymentMethod || expense?.paymentType || ""
    ).toUpperCase();

    return paymentMethod.includes("CREDITO");
};

// Calcula la diferencia de meses entre dos fechas
const monthDiff = (from, to) =>
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

export function Analisis() {
    // Estados del componente: Modales, listado de gastos, indicadores de carga y el estado "hover" del gráfico
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [gastos, setGastos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Efecto para cargar los gastos al inicio y configurar un refresco automático cada 60 segundos
    useEffect(() => {
        const fetchGastos = async () => {
            try {
                const gastosResponse = await Promise.resolve(obtenerGastos());

                const expenses = normalizeExpenses(gastosResponse);

                setGastos(expenses);

                setError(null);
            } catch (fetchError) {
                console.error("Error fetching gastos:", fetchError);
                setError(fetchError.message || "Error al cargar gastos");
            } finally {
                setLoading(false);
            }
        };

        fetchGastos();

        const intervalo = setInterval(() => {
            fetchGastos();
        }, 60000);

        return () => clearInterval(intervalo);
    }, []);

    // Definición de las fechas de inicio y fin para el mes actual y el mes anterior
    const fechaActual = new Date();
    const inicioMesActual = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        1
    );
    const finMesActual = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth() + 1,
        0
    );
    const inicioMesAnterior = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth() - 1,
        1
    );
    const finMesAnterior = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        0
    );

    // Filtrado de gastos para obtener solo los que pertenecen al mes actual
    const gastosMesActual = gastos.filter((gasto) => {
        const fechaGasto = parseExpenseDate(gasto?.date);

        return (
            fechaGasto &&
            fechaGasto >= inicioMesActual &&
            fechaGasto <= finMesActual
        );
    });

    // Filtrado de gastos para obtener solo los que pertenecen al mes anterior
    const gastosMesAnterior = gastos.filter((gasto) => {
        const fechaGasto = parseExpenseDate(gasto?.date);

        return (
            fechaGasto &&
            fechaGasto >= inicioMesAnterior &&
            fechaGasto <= finMesAnterior
        );
    });

    // Separación de gastos excluyendo los de crédito (solo queremos analizar efectivo y débito)
    const gastosMesActualSinCredito = gastosMesActual.filter(
        (gasto) => !isCreditExpense(gasto)
    );

    const gastosMesAnteriorSinCredito = gastosMesAnterior.filter(
        (gasto) => !isCreditExpense(gasto)
    );

    const gastosMesActualVisible = gastosMesActualSinCredito.filter((gasto) => {
        const paymentMethod = String(
            gasto?.paymentMethod || gasto?.paymentType || ""
        ).toUpperCase();

        return paymentMethod === "EFECTIVO" || paymentMethod === "DEBITO";
    });

    const gastosMesAnteriorVisible = gastosMesAnteriorSinCredito.filter((gasto) => {
        const paymentMethod = String(
            gasto?.paymentMethod || gasto?.paymentType || ""
        ).toUpperCase();

        return paymentMethod === "EFECTIVO" || paymentMethod === "DEBITO";
    });

    // Cálculo del dinero total gastado en el mes actual y anterior
    const totalMesActual = gastosMesActualVisible.reduce((total, gasto) => {
        const amount = Number(gasto?.amount ?? 0);
        return total + (Number.isNaN(amount) ? 0 : amount);
    }, 0);

    const totalMesAnterior = gastosMesAnteriorVisible.reduce((total, gasto) => {
        const amount = Number(gasto?.amount ?? 0);
        return total + (Number.isNaN(amount) ? 0 : amount);
    }, 0);

    // Cálculo de la variación porcentual entre ambos meses (Ej. Subió un 15% o bajó un 10%)
    const variacionPorcentual = totalMesAnterior > 0
        ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100
        : null;

    // Suma de los gastos agrupados día por día para el gráfico lineal
    const dailyTotals = gastosMesActualVisible.reduce((accumulator, gasto) => {
        const fechaGasto = parseExpenseDate(gasto?.date);

        if (!fechaGasto) return accumulator;

        const dayKey = fechaGasto.getDate();
        const amount = Number(gasto?.amount ?? 0);
        const safeAmount = Number.isNaN(amount) ? 0 : amount;

        accumulator.set(dayKey, (accumulator.get(dayKey) || 0) + safeAmount);

        return accumulator;
    }, new Map());

    const gastosDiarios = Array.from(dailyTotals.entries())
        .filter(([, amount]) => amount > 0)
        .sort((a, b) => a[0] - b[0])
        .map(([day, amount]) => ({
            day,
            amount,
            date: new Date(
                fechaActual.getFullYear(),
                fechaActual.getMonth(),
                day
            ),
        }));

    // Configuración y variables para dibujar el gráfico SVG (tamaños, posiciones y coordenadas)
    const montoMaximo = Math.max(
        1,
        ...gastosDiarios.map((gasto) => gasto.amount)
    );

    const chartWidth = 580;
    const chartHeight = 160;
    const chartStartX = 70;
    const chartEndX = 650;
    const chartStartY = 180;
    const chartTopY = 20;

    const separacionX = gastosDiarios.length > 1
        ? chartWidth / (gastosDiarios.length - 1)
        : 0;

    const puntosGrafico = gastosDiarios
        .map((gasto, index) => {
            const x = chartStartX + (index * separacionX);
            const y = chartStartY - ((gasto.amount / montoMaximo) * chartHeight);

            return `${x},${y}`;
        })
        .join(" ");

    const majorDay = gastosDiarios.reduce((best, current) => {
        if (!best || current.amount > best.amount) {
            return current;
        }

        return best;
    }, null);

    // Suma de los gastos agrupados por categoría para crear el gráfico circular (Pie chart)
    const categoryTotals = gastosMesActualVisible.reduce((accumulator, gasto) => {
        const nombreCategoria =
            gasto?.categoryName ||
            gasto?.category?.name ||
            gasto?.category?.nombre ||
            gasto?.nombreCategoria ||
            gasto?.categoryId ||
            "Sin categoría";

        const amount = Number(gasto?.amount ?? 0);
        const safeAmount = Number.isNaN(amount) ? 0 : amount;

        accumulator.set(
            nombreCategoria,
            (accumulator.get(nombreCategoria) || 0) + safeAmount
        );

        return accumulator;
    }, new Map());

    const categoriasOrdenadas = Array.from(categoryTotals.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

    // Se separan las 4 categorías con más gastos y el resto se agrupa en "Otros"
    const categoriasPie = categoriasOrdenadas.slice(0, 4);
    const restantes = categoriasOrdenadas
        .slice(4)
        .reduce((total, item) => total + item.amount, 0);

    if (restantes > 0) {
        categoriasPie.push({ name: "Otros", amount: restantes });
    }

    const totalCategorias = categoriasPie.reduce(
        (total, item) => total + item.amount,
        0
    );

    // Se genera la cadena del gradiente cónico para pintar el gráfico circular con CSS
    const pieGradient = totalCategorias > 0
        ? categoriasPie
            .map((item, index) => {
                const inicio = categoriasPie
                    .slice(0, index)
                    .reduce((sum, previous) => sum + previous.amount, 0);
                const fin = inicio + item.amount;

                const startPercent = (inicio / totalCategorias) * 100;
                const endPercent = (fin / totalCategorias) * 100;

                return `${categoryPalette[index % categoryPalette.length]} ${startPercent}% ${endPercent}%`;
            })
            .join(", ")
        : "#e5e7eb 0% 100%";

    const categoriaMayor = categoriasOrdenadas[0] || null;
    const porcentajeCategoriaMayor = totalCategorias > 0 && categoriaMayor
        ? (categoriaMayor.amount / totalCategorias) * 100
        : 0;

    // Formateadores de fechas (meses y días) para mostrar textos amigables en la vista
    const monthFormatter = new Intl.DateTimeFormat("es-CL", {
        month: "long",
    });
    const weekdayFormatter = new Intl.DateTimeFormat("es-CL", {
        weekday: "long",
    });
    const dayMonthFormatter = new Intl.DateTimeFormat("es-CL", {
        day: "numeric",
        month: "long",
    });

    const chartMonthLabel = `${String(inicioMesActual.getDate()).padStart(2, "0")}/${String(
        inicioMesActual.getMonth() + 1
    ).padStart(2, "0")}/${inicioMesActual.getFullYear()} - ${String(
        finMesActual.getDate()
    ).padStart(2, "0")}/${String(finMesActual.getMonth() + 1).padStart(2, "0")}/${finMesActual.getFullYear()}`;

    // Generación dinámica de los mensajes del banner principal en base a los cálculos anteriores
    const bannerTitle = variacionPorcentual !== null
        ? `¡Tus gastos ${variacionPorcentual >= 0 ? "aumentaron" : "disminuyeron"} ${Math.abs(Math.round(variacionPorcentual))}% respecto al mes anterior${categoriaMayor ? `, principalmente en la categoría ${categoriaMayor.name}!` : "!"}`
        : "¡Tus gastos del mes se ven listos para analizar!";

    const bannerSubtitle = categoriaMayor
        ? "Se recomienda reducir el gasto en esta categoría para optimizar el presupuesto."
        : "Agrega gastos para que el análisis detecte la categoría con mayor impacto.";

    const gastoMayorDiaTexto = majorDay
        ? `El ${capitalize(weekdayFormatter.format(majorDay.date))} ${dayMonthFormatter.format(majorDay.date)} fue el día con más gastos del mes (${formatCurrency(majorDay.amount)}).`
        : "Todavía no hay suficientes datos para identificar el día con mayor gasto.";

    const totalDebitoEfectivo = totalMesActual;

    const gastosCredito = gastosMesActual.filter(isCreditExpense);

    const currentMonthStart = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        1
    );

    // Cálculo del estimado a pagar de las compras con tarjeta de crédito considerando las cuotas activas
    const totalCreditoMesActual = gastos.reduce((total, gasto) => {
        if (!isCreditExpense(gasto)) return total;

        const expenseDate = parseExpenseDate(gasto?.date);
        if (!expenseDate) return total;

        const amount = Number(gasto?.amount ?? 0);
        const commission = Number(gasto?.commission ?? 0);
        const commissionAmount = amount * (commission / 100);
        const installments = Math.max(1, Number(gasto?.installments ?? 1));

        const startMonth = new Date(
            expenseDate.getFullYear(),
            expenseDate.getMonth(),
            1
        );

        const elapsedMonths = monthDiff(startMonth, currentMonthStart);

        if (elapsedMonths < 0 || elapsedMonths >= installments) {
            return total;
        }

        const monthlyPayment = (amount + commissionAmount) / installments;

        return total + (Number.isNaN(monthlyPayment) ? 0 : monthlyPayment);
    }, 0);

    const resumenDescripcion = "Esta vista solo considera gastos de débito y efectivo; los gastos en crédito quedan excluidos del análisis.";

    const resumenCreditoDescripcion = "Este apartado calcula el pago estimado de las compras con crédito activas del mes, considerando cuotas y comisión.";

    const totalCategoriaTexto = categoriaMayor
        ? `${categoriaMayor.name} (${Math.round(porcentajeCategoriaMayor)}%)`
        : "Sin categoría destacada";

    const gastoTotalRegistrado = gastosMesActualVisible.length;

    return (
        // Contenedor principal y barra lateral
        <div className="contenedor_analisis">
            <SideBarSwitcher />

            <div className="contenido_anilisis">
                <Navbar 
                    onOpenExpenseModal={() => setIsExpenseModalOpen(true)} 
                    onOpenConfigModal={() => setIsConfigModalOpen(true)}
                />

                {/* Modales ocultos para registro y configuración */}
                <AddExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => setIsExpenseModalOpen(false)}
                />

                <CreditCardConfigModal
                    isOpen={isConfigModalOpen}
                    onClose={() => setIsConfigModalOpen(false)}
                />

                <div className="analisis_page">
                    <div className="analisis_header">
                        <h1>Análisis</h1>
                    </div>

                    {/* Banner principal con el resumen dinámico del análisis */}
                    <div className="analisis_banner">
                        <div className="analisis_banner_icon">
                            <img src={iconAnalisis} alt="Icono de análisis" />
                        </div>

                        <div className="analisis_banner_texto">
                            <p className="analisis_banner_titulo">
                                {bannerTitle}
                            </p>

                            <p className="analisis_banner_subtitulo">
                                {bannerSubtitle}
                            </p>
                        </div>
                    </div>

                    <div className="layout_analisis">
                        <div className="col_izquierda">
                            {/* Bloque del gráfico de líneas para mostrar los gastos por días */}
                            <div className="card_analisis card_linea">
                                <div className="card_titulo_block">
                                    <h2>Gastos diarios del mes</h2>
                                    <span>{chartMonthLabel}</span>
                                </div>

                                {gastosDiarios.length > 0 ? (
                                    <div className="grafico_linea_container">
                                        <svg
                                            className="grafico_svg"
                                            viewBox="0 0 700 220"
                                            role="img"
                                            aria-label="Gráfico de gastos diarios del mes"
                                        >
                                            {[0, 0.25, 0.5, 0.75, 1].map((valor, index) => {
                                                const y = chartStartY - (valor * chartHeight);

                                                return (
                                                    <text
                                                        key={`value-${index}`}
                                                        x="10"
                                                        y={y + 5}
                                                        className="texto_grafico texto_eje_y"
                                                    >
                                                        {formatCurrency(montoMaximo * valor)}
                                                    </text>
                                                );
                                            })}

                                            {[24, 64, 104, 144, 180].map((y) => (
                                                <line
                                                    key={`grid-h-${y}`}
                                                    x1={chartStartX}
                                                    y1={y}
                                                    x2={chartEndX}
                                                    y2={y}
                                                    className="grid_line"
                                                />
                                            ))}

                                            {Array.from({ length: 7 }, (_, index) => chartStartX + (index * (chartWidth / 6))).map((x) => (
                                                <line
                                                    key={`grid-v-${x}`}
                                                    x1={x}
                                                    y1={chartTopY}
                                                    x2={x}
                                                    y2={chartStartY}
                                                    className="grid_line grid_line_vertical"
                                                />
                                            ))}

                                            <line
                                                x1={chartStartX}
                                                y1={chartTopY}
                                                x2={chartStartX}
                                                y2={chartStartY}
                                                className="linea_eje"
                                            />

                                            <line
                                                x1={chartStartX}
                                                y1={chartStartY}
                                                x2={chartEndX}
                                                y2={chartStartY}
                                                className="linea_eje"
                                            />

                                            {puntosGrafico && (
                                                <polyline
                                                    fill="none"
                                                    points={puntosGrafico}
                                                    className="linea_grafico"
                                                />
                                            )}

                                            {gastosDiarios.map((gasto, index) => {
                                                const x = chartStartX + (index * separacionX);
                                                const y = chartStartY - ((gasto.amount / montoMaximo) * chartHeight);

                                                return (
                                                    <g key={`${gasto.day}-${index}`}>
                                                        {hoveredPoint === index && (
                                                            <g>
                                                                <rect
                                                                    x={x - 64}
                                                                    y={y - 76}
                                                                    width="128"
                                                                    height="48"
                                                                    rx="10"
                                                                    fill="#1F2937"
                                                                />

                                                                <text
                                                                    x={x}
                                                                    y={y - 56}
                                                                    textAnchor="middle"
                                                                    fill="#ffffff"
                                                                    fontSize="11"
                                                                >
                                                                    {formatCurrency(gasto.amount)}
                                                                </text>

                                                                <text
                                                                    x={x}
                                                                    y={y - 40}
                                                                    textAnchor="middle"
                                                                    fill="#D1D5DB"
                                                                    fontSize="10"
                                                                >
                                                                    {monthFormatter.format(gasto.date)}
                                                                </text>
                                                            </g>
                                                        )}

                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="6"
                                                            className="punto_grafico"
                                                            onMouseEnter={() => setHoveredPoint(index)}
                                                            onMouseLeave={() => setHoveredPoint(null)}
                                                        />

                                                        <text
                                                            x={x}
                                                            y="205"
                                                            textAnchor="middle"
                                                            className="texto_grafico texto_grafico_dia"
                                                        >
                                                            {gasto.day}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="analisis_empty_state">
                                        No hay gastos suficientes para mostrar el gráfico del mes.
                                    </div>
                                )}

                                <p className="analisis_resumen_linea">
                                    {resumenDescripcion}
                                </p>

                                <p className="analisis_resumen_diario">
                                    {gastoMayorDiaTexto}
                                </p>
                            </div>

                            {/* Bloque con la estimación de pagos de tarjeta de crédito */}
                            <div className="card_analisis card_estimacion">
                                <div className="card_titulo_block">
                                    <h2>Pago estimado en crédito</h2>
                                </div>

                                <div className="estimacion_contenido">
                                    <div className="estimacion_texto">
                                        <p className="monto_estimacion">
                                            {formatCurrency(totalCreditoMesActual)}
                                        </p>

                                        <p className="descripcion_estimacion">
                                            {resumenCreditoDescripcion}
                                        </p>
                                    </div>

                                    <div className="estimacion_icono">
                                        <img src={tarjetaIcon} alt="Tarjeta de crédito" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col_derecha">
                            {/* Bloque con el total gastado en el mes y la variación respecto al mes anterior */}
                            <div className="card_analisis card_total">
                                <div className="card_titulo_block card_titulo_block_row">
                                    <h2>Total gastos registrados</h2>

                                    {variacionPorcentual !== null && (
                                        <span
                                            className={`badge_variacion ${variacionPorcentual >= 0 ? "badge_alza" : "badge_baja"}`}
                                        >
                                            {`${variacionPorcentual >= 0 ? "+" : ""}${Math.abs(Math.round(variacionPorcentual))}%`}
                                        </span>
                                    )}
                                </div>

                                {loading ? (
                                    <h3 className="card_total_loading">Cargando...</h3>
                                ) : error ? (
                                    <p className="card_total_error">Error: {error}</p>
                                ) : (
                                    <>
                                        <p className="total_gastos_valor">
                                            {formatCurrency(totalMesActual)}
                                        </p>

                                        <p className="total_gastos_subtexto">
                                            {gastoTotalRegistrado} gastos en total registrados este mes (débito y efectivo).
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Bloque del gráfico circular mostrando la distribución por categorías */}
                            <div className="card_analisis card_categoria">
                                <div className="card_titulo_block">
                                    <h2>Gastos por Categoría</h2>
                                </div>

                                {categoriasPie.length > 0 ? (
                                    <div className="categoria_layout">
                                        <div className="pie_visual_wrap">
                                            <div
                                                className="pie_visual"
                                                style={{ background: `conic-gradient(${pieGradient})` }}
                                            />
                                        </div>

                                        <div className="categoria_leyenda">
                                            {categoriasPie.map((categoria, index) => (
                                                <div key={categoria.name} className="categoria_item">
                                                    <span
                                                        className="categoria_dot"
                                                        style={{ backgroundColor: categoryPalette[index % categoryPalette.length] }}
                                                    />
                                                    <div>
                                                        <p className="categoria_nombre">{categoria.name}</p>
                                                        <p className="categoria_monto">
                                                            {formatCurrency(categoria.amount)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="categoria_mayor_box">
                                                <span className="categoria_mayor_dot" />
                                                <p>
                                                    Mayor gasto: <strong>{totalCategoriaTexto}</strong>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="analisis_empty_state analisis_empty_state_compact">
                                        Aún no hay categorías para mostrar.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}