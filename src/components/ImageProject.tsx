import { useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import "../styles/ImageProject.css";

function ImageProject() {

    // Lugar donde se mostrará la webcam
    const webcamContainer = useRef<HTMLDivElement>(null);

    // Guarda las predicciones del modelo
    const [predicciones, setPredicciones] = useState<string[]>([]);

    // Evita iniciar la cámara más de una vez
    const [iniciado, setIniciado] = useState(false);

    // Inicia el modelo y la webcam
    const iniciar = async () => {

        if (iniciado) return;

        // Ubicación de los archivos exportados de Teachable Machine
        const URL = "/my_model/";

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // Carga el modelo y sus metadatos
        const model = await tmImage.load(
            modelURL,
            metadataURL
        );

        // Crea la webcam
        const webcam = new tmImage.Webcam(
            300,
            300,
            true
        );

        // Solicita permiso para utilizar la cámara
        await webcam.setup();

        // Inicia la webcam
        await webcam.play();

        setIniciado(true);

        // Agrega la webcam al componente
        if (webcamContainer.current) {
            webcamContainer.current.appendChild(
                webcam.canvas
            );
        }

        // Función que analiza continuamente la imagen
        const loop = async () => {

            // Actualiza la imagen de la webcam
            webcam.update();

            // Envía la imagen actual al modelo
            const resultado = await model.predict(
                webcam.canvas
            );

            // Convierte las predicciones a texto
            const nuevasPredicciones = resultado.map(
                (prediccion) =>
                    `${prediccion.className}: ${(
                        prediccion.probability * 100
                    ).toFixed(1)}%`
            );
            setPredicciones(nuevasPredicciones);

            // Repite el proceso en el siguiente frame
            requestAnimationFrame(loop);
        };
        // Inicia el análisis continuo
        requestAnimationFrame(loop);
    };

    return(
        <div className="image-project">

            <h3>Proyecto de imagen</h3>

            <p>Utiliza la cámara para realizar predicciones con el modelo de Teachable Machine.</p>

            {!iniciado && (
                <button onClick={iniciar}>
                    Activar webcam
                </button>
            )}

            <div
                ref={webcamContainer}
                className="webcam-container"
            />

            <div className="prediction-container">

                {predicciones.map(
                    (prediccion, index) => (
                        <p key={index}>
                            {prediccion}
                        </p>
                    )
                )}

            </div>
        </div>
    );
}
export default ImageProject;