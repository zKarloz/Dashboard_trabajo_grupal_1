import matplotlib

# Evita que Matplotlib abra ventanas gráficas
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import io
import base64

# Convierte el gráfico actual a Base64
def convertir_base64():

    imagen = io.BytesIO()

    plt.savefig(
        imagen,
        format="png"
    )

    plt.close()

    imagen.seek(0)

    return base64.b64encode(
        imagen.getvalue()
    ).decode("utf-8")


def crear_graficos(df):

    # Selecciona solamente las columnas numéricas
    columnas_numericas = df.select_dtypes(
        include=np.number
    )

    # Aquí se guardarán los gráficos
    graficos = {
        "barras": "",
        "histograma": "",
        "lineas": ""
    }

    # Verifica que exista al menos una columna numérica
    if len(columnas_numericas.columns) > 0:

        columnas = columnas_numericas.columns

        # GRÁFICO DE BARRAS
        promedios = columnas_numericas.mean()

        ancho = max(
            8,
            len(columnas) * 1.2
        )

        plt.figure(figsize=(ancho, 5))

        plt.bar(columnas,promedios)

        plt.title("Promedio por columna")

        plt.xlabel("Columnas")
        plt.ylabel("Promedio")

        plt.xticks(
            rotation=45,
            ha="right"
        )

        plt.tight_layout()

        graficos["barras"] = convertir_base64()

        # HISTOGRAMA
        primera_columna = columnas[0]

        datos = columnas_numericas[
            primera_columna
        ].dropna()

        plt.figure(figsize=(8, 5))

        plt.hist(
            datos,
            bins=10,
            edgecolor="black"
        )

        plt.title(f"Distribución de {primera_columna}")

        plt.xlabel(primera_columna)
        plt.ylabel("Frecuencia")

        plt.tight_layout()

        graficos["histograma"] = convertir_base64()

        # GRÁFICO DE LÍNEAS
        plt.figure(figsize=(9, 5))

        plt.plot(datos.values)

        plt.title(f"Evolución de {primera_columna}")

        plt.xlabel("Registro")
        plt.ylabel(primera_columna)

        plt.tight_layout()

        graficos["lineas"] = convertir_base64()

    return graficos