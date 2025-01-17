import React, { useRef, useEffect } from "react";
import { Holistic, POSE_CONNECTIONS, HAND_CONNECTIONS } from "@mediapipe/holistic";
import {drawConnectors, drawLandmarks} from '@mediapipe/drawing_utils'
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

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

    // Draw face landmarks
    // if (results.faceLandmarks) {
    //   drawLandmarks(canvasCtx, results.faceLandmarks, {
    //     color: "#ffcc00",
    //     lineWidth: 1,
    //   });
    // }

    // Draw pose landmarks
    if (results.poseLandmarks) {
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#00ff00",
        lineWidth: 2,
      });
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
        {color: '#CC0000', lineWidth: 5});
    }

    // Draw left hand landmarks
    if (results.leftHandLandmarks) {
      drawLandmarks(canvasCtx, results.leftHandLandmarks, {
        color: "#ff0000",
        lineWidth: 2,
      });
      drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
        {color: '#CC0000', lineWidth: 5});
    }

    // Draw right hand landmarks
    if (results.rightHandLandmarks) {
      drawLandmarks(canvasCtx, results.rightHandLandmarks, {
        color: "#0000ff",
        lineWidth: 2,
      });
      drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
        {color: '#CC0000', lineWidth: 5});
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
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <center>
          <div className="App">
            <Webcam
              ref={webcamRef}
              style={{
                textAlign: "center",
                zindex: 9,
                width: "300px",
                height: "auto",
                display: "none",
              }}
            />{" "}
            <canvas
              ref={canvasRef}
              className="output_canvas"
              style={{
                zindex: 9,
                width: "300px",
                height: "auto",
              }}
            ></canvas>
          </div>
        </center>
        <p>
          React js <code>Holistic</code> using Mediapipe.
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
