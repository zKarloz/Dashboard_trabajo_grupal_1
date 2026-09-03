// Importa useState para guardar valores que cambian en el componente
import { useState } from "react";

// Importa useNavigate para cambiar de ruta desde el código
import { useNavigate } from "react-router-dom";

// MEJORAR CODIGO
import { API_URL } from "../config/api";

import ImageProject from "../components/ImageProject";
import PoseProject from "../components/PoseProject";
import VoiceProject from "../components/VoiceProject";

// Importa los estilos del Dashboard
import "../styles/Dashboard.css";

function Dashboard() {

    // Guarda la cantidad de filas y columnas del CSV
    const [filas, setFilas] = useState(0);
    const [columnas, setColumnas] = useState(0);

    // Guarda la cantidad de valores nulos y el resumen del CSV
    const [nulos, setNulos] = useState<any>({});
    const [resumen, setResumen] = useState<any>({});

    // Guarda qué herramienta está seleccionada
    const [herramienta, setHerramienta] = useState("pandas");

    // Guarda los datos originales del CSV
    const [datos, setDatos] = useState<any[]>([]);

    // Guarda los datos limpios enviados por Pandas
    const [datosLimpios, setDatosLimpios] = useState<any[]>([]);

    // Guarda las estadísticas calculadas por NumPy
    const [estadisticas, setEstadisticas] = useState<any>({});

    // Guarda la imagen del gráfico generada por Matplotlib
    const [graficos, setGraficos] = useState<any>({});

    const [tipoGrafico, setTipoGrafico] = useState("barras");

    // Indica si se muestran los datos originales o los limpios
    const [limpio, setLimpio] = useState(false);

    // Permite redirigir al usuario a otra ruta
    const navigate = useNavigate();

    // Cierra la sesión del usuario
    const cerrarSesion = () => {

        // Elimina la sesión guardada en localStorage
        localStorage.removeItem("dashboard_logged_in");

        // Redirige nuevamente al Login
        navigate("/login");
    };

    // Función que se ejecuta cuando el usuario selecciona un CSV
    const subirArchivo = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        // Obtiene el primer archivo seleccionado
        const archivo = e.target.files?.[0];

        // Si no existe archivo, termina la función
        if (!archivo) return;

        // Crea un FormData para poder enviar el archivo
        const formData = new FormData();

        // Agrega el archivo con el nombre "file"
        formData.append("file", archivo);

        // Envía el CSV al backend Flask
        const respuesta = await fetch(
            `${API_URL}/analyze`,
            {
                method: "POST",
                body: formData
            }
        );
        // Convierte la respuesta del backend a JSON
        const resultado = await respuesta.json();

        // Guarda los datos originales recibidos
        setDatos(resultado.original);

        // Guarda los datos limpios recibidos
        setDatosLimpios(resultado.limpio);

        // Guarda la cantidad de filas y columnas recibidas
        setFilas(resultado.filas);

        // Guarda la cantidad de columnas recibidas
        setColumnas(resultado.columnas);

        // Guarda la cantidad de valores nulos recibidos
        setNulos(resultado.nulos);

        // Guarda el resumen de los datos recibidos
        setResumen(resultado.resumen);

        // Guarda los resultados de NumPy
        setEstadisticas(resultado.estadisticas);

        // Guarda el gráfico generado por Matplotlib
        setGraficos(resultado.graficos);

        // Empieza mostrando la tabla original
        setLimpio(false);
    };

    // Decide qué tabla mostrar
    // Si limpio es true muestra datosLimpios, si no muestra datos
    const tabla = limpio ? datosLimpios : datos;

    const totalNulos = Object.values(nulos).reduce(
    (total: number, cantidad: any) =>
        total + Number(cantidad),
    0
    );

    return(
        <div className="dashboard">

            {/* Menú lateral */}
            <aside className="sidebar">
                <h3>Herramientas</h3>

                {/* Cambia la herramienta seleccionada a Pandas */}
                <button onClick={() => setHerramienta("pandas")}>Pandas</button>

                {/* Cambia la herramienta seleccionada a NumPy */}
                <button onClick={() => setHerramienta("numpy")}>NumPy</button>

                {/* Cambia la herramienta seleccionada a Matplotlib */}
                <button onClick={() => setHerramienta("matplotlib")}>Matplotlib</button>

                {/* Cambia la herramienta seleccionada a Proyecto de Imagen */}
                <button onClick={() => setHerramienta("imagen")}>Proyecto de Imagen</button>

                {/* Cambia la herramienta seleccionada a Proyecto de Posturas */}
                <button onClick={() => setHerramienta("posturas")}>Proyecto de Posturas</button>

                {/* Cambia la herramienta seleccionada a Proyecto de Voz */}
                <button onClick={() => setHerramienta("voz")}>Proyecto de Voz</button>

                {/* Cierra la sesión */}
                <button onClick={cerrarSesion}>Cerrar sesión</button>
            </aside>

            {/* Contenido principal del Dashboard */}
            <section className="dashboard-content">

                {/* La carga de CSV solo aparece en las herramientas de análisis de datos */}
                {["pandas", "numpy", "matplotlib"].includes(herramienta) && (
                    <>
                        <h2>Análisis de CSV</h2>

                        {/* Permite seleccionar únicamente archivos CSV, ejecuta subirArchivo al seleccionar un archivo */}
                        <input
                            type="file"
                            accept=".csv"
                            onChange={subirArchivo}
                        />
                    </>
                )}

                {/* Muestra esta sección solo si se seleccionó Pandas */}
                {herramienta === "pandas" && (
                    <div>
                        <h3>Pandas</h3>

                        {datos.length > 0 && (
                            <div className="dataset-info">

                                <div className="dataset-card filas-card">

                                    <span className="dataset-label">
                                        Filas
                                    </span>

                                    <strong className="dataset-value">
                                        {filas}
                                    </strong>

                                    <span className="dataset-description">
                                        Registros encontrados
                                    </span>

                                </div>


                                <div className="dataset-card columnas-card">

                                    <span className="dataset-label">
                                        Columnas
                                    </span>

                                    <strong className="dataset-value">
                                        {columnas}
                                    </strong>

                                    <span className="dataset-description">
                                        Variables del dataset
                                    </span>

                                </div>


                                <div className="dataset-card nulos-card">

                                    <span className="dataset-label">
                                        Valores nulos
                                    </span>

                                    <strong className="dataset-value">
                                        {totalNulos}
                                    </strong>

                                    <span className="dataset-description">
                                        Datos faltantes encontrados
                                    </span>

                                </div>

                            </div>
                        )}

                        {datos.length > 0 && (
                            <div className="pandas-info">

                                <h4>Valores nulos por columna</h4>

                                <div className="nulos-grid">

                                    {Object.entries(nulos).map(
                                        ([columna, cantidad]: any) => (

                                            <div
                                                className="nulo-item"
                                                key={columna}
                                            >
                                                <span>{columna}</span>

                                                <strong>
                                                    {cantidad}
                                                </strong>
                                            </div>
                                        )
                                    )}

                                </div>

                            </div>
                        )}

                        {Object.keys(resumen).length > 0 && (
                            <div>

                                <h4>Resumen estadístico</h4>

                                <div className="tabla-container">

                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Columna</th>
                                                <th>Media</th>
                                                <th>Mínimo</th>
                                                <th>Máximo</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {Object.entries(resumen).map(
                                                ([columna, valores]: any) => (

                                                    <tr key={columna}>

                                                        <td>{columna}</td>

                                                        <td>
                                                            {valores.mean}
                                                        </td>

                                                        <td>
                                                            {valores.min}
                                                        </td>

                                                        <td>
                                                            {valores.max}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        )}

                        {datos.length > 0 && (
                            <>
                                <br />
                                {/* Muestra nuevamente los datos originales */}
                                <button onClick={() => setLimpio(false)}>Mostrar original</button>

                                {/* Muestra los datos limpios */}
                                <button onClick={() => setLimpio(true)}>Limpiar datos</button>
                            </>
                        )}

                        {/* Comprueba que existan datos para mostrar */}
                        {tabla.length > 0 ? (
                            <div className="tabla-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {/* Obtiene los nombres de las columnas */}
                                            {Object.keys(tabla[0]).map(
                                                (columna) => (
                                                    // Crea un encabezado por cada columna
                                                    <th key={columna}>
                                                        {columna}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {/* Recorre todas las filas del CSV */}
                                        {tabla.map((fila, index) => (
                                            <tr key={index}>

                                                {/* Recorre los valores de cada fila */}
                                                {Object.values(fila).map(
                                                    (valor, i) => (
                                                        
                                                        // Muestra cada valor en una celda
                                                        <td key={i}>
                                                            {String(valor)}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // Mensaje mostrado antes de cargar un CSV
                            <p>Adjunta un archivo CSV para mostrar los datos.</p>
                        )}
                    </div>
                )}

                {/* Muestra esta sección solo si se seleccionó NumPy */}
                {herramienta === "numpy" && (
                    <div>
                        <h3>NumPy</h3>

                        {Object.keys(estadisticas).length > 0 ? (

                            <div className="stats-grid">

                                {Object.entries(estadisticas).map(
                                    ([columna, valores]: any) => (

                                        <div
                                            className="stat-card"
                                            key={columna}
                                        >

                                            <h4>{columna}</h4>

                                            <div className="stat-row">
                                                <span>Mínimo</span>
                                                <strong>{valores.min}</strong>
                                            </div>

                                            <div className="stat-row">
                                                <span>Máximo</span>
                                                <strong>{valores.max}</strong>
                                            </div>

                                            <div className="stat-row">
                                                <span>Media</span>
                                                <strong>{valores.media}</strong>
                                            </div>

                                            <div className="stat-row">
                                                <span>Mediana</span>
                                                <strong>{valores.mediana}</strong>
                                            </div>

                                            <div className="stat-row">
                                                <span>Suma</span>
                                                <strong>{valores.suma}</strong>
                                            </div>

                                            <div className="stat-row">
                                                <span>Desviación</span>
                                                <strong>{valores.desviacion}</strong>
                                            </div>

                                            <div className="stat-row">
                                                <span>Rango</span>
                                                <strong>{valores.rango}</strong>
                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        ) : (
                            <p>
                                Adjunta un CSV con columnas numéricas.
                            </p>
                        )}
                    </div>
                )}

                {/* Muestra esta sección solo si se seleccionó Matplotlib */}
                {herramienta === "matplotlib" && (
                    <div>

                        <h3>Matplotlib</h3>

                        {Object.keys(graficos).length > 0 ? (
                            <>

                                <button
                                    onClick={() =>
                                        setTipoGrafico("barras")
                                    }
                                >
                                    Barras
                                </button>

                                <button
                                    onClick={() =>
                                        setTipoGrafico("histograma")
                                    }
                                >
                                    Histograma
                                </button>

                                <button
                                    onClick={() =>
                                        setTipoGrafico("lineas")
                                    }
                                >
                                    Líneas
                                </button>


                                <div className="grafico-container">

                                    <img
                                        className="grafico"
                                        src={`data:image/png;base64,${
                                            graficos[tipoGrafico]
                                        }`}
                                        alt="Gráfico generado con Matplotlib"
                                    />

                                </div>

                            </>
                        ) : (
                            <p>
                                Adjunta un CSV para generar los gráficos.
                            </p>
                        )}

                    </div>
                )}

                {herramienta === "imagen" && (
                    <ImageProject />
                )}

                {herramienta === "posturas" && (
                    <PoseProject />
                )}

                {herramienta === "voz" && (
                    <VoiceProject />
                )}

            </section>
        </div>
    );
}
// Permite importar Dashboard desde otros archivos
export default Dashboard;
