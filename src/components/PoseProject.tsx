import { useEffect, useRef, useState } from "react";

// Types for the globals injected by the tfjs / teachablemachine-pose <script> tags.
// Install the scripts in your index.html (or load them dynamically, see loadScript below):
//   https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js
//   https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js
declare global {
  interface Window {
    tmPose: any;
  }
}

const URL = "./public/pose_model/";
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

  // Clean up the animation loop and webcam stream on unmount.
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

    // Prediction #1: run input through posenet.
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction #2: run input through the teachable machine classifier.
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

    // Load the model and metadata.
    const model = await window.tmPose.load(modelURL, metadataURL);
    modelRef.current = model;
    setMaxPredictions(model.getTotalClasses());

    // Set up the webcam.
    const flip = true;
    const webcam = new window.tmPose.Webcam(SIZE, SIZE, flip);
    await webcam.setup();
    await webcam.play();
    webcamRef.current = webcam;

    // Set up the canvas.
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
    <div>
      <div>Teachable Machine Pose Model</div>
      <button type="button" onClick={init} disabled={isRunning}>
        Start
      </button>
      <div>
        <canvas ref={canvasRef} />
      </div>
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