import './App.css';
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Holistic } from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import * as HolisticModule from "@mediapipe/holistic";

function App() {
  const [xDistance, setXDistance] = useState(null);
  const [yDistance, setYDistance] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);  // Use useRef for the camera
  const connect = window.drawConnectors;
  const drawLandmarks = window.drawLandmarks
  
  function preProcessLandmark(landmarkList) {
    // Extract x and y values from landmarkList
    const xValues = landmarkList.map(element => element.x);
    const yValues = landmarkList.map(element => element.y);

    // Deep copy x and y values
    const tempX = [...xValues];
    const tempY = [...yValues];

    // Convert to relative coordinates
    let baseX = tempX[0];
    let baseY = tempY[0];
    for (let i = 0; i < tempX.length; i++) {
      tempX[i] -= baseX;
      tempY[i] -= baseY;
    }

    // Flatten and interleave x and y values
    const tempLandmarkList = [];
    for (let i = 0; i < tempX.length; i++) {
      tempLandmarkList.push(tempX[i]);
      tempLandmarkList.push(tempY[i]);
    }

    // Normalization
    const maxAbsValue = Math.max(...tempLandmarkList.map(Math.abs));
    const normalizedLandmarkList = tempLandmarkList.map(value => value / maxAbsValue);

    return normalizedLandmarkList;
  }

  function calcBoundingRect(frame, landmarks, imageWidth, imageHeight) {
  let landmarkArray = [];

  for (let i = 0; i < landmarks.length; i++) {
    const landmark = landmarks[i];
    const landmarkX = Math.min(Math.floor(landmark.x * imageWidth), imageWidth - 1);
    const landmarkY = Math.min(Math.floor(landmark.y * imageHeight), imageHeight - 1);
    landmarkArray.push({ x: landmarkX, y: landmarkY });
  }

  // Calculate bounding rectangle
  let minX = imageWidth, minY = imageHeight;
  let maxX = 0, maxY = 0;

  for (let i = 0; i < landmarkArray.length; i++) {
    const { x, y } = landmarkArray[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const boundingRect = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
    console.log(boundingRect)

  return boundingRect;
}
  function onResults(results) {
    const imageWidth = webcamRef.current.video.videoWidth;
    const imageHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = imageWidth;
    canvasRef.current.height = imageHeight;

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
      connect(canvasCtx, results.poseLandmarks, HolisticModule.POSE_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
      drawLandmarks(canvasCtx, results.poseLandmarks, HolisticModule.POSE_CONNECTIONS, { color: "#00FF00", lineWidth: 4 })
    }

    if (results.poseLandmarks && results.leftHandLandmarks) {
      const xDistance = Math.abs(results.poseLandmarks.landmark[3].x - results.leftHandLandmarks.landmark[4].x);
      const yDistance = Math.abs(results.poseLandmarks.landmark[3].y - results.leftHandLandmarks.landmark[4].y);
      setXDistance(xDistance);
      setYDistance(yDistance);

      const boundingRect = calcBoundingRect(canvasCtx, results.leftHandLandmarks, imageWidth, imageHeight);
      // const preProcessedLandmarks = preProcessLandmark(results.leftHandLandmarks.landmark);}
      console.log(boundingRect);
      console.log(yDistance);
      console.log(xDistance);
    // // Draw face landmarks
    // if (results.faceLandmarks) {
    //   drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
    // }

    // Draw left hand landmarks
    if (results.leftHandLandmarks) {
      connect(canvasCtx, results.leftHandLandmarks, HolisticModule.HAND_CONNECTIONS, { color: "#CC0000", lineWidth: 5 });
      drawLandmarks(canvasCtx, results.leftHandLandmarks, HolisticModule.HAND_CONNECTIONS, { color: "#CC0000", lineWidth: 5 });
    }

    // Draw right hand landmarks
    if (results.rightHandLandmarks) {
      connect(canvasCtx, results.rightHandLandmarks, HolisticModule.HAND_CONNECTIONS, { color: "#CC0000", lineWidth: 5 });
      drawLandmarks(canvasCtx, results.rightHandLandmarks, HolisticModule.HAND_CONNECTIONS, { color: "#00CC00", lineWidth: 5 });
    }
    canvasCtx.restore();
  }

  useEffect(() => {
    const holisticEffect = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });

    holisticEffect.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holisticEffect.onResults(onResults);

    if (webcamRef.current !== null) {
      cameraRef.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holisticEffect.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }
  });

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
                width: '300px',
                height: 'auto',
                display:'none'
              }}
            />{" "}
            <canvas
              ref={canvasRef}
              className="output_canvas"
              style={{
                zindex: 9,
                width: '300px',
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
