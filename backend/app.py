from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import random

from pandas_service import procesar_pandas
from numpy_service import procesar_numpy
from matplotlib_service import crear_grafico


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

    original, limpio = procesar_pandas(df)

    estadisticas = procesar_numpy(df)

    grafico = crear_grafico(df)

    return jsonify({
        "original": original,
        "limpio": limpio,
        "estadisticas": estadisticas,
        "grafico": grafico
    })


if __name__ == "__main__":
    app.run(debug=True)