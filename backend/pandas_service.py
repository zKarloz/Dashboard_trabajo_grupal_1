# El DataFrame ya fue creado en app.py con pd.read_csv(), así que ya no es necesario importar pandas nuevamente

# Función que recibe un DataFrame
def procesar_pandas(df):

    # Reemplaza valores vacíos por ""
    # y convierte el DataFrame original a una lista de diccionarios
    original = df.fillna("").to_dict(orient="records")

    # Elimina filas con valores nulos
    # y también elimina filas duplicadas
    limpio = df.dropna().drop_duplicates()

    # Convierte el DataFrame limpio a una lista de diccionarios
    limpio_json = limpio.fillna("").to_dict(orient="records")

    # Devuelve los datos originales y los datos limpios
    return original, limpio_json