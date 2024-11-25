import React from "react";
import { useState } from "react";

type Point = {
  x: number;
  y: number;
};

const StateTransition = ({ startPoint, endPoint, radius }) => {
  
  const canvasStartPoint = {
    x: Math.min(startPoint.x, endPoint.x),
    y: Math.min(startPoint.y, endPoint.y),
  };
  const canvasWidth = Math.abs(endPoint.x - startPoint.x);
  const canvasHeight = Math.abs(endPoint.y - startPoint.y) + radius*2;

  const startY = ((startPoint.y < endPoint.y) ? radius : (canvasHeight - radius));
  const endY = ((startPoint.y < endPoint.y) ? (canvasHeight - radius) : radius);

  const startX = ((startPoint.x < endPoint.x) ? radius : (canvasWidth - radius));
  const endX = ((startPoint.x < endPoint.x) ? (canvasWidth - radius) : radius);

  return (
      <svg
        width={canvasWidth}
        height={canvasHeight}
        style={{
          backgroundColor: "#eee",
          transform: `translate(${canvasStartPoint.x}px, ${canvasStartPoint.y}px)`,
        }}
      >
        <circle cx={startX} cy={startY} r={radius} fill="none" stroke="black"/>
        <text x={startX} y={startY} text-anchor="middle">z1</text>
        <line
          stroke="#aaa"
          strokeWidth={1}
          x1={startPoint.x - canvasStartPoint.x + radius*2 * Math.sign(endPoint.x- startPoint.x)}
          y1={startPoint.y - canvasStartPoint.y + radius}
          x2={endPoint.x - canvasStartPoint.x - radius*2 * Math.sign(endPoint.x- startPoint.x)}
          y2={endPoint.y - canvasStartPoint.y + radius}
        />
        <text x="50%" y="50%" text-anchor="middle">arrow description</text>
        <circle cx={endX} cy={endY} r={radius} fill="none" stroke="black"/>
        <text x={endX} y={endY} text-anchor="middle">z2</text>
      </svg>
  );
};

function App() {
  const [startValue, setStartValue] = useState('')
  const [nonterminalValue, setNonterminalValue] = useState('')
  const [terminalValue, setTerminalValue] = useState('')
  const [productionValue, setProductionValue] = useState('')
  


  function handleSubmit(e) {
    e.preventDefault();

    console.log(startValue, nonterminalValue, terminalValue, productionValue);
  }

  const startPoint = {
    x: 50,
    y: 50,
  };

  const endPoint = {
    x: 20000,
    y: 20000,
  };

  const radius = 40

  return (
    <div>
      <div>
        <label>start:</label>
        <textarea onChange={(e) => setStartValue(e.target.value)}></textarea>
        <label>nonterminals:</label>
        <textarea onChange={(e) => setNonterminalValue(e.target.value)}></textarea>
        <label>terminals:</label>
        <textarea  onChange={(e) => setTerminalValue(e.target.value)}></textarea>
        <label>productions:</label>
        <textarea rows={5} onChange={(e) => setProductionValue(e.target.value)}></textarea>
        <button onClick={handleSubmit}>submit</button>
      </div>
      <div>
        <StateTransition startPoint={startPoint} endPoint={endPoint} radius={radius} />
      </div>
    </div>
  );
}

export default App;