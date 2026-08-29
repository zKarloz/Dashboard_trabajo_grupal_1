import { useEffect, useRef, useState } from "react";

// Types for the globals injected by the tfjs / speech-commands <script> tags.
// Install the scripts in your index.html (o cárgalos dinámicamente):
//   https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js
//   https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.min.js
declare global {
  interface Window {
    speechCommands: any;
  }
}

const URL = `${import.meta.env.BASE_URL}voice_model/`;

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
    <div>
      <div>Teachable Machine Audio Model</div>
      <button type="button" onClick={init} disabled={isRunning}>
        Start
      </button>
      <div id="label-container" ref={labelContainerRef} />
    </div>
  );
}
