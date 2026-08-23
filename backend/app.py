from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

import random
import io
import base64


app = Flask(__name__)
CORS(app)

otps = {}


@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    email = data["email"]

    codigo = str(random.randint(100000, 999999))

    otps[email] = codigo

    print(f"OTP para {email}: {codigo}")

    return jsonify({
        "message": "Código OTP generado"
    })


@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json

    email = data["email"]
    codigo = data["codigo"]

    if otps.get(email) == codigo:
        return jsonify({
            "success": True
        })

    return jsonify({
        "success": False
    })


@app.route("/analyze", methods=["POST"])
def analyze():
    archivo = request.files["file"]

    df = pd.read_csv(archivo)

    # PANDAS
    original = df.fillna("").to_dict(orient="records")

    limpio = df.dropna().drop_duplicates()

    limpio_json = limpio.fillna("").to_dict(orient="records")

    # NUMPY
    estadisticas = {}

    columnas_numericas = df.select_dtypes(include=np.number)

    for columna in columnas_numericas.columns:

        datos = columnas_numericas[columna].dropna().to_numpy()

        if len(datos) > 0:
            estadisticas[columna] = {
                "min": float(np.min(datos)),
                "max": float(np.max(datos)),
                "media": float(np.mean(datos)),
                "desviacion": float(np.std(datos))
            }

    # MATPLOTLIB
    grafico = ""

    if len(columnas_numericas.columns) > 0:

        columnas = columnas_numericas.columns
        promedios = columnas_numericas.mean()

        ancho = max(8, len(columnas) * 1.2)

        plt.figure(figsize=(ancho, 5))

        plt.bar(columnas, promedios)

        plt.title("Promedio por columna")
        plt.xlabel("Columnas")
        plt.ylabel("Promedio")

        plt.xticks(rotation=45, ha="right")

        plt.tight_layout()

        imagen = io.BytesIO()

        plt.savefig(imagen, format="png")
        plt.close()

        imagen.seek(0)

        grafico = base64.b64encode(
            imagen.getvalue()
        ).decode("utf-8")

    return jsonify({
        "original": original,
        "limpio": limpio_json,
        "estadisticas": estadisticas,
        "grafico": grafico
    })


if __name__ == "__main__":
    app.run(debug=True)