import { useEffect, useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import "../styles/PoseProject.css";

function PoseProject() {
    // Canvas donde se mostrará la webcam.
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Referencias para apagar la cámara y detener la animación.
    const webcamRef = useRef<tmPose.Webcam | null>(null);
    const animationRef = useRef<number | null>(null);
    const activoRef = useRef(true);

    // Estados del componente.
    const [predicciones, setPredicciones] = useState<string[]>([]);
    const [iniciado, setIniciado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    // Apaga la webcam al cambiar de herramienta o salir del Dashboard.
    useEffect(() => {
        activoRef.current = true;

        return () => {
            activoRef.current = false;

            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }

            try {
                webcamRef.current?.stop();
            } catch {
                // La cámara podría no haber terminado de iniciarse.
            }
        };
    }, []);

    // Inicia la webcam y el reconocimiento de posturas.
    const iniciar = async () => {
        if (iniciado || cargando) return;

        setCargando(true);
        setError("");
        activoRef.current = true;

        const size = 300;
        const webcam = new tmPose.Webcam(size, size, true);
        webcamRef.current = webcam;

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error(
                    "El navegador no permite utilizar la webcam."
                );
            }

            // Primero solicita permiso y enciende la webcam.
            await webcam.setup();
            await webcam.play();

            if (!activoRef.current) return;

            const canvas = canvasRef.current;

            if (!canvas) {
                throw new Error("No se encontró el canvas.");
            }

            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("No se pudo preparar el canvas.");
            }

            setIniciado(true);

            // Muestra la webcam mientras se carga el modelo.
            const mostrarWebcam = () => {
                if (!activoRef.current) return;

                webcam.update();
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(webcam.canvas, 0, 0, size, size);

                animationRef.current =
                    requestAnimationFrame(mostrarWebcam);
            };

            animationRef.current =
                requestAnimationFrame(mostrarWebcam);

            // Carga los archivos exportados por Teachable Machine.
            const URL = "/pose_model/";

            const model = await tmPose.load(
                URL + "model.json",
                URL + "metadata.json"
            );

            if (!activoRef.current) return;

            // Detiene la vista provisional antes de iniciar las predicciones.
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }

            // Detecta y clasifica continuamente la postura.
            const loop = async () => {
                if (!activoRef.current) return;

                try {
                    webcam.update();

                    const { pose, posenetOutput } =
                        await model.estimatePose(webcam.canvas);

                    const resultado =
                        await model.predict(posenetOutput);

                    if (!activoRef.current) return;

                    setPredicciones(
                        resultado.map(
                            (prediccion) =>
                                `${prediccion.className}: ${(
                                    prediccion.probability * 100
                                ).toFixed(1)}%`
                        )
                    );

                    ctx.clearRect(0, 0, size, size);
                    ctx.drawImage(webcam.canvas, 0, 0, size, size);

                    if (pose) {
                        const confianzaMinima = 0.5;

                        tmPose.drawKeypoints(
                            pose.keypoints,
                            confianzaMinima,
                            ctx
                        );

                        tmPose.drawSkeleton(
                            pose.keypoints,
                            confianzaMinima,
                            ctx
                        );
                    }

                    animationRef.current =
                        requestAnimationFrame(loop);
                } catch (errorPrediccion) {
                    console.error(
                        "Error durante la predicción:",
                        errorPrediccion
                    );

                    setError(
                        "La cámara funciona, pero falló el reconocimiento."
                    );
                }
            };

            animationRef.current = requestAnimationFrame(loop);
        } catch (errorInicio) {
            console.error(
                "Error al iniciar el proyecto de posturas:",
                errorInicio
            );

            const mensaje =
                errorInicio instanceof Error
                    ? errorInicio.message
                    : String(errorInicio);

            setError(mensaje);
            setIniciado(false);

            try {
                webcam.stop();
            } catch {
                // La cámara todavía podría no estar configurada.
            }
        } finally {
            if (activoRef.current) {
                setCargando(false);
            }
        }
    };

    return (
        <div className="pose-project">
            <h3>Proyecto de posturas</h3>

            <p>
                Activa la cámara para reconocer diferentes posturas mediante
                Teachable Machine.
            </p>

            {!iniciado && (
                <button onClick={iniciar} disabled={cargando}>
                    {cargando ? "Iniciando webcam..." : "Activar webcam"}
                </button>
            )}

            {iniciado && cargando && (
                <p>Cámara activada. Cargando modelo de posturas...</p>
            )}

            {error && <p>Error: {error}</p>}

            <div className="pose-camera">
                <canvas
                    ref={canvasRef}
                    className="pose-canvas"
                />
            </div>

            <div className="pose-predictions">
                {predicciones.map((prediccion, index) => (
                    <p key={index}>{prediccion}</p>
                ))}
            </div>
        </div>
    );
}

export default PoseProject;
