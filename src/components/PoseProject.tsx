import { useEffect, useRef, useState } from "react";
import "../styles/TeachableProjects.css";

declare global {
  interface Window {
    tmPose: any;
  }
}

const URL = `${import.meta.env.BASE_URL}pose_model/`;
const SIZE = 200;

interface Prediction {
  className: string;
  probability: number;
}

export default function TeachableMachinePose() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  const [maxPredictions, setMaxPredictions] = useState(0);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      webcamRef.current?.stop?.();
    };
  }, []);

  const drawPose = (pose: any) => {
    const ctx = ctxRef.current;
    const webcam = webcamRef.current;
    if (!ctx || !webcam?.canvas) return;

    ctx.drawImage(webcam.canvas, 0, 0);

    if (pose) {
      const minPartConfidence = 0.5;
      window.tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      window.tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  };

  const predict = async () => {
    const model = modelRef.current;
    const webcam = webcamRef.current;
    if (!model || !webcam) return;

    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction: Prediction[] = await model.predict(posenetOutput);

    setPredictions(prediction);
    drawPose(pose);
  };

  const loop = async () => {
    webcamRef.current?.update();
    await predict();
    rafRef.current = window.requestAnimationFrame(loop);
  };

  const init = async () => {
    if (!window.tmPose) {
      console.error(
        "tmPose is not loaded. Make sure the tfjs and teachablemachine-pose scripts are included."
      );
      return;
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const model = await window.tmPose.load(modelURL, metadataURL);
    modelRef.current = model;
    setMaxPredictions(model.getTotalClasses());

    const flip = true;
    const webcam = new window.tmPose.Webcam(SIZE, SIZE, flip);
    await webcam.setup();
    await webcam.play();
    webcamRef.current = webcam;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = SIZE;
      canvas.height = SIZE;
      ctxRef.current = canvas.getContext("2d");
    }

    setIsRunning(true);
    rafRef.current = window.requestAnimationFrame(loop);
  };

  return (
  <section className="tm-project tm-project--pose">
    <header className="tm-project__header">
      <span className="tm-project__badge">Proyecto de postura</span>

      <h2>Detección de posturas</h2>

      <p>
        El modelo analizará tu posición corporal, dibujará los puntos de
        referencia y mostrará la postura detectada.
      </p>
    </header>

    <div className="tm-project__content">
      <div className="tm-project__card">
        <div className="tm-project__card-header">
          <h3>Detección corporal</h3>

          <span className={`tm-status ${isRunning ? "is-active" : ""}`}>
            <span className="tm-status__dot" />

            {isRunning ? "Detección activa" : "Detección inactiva"}
          </span>
        </div>

        <div className="tm-media">
          {!isRunning && (
            <div className="tm-placeholder">
              Colócate frente a la cámara y presiona el botón para comenzar.
            </div>
          )}

          <canvas ref={canvasRef} />
        </div>

        <button
          className="tm-project__button"
          type="button"
          onClick={init}
          disabled={isRunning}
        >
          {isRunning ? "Modelo funcionando" : "Iniciar detección"}
        </button>
      </div>

      <aside className="tm-project__card">
        <div className="tm-project__card-header">
          <h3>Probabilidad por postura</h3>
        </div>

        <p className="tm-results-description">
          Cada resultado indica qué tan seguro está el modelo de la postura
          observada.
        </p>

        {!isRunning && (
          <p className="tm-results-empty">
            Activa la cámara para mostrar las predicciones.
          </p>
        )}

        <div id="label-container" className="tm-labels">
          {predictions.slice(0, maxPredictions).map((prediction, index) => (
            <div key={index}>
              {prediction.className}:{" "}
              {(prediction.probability * 100).toFixed(1)}%
            </div>
          ))}
        </div>
      </aside>
    </div>
  </section>
);
}