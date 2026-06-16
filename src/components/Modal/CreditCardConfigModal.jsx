import { useState, useEffect } from "react";
import "../../css/components/CreditCardConfigModal.css";
import {
  guardarConfiguracionTarjeta,
  obtenerConfiguracionTarjeta,
} from "../../services/usuarioService";

function CreditCardConfigModal({ isOpen, onClose, onConfigSaved }) {
  const [fechaFacturacion, setFechaFacturacion] = useState("");
  const [sueldoMes, setSueldoMes] = useState("");
  const [cupoTarjeta, setCupoTarjeta] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      setLoadingData(true);
      const data = await obtenerConfiguracionTarjeta();
      if (data) {
        setFechaFacturacion(data.fechaFacturacion || "");
        setSueldoMes(data.sueldoMes || "");
        setCupoTarjeta(data.cupoTarjeta || "");
      }
      setError("");
    } catch (err) {
      console.log("No hay configuración guardada aún");
      setError("");
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const limpiarFormulario = () => {
    setFechaFacturacion("");
    setSueldoMes("");
    setCupoTarjeta("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fechaFacturacion || !sueldoMes || !cupoTarjeta) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      await guardarConfiguracionTarjeta({
        fechaFacturacion: parseInt(fechaFacturacion),
        sueldoMes: parseFloat(sueldoMes),
        cupoTarjeta: parseFloat(cupoTarjeta),
      });

      limpiarFormulario();
      if (onConfigSaved) {
        onConfigSaved();
      }
      onClose();
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      setError(err.message || "Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  return (
    <div className="modal_overlay" onClick={handleClose}>
      <div
        className="modal_content_tarjeta"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal_header_tarjeta">
          <h2>Configuración de Tarjeta de Crédito</h2>
          <button
            className="modal_close_btn"
            onClick={handleClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {loadingData ? (
          <div className="loading_message">Cargando configuración...</div>
        ) : (
          <form onSubmit={handleSubmit} className="form_tarjeta">
          {error && <div className="error_message">{error}</div>}

          <div className="form_group_tarjeta">
            <label htmlFor="fechaFacturacion">
              Fecha de Facturación (día del mes):
            </label>
            <input
              type="number"
              id="fechaFacturacion"
              min="1"
              max="31"
              value={fechaFacturacion}
              onChange={(e) => setFechaFacturacion(e.target.value)}
              placeholder="Ej: 15"
              required
            />
          </div>

          <div className="form_group_tarjeta">
            <label htmlFor="sueldoMes">Sueldo ganado a fin de mes:</label>
            <div className="input_with_currency">
              <span className="currency_symbol">$</span>
              <input
                type="number"
                id="sueldoMes"
                value={sueldoMes}
                onChange={(e) => setSueldoMes(e.target.value)}
                placeholder="Ej: 2.500.000"
                step="1"
                required
              />
            </div>
          </div>

          <div className="form_group_tarjeta">
            <label htmlFor="cupoTarjeta">Cupo de tarjeta de crédito:</label>
            <div className="input_with_currency">
              <span className="currency_symbol">$</span>
              <input
                type="number"
                id="cupoTarjeta"
                value={cupoTarjeta}
                onChange={(e) => setCupoTarjeta(e.target.value)}
                placeholder="Ej: 500.000"
                step="1"
                required
              />
            </div>
          </div>

          <div className="form_actions_tarjeta">
            <button
              type="button"
              className="btn_cancel_tarjeta"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn_submit_tarjeta"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

export default CreditCardConfigModal;
