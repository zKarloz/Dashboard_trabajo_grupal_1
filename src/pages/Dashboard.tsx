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

    // Guarda qué herramienta está seleccionada
    const [herramienta, setHerramienta] = useState("pandas");

    // Guarda los datos originales del CSV
    const [datos, setDatos] = useState<any[]>([]);

    // Guarda los datos limpios enviados por Pandas
    const [datosLimpios, setDatosLimpios] = useState<any[]>([]);

    // Guarda las estadísticas calculadas por NumPy
    const [estadisticas, setEstadisticas] = useState<any>({});

    // Guarda la imagen del gráfico generada por Matplotlib
    const [grafico, setGrafico] = useState("");

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

        // Guarda los resultados de NumPy
        setEstadisticas(resultado.estadisticas);

        // Guarda el gráfico generado por Matplotlib
        setGrafico(resultado.grafico);

        // Empieza mostrando la tabla original
        setLimpio(false);
    };

    // Decide qué tabla mostrar
    // Si limpio es true muestra datosLimpios, si no muestra datos
    const tabla = limpio ? datosLimpios : datos;

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

                {/* Cierra la sesión */}
                <button onClick={cerrarSesion}>Cerrar sesión</button>
            </aside>

            {/* Contenido principal del Dashboard */}
            <section className="dashboard-content">

                <h2>Análisis de CSV</h2>

                {/* Permite seleccionar únicamente archivos CSV, ejecuta subirArchivo al seleccionar un archivo */}
                <input type="file" accept=".csv" onChange={subirArchivo}/>

                {/* Muestra esta sección solo si se seleccionó Pandas */}
                {herramienta === "pandas" && (
                    <div>
                        <h3>Pandas</h3>
                        
                        {/* Muestra nuevamente los datos originales */}
                        <button onClick={() => setLimpio(false)}>Mostrar original</button>

                        {/* Muestra los datos limpios */}
                        <button onClick={() => setLimpio(true)}>Limpiar datos</button>

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
                        {/* Comprueba si existen estadísticas */}
                        {Object.keys(estadisticas).length > 0 ? (

                            // Recorre las estadísticas de cada columna
                            Object.entries(estadisticas).map(
                                ([columna, valores]: any) => (

                                    <div key={columna}>
                                        {/* Nombre de la columna */}
                                        <h4>{columna}</h4>

                                        {/* Valor mínimo */}
                                        <p>Mínimo: {valores.min}</p>

                                        {/* Valor máximo */}
                                        <p>Máximo: {valores.max}</p>

                                        {/* Promedio */}
                                        <p>Media: {valores.media}</p>

                                        {/* Desviación estándar */}
                                        <p>Desviación: {valores.desviacion}</p>
                                    </div>
                                )
                            )
                        ) : (
                            // Mensaje si aún no hay datos numéricos
                            <p>Adjunta un CSV con columnas numéricas.</p>
                        )}

                    </div>
                )}

                {/* Muestra esta sección solo si se seleccionó Matplotlib */}
                {herramienta === "matplotlib" && (

                    <div>
                        <h3>Matplotlib</h3>
                        {/* Comprueba si existe un gráfico */}
                        {grafico ? (

                            <div className="grafico-container">
                                {/* Muestra la imagen enviada por Flask, Convierte el texto Base64 en una imagen */}
                                <img className="grafico" src={`data:image/png;base64,${grafico}`} alt="Gráfico generado con Matplotlib"/>
                            </div>
                        ) : (
                            // Mensaje si todavía no se cargó un CSV
                            <p>Adjunta un CSV para generar el gráfico.</p>
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