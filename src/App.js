import './App.css';
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Holistic } from "@mediapipe/holistic";
import * as HolisticModule from "@mediapipe/holistic";

function App() {
  const [xDistance, setXDistance] = useState(null);
  const [yDistance, setYDistance] = useState(null);
  const webcamRef = useRef(null);
  const cameraRef = useRef(null);

  function calcBoundingRect(imageWidth, imageHeight, landmarks) {
    let landmarkArray = [];

    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      const landmarkX = Math.min(
        Math.floor(landmark.x * imageWidth),
        imageWidth - 1
      );
      const landmarkY = Math.min(
        Math.floor(landmark.y * imageHeight),
        imageHeight - 1
      );
      landmarkArray.push({ x: landmarkX, y: landmarkY });
    }

    // Calculate bounding rectangle
    let minX = imageWidth,
      minY = imageHeight;
    let maxX = 0,
      maxY = 0;

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
      height: maxY - minY,
    };

    return boundingRect;
  }

  function preProcessLandmark(landmarkList) {
    // Extract x and y values from landmarkList
    const xValues = landmarkList.map((element) => element.x);
    const yValues = landmarkList.map((element) => element.y);

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
    const normalizedLandmarkList = tempLandmarkList.map(
      (value) => value / maxAbsValue
    );

    return normalizedLandmarkList;
  }

  function onResults(results) {
    const imageWidth = webcamRef.current.video.videoWidth;
    const imageHeight = webcamRef.current.video.videoHeight;
    if (results.poseLandmarks && results.leftHandLandmarks) {
      const xDistance = Math.abs(
        results.poseLandmarks.landmark[3].x -
          results.leftHandLandmarks.landmark[4].x
      );
      const yDistance = Math.abs(
        results.poseLandmarks.landmark[3].y -
          results.leftHandLandmarks.landmark[4].y
      );
      setXDistance(xDistance);
      setYDistance(yDistance);

      const boundingRect = calcBoundingRect(
        imageWidth,
        imageHeight,
        results.leftHandLandmarks
      );
      const preProcessedLandmarks = preProcessLandmark(
        results.leftHandLandmarks.landmark
      );
      console.log(boundingRect);
      console.log(preProcessedLandmarks);
    }
    if (results.poseLandmarks) {
      const preProcessedLandmarksFace = preProcessLandmark(
        results.poseLandmarks.landmark
      );
      console.log(preProcessedLandmarksFace);
    }
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
      cameraRef.current = new HolisticModule.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <center>
          <div className="App">
            <Webcam
              ref={webcamRef}
              style={{ display: "none" }} // Hide webcam if not needed for display
            />
            <canvas
              ref={canvasRef}
              className="output_canvas"
              style={{
                width: "100%",
                height: "auto",
                zIndex: 9,
              }}
            ></canvas>
          </div>
        </center>
      </header>
    </div>
  );
}

export default App;
