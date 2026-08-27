# Importa el módulo principal de Matplotlib
import matplotlib

# Usa Agg para generar imágenes sin abrir ventanas gráficas
matplotlib.use("Agg")

# Importa pyplot para crear gráficos
import matplotlib.pyplot as plt

# Importa NumPy para identificar columnas numéricas
import numpy as np

# Permite crear archivos temporalmente en memoria
import io

# Permite convertir la imagen a texto Base64
import base64

# Función que recibe un DataFrame
def crear_grafico(df):

    # Selecciona únicamente las columnas numéricas
    columnas_numericas = df.select_dtypes(include=np.number)

    # Inicialmente no existe ningún gráfico
    grafico = ""

    # Comprueba que exista al menos una columna numérica
    if len(columnas_numericas.columns) > 0:

        # Guarda los nombres de las columnas
        columnas = columnas_numericas.columns

        # Calcula el promedio de cada columna
        promedios = columnas_numericas.mean()

        # Calcula un ancho dinámico según la cantidad de columnas
        ancho = max(8, len(columnas) * 1.2)

        # Crea el espacio del gráfico
        plt.figure(figsize=(ancho, 5))

        # Genera un gráfico de barras
        plt.bar(columnas, promedios)

        # Agrega un título
        plt.title("Promedio por columna")

        # Agrega nombre al eje horizontal
        plt.xlabel("Columnas")

        # Agrega nombre al eje vertical
        plt.ylabel("Promedio")

        # Rota los nombres de las columnas para evitar que se superpongan
        plt.xticks(rotation=45, ha="right")

        # Ajusta automáticamente los elementos del gráfico
        plt.tight_layout()

        # Crea un espacio en memoria para guardar la imagen
        imagen = io.BytesIO()

        # Guarda el gráfico dentro de ese espacio como PNG
        plt.savefig(imagen, format="png")

        # Cierra el gráfico para liberar recursos
        plt.close()

        # Regresa al inicio de la imagen guardada en memoria
        imagen.seek(0)

        # Convierte la imagen PNG a texto Base64
        grafico = base64.b64encode(
            imagen.getvalue()
        ).decode("utf-8")

    # Devuelve el gráfico en Base64
    return grafico