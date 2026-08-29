import { useEffect, useRef, useState } from "react";

// Types for the globals injected by the tfjs / teachablemachine-image <script> tags.
// Install the scripts in your index.html (or load them dynamically):
//   https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js
//   https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js
declare global {
  interface Window {
    tmImage: any;
  }
}

const URL = "./my_model/";
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

  // Clean up the animation loop and webcam stream on unmount.
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

    // predict can take in an image, video or canvas html element
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
      // Solo reprogramamos si el componente sigue montado. Si te fuiste de
      // la página mientras predict() estaba en vuelo, cancelAnimationFrame
      // en el cleanup no alcanza a cancelar ESTE frame (ya se está
      // ejecutando), así que sin este chequeo el loop seguiría vivo para
      // siempre después de desmontar.
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
    <div>
      <div>Teachable Machine Image Model</div>
      <button type="button" onClick={init} disabled={isRunning}>
        Start
      </button>
      <div id="webcam-container" ref={webcamContainerRef} />
      <div id="label-container" ref={labelContainerRef} />
    </div>
  );
}
