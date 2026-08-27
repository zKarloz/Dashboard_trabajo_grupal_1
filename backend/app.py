# Importa Flask para crear el servidor
# request permite recibir datos enviados desde React
# jsonify convierte respuestas de Python a JSON
from flask import Flask, request, jsonify

# Permite que React y Flask se comuniquen aunque usen puertos distintos
from flask_cors import CORS

# Importa Pandas para leer el archivo CSV
import pandas as pd

# Se usa para generar un código OTP aleatorio
import random

# Importa la función encargada del procesamiento con Pandas
from pandas_service import procesar_pandas

# Importa la función encargada de los cálculos con NumPy
from numpy_service import procesar_numpy

# Importa la función encargada de generar el gráfico
from matplotlib_service import crear_grafico

# Crea la aplicación Flask
app = Flask(__name__)

# Habilita CORS para permitir peticiones desde React
CORS(app)

# Diccionario temporal para guardar los códigos OTP
otps = {}

# Crea la ruta POST /send-otp
@app.route("/send-otp", methods=["POST"])
def send_otp():

    # Obtiene el JSON enviado desde React
    data = request.json

    # Obtiene el correo enviado
    email = data["email"]

    # Genera un código aleatorio de 6 dígitos
    codigo = str(random.randint(100000, 999999))

    # Guarda el código asociado al correo
    otps[email] = codigo

    # Muestra el código OTP en la terminal
    print(f"OTP para {email}: {codigo}")

    # Devuelve una respuesta JSON a React
    return jsonify({
        "message": "Código OTP generado"
    })

# Crea la ruta POST /verify-otp
@app.route("/verify-otp", methods=["POST"])
def verify_otp():

    # Obtiene los datos enviados desde React
    data = request.json

    # Obtiene el correo
    email = data["email"]

    # Obtiene el código escrito por el usuario
    codigo = data["codigo"]

    # Compara el código guardado con el código recibido
    if otps.get(email) == codigo:

        # Si coinciden, indica que el acceso es correcto
        return jsonify({
            "success": True
        })
    # Si no coinciden, indica que el acceso falló
    return jsonify({
        "success": False
    })

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