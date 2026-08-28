"""Servicio encargado de enviar correos mediante Resend."""

import os

import resend


# La clave se configura en las variables de entorno de Render.
resend.api_key = os.environ.get("RESEND_API_KEY")

# Mientras no exista un dominio propio, Resend permite usar este remitente
# únicamente para enviar pruebas al correo asociado con la cuenta.
REMITENTE = os.environ.get(
    "RESEND_FROM_EMAIL",
    "Dashboard <onboarding@resend.dev>",
)


def enviar_codigo_otp(destinatario: str, codigo: str) -> None:
    """Envía un código OTP al correo indicado."""

    if not resend.api_key:
        raise RuntimeError("RESEND_API_KEY no está configurada")

    resend.Emails.send(
        {
            "from": REMITENTE,
            "to": [destinatario],
            "subject": "Código de verificación",
            "html": f"""
                <div style="font-family: Arial, sans-serif; color: #1f2937;">
                    <h2>Verificación de inicio de sesión</h2>
                    <p>Tu código de verificación es:</p>
                    <h1 style="letter-spacing: 5px; color: #2563eb;">
                        {codigo}
                    </h1>
                    <p>Este código vencerá en 5 minutos.</p>
                    <p>Si no solicitaste el código, ignora este mensaje.</p>
                </div>
            """,
        }
    )
