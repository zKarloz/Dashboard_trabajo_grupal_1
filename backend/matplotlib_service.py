import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import io
import base64


def crear_grafico(df):
    columnas_numericas = df.select_dtypes(include=np.number)

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

    return grafico