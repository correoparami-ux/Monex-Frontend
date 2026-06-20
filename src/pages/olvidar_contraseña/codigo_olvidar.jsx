import { useState, useEffect } from "react";
import frameee from "../../assets/icon/Frameee.png"
import logo from "../../assets/logo/Logo_Monex_Azul.png"


import { useNavigate } from "react-router-dom";
import { registrarUsuario, enviarCodigoRecuperacion, verificarCodigoRecuperacion, cambiarContraseña } from "../../services/usuarioService";

export function RecuperarContraseña() {

    const [email, setEmail] = useState("");
    const [codigo, setCodigo] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoVerificado, setCodigoVerificado] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const [colorMensaje, setColorMensaje] = useState("");

    const navigate = useNavigate();

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
            setCodigoVerificado(true);
            setMensaje("Código verificado correctamente.");
            setColorMensaje("green");
        } catch (error) {
            setMensaje(error.message || "Código inválido");
            setColorMensaje("red");
        }
    };

    const cambiarPassword = async (e) => {
        e.preventDefault();

        if (!newPassword.trim()) {
            setMensaje("Debe ingresar una nueva contraseña.");
            setColorMensaje("red");
            return;
        }

        if (newPassword.length < 6) {
            setMensaje("La contraseña debe tener al menos 6 caracteres.");
            setColorMensaje("red");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMensaje("Las contraseñas no coinciden.");
            setColorMensaje("red");
            return;
        }

        try {
            await cambiarContraseña(email, codigo, newPassword);
            setMensaje("Contraseña cambiada correctamente. Redirigiendo...");
            setColorMensaje("green");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            setMensaje(error.message || "Error al cambiar la contraseña");
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
                        {codigoVerificado ? "Cambiar contraseña" : "Recuperar contraseña"}
                    </h2>

                    <p className="descripcion_recuperar">
                        {codigoVerificado 
                            ? "Ingresa tu nueva contraseña"
                            : "Ingresa tu correo electrónico y te enviaremos un código de verificación."}
                    </p>

                    <form
                        className="form_register_registro"
                        onSubmit={codigoVerificado ? cambiarPassword : (codigoEnviado ? verificarCodigo : enviarCodigo)}
                    >

                        {!codigoVerificado && (
                            <>
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
                            </>
                        )}

                        {codigoVerificado && (
                            <>
                                <div className="input_group_registro">

                                    <label className="text_usuario_registro">
                                        Nueva contraseña
                                    </label>

                                    <div className="input_wrapper_registro">

                                        <input
                                            className="input_email_registro"
                                            type="password"
                                            placeholder="Ingresa tu nueva contraseña"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />

                                    </div>

                                </div>

                                <div className="input_group_registro">

                                    <label className="text_usuario_registro">
                                        Confirmar contraseña
                                    </label>

                                    <div className="input_wrapper_registro">

                                        <input
                                            className="input_email_registro"
                                            type="password"
                                            placeholder="Confirma tu contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />

                                    </div>

                                </div>
                            </>
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
                                {codigoVerificado
                                    ? "Cambiar contraseña"
                                    : codigoEnviado
                                        ? "Verificar código"
                                        : "Enviar código"}
                            </button>

                        </div>

                        {codigoEnviado && !codigoVerificado && (
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