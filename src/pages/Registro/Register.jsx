import { useState, useEffect } from "react";
import frameee from "../../assets/icon/Frameee.png"
import logo from "../../assets/logo/Logo_Monex_Azul.png"
import ocultar from "../../assets/icon/ocultar_contrasena.png"

import { useNavigate } from "react-router-dom";
import { registrarUsuario } from "../../services/usuarioService";

export function Register (){

    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [confirmarContraseña, setConfirmarContraseña] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Nuevo estado para la visibilidad de la contraseña
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Nuevo estado para la visibilidad de la confirmación de contraseña

    // --- Estados para mensajes de validación ---
    const [mensajeContraseñas, setMensajeContraseñas] = useState("");
    const [colorMensajeContraseñas, setColorMensajeContraseñas] = useState("");
    const [mensajeNombre, setMensajeNombre] = useState("");
    const [colorMensajeNombre, setColorMensajeNombre] = useState("");
    const [mensajeContraseña, setMensajeContraseña] = useState("");
    const [colorMensajeContraseña, setColorMensajeContraseña] = useState("");
    const [mensajeEmail, setMensajeEmail] = useState("");
    const [colorMensajeEmail, setColorMensajeEmail] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [erroresDuplicado, setErroresDuplicado] = useState({ nombre: false, email: false });

    // --- Expresiones regulares para validación ---
    // const regexEmail = /^[a-zA-Z0-9._%+-]+@(duocuc\.cl|gmail\.com|duocProfesor\.com)$/;
    const regexNombre = /^[a-zA-ZÀ-ÿ\s]{3,40}$/;
    const regexContraseña = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

    const validarNombre = (valor) => {
      if (valor === "") {
        setMensajeNombre("Debe ingresar un nombre.");
        setColorMensajeNombre("red");
        setErroresDuplicado({ ...erroresDuplicado, nombre: false });
        return false;
      } else if (!regexNombre.test(valor)) {
        setMensajeNombre("Nombre inválido.");
        setColorMensajeNombre("red");
        setErroresDuplicado({ ...erroresDuplicado, nombre: false });
        return false;
      } else if (!erroresDuplicado.nombre) {
        // Solo mostrar 'Nombre válido' si no hay error de duplicado
        setMensajeNombre("Nombre válido");
        setColorMensajeNombre("#0d47a1");
        return true;
      } else {
        return true;
      }
    };

    const validarEmail = (valor) => {
      if (valor === "") {
        setMensajeEmail("Debe ingresar un correo.");
        setColorMensajeEmail("red");
        return false;
      } else {
        setMensajeEmail("Correo válido");
        setColorMensajeEmail("#0d47a1");
        return true;
      }
    };

    const validarContraseña = (valor) => {
      if (valor === "") {
        setMensajeContraseña("Debe ingresar una contraseña.");
        setColorMensajeContraseña("red");
        return false;
      } else if (!regexContraseña.test(valor)) {
        setMensajeContraseña("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.");
        setColorMensajeContraseña("red");
        return false;
      } else {
        setMensajeContraseña("Contraseña válida");
        setColorMensajeContraseña("#0d47a1");
        return true;
      }
    };

    const confirmarContraseñas = (valor) => {
      if (valor !== contraseña) {
        setMensajeContraseñas("Las contraseñas no coinciden.");
        setColorMensajeContraseñas("red");
      } else {
        setMensajeContraseñas("Las contraseñas coinciden");
        setColorMensajeContraseñas("#0d47a1");
      }
    };


    useEffect(() => {
      console.log("Register montado");
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("Submit ejecutado");

      const esNombreValido = validarNombre(nombre);
      const esEmailValido = validarEmail(email);
      const esPasswordValida = validarContraseña(contraseña);
      const coinciden = contraseña === confirmarContraseña;

      if (!coinciden) {
        setMensajeContraseñas("Las contraseñas no coinciden.");
        setColorMensajeContraseñas("red");
        return;
      }

      if (!esNombreValido || !esEmailValido || !esPasswordValida) {
        return;
      }

      try {
        await registrarUsuario({
          username: nombre,
          email: email,
          password: contraseña,
        });
        window.alert("¡Registro exitoso! Redirigiendo al login");
        setTimeout(() => {
          navigate("/");
        }, 1800);
      } catch (error) {
        const mensajeError = error.message || "Error al registrar usuario";
        
        // Verificar si hay ambos errores
        const contieneUsuario = mensajeError.toLowerCase().includes("usuario");
        const contieneEmail = mensajeError.toLowerCase().includes("email");
        
        if (contieneUsuario && contieneEmail) {
          // Ambos errores existen
          setMensajeNombre("El nombre de usuario ya está registrado");
          setColorMensajeNombre("red");
          setErroresDuplicado({ nombre: true, email: true });
          
          setMensajeEmail("El email ya está registrado");
          setColorMensajeEmail("red");
        } else if (contieneUsuario) {
          // Solo error de usuario
          setMensajeNombre(mensajeError);
          setColorMensajeNombre("red");
          setErroresDuplicado({ ...erroresDuplicado, nombre: true });
        } else if (contieneEmail) {
          // Solo error de email
          setMensajeEmail(mensajeError);
          setColorMensajeEmail("red");
          setErroresDuplicado({ ...erroresDuplicado, email: true });
        } else {
          setMensajeEmail(mensajeError);
          setColorMensajeEmail("red");
        }
        console.error("Error en registro:", error);
      }
    };

    return(
    <div className="contenedor_registro">
      <div className="fondo_imagen_registro"></div>
      <div className="register_registro">
        <div className="register_contenido_registro">
          <img src={logo} alt="Logo Monex azul" className="img_logo_registro" />
          {mensajeExito && (
            <div style={{ color: "#0d47a1", fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
              {mensajeExito}
            </div>
          )}

          <form className="form_register_registro" onSubmit={handleSubmit}>
            <div className="input_group_registro">
              <label className="text_usuario_registro">Nombre usuario</label>
              <div className="input_wrapper_registro">
                <input
                  className="input_usuario_registro"
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    // Si hay error de duplicado, limpiar y marcar que ya no hay error
                    if (erroresDuplicado.nombre) {
                      setMensajeNombre("");
                      setColorMensajeNombre("");
                      setErroresDuplicado({ ...erroresDuplicado, nombre: false });
                    }
                    validarNombre(e.target.value);
                  }}
                />
              </div>
              <span style={{ color: colorMensajeNombre }}>
                {(colorMensajeNombre === "red" && mensajeNombre && mensajeNombre.toLowerCase().includes("registrado"))
                  ? <b>{mensajeNombre}</b>
                  : (colorMensajeNombre === "#0d47a1" && mensajeNombre === "Nombre válido")
                    ? mensajeNombre
                    : null}
              </span>
            </div>

            <div className="input_group_registro">
              <label className="text_email_registro">Email</label>
              <div className="input_wrapper_registro">
                <input
                  className="input_email_registro"
                  type="text"
                  placeholder="Ingresa tu correo electronico"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validarEmail(e.target.value);
                  }}
                />
              </div>
              <span style={{ color: colorMensajeEmail }}>
                {colorMensajeEmail === "red" && mensajeEmail ? <b>{mensajeEmail}</b> : mensajeEmail}
              </span>
            </div>

            <div className="input_group_registro">
              <label className="text_contraseña_registro">Contraseña</label>
              <div className="input_wrapper_registro">
                <input 
                  className="input_contraseña_registro"
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
                  className="input_icon_password_registro" 
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
              <span style={{ color: colorMensajeContraseña }}>{mensajeContraseña}</span>
            </div>

            <div className="input_group_registro">
              <label className="text_contraseña_registro">Repetir contraseña</label>
              <div className="input_wrapper_registro">
                <input 
                  className="input_contraseña_registro"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={confirmarContraseña}
                  onChange={(e) => {
                    setConfirmarContraseña(e.target.value);
                    confirmarContraseñas(e.target.value);
                  }}
                />
                <img 
                  src={ocultar} 
                  alt="icono contraseña" 
                  className="input_icon_password_registro" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>
              <span style={{ color: colorMensajeContraseñas }}>{mensajeContraseñas}</span>
            </div>
            <div className="contenedor-botones_registro">
              <button className="boton_registrarse" type="submit">Registrarse</button>
            </div>
          </form>
                        
  
        </div>
      </div>

    </div>
  )
}