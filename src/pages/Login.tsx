// Importa useState para guardar valores que cambian en el componente
import { useState } from "react";

// Importa useNavigate para cambiar de ruta desde el código
import { useNavigate } from "react-router-dom";

// MEJORAR CODIGO
import { API_URL } from "../config/api";

// Importa los estilos del Login
import "../styles/Login.css";

// Componente de inicio de sesión
function Login() {
    // Guarda el correo escrito por el usuario
    const [email, setEmail] = useState("");

    // Guarda el código OTP escrito por el usuario
    const [codigo, setCodigo] = useState("");

    // Indica si ya se solicitó el código OTP
    const [otpEnviado, setOtpEnviado] = useState(false);

    // Guarda mensajes enviados por el backend
    const [mensaje, setMensaje] = useState("");

    // Evita presionar varias veces mientras se procesa una petición
    const [cargando, setCargando] = useState(false);

    // Permite redirigir al usuario a otra ruta
    const navigate = useNavigate();

    // Función para solicitar el código OTP al backend
    const enviarOtp = async () => {
        if (!email.trim()) {
            setMensaje("Ingresa tu correo electrónico");
            return;
        }

        setCargando(true);
        setMensaje("");

        try {
            // Envía el correo al servidor Flask
            const respuesta = await fetch(`${API_URL}/send-otp`, {
                // Indica que se enviarán datos al servidor
                method: "POST",

                // Indica que los datos enviados tienen formato JSON
                headers: {
                    "Content-Type": "application/json"
                },
                // Convierte el correo a JSON y lo envía al backend
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.message);
            }

            // Muestra el campo solamente cuando el correo fue enviado
            setEmail(email.trim().toLowerCase());
            setOtpEnviado(true);
            setMensaje(datos.message);
        }
        catch (error) {
            setMensaje(
                error instanceof Error
                    ? error.message
                    : "No se pudo enviar el código"
            );
        }
        finally {
            setCargando(false);
        }
    };

    // Función para verificar el código OTP
    const verificarOtp = async () => {
        setCargando(true);
        setMensaje("");

        try {
            // Envía el correo y el código al backend para verificarlos
            const respuesta = await fetch(
                `${API_URL}/verify-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },
                    // Envía correo y código en formato JSON
                    body: JSON.stringify({
                        email,
                        codigo
                    })
                }
            );

            // Convierte la respuesta del servidor a JSON
            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.success) {
                throw new Error(datos.message);
            }

            // Guarda una sesión básica en el navegador
            localStorage.setItem("dashboard_logged_in", "true");

            // Redirige al Dashboard
            navigate("/dashboard");
        }
        catch (error) {
            setMensaje(
                error instanceof Error
                    ? error.message
                    : "No se pudo verificar el código"
            );
        }
        finally {
            setCargando(false);
        }
    };
    return(
        // Contenedor principal del Login
        <section className="login-page">

            <h2>Iniciar sesión</h2>
            {/* Campo para ingresar el correo */}
            <input
                type="email"
                placeholder="Correo electrónico"

                // Muestra el valor guardado en email
                value={email}

                // Actualiza email cuando el usuario escribe
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpEnviado || cargando}
            />

            {/* Ejecuta enviarOtp al presionar el botón */}
            {!otpEnviado && (
                <button onClick={enviarOtp} disabled={cargando}>
                    {cargando ? "Enviando..." : "Enviar código OTP"}
                </button>
            )}

            {/* Solo se muestra después de enviar el OTP */}
            {otpEnviado && (
                <>
                    {/* Campo para ingresar el código recibido */}
                    <input
                        type="text"
                        placeholder="Código OTP"

                        // Muestra el código guardado
                        value={codigo}

                        // Actualiza codigo cuando el usuario escribe
                        onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, "");
                            setCodigo(valor);
                        }}
                        maxLength={6}
                        inputMode="numeric"
                        disabled={cargando}
                    />

                    {/* Ejecuta la verificación del código */}
                    <button
                        onClick={verificarOtp}
                        disabled={cargando || codigo.length !== 6}
                    >
                        {cargando ? "Verificando..." : "Verificar código"}
                    </button>
                </>
            )}

            {/* Muestra mensajes de éxito o error */}
            {mensaje && <p className="login-message">{mensaje}</p>}
        </section>
    );
}
// Permite importar el componente desde otros archivos
export default Login;