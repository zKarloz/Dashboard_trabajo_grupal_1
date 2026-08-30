# Permite leer variables de entorno
import os

# Permite cargar las variables del archivo .env
from dotenv import load_dotenv

load_dotenv()

# Correo y código para el acceso de demostración
DEMO_EMAIL = os.getenv("DEMO_EMAIL", "").strip().lower()
DEMO_OTP = os.getenv("DEMO_OTP", "").strip()

# Importa Flask para crear el servidor
# request permite recibir datos enviados desde React
# jsonify convierte respuestas de Python a JSON
from flask import Flask, request, jsonify

# Permite que React y Flask se comuniquen aunque usen puertos distintos
from flask_cors import CORS

# Importa Pandas para leer el archivo CSV
import pandas as pd

# Genera códigos OTP apropiados para verificación
import secrets

# Permite controlar la expiración del código OTP
import time

# Importa los servicios del dashboard
from pandas_service import procesar_pandas
from numpy_service import procesar_numpy
from matplotlib_service import crear_grafico

# Importa el servicio encargado de enviar correos con Resend
from email_service import enviar_codigo_otp


# Crea la aplicación Flask
app = Flask(__name__)

# Habilita CORS para permitir peticiones desde React
CORS(app)

# Diccionario temporal para guardar los códigos OTP
otps = {}

# Configuración de seguridad básica del OTP
DURACION_OTP = 300
MAXIMO_INTENTOS = 5


# Permite comprobar que el backend está funcionando
@app.route("/", methods=["GET"])
def inicio():
    return jsonify({
        "status": "ok",
        "message": "Backend funcionando correctamente"
    })


# Crea la ruta POST /send-otp
@app.route("/send-otp", methods=["POST"])
def send_otp():
    # Obtiene el JSON enviado desde React
    data = request.get_json(silent=True) or {}

    # Obtiene y normaliza el correo enviado
    email = str(data.get("email", "")).strip().lower()

    # Comprueba que el correo tenga un formato básico válido
    if not email or "@" not in email:
        return jsonify({
            "success": False,
            "message": "Ingresa un correo electrónico válido"
        }), 400

    # Comprueba si se está utilizando la cuenta de demostración
    es_demo = bool(
        DEMO_EMAIL
        and DEMO_OTP
        and email == DEMO_EMAIL
    )

    # En modo demo utiliza el código configurado.
    # Para los demás correos genera un código aleatorio.
    if es_demo:
        codigo = DEMO_OTP
    else:
        codigo = f"{secrets.randbelow(1_000_000):06d}"

        try:
            # Envía el código real mediante Resend
            enviar_codigo_otp(email, codigo)

        except Exception:
            app.logger.exception("No se pudo enviar el código OTP")

            return jsonify({
                "success": False,
                "message": "No se pudo enviar el código por correo"
            }), 502

    # Guarda el código, su expiración y los intentos realizados
    otps[email] = {
        "codigo": codigo,
        "expira": time.time() + DURACION_OTP,
        "intentos": 0
    }

    # Devuelve un mensaje diferente según el tipo de acceso
    if es_demo:
        return jsonify({
            "success": True,
            "message": (
                "Modo demostración activado. "
                "Utiliza el código mostrado en el login."
            )
        })

    return jsonify({
        "success": True,
        "message": "Código enviado correctamente"
    })


# Crea la ruta POST /verify-otp
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    # Obtiene los datos enviados desde React
    data = request.get_json(silent=True) or {}

    # Obtiene y normaliza el correo
    email = str(data.get("email", "")).strip().lower()

    # Obtiene el código escrito por el usuario
    codigo = str(data.get("codigo", "")).strip()

    # Busca el registro asociado al correo
    registro = otps.get(email)

    if not registro:
        return jsonify({
            "success": False,
            "message": "No existe un código para este correo"
        }), 400

    # Elimina el código si ya venció
    if time.time() > registro["expira"]:
        otps.pop(email, None)

        return jsonify({
            "success": False,
            "message": "El código ha vencido"
        }), 400

    # Compara el código guardado con el código recibido
    if secrets.compare_digest(registro["codigo"], codigo):
        # El código solamente puede utilizarse una vez
        otps.pop(email, None)

        return jsonify({
            "success": True,
            "message": "Código verificado correctamente"
        })

    # Cuenta los intentos incorrectos
    registro["intentos"] += 1

    if registro["intentos"] >= MAXIMO_INTENTOS:
        otps.pop(email, None)

        return jsonify({
            "success": False,
            "message": "Demasiados intentos. Solicita otro código"
        }), 400

    return jsonify({
        "success": False,
        "message": "Código incorrecto"
    }), 400


# Crea la ruta POST /analyze
@app.route("/analyze", methods=["POST"])
def analyze():
    # Obtiene el archivo CSV enviado desde React
    archivo = request.files["file"]

    # Lee el CSV y lo convierte en un DataFrame
    df = pd.read_csv(archivo)

    # Procesa el DataFrame con Pandas
    original, limpio = procesar_pandas(df)

    # Calcula estadísticas usando NumPy
    estadisticas = procesar_numpy(df)

    # Genera un gráfico usando Matplotlib
    grafico = crear_grafico(df)

    # Devuelve todos los resultados a React
    return jsonify({
        "original": original,
        "limpio": limpio,
        "estadisticas": estadisticas,
        "grafico": grafico
    })


# Comprueba que app.py se esté ejecutando directamente
if __name__ == "__main__":
    app.run(debug=True)