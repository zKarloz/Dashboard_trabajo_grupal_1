# El DataFrame ya fue creado en app.py con pd.read_csv(), así que ya no es necesario importar pandas nuevamente

# Función que recibe un DataFrame
def procesar_pandas(df):

    # 1. Reemplaza valores vacíos por "", y convierte el DataFrame original a una lista de diccionarios
    original = df.fillna("").to_dict(orient="records")

    # 2. Elimina filas con valores nulos y filas duplicadas
    limpio = df.dropna().drop_duplicates()

    # 2.1. Convierte el DataFrame limpio a una lista de diccionarios
    limpio_json = limpio.fillna("").to_dict(orient="records")

    # 3. Obtiene la cantidad de filas y columnas
    filas = df.shape[0]
    columnas = df.shape[1]

    # 4. Obtiene la cantidad de valores nulos por columna
    nulos = df.isnull().sum().to_dict()

    # 5. Obtiene un resumen de las columnas numéricas del DataFrame, redondeando los valores a 2 decimales
    resumen_df = df.describe().round(2)

    # 5.1. Convierte el resumen a un diccionario
    resumen = resumen_df.to_dict()

    # Devuelve los datos originales, los datos limpios y la cantidad de filas y columnas
    return (original, limpio_json, filas, columnas, nulos, resumen)