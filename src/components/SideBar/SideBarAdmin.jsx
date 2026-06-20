import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../css/components/sideBarAdmin.css';
import home from "../../assets/icon/home.png";
import gastos from "../../assets/icon/gastos.png";
import categoria from "../../assets/icon/categorias.png";
import analisis from "../../assets/icon/analisis.png";
import estMensual from "../../assets/icon/est_mensual.png";
import logout from "../../assets/icon/cerrar_sesion.png";
import usuario_avatar from "../../assets/icon/usuario.png";
import botonAdmin from "../../assets/icon/BotonAdmin.png";

const USERS_BASE_URL = import.meta.env.VITE_USERS_API_URL;

export function SideBarAdmin() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState({ username: "Usuario", email: "" });

    useEffect(() => {
        const cargarUsuario = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            try {
                const response = await fetch(`${USERS_BASE_URL}/api/auth/me`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                setUsuario({
                    username: data.username || "Usuario",
                    email: data.email || "",
                });
            } catch (error) {
                console.error("Error al cargar usuario:", error);
            }
        };

        cargarUsuario();
    }, []);

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        sessionStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <div className="contenedor_sideBar">
            <div className="contenedor_botones">
                <button
                    type="button"
                    className="boton_inicio"
                    onClick={() => navigate("/Home")}
                >
                    Inicio
                    <img src={home} alt="Inicio" />
                </button>

                <button
                    type="button"
                    className="boton_panel_admin"
                    onClick={() => navigate("/PanelAdmin")}
                >
                    Panel Admin
                    <img src={botonAdmin} alt="Panel Admin" />
                </button>

                <button
                    type="button"
                    className="boton_gastos"
                    onClick={() => navigate("/Gastos")}
                >
                    Gastos
                    <img src={gastos} alt="Gastos" />
                </button>

                <button
                    type="button"
                    className="boton_categoria"
                    onClick={() => navigate("/categorias")}
                >
                    Categoria
                    <img src={categoria} alt="Categoria" />
                </button>

                <button
                    type="button"
                    className="boton_analisis"
                    onClick={() => navigate("/Analisis")}
                >
                    Analisis
                    <img src={analisis} alt="Analisis" />
                </button>

                <button
                    type="button"
                    className="boton_est_mensual"
                    onClick={() => navigate("/est_monthly")}
                >
                    Est. Mensual
                    <img src={estMensual} alt="Est. Mensual" />
                </button>
            </div>

            <div className="sidebar_footer">
                <div className="usuario_info">
                    <div className="usuario_avatar_container">
                        <img
                            src={usuario_avatar}
                            alt="Imagen de usuario"
                            className="usuario_avatar_img"
                        />
                    </div>

                    <div className="usuario_datos">
                        <p className="texto_usuario_sidebar">
                            {usuario.username}
                        </p>

                        <p className="texto_email_sidebar">
                            {usuario.email}
                        </p>
                    </div>
                </div>

                <button
                    className="boton_logout"
                    onClick={cerrarSesion}
                >
                    <img src={logout} alt="Cerrar Sesión" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}