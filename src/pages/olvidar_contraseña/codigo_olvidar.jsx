import { useState, useEffect } from "react";
import frameee from "../../assets/icon/Frameee.png"
import logo from "../../assets/logo/Logo_Monex_Azul.png"


import { useNavigate } from "react-router-dom";
import { registrarUsuario, enviarCodigoRecuperacion, verificarCodigoRecuperacion } from "../../services/usuarioService";

export function RecuperarContraseña() {

    const [email, setEmail] = useState("");
    const [codigo, setCodigo] = useState("");

    const [codigoEnviado, setCodigoEnviado] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const [colorMensaje, setColorMensaje] = useState("");

    const enviarCodigo = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setMensaje("Debe ingresar un correo.");
            setColorMensaje("red");
            return;
        }

        try {
            await enviarCodigoRecuperacion(email);
            setCodigoEnviado(true);
            setMensaje("Se envió un código de verificación a tu correo.");
            setColorMensaje("#0d47a1");
        } catch (error) {
            setMensaje(error.message || "Error al enviar el código");
            setColorMensaje("red");
        }
    };

    const verificarCodigo = async (e) => {
        e.preventDefault();

        if (!codigo.trim()) {
            setMensaje("Ingrese el código recibido.");
            setColorMensaje("red");
            return;
        }

        try {
            await verificarCodigoRecuperacion(email, codigo);
            setMensaje("Código verificado correctamente.");
            setColorMensaje("green");
            console.log("Código:", codigo);
        } catch (error) {
            setMensaje(error.message || "Código inválido");
            setColorMensaje("red");
        }
    };

    return (
        <div className="contenedor_registro">

            <div className="fondo_imagen_registro"></div>

            <div className="register_registro">

                <div className="register_contenido_registro">

                    <img
                        src={logo}
                        alt="Logo Monex"
                        className="img_logo_registro"
                    />

                    <h2 className="titulo_recuperar">
                        Recuperar contraseña
                    </h2>

                    <p className="descripcion_recuperar">
                        Ingresa tu correo electrónico y te enviaremos un código de verificación.
                    </p>

                    <form
                        className="form_register_registro"
                        onSubmit={codigoEnviado ? verificarCodigo : enviarCodigo}
                    >

                        <div className="input_group_registro">

                            <label className="text_email_registro">
                                Correo electrónico
                            </label>

                            <div className="input_wrapper_registro">

                                <input
                                    className="input_email_registro"
                                    type="email"
                                    placeholder="Ingresa tu correo"
                                    value={email}
                                    disabled={codigoEnviado}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                            </div>

                        </div>

                        {codigoEnviado && (

                            <div className="input_group_registro">

                                <label className="text_usuario_registro">
                                    Código de verificación
                                </label>

                                <div className="input_wrapper_registro">

                                    <input
                                        className="codigo_input"
                                        type="text"
                                        placeholder="Ej: 482913"
                                        value={codigo}
                                        maxLength={6}
                                        onChange={(e) => setCodigo(e.target.value)}
                                    />

                                </div>

                            </div>

                        )}

                        {mensaje && (
                            <div
                                className="mensaje_recuperar"
                                style={{ color: colorMensaje }}
                            >
                                {mensaje}
                            </div>
                        )}

                        <div className="contenedor-botones_registro">

                            <button
                                className="boton_codigo"
                                type="submit"
                            >
                                {codigoEnviado
                                    ? "Verificar código"
                                    : "Enviar código"}
                            </button>

                        </div>

                        {codigoEnviado && (
                            <div className="reenviar_codigo">
                                ¿No recibiste el código?{" "}
                                <span
                                    onClick={enviarCodigo}
                                >
                                    Reenviar
                                </span>
                            </div>
                        )}

                        <div className="volver_login">
                            <a href="/">
                                Volver al inicio de sesión
                            </a>
                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}