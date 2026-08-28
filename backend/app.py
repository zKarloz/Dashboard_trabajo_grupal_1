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

# Importa la función encargada del procesamiento con Pandas
from pandas_service import procesar_pandas

# Importa la función encargada de los cálculos con NumPy
from numpy_service import procesar_numpy

# Importa la función encargada de generar el gráfico
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

    # Genera un código de 6 dígitos, incluyendo posibles ceros iniciales
    codigo = f"{secrets.randbelow(1_000_000):06d}"

    try:
        # Envía el código por correo antes de guardarlo
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

    # Devuelve una respuesta JSON a React
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

        # Si coinciden, indica que el acceso es correcto
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

    # Si no coinciden, indica que el acceso falló
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
    # Devuelve los datos originales y los datos limpios
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

    # Inicia el servidor Flask en modo desarrollo
    app.run(debug=True)
