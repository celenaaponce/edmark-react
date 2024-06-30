import './App.css';
import { Holistic } from "@mediapipe/holistic";
import React, { useRef, useEffect } from "react";
import * as HolisticModule from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";

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

    if (results.poseLandmarks) {
      HolisticModule.drawConnectors(canvasCtx, results.poseLandmarks, HolisticModule.POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 4
      });
    }
    if (results.faceLandmarks) {
      HolisticModule.drawConnectors(canvasCtx, results.faceLandmarks, HolisticModule.FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1
      });
    }
    if (results.leftHandLandmarks) {
      HolisticModule.drawConnectors(canvasCtx, results.leftHandLandmarks, HolisticModule.HAND_CONNECTIONS, {
        color: "#CC0000",
        lineWidth: 5
      });
    }
    if (results.rightHandLandmarks) {
      HolisticModule.drawConnectors(canvasCtx, results.rightHandLandmarks, HolisticModule.HAND_CONNECTIONS, {
        color: "#00CC00",
        lineWidth: 5
      });
    }
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
            <div style={{ position: 'relative', width: '300px' }}>
              <Webcam
                ref={webcamRef}
                style={{
                  textAlign: "center",
                  zindex: 9,
                  width: '300px',
                  height: 'auto',
                }}
              />
              <canvas
                ref={canvasRef}
                className="output_canvas"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zindex: 10,
                  width: '300px',
                  height: 'auto',
                }}
              ></canvas>
            </div>
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
