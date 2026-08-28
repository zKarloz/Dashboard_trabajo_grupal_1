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

const URL = `${import.meta.env.BASE_URL}image_model/`;
const SIZE = 200;

interface Prediction {
  className: string;
  probability: number;
}

export default function TeachableMachineImage() {
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  const [maxPredictions, setMaxPredictions] = useState(0);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Clean up the animation loop and webcam stream on unmount.
  useEffect(() => {
    return () => {
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
    setPredictions(prediction);
  };

  const loop = async () => {
    webcamRef.current?.update();
    await predict();
    rafRef.current = window.requestAnimationFrame(loop);
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
    setMaxPredictions(model.getTotalClasses());

    // Set up the webcam.
    const flip = true;
    const webcam = new window.tmImage.Webcam(SIZE, SIZE, flip);
    await webcam.setup();
    await webcam.play();
    webcamRef.current = webcam;

    // Append the webcam canvas to the DOM.
    webcamContainerRef.current?.appendChild(webcam.canvas);

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
      <div id="label-container">
        {predictions.slice(0, maxPredictions).map((p, i) => (
          <div key={i}>
            {p.className}: {p.probability.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}