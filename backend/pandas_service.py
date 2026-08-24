import pandas as pd


def procesar_pandas(df):
    original = df.fillna("").to_dict(orient="records")

    limpio = df.dropna().drop_duplicates()

    limpio_json = limpio.fillna("").to_dict(orient="records")

    return original, limpio_json