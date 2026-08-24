import numpy as np


def procesar_numpy(df):
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

    return estadisticas