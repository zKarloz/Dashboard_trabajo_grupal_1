function Services() {
    return(
        <section className="page services-page">

            <span className="page-label">
                FUNCIONALIDADES
            </span>

            <h2>
                Herramientas disponibles
            </h2>

            <p>
                El Dashboard integra diferentes herramientas
                para el análisis de datos y reconocimiento
                mediante inteligencia artificial.
            </p>


            <div className="services-grid">

                <div className="service-card">
                    <h3>Pandas</h3>
                    <p>
                        Permite visualizar, limpiar y analizar
                        archivos CSV.
                    </p>
                </div>


                <div className="service-card">
                    <h3>NumPy</h3>
                    <p>
                        Calcula estadísticas como media,
                        mediana, mínimo, máximo y desviación.
                    </p>
                </div>


                <div className="service-card">
                    <h3>Matplotlib</h3>
                    <p>
                        Genera gráficos para visualizar la
                        información del dataset.
                    </p>
                </div>


                <div className="service-card">
                    <h3>Teachable Machine</h3>
                    <p>
                        Permite reconocer imágenes, posturas
                        y sonidos mediante modelos entrenados.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default Services;