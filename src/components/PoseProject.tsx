import { useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import "../styles/PoseProject.css";

function PoseProject() {

    // Canvas donde se mostrará la cámara
    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    // Guarda las predicciones
    const [predicciones, setPredicciones] =
        useState<string[]>([]);

    // Indica si la webcam está activa
    const [iniciado, setIniciado] =
        useState(false);

    // Indica si está iniciando
    const [cargando, setCargando] =
        useState(false);

    // Guarda posibles errores
    const [error, setError] =
        useState("");

    // Inicia la webcam y el modelo
    const iniciar = async () => {

        // Evita presionar varias veces
        if (iniciado || cargando) return;

        setCargando(true);
        setError("");

        const size = 300;
        const flip = true;

        // Webcam siempre tendrá un valor
        const webcam = new tmPose.Webcam(
            size,
            size,
            flip
        );

        try {

            // Comprueba que el navegador
            // permita utilizar una webcam
            if (
                !navigator.mediaDevices?.getUserMedia
            ) {
                throw new Error(
                    "El navegador no permite utilizar la webcam."
                );
            }

            // Primero solicita permiso
            await webcam.setup();

            // Enciende la webcam
            await webcam.play();

            setIniciado(true);

            // Ruta de los archivos del modelo
            const URL = "/pose_model/";

            const modelURL =
                URL + "model.json";

            const metadataURL =
                URL + "metadata.json";

            // Carga el modelo después
            // de activar la webcam
            const model = await tmPose.load(
                modelURL,
                metadataURL
            );

            // Obtiene el canvas de React
            const canvas = canvasRef.current;

            if (!canvas) {
                throw new Error(
                    "No se encontró el canvas."
                );
            }

            canvas.width = size;
            canvas.height = size;

            const ctx =
                canvas.getContext("2d");

            if (!ctx) {
                throw new Error(
                    "No se pudo preparar el canvas."
                );
            }

            // Analiza continuamente la postura
            const loop = async () => {

                // Actualiza la imagen
                webcam.update();

                // Detecta los puntos del cuerpo
                const {
                    pose,
                    posenetOutput
                } = await model.estimatePose(
                    webcam.canvas
                );

                // Clasifica la postura
                const resultado =
                    await model.predict(
                        posenetOutput
                    );

                // Convierte las predicciones a texto
                const nuevasPredicciones =
                    resultado.map(
                        (prediccion) =>
                            `${prediccion.className}: ${(
                                prediccion.probability *
                                100
                            ).toFixed(1)}%`
                    );

                setPredicciones(
                    nuevasPredicciones
                );

                // Limpia el canvas anterior
                ctx.clearRect(
                    0,
                    0,
                    size,
                    size
                );

                // Dibuja la imagen de la webcam
                ctx.drawImage(
                    webcam.canvas,
                    0,
                    0,
                    size,
                    size
                );

                // Dibuja los puntos y el esqueleto
                if (pose) {

                    const minPartConfidence =
                        0.5;

                    tmPose.drawKeypoints(
                        pose.keypoints,
                        minPartConfidence,
                        ctx
                    );

                    tmPose.drawSkeleton(
                        pose.keypoints,
                        minPartConfidence,
                        ctx
                    );
                }

                // Repite el análisis
                requestAnimationFrame(loop);
            };

            // Inicia el ciclo
            requestAnimationFrame(loop);

        } catch (errorInicio) {

            console.error(
                "Error al iniciar la webcam:",
                errorInicio
            );

            const mensaje =
                errorInicio instanceof Error
                    ? errorInicio.message
                    : String(errorInicio);

            setError(mensaje);
            setIniciado(false);

            // Intenta apagar la cámara
            // si ocurrió un error
            try {
                webcam.stop();
            } catch {
                // No hace nada si la webcam
                // todavía no estaba configurada
            }

        } finally {
            setCargando(false);
        }
    };

    return(
        <div className="pose-project">

            <h3>Proyecto de posturas</h3>

            <p>
                Activa la cámara para reconocer
                diferentes posturas mediante
                Teachable Machine.
            </p>

            {!iniciado && (
                <button
                    onClick={iniciar}
                    disabled={cargando}
                >
                    {cargando
                        ? "Iniciando webcam..."
                        : "Activar webcam"}
                </button>
            )}

            {iniciado && cargando && (
                <p>
                    Cámara activada. Cargando
                    modelo de posturas...
                </p>
            )}

            {error && (
                <p>
                    Error: {error}
                </p>
            )}

            <div className="pose-camera">

                <canvas
                    ref={canvasRef}
                    className="pose-canvas"
                />

            </div>

            <div className="pose-predictions">

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

export default PoseProject;