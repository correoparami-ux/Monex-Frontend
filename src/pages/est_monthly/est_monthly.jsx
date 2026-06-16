import { useState, useEffect } from "react";
import { SideBarSwitcher } from "../../components/SideBar/SideBarSwitcher";
import { Navbar } from "../../components/Navbar/Navbar";
import alertaMensualIcon from "../../assets/icon/Alerta_mensual.png";
import "../../css/pages/est_monthly.css";
import AddExpenseModal from "../../components/Modal/AddExpenseModal";
import CreditCardConfigModal from "../../components/Modal/CreditCardConfigModal";
import {obtenerEstimacionMensual,obtenerGastos,} from "../../services/expensesService";
import { obtenerConfiguracionTarjeta } from "../../services/usuarioService";

export function EstMensual() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [cupoTarjeta, setCupoTarjeta] = useState(0);
  const [fechaFacturacion, setFechaFacturacion] = useState(null);

  const [estimaciones, setEstimaciones] = useState({
    totalEstimado: 0,
    comprasConTarjeta: 0,
    meses: [],
    pagosEstimados: [],
    detallesPagos: [],
    deudaTotal: 0,
    pagoMes: 0,
    cuotasPendientes: 0,
    totalCuotas: 0,
  });

  const monthFormatter = new Intl.DateTimeFormat("es-CL", {
    month: "long",
  });

  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;

    const parsed = Number(value);

    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const parseIsoDate = (isoDate) => {
    if (!isoDate) return null;

    if (isoDate instanceof Date) {
      return Number.isNaN(isoDate.getTime())
        ? null
        : isoDate;
    }

    if (
      Array.isArray(isoDate) &&
      isoDate.length >= 3
    ) {
      const [year, month, day] = isoDate.map(Number);

      if (!year || !month || !day) return null;

      const parsedArrayDate = new Date(
        year,
        month - 1,
        day
      );

      return Number.isNaN(parsedArrayDate.getTime())
        ? null
        : parsedArrayDate;
    }

    if (typeof isoDate === "object") {
      const year = Number(isoDate.year);

      const month = Number(
        isoDate.monthValue ?? isoDate.month
      );

      const day = Number(
        isoDate.dayOfMonth ?? isoDate.day
      );

      if (year && month && day) {
        const parsedObjectDate = new Date(
          year,
          month - 1,
          day
        );

        return Number.isNaN(
          parsedObjectDate.getTime()
        )
          ? null
          : parsedObjectDate;
      }
    }

    if (typeof isoDate !== "string") return null;

    const datePart = isoDate.slice(0, 10);

    let year;
    let month;
    let day;

    if (datePart.includes("-")) {
      [year, month, day] = datePart
        .split("-")
        .map(Number);
    } else if (datePart.includes("/")) {
      const parts = datePart
        .split("/")
        .map(Number);

      if (parts.length === 3) {
        if (String(parts[0]).length === 4) {
          [year, month, day] = parts;
        } else {
          [day, month, year] = parts;
        }
      }
    }

    if (!year || !month || !day) return null;

    const parsed = new Date(year, month - 1, day);

    return Number.isNaN(parsed.getTime())
      ? null
      : parsed;
  };

  const normalizeMonthLabel = (date) => {
    const raw = monthFormatter.format(date);

    return (
      raw.charAt(0).toUpperCase() + raw.slice(1)
    );
  };

  const getMonthKey = (date) =>
    `${date.getFullYear()}-${date.getMonth()}`;

  const monthDiff = (from, to) =>
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  const getPendingInstallments = (expense) => {
    const totalInstallments = Math.max(
      1,
      toNumber(expense?.installments)
    );

    const expenseDate = parseIsoDate(expense?.date);

    if (!expenseDate) {
      return totalInstallments;
    }

    // Use billing day if configured, otherwise default to 1
    const billingDay =
      Number(fechaFacturacion) > 0
        ? Number(fechaFacturacion)
        : 1;

    const computeCycleStart = (date, day) => {
      const candidate = new Date(
        date.getFullYear(),
        date.getMonth(),
        day
      );
      if (date.getDate() >= day) {
        return candidate;
      }
      return new Date(date.getFullYear(), date.getMonth() - 1, day);
    };

    const startCycle = computeCycleStart(expenseDate, billingDay);
    const now = new Date();
    const currentCycle = computeCycleStart(now, billingDay);

    const elapsedMonths = monthDiff(startCycle, currentCycle);

    const paidInstallments =
      elapsedMonths <= 0 ? 0 : Math.min(totalInstallments, elapsedMonths);

    return Math.max(0, totalInstallments - paidInstallments);
  };

  const buildEstimateFromExpenses = (
    allExpenses,
    apiEstimate
  ) => {
    const creditExpenses = (
      Array.isArray(allExpenses)
        ? allExpenses
        : []
    ).filter(
      (expense) =>
        expense.paymentMethod === "CREDITO"
    );

    const monthMap = new Map();

    let deudaTotal = 0;
    let cuotasPendientes = 0;
    let totalCuotas = 0;
    let totalGastadoCredito = 0;

    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    creditExpenses.forEach((expense) => {
      const amount = toNumber(expense.amount);

      const commission = toNumber(
        expense.commission
      );

      const commissionAmount =
        amount * (commission / 100);

      const installments = Math.max(
        1,
        toNumber(expense.installments)
      );

      const totalWithCommission =
        amount + commissionAmount;

      totalGastadoCredito += totalWithCommission;

      const monthlyPayment =
        totalWithCommission / installments;

      const expenseDate = parseIsoDate(
        expense.date
      );

      if (!expenseDate) return;

      const startMonth = new Date(
        expenseDate.getFullYear(),
        expenseDate.getMonth(),
        1
      );

      const elapsedMonths = monthDiff(
        startMonth,
        currentMonthStart
      );

      const paidInstallments =
        elapsedMonths <= 0
          ? 0
          : Math.min(
              installments,
              elapsedMonths
            );

      const pendingInstallments =
        getPendingInstallments(expense);

      if (pendingInstallments > 0) {
        totalCuotas += installments;

        cuotasPendientes +=
          pendingInstallments;

        deudaTotal +=
          monthlyPayment *
          pendingInstallments;
      }

      for (
        let installmentIndex =
          paidInstallments;
        installmentIndex < installments;
        installmentIndex += 1
      ) {
        const dueMonth = new Date(
          startMonth.getFullYear(),
          startMonth.getMonth() +
            installmentIndex,
          1
        );

        const dueKey =
          getMonthKey(dueMonth);

        const entry = monthMap.get(dueKey);

        if (entry) {
          entry.monto += monthlyPayment;
        } else {
          monthMap.set(dueKey, {
            monthDate: dueMonth,
            mes: normalizeMonthLabel(
              dueMonth
            ),
            monto: monthlyPayment,
          });
        }
      }
    });

    const pagosEstimados = Array.from(
      monthMap.values()
    )
      .sort(
        (a, b) =>
          new Date(a.monthDate) -
          new Date(b.monthDate)
      )
      .map((item) => ({
        mes: item.mes,
        monto: Math.round(item.monto),
      }));

    const detallesPagos = creditExpenses
      .map((expense) => {
        const amount = toNumber(
          expense.amount
        );

        const commission = toNumber(
          expense.commission
        );

        const commissionAmount =
          amount * (commission / 100);

        const installments = Math.max(
          1,
          toNumber(expense.installments)
        );

        const monthlyPayment =
          (amount + commissionAmount) /
          installments;

        const pendingInstallments =
          getPendingInstallments(expense);

        return {
          nombre: expense.name,
          monto: Math.round(
            amount + commissionAmount
          ),
          cuotas: pendingInstallments,
          cuotasTotales: installments,
          pagoEstimado: Math.round(
            monthlyPayment
          ),
        };
      })
      .filter((i) => i.cuotas > 0)
      .sort(
        (a, b) =>
          b.pagoEstimado - a.pagoEstimado
      )
      .slice(0, 6);

    const totalEstimadoApi = toNumber(
      apiEstimate?.totalMonthlyEstimate
    );

    const comprasTarjetaApi = toNumber(
      apiEstimate?.totalCreditExpenses
    );

    const pagoMesCalculado =
      pagosEstimados[0]?.monto ?? 0;

    const totalEstimadoFinal =
      pagoMesCalculado > 0
        ? pagoMesCalculado
        : totalEstimadoApi;

    const comprasActivas =
      detallesPagos.length;

    return {
      totalEstimado: totalEstimadoFinal,
      totalGastadoCredito: Math.round(
        totalGastadoCredito
      ),
      comprasConTarjeta:
        comprasTarjetaApi > 0
          ? comprasTarjetaApi
          : comprasActivas,
      meses: pagosEstimados,
      pagosEstimados,
      detallesPagos,
      deudaTotal: Math.round(deudaTotal),
      pagoMes: pagoMesCalculado,
      cuotasPendientes,
      totalCuotas,
    };
  };

  const loadEstimateData = async () => {
    try {
      setLoading(true);
      setError("");

      const [estimate, expenses, config] =
        await Promise.all([
          obtenerEstimacionMensual(),
          obtenerGastos(),
          obtenerConfiguracionTarjeta(),
        ]);

      if (config && config.cupoTarjeta) {
        setCupoTarjeta(config.cupoTarjeta);
      }
      if (config && config.fechaFacturacion) {
        setFechaFacturacion(Number(config.fechaFacturacion));
      }

      setEstimaciones(
        buildEstimateFromExpenses(
          expenses,
          estimate,
          config?.fechaFacturacion
        )
      );
    } catch (err) {
      console.error(
        "Error al cargar estimación mensual:",
        err
      );

      setError(
        err.message ||
          "No se pudo cargar la estimación mensual"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimateData();
  }, []);

  return (
    <div className="est_mensual_layout">
      <SideBarSwitcher />

      <Navbar
        onOpenExpenseModal={() =>
          setIsExpenseModalOpen(true)
        }
        onOpenConfigModal={() =>
          setIsConfigModalOpen(true)
        }
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() =>
          setIsExpenseModalOpen(false)
        }
        onExpenseCreated={loadEstimateData}
      />

      <CreditCardConfigModal
        isOpen={isConfigModalOpen}
        onClose={() =>
          setIsConfigModalOpen(false)
        }
        onConfigSaved={loadEstimateData}
      />

      <div className="contenedor_est_mensual">
        <div className="est_header">
          <h1>Estimación Mensual</h1>

          <p className="est_descripcion">
            Aqui puedes ver una estimación de los
            pagos mensuales de tu tarjeta de crédito
            basado en tus gastos registrados con este método de pago.
          </p>
        </div>

        <div className="est_content">
          {loading && (
            <p>
              Cargando estimación mensual...
            </p>
          )}

          {error && <p>{error}</p>}

          {!loading &&
            !error &&
            (() => {
              const maxMonto =
                estimaciones.pagosEstimados.reduce(
                  (max, item) =>
                    Math.max(
                      max,
                      item.monto
                    ),
                  0
                );

              const spent = estimaciones.totalGastadoCredito || 0;
              const cupo = cupoTarjeta || 0;
              const gastoPercent =
                cupo > 0
                  ? Math.min(100, Math.round((spent / cupo) * 100))
                  : 0;

              return (
                <>
                  <div className="est_main">
                    <div className="est_card">
                      <div className="est_card_header">
                        <h2 className="est_card_title">
                          Estimación Mensual
                        </h2>
                      </div>

                      <div className="est_card_body">
                        <div className="est_monto">
                          <span className="monto_valor">
                            $
                            {estimaciones.totalEstimado.toLocaleString()}
                          </span>

                          <p className="monto_texto">
                            Basado en{" "}
                            {
                              estimaciones.comprasConTarjeta
                            }{" "}
                            compras con tarjeta de
                            crédito
                          </p>
                        </div>

                          {cupoTarjeta > 0 && (
                            <div className="cupo_comparacion">
                              <p className="cupo_label">
                                Total gastado / cupo de tarjeta:
                              </p>
                              <p className="cupo_valor">
                                $
                                {spent.toLocaleString()}
                                /$
                                {cupoTarjeta.toLocaleString()}
                              </p>
                            </div>
                          )}

                        <div className="est_progress_bar" aria-hidden>
                          <div
                            className="est_progress_fill"
                            style={{ width: `${gastoPercent}%` }}
                          ></div>
                        </div>

                        <div className="est_meses">
                          {estimaciones.meses.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={index}
                                className="mes_item"
                              >
                                <span className="mes_monto">
                                  $
                                  {item.monto.toLocaleString()}
                                </span>

                                <span className="mes_nombre">
                                  {item.mes}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="est_table_card">
                      <h2>
                        Detalles de los
                        Próximos Pagos
                      </h2>

                      <table className="est_table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Monto</th>
                            <th>Cuotas</th>
                            <th>
                              Pago Estimado
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {estimaciones.detallesPagos
                            .length > 0 ? (
                            estimaciones.detallesPagos.map(
                              (
                                pago,
                                index
                              ) => (
                                <tr
                                  key={index}
                                >
                                  <td>
                                    {
                                      pago.nombre
                                    }
                                  </td>

                                  <td>
                                    $
                                    {pago.monto.toLocaleString()}
                                  </td>

                                  <td>
                                    {
                                      pago.cuotas
                                    }{" "}
                                    de{" "}
                                    {
                                      pago.cuotasTotales
                                    }
                                  </td>

                                  <td>
                                    $
                                    {pago.pagoEstimado.toLocaleString()}
                                  </td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              <td colSpan="4">
                                No hay gastos
                                con crédito
                                para estimar
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="est_sidebar">
                    <div className="est_chart_card">
                      <h2>
                        Pagos Mensuales
                        Estimados
                      </h2>

                      <div className="est_chart">
                        <div className="chart_axis">
                          {(() => {
                            const valores = estimaciones.pagosEstimados
                              .map((p) => p.monto)
                              .sort((a, b) => b - a)
                              .slice(0, 4);
                            
                            return valores.map(
                              (
                                monto,
                                index
                              ) => (
                                <span
                                  key={index}
                                  className="chart_axis_label"
                                >
                                  $
                                  {monto.toLocaleString()}
                                </span>
                              )
                            );
                          })()}
                        </div>

                        <div className="chart_plot">
                          {estimaciones.pagosEstimados.map(
                            (
                              pago,
                              index
                            ) => (
                              <div
                                key={index}
                                className="chart_bar_container"
                              >
                                <span className="chart_bar_value">
                                  $
                                  {pago.monto.toLocaleString()}
                                </span>

                                <div
                                  className="chart_bar"
                                  style={{
                                    height: `${
                                      maxMonto >
                                      0
                                        ? (pago.monto /
                                            maxMonto) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>

                                <span className="chart_label">
                                  {
                                    pago.mes
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="est_resumen">
                      <div className="resumen_item">
                        <span className="resumen_label">
                          Deuda en total:
                        </span>

                        <span className="resumen_valor">
                          $
                          {estimaciones.deudaTotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="resumen_item">
                        <span className="resumen_label">
                          Pago estimado del
                          mes:
                        </span>

                        <span className="resumen_valor">
                          $
                          {estimaciones.pagoMes.toLocaleString()}
                        </span>
                      </div>

                      <div className="resumen_item">
                        <span className="resumen_label">
                          Total de cuotas
                          pendientes:
                        </span>

                        <span className="resumen_valor">
                          {
                            estimaciones.cuotasPendientes
                          }{" "}
                          de{" "}
                          {
                            estimaciones.totalCuotas
                          }{" "}
                          cuotas
                        </span>
                      </div>
                    </div>

                    <div className="est_alerta">
                      <img
                        className="alerta_icono"
                        src={alertaMensualIcon}
                        alt="Alerta mensual"
                      />

                      <span className="alerta_texto">
                        La deuda y el pago
                        mensual son
                        aproximados basados
                        en los gastos
                        ingresados y puede no ser exacto, ya que el
                        sistema no se conecta
                        con entidades
                        bancarias.
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

export default EstMensual;