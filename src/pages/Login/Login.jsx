import { useEffect, useRef, useState } from "react";
import frameee from "../../assets/icon/Frameee.png";
import logo from "../../assets/logo/Logo_Monex_Azul.png";
import ocultar from "../../assets/icon/ocultar_contrasena.png";
import { useNavigate } from "react-router-dom";

const USERS_BASE_URL = import.meta.env.VITE_USERS_API_URL;

export function Login() {
    const navigate = useNavigate();
    const googleButtonRef = useRef(null);

    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [mensajeContraseñas, setMensajeContraseñas] = useState("");
    const [colorMensajeContraseñas, setColorMensajeContraseñas] = useState("");
    const [mensajeContraseña, setMensajeContraseña] = useState("");
    const [colorMensajeContraseña, setColorMensajeContraseña] = useState("");
    const [mensajeEmail, setMensajeEmail] = useState("");
    const [colorMensajeEmail, setColorMensajeEmail] = useState("");
    const [googleHabilitado, setGoogleHabilitado] = useState(false);
    const [googleSdkListo, setGoogleSdkListo] = useState(false);
    const [mensajeGoogle, setMensajeGoogle] = useState("");
    const [colorMensajeGoogle, setColorMensajeGoogle] = useState("");

    const regexNombre = /^[a-zA-ZÀ-ÿ\s]{3,40}$/;
    const regexContraseña = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

    const validarEmail = (valor) => {
        if (valor === "") {
            setMensajeEmail("Debe ingresar un correo.");
            setColorMensajeEmail("red");
            return false;
        } else {
            return true;
        }
    };

    const validarContraseña = (valor) => {
        if (valor === "") {
            setMensajeContraseña("Debe ingresar una contraseña.");
            setColorMensajeContraseña("red");
            return false;
        } else {
            return true;
        }
    };

    const iniciarSesionConGoogle = async (idToken) => {
        try {
            const res = await fetch(`${USERS_BASE_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "No se pudo iniciar sesión con Google");
            }

            const data = await res.json();
            const token = data.access_token;

            if (token) {
                localStorage.setItem("token", token);
            }

            sessionStorage.setItem("usuario", JSON.stringify(data));
            navigate("/home");
        } catch (error) {
            console.error(error);
            setMensajeGoogle(error.message || "Error al iniciar sesión con Google");
            setColorMensajeGoogle("red");
        }
    };

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
            console.warn("Falta configurar VITE_GOOGLE_CLIENT_ID para habilitar Google.");
            setGoogleHabilitado(true);
            setMensajeGoogle("Crea frontend/.env con VITE_GOOGLE_CLIENT_ID para mostrar el botón de Google.");
            setColorMensajeGoogle("#f2c94c");
            return undefined;
        }

        setGoogleHabilitado(true);

        if (window.google?.accounts?.id) {
            setGoogleSdkListo(true);
            return undefined;
        }

        const scriptId = "google-gsi-client";
        const existingScript = document.getElementById(scriptId);

        const handleLoad = () => {
            setGoogleSdkListo(true);
        };

        if (existingScript) {
            existingScript.addEventListener("load", handleLoad);
            return () => existingScript.removeEventListener("load", handleLoad);
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = handleLoad;
        document.body.appendChild(script);

        return () => {
            script.onload = null;
        };
    }, []);

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!googleHabilitado || !googleSdkListo || !clientId || !googleButtonRef.current || !window.google?.accounts?.id) {
            return;
        }

        googleButtonRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
                if (response?.credential) {
                    iniciarSesionConGoogle(response.credential);
                }
            },
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: 360,
            text: "continue_with",
        });
    }, [googleHabilitado, googleSdkListo]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const esPasswordValida = validarContraseña(contraseña);
        const esEmailValido = validarEmail(email);

        if (!esPasswordValida || !esEmailValido) return;

        try {
            const res = await fetch(`${USERS_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: contraseña,
                }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                return;
            }

            const data = await res.json();

            const token = data.access_token;

            if (token) {
                localStorage.setItem("token", token);
            }

            sessionStorage.setItem("usuario", JSON.stringify(data));

            navigate("/home");
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        }
    };

    return (
        <div className="contenedor_login">
            <div className="fondo_imagen"></div>

            <div className="login">
                <div className="login_contenido">
                    <img src={logo} alt="Logo Monex azul" className="img_logo" />

                    <form className="form_login" onSubmit={handleSubmit}>
                        <div className="input_group">
                            <label className="text_email">Email</label>

                            <div className="input_wrapper">
                                <input
                                    className="input_email"
                                    type="text"
                                    placeholder="Ingresa tu correo electronico"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        validarEmail(e.target.value);
                                    }}
                                />

                                <img src={frameee} alt="icono email" className="input_icon_email" />
                            </div>

                            <span style={{ color: colorMensajeEmail }}>
                                {mensajeEmail}
                            </span>
                        </div>

                        <div className="input_group">
                            <label className="text_contraseña">Contraseña</label>

                            <div className="input_wrapper">
                                <input
                                    className="input_contraseña"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    value={contraseña}
                                    onChange={(e) => {
                                        setContraseña(e.target.value);
                                        validarContraseña(e.target.value);
                                    }}
                                />

                                <img
                                    src={ocultar}
                                    alt="icono contraseña"
                                    className="input_icon_password"
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </div>

                            <span style={{ color: colorMensajeContraseña }}>
                                {mensajeContraseña}
                            </span>
                        </div>
                            <p>
                                <a href="/codigo_olvidar" className="link_olvidaste_contraseña">
                                    Olvidaste tu contraseña?
                                </a>
                            </p>
                        <div className="acciones_login">
                            <div className="contenedor-botones">
                                <button className="boton_ingresar" type="submit">
                                    Iniciar sesión
                                </button>

                                <button
                                    className="boton_registro"
                                    type="button"
                                    onClick={() => navigate("/Register")}
                                >
                                    Registrarte
                                </button>
                            </div>

                            {googleHabilitado && (
                                <>
                                    <div className="google_login_separator">o</div>

                                    <div className="google_login_block">
                                        <div
                                            className="google_button_container"
                                            ref={googleButtonRef}
                                        ></div>

                                        {mensajeGoogle && (
                                            <span
                                                style={{ color: colorMensajeGoogle }}
                                                className="google_login_message"
                                            >
                                                {mensajeGoogle}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}