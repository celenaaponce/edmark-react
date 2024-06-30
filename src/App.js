import './App.css';
import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Holistic } from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);  // Use useRef for the camera

  function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // Draw pose landmarks
    if (results.poseLandmarks) {
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
    }

    // // Draw face landmarks
    // if (results.faceLandmarks) {
    //   drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
    // }

    // // Draw left hand landmarks
    // if (results.leftHandLandmarks) {
    //   drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: "#CC0000", lineWidth: 5 });
    // }

    // // Draw right hand landmarks
    // if (results.rightHandLandmarks) {
    //   drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: "#00CC00", lineWidth: 5 });
    // }
    canvasCtx.restore();
  }

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    if (webcamRef.current !== null) {
      cameraRef.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <center>
          <div className="App">
            <Webcam
              ref={webcamRef}
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
              style={{
                textAlign: "center",
                zindex: 9,
                width: '100%',
                height: 'auto',
              }}
            />
            <canvas
              ref={canvasRef}
              className="output_canvas"
              style={{
                position: "absolute",
                textAlign: "center",
                zindex: 9,
                width: '100%',
                height: 'auto',
              }}
            ></canvas>
          </div>
        </center>
        <p>
          React JS <code>Holistic</code> using MediaPipe.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
