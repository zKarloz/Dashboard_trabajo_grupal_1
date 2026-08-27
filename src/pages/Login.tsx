// Importa useState para guardar valores que cambian en el componente
import { useState } from "react";

// Importa useNavigate para cambiar de ruta desde el código
import { useNavigate } from "react-router-dom";

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

    // Permite redirigir al usuario a otra ruta
    const navigate = useNavigate();

    // Función para solicitar el código OTP al backend
    const enviarOtp = async () => {

        // Envía el correo al servidor Flask
        await fetch("http://127.0.0.1:5000/send-otp", 
            {
                // Indica que se enviarán datos al servidor
                method: "POST",

                // Indica que los datos enviados tienen formato JSON
                headers: {
                    "Content-Type": "application/json"
                },
                // Convierte el correo a JSON y lo envía al backend
                body: JSON.stringify({ email })
            });

        // Muestra el campo para ingresar el código OTP
        setOtpEnviado(true);
    };

    // Función para verificar el código OTP
    const verificarOtp = async () => {

        // Envía el correo y el código al backend para verificarlos
        const respuesta = await fetch(
            "http://127.0.0.1:5000/verify-otp",
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

        // Comprueba si el backend indicó que el código es correcto
        if (datos.success) {
            // Guarda una sesión básica en el navegador
            localStorage.setItem(
                "dashboard_logged_in",
                "true"
            );
            // Redirige al Dashboard
            navigate("/dashboard");
        }
        else {
            // Muestra un mensaje si el código es incorrecto
            alert("Código incorrecto");
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
            />

            {/* Ejecuta enviarOtp al presionar el botón */}
            <button onClick={enviarOtp}>Enviar código OTP</button>

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
                        onChange={(e) => setCodigo(e.target.value)}
                    />

                    {/* Ejecuta la verificación del código */}
                    <button onClick={verificarOtp}>Verificar código</button>
                </>
            )}
        </section>
    );
}
// Permite importar el componente desde otros archivos
export default Login;