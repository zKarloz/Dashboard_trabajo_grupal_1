function About() {
    return(
        <section className="page">

            <span className="page-label">
                SOBRE EL PROYECTO
            </span>

            <h2>
                Tecnología integrada en una sola plataforma
            </h2>

            <p>
                Este proyecto integra un frontend desarrollado
                con React, Vite y TypeScript con un backend
                desarrollado en Python mediante Flask.
            </p>

            <p>
                Ambos se comunican mediante una API que permite
                enviar datos desde el navegador para ser
                procesados y posteriormente mostrar los
                resultados en el Dashboard.
            </p>

        </section>
    );
}

export default About;