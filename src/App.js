import './App.css';
import React, { useRef } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);

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
              }}
            />
          </div>
        </center>
        <p>
          React JS <code>Webcam</code> feed.
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
