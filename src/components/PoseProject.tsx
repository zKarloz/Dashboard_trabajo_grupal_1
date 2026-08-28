import { useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import "../styles/PoseProject.css";

function PoseProject() {

    // Referencia al canvas donde se mostrará la cámara
    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    // Guarda las predicciones de las posturas
    const [predicciones, setPredicciones] =
        useState<string[]>([]);

    // Controla si la webcam ya fue iniciada
    const [iniciado, setIniciado] =
        useState(false);


    // Inicia el modelo y la webcam
    const iniciar = async () => {

        // Evita iniciar la cámara más de una vez
        if (iniciado) return;


        // Ruta donde se encuentra el modelo
        const URL = "/pose_model/";

        const modelURL =
            URL + "model.json";

        const metadataURL =
            URL + "metadata.json";


        // Carga el modelo de posturas
        const model = await tmPose.load(
            modelURL,
            metadataURL
        );


        // Tamaño de la webcam
        const size = 300;

        // Voltea horizontalmente la imagen
        const flip = true;


        // Crea la webcam
        const webcam =
            new tmPose.Webcam(
                size,
                size,
                flip
            );


        // Solicita permiso para usar la cámara
        await webcam.setup();

        // Inicia la cámara
        await webcam.play();

        setIniciado(true);


        // Obtiene el canvas de React
        const canvas = canvasRef.current;

        if (!canvas) return;


        // Define el tamaño del canvas
        canvas.width = size;
        canvas.height = size;


        // Obtiene el contexto utilizado para dibujar
        const ctx = canvas.getContext("2d");

        if (!ctx) return;


        // Actualiza continuamente la cámara
        const loop = async () => {

            // Actualiza el frame de la webcam
            webcam.update();


            // Detecta la postura de la persona
            const {
                pose,
                posenetOutput
            } =
                await model.estimatePose(
                    webcam.canvas
                );


            // Clasifica la postura detectada
            const resultado =
                await model.predict(
                    posenetOutput
                );


            // Convierte las predicciones a texto
            const nuevasPredicciones =
                resultado.map(
                    (prediccion) =>
                        `${prediccion.className}: ${(
                            prediccion.probability * 100
                        ).toFixed(1)}%`
                );


            // Guarda las predicciones
            setPredicciones(
                nuevasPredicciones
            );


            // Dibuja la imagen de la webcam
            ctx.drawImage(
                webcam.canvas,
                0,
                0
            );


            // Si detectó una postura
            if (pose) {

                // Confianza mínima para mostrar un punto
                const minPartConfidence = 0.5;


                // Dibuja los puntos del cuerpo
                tmPose.drawKeypoints(
                    pose.keypoints,
                    minPartConfidence,
                    ctx
                );


                // Dibuja el esqueleto
                tmPose.drawSkeleton(
                    pose.keypoints,
                    minPartConfidence,
                    ctx
                );
            }


            // Ejecuta nuevamente el ciclo
            requestAnimationFrame(loop);
        };


        // Inicia el análisis continuo
        requestAnimationFrame(loop);
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
                <button onClick={iniciar}>
                    Activar webcam
                </button>
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