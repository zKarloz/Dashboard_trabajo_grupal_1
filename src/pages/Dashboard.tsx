import { useState } from "react";
import "../styles/Dashboard.css";

function Dashboard() {

    const [herramienta, setHerramienta] = useState("pandas");
    const [datos, setDatos] = useState<any[]>([]);
    const [datosLimpios, setDatosLimpios] = useState<any[]>([]);
    const [estadisticas, setEstadisticas] = useState<any>({});
    const [grafico, setGrafico] = useState("");
    const [limpio, setLimpio] = useState(false);

    const subirArchivo = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const archivo = e.target.files?.[0];

        if (!archivo) return;

        const formData = new FormData();

        formData.append("file", archivo);

        const respuesta = await fetch(
            "http://127.0.0.1:5000/analyze",
            {
                method: "POST",
                body: formData
            }
        );

        const resultado = await respuesta.json();

        setDatos(resultado.original);
        setDatosLimpios(resultado.limpio);
        setEstadisticas(resultado.estadisticas);
        setGrafico(resultado.grafico);
        setLimpio(false);
    };

    const tabla = limpio ? datosLimpios : datos;

    return(
        <div className="dashboard">

            <aside className="sidebar">

                <h3>Herramientas</h3>

                <button onClick={() => setHerramienta("pandas")}>
                    Pandas
                </button>

                <button onClick={() => setHerramienta("numpy")}>
                    NumPy
                </button>

                <button onClick={() => setHerramienta("matplotlib")}>
                    Matplotlib
                </button>

            </aside>

            <section className="dashboard-content">

                <h2>Análisis de CSV</h2>

                <input
                    type="file"
                    accept=".csv"
                    onChange={subirArchivo}
                />

                {herramienta === "pandas" && (
                    <div>

                        <h3>Pandas</h3>

                        <button onClick={() => setLimpio(false)}>
                            Mostrar original
                        </button>

                        <button onClick={() => setLimpio(true)}>
                            Limpiar datos
                        </button>

                        {tabla.length > 0 ? (
                            <div className="tabla-container">

                                <table>

                                    <thead>
                                        <tr>

                                            {Object.keys(tabla[0]).map(
                                                (columna) => (
                                                    <th key={columna}>
                                                        {columna}
                                                    </th>
                                                )
                                            )}

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {tabla.map((fila, index) => (
                                            <tr key={index}>

                                                {Object.values(fila).map(
                                                    (valor, i) => (
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
                            <p>Adjunta un archivo CSV para mostrar los datos.</p>
                        )}

                    </div>
                )}

                {herramienta === "numpy" && (
                    <div>

                        <h3>NumPy</h3>

                        {Object.keys(estadisticas).length > 0 ? (

                            Object.entries(estadisticas).map(
                                ([columna, valores]: any) => (

                                    <div key={columna}>

                                        <h4>{columna}</h4>

                                        <p>
                                            Mínimo: {valores.min}
                                        </p>

                                        <p>
                                            Máximo: {valores.max}
                                        </p>

                                        <p>
                                            Media: {valores.media}
                                        </p>

                                        <p>
                                            Desviación: {valores.desviacion}
                                        </p>

                                    </div>
                                )
                            )

                        ) : (
                            <p>
                                Adjunta un CSV con columnas numéricas.
                            </p>
                        )}

                    </div>
                )}

                {herramienta === "matplotlib" && (
                    <div>

                        <h3>Matplotlib</h3>

                        {grafico ? (

                            <div className="grafico-container">

                                <img
                                    className="grafico"
                                    src={`data:image/png;base64,${grafico}`}
                                    alt="Gráfico generado con Matplotlib"
                                />

                            </div>

                        ) : (

                            <p>
                                Adjunta un CSV para generar el gráfico.
                            </p>

                        )}

                    </div>
                )}

            </section>

        </div>
    );
}

export default Dashboard;