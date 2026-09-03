# Importa NumPy y lo renombra como np
import numpy as np

# Función que recibe un DataFrame
def procesar_numpy(df):

    # Diccionario donde se guardarán los resultados
    estadisticas = {}

    # Selecciona únicamente las columnas numéricas del DataFrame
    columnas_numericas = df.select_dtypes(include=np.number)

    # Recorre cada columna numérica
    for columna in columnas_numericas.columns:

        # Elimina valores vacíos y convierte la columna a un arreglo de NumPy
        datos = columnas_numericas[columna].dropna().to_numpy()

        # Comprueba que la columna tenga datos
        if len(datos) > 0:

            # Guarda las estadísticas de esa columna
            estadisticas[columna] = {

                # Calcula el valor mínimo
                "min": float(np.min(datos)),

                # Calcula el valor máximo
                "max": float(np.max(datos)),

                # Calcula la media o promedio
                "media": float(np.mean(datos)),

                # Calcula la mediana
                "mediana": float(np.median(datos)),

                # Calcula la suma
                "suma": float(np.sum(datos)),

                # Calcula el rango (diferencia entre el valor máximo y mínimo)
                "rango": float(np.ptp(datos)),

                # Calcula la desviación estándar
                "desviacion": float(np.std(datos))
            }

    # Devuelve todas las estadísticas calculadas
    return estadisticas