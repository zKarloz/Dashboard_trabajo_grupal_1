import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {

    const [email, setEmail] = useState("");
    const [codigo, setCodigo] = useState("");
    const [otpEnviado, setOtpEnviado] = useState(false);

    const navigate = useNavigate();

    const enviarOtp = async () => {

        await fetch("http://127.0.0.1:5000/send-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        setOtpEnviado(true);
    };

    const verificarOtp = async () => {

        const respuesta = await fetch(
            "http://127.0.0.1:5000/verify-otp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    codigo
                })
            }
        );

        const datos = await respuesta.json();

        if (datos.success) {

            localStorage.setItem(
                "dashboard_logged_in",
                "true"
            );

            navigate("/dashboard");

        }
        else {
            alert("Código incorrecto");
        }
    };

    return(
        <section className="login-page">

            <h2>Iniciar sesión</h2>

            <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={enviarOtp}>
                Enviar código OTP
            </button>

            {otpEnviado && (
                <>
                    <input
                        type="text"
                        placeholder="Código OTP"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    />

                    <button onClick={verificarOtp}>
                        Verificar código
                    </button>
                </>
            )}

        </section>
    );
}

export default Login;