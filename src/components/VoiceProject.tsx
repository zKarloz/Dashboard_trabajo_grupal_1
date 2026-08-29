import { useEffect, useRef, useState } from "react";
import "../styles/TeachableProjects.css";

// Types for the globals injected by the tfjs / speech-commands <script> tags.
// Install the scripts in your index.html (o cárgalos dinámicamente):
//   https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js
//   https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.min.js
declare global {
  interface Window {
    speechCommands: any;
  }
}

const URL = `${window.location.origin}${import.meta.env.BASE_URL}voice_model/`;

export default function TeachableMachineAudio() {
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const [isRunning, setIsRunning] = useState(false);

  // Detener el reconocimiento al desmontar el componente.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      recognizerRef.current?.stopListening?.();
    };
  }, []);

  const createModel = async () => {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = window.speechCommands.create(
      "BROWSER_FFT", // fourier transform type, not useful to change
      undefined, // speech commands vocabulary feature, not useful for your models
      checkpointURL,
      metadataURL
    );

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();
    return recognizer;
  };

  const init = async () => {
    if (!window.speechCommands) {
      console.error(
        "speechCommands is not loaded. Make sure the tfjs and speech-commands scripts are included."
      );
      return;
    }

    try {
      const recognizer = await createModel();
      recognizerRef.current = recognizer;

      const classLabels: string[] = recognizer.wordLabels(); // get class labels

      // Crear un div por clase, igual que el original.
      const container = labelContainerRef.current;
      if (container) {
        container.innerHTML = "";
        for (let i = 0; i < classLabels.length; i++) {
          container.appendChild(document.createElement("div"));
        }
      }

      // listen() takes two arguments:
      // 1. A callback function that is invoked anytime a word is recognized.
      // 2. A configuration object with adjustable fields
      recognizer.listen(
        (result: { scores: Float32Array | number[] }) => {
          if (!mountedRef.current) return;

          // Actualizamos el DOM directamente (como en el original) en vez
          // de usar setState, para no forzar un re-render de React en cada
          // predicción.
          const labelContainer = labelContainerRef.current;
          if (!labelContainer) return;

          for (let i = 0; i < classLabels.length; i++) {
            const node = labelContainer.childNodes[i] as
              | HTMLDivElement
              | undefined;
            if (node) {
              node.textContent = `${classLabels[i]}: ${result.scores[i].toFixed(2)}`;
            }
          }
        },
        {
          includeSpectrogram: true, // in case listen should return result.spectrogram
          probabilityThreshold: 0.75,
          invokeCallbackOnNoiseAndUnknown: true,
          overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
        }
      );

      // Stop the recognition in 5 seconds.
      // setTimeout(() => recognizer.stopListening(), 5000);

      setIsRunning(true);
    } catch (err) {
      console.error("Error al iniciar el modelo/micrófono:", err);
    }
  };

  return (
  <section className="tm-project tm-project--voice">
    <header className="tm-project__header">
      <span className="tm-project__badge">Proyecto de voz</span>

      <h2>Reconocimiento de comandos de voz</h2>

      <p>
        Activa el micrófono y pronuncia uno de los comandos utilizados para
        entrenar el modelo.
      </p>
    </header>

    <div className="tm-project__content">
      <div className="tm-project__card">
        <div className="tm-project__card-header">
          <h3>Entrada de audio</h3>

          <span className={`tm-status ${isRunning ? "is-active" : ""}`}>
            <span className="tm-status__dot" />

            {isRunning ? "Escuchando" : "Micrófono inactivo"}
          </span>
        </div>

        <div className="tm-media tm-media--voice">
          <div
            className={`tm-voice-visual ${
              isRunning ? "is-listening" : ""
            }`}
          >
            <span className="tm-voice-ring" />
            <span className="tm-voice-ring tm-voice-ring--second" />

            <div className="tm-voice-icon" aria-hidden="true">
              🎙
            </div>
          </div>
        </div>

        <button
          className="tm-project__button"
          type="button"
          onClick={init}
          disabled={isRunning}
        >
          {isRunning ? "Reconocimiento activo" : "Activar micrófono"}
        </button>
      </div>

      <aside className="tm-project__card">
        <div className="tm-project__card-header">
          <h3>Comandos detectados</h3>
        </div>

        <p className="tm-results-description">
          El modelo mostrará la probabilidad asignada a cada palabra o sonido.
        </p>

        {!isRunning && (
          <p className="tm-results-empty">
            Activa el micrófono para comenzar la detección.
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
