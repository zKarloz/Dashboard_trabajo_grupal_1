import { useEffect, useRef, useState } from "react";
import "../styles/TeachableProjects.css";

declare global {
  interface Window {
    tmImage: any;
  }
}

const URL = `${import.meta.env.BASE_URL}image_model/`;
const SIZE = 200;

interface Prediction {
  className: string;
  probability: number;
}

export default function TeachableMachineImage() {
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      webcamRef.current?.stop?.();
    };
  }, []);

  const predict = async () => {
    const model = modelRef.current;
    const webcam = webcamRef.current;
    if (!model || !webcam) return;

    const prediction: Prediction[] = await model.predict(webcam.canvas);

    // Actualizamos el DOM directamente (como en el original) en vez de usar
    // setState, para no forzar un re-render de React en cada frame.
    const container = labelContainerRef.current;
    if (container) {
      prediction.forEach((p, i) => {
        const node = container.childNodes[i] as HTMLDivElement | undefined;
        if (node) {
          node.textContent = `${p.className}: ${p.probability.toFixed(2)}`;
        }
      });
    }
  };

  const loop = async () => {
    try {
      webcamRef.current?.update();
      await predict();
    } catch (err) {
      // Sin este catch, un error acá mata la cadena de requestAnimationFrame
      // en silencio: la cámara sigue viva pero las predicciones se congelan.
      console.error("Error en el loop de predicción:", err);
    } finally {
      if (mountedRef.current) {
        rafRef.current = window.requestAnimationFrame(loop);
      }
    }
  };

  const init = async () => {
    if (!window.tmImage) {
      console.error(
        "tmImage is not loaded. Make sure the tfjs and teachablemachine-image scripts are included."
      );
      return;
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata.
    const model = await window.tmImage.load(modelURL, metadataURL);
    modelRef.current = model;

    // Set up the webcam.
    const flip = true;
    const webcam = new window.tmImage.Webcam(SIZE, SIZE, flip);
    await webcam.setup();
    await webcam.play();
    webcamRef.current = webcam;

    // Append the webcam canvas to the DOM.
    webcamContainerRef.current?.appendChild(webcam.canvas);

    // Crear un div por clase, igual que el original.
    const container = labelContainerRef.current;
    if (container) {
      container.innerHTML = "";
      for (let i = 0; i < model.getTotalClasses(); i++) {
        container.appendChild(document.createElement("div"));
      }
    }

    setIsRunning(true);
    rafRef.current = window.requestAnimationFrame(loop);
  };

  return (
  <section className="tm-project tm-project--image">
    <header className="tm-project__header">
      <span className="tm-project__badge">Proyecto de imagen</span>

      <h2>Clasificación de imágenes</h2>

      <p>
        Activa la cámara para que el modelo analice la imagen y muestre la
        probabilidad correspondiente a cada clase.
      </p>
    </header>

    <div className="tm-project__content">
      <div className="tm-project__card">
        <div className="tm-project__card-header">
          <h3>Vista de la cámara</h3>

          <span className={`tm-status ${isRunning ? "is-active" : ""}`}>
            <span className="tm-status__dot" />

            {isRunning ? "Cámara activa" : "Cámara inactiva"}
          </span>
        </div>

        <div className="tm-media">
          {!isRunning && (
            <div className="tm-placeholder">
              Presiona el botón para activar la cámara e iniciar el modelo.
            </div>
          )}

          <div
            id="webcam-container"
            className="tm-webcam-mount"
            ref={webcamContainerRef}
          />
        </div>

        <button
          className="tm-project__button"
          type="button"
          onClick={init}
          disabled={isRunning}
        >
          {isRunning ? "Modelo funcionando" : "Activar cámara"}
        </button>
      </div>

      <aside className="tm-project__card">
        <div className="tm-project__card-header">
          <h3>Resultados</h3>
        </div>

        <p className="tm-results-description">
          Las probabilidades se actualizarán automáticamente mientras la
          cámara esté activa.
        </p>

        {!isRunning && (
          <p className="tm-results-empty">
            Todavía no hay predicciones disponibles.
          </p>
        )}

        <div
          id="label-container"
          className="tm-labels"
          ref={labelContainerRef}
        />
      </aside>
    </div>
  </section>
);
}
