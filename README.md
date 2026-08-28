# Probar en Vercel
LINK = https://dashboard-trabajo-grupal-1.vercel.app/

# Proyecto React + Python

Proyecto desarrollado con React, TypeScript, Vite, Flask y Python.

Permite:

- Visualizar y limpiar archivos CSV con Pandas.
- Calcular estadísticas con NumPy.
- Generar gráficos con Matplotlib.
- Realizar predicciones mediante webcam con Teachable Machine y TensorFlow.js.

## Requisitos previos

Antes de ejecutar el proyecto, instalar:

- Node.js
- Python 3.14
- Git
- Visual Studio Code

## Descargar o actualizar el proyecto

Para clonar el repositorio por primera vez:

```bash
git clone https://github.com/zKarloz/Dashboard_trabajo_grupal_1.git
cd Dashboard_trabajo_grupal_1
```

### Frontend

Abrir una primera terminal en VSCode (Usar CMD/Command Prompt)

1. Instalar dependencias:

`npm install`

2. Iniciar React:

`npm run dev`

### Backend

Abrir una segunda terminal en VSCode (No usar PowerShell)

3. Entrar a la carpeta:

`cd backend`

4. Crear entorno virtual:

`python -m venv .venv`

5. Activar entorno virtual en Windows:

`.venv\Scripts\activate.bat` (Para CMD o Command Prompt)
`source .venv/Scripts/activate` (Para Git Bash)

6. Instalar dependencias:

`pip install -r requirements.txt`

7. Iniciar servidor:

`python app.py`