import React from "react";
import { useState } from "react";
import './App.css';
import { Production, Grammar, convert_to_kuroda, grammar_to_lba, is_kuroda } from "./lba.js";;

type Point = {
  x: number;
  y: number;
};

const StateTransition = ({ startPoint, endPoint, radius, stateIndex, stateIndex2, description }) => {
  
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
        <text x={startX} y={startY} text-anchor="middle">{stateIndex}</text>
        <line
          stroke="#aaa"
          strokeWidth={1}
          x1={startPoint.x - canvasStartPoint.x + radius*2 * Math.sign(endPoint.x- startPoint.x)}
          y1={startPoint.y - canvasStartPoint.y + radius}
          x2={endPoint.x - canvasStartPoint.x - radius*2 * Math.sign(endPoint.x- startPoint.x)}
          y2={endPoint.y - canvasStartPoint.y + radius}
        />
        <text x="50%" y="50%" text-anchor="middle">{description}</text>
        <circle cx={endX} cy={endY} r={radius} fill="none" stroke="black"/>
        <text x={endX} y={endY} text-anchor="middle">{stateIndex2}</text>
      </svg>
  );
};

function App() {
  const [startValue, setStartValue] = useState('')
  const [nonterminalValue, setNonterminalValue] = useState('')
  const [terminalValue, setTerminalValue] = useState('')
  const [productionValue, setProductionValue] = useState('')

  const [lba, setLBA] = useState('')

  function handleSubmit(e) {
    e.preventDefault();

    const nonterminals = nonterminalValue.split(' ').join('').split(',')
    const terminals = terminalValue.split(' ').join('').split(',')
    let productions = productionValue.split(' ').join('').split(',')

    productions = handleProductions(productions)

    //console.log(startValue, nonterminals, terminals, productions)

    let grammar = new Grammar(nonterminals, terminals, productions, startValue)

    console.log('old grammar:')
    for(let production of productions){
        console.log(production.left + " -> " + production.right)
    }

    let kuroda_grammar = is_kuroda(grammar) ? grammar : convert_to_kuroda(grammar)

    console.log('\nnew grammar:')
    for(let production of kuroda_grammar.productions){
        console.log(production.left + " -> " + production.right)
    }
    console.log(lba)
    
    setLBA(grammar_to_lba(kuroda_grammar))
  }

  function handleStartValue(startValue){
    //TODO: check if startValue input is correct
  }

  function handleNonterminals(nonterminals){
    //TODO: check if nonterminals input is correct
  }

  function handleTerminals(terminals){
    //TODO: check if terminals input is correct
  }

  function handleProductions(productionsString){
    //TODO: check if production input is correct

    let productions = []

    for (let prod of productionsString) {
      prod = prod.trim()

      const left = prod.split('->')[0]
      const right = prod.split('->')[1]
      
      const production = new Production(left.split(''), right.split(''))

      productions.push(production)
    }

    return productions
  }

  const startPoint = {
    x: 50,
    y: 50,
  };

  const endPoint = {
    x: 400,
    y: 50,
  };

  const radius = 40

  return (
    <div>
      <div className='input'>
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
        <tbody>
        {Array.from(lba).map(([key, value]) => 
          <StateTransition startPoint={startPoint} endPoint={endPoint} radius={radius} stateIndex={key[0]} stateIndex2={value[0]} description={key[1] + ' : ' + value[1] + ', ' + value[2]}/>)
        }
        </tbody>
      </div>
    </div>
  );
}

export default App;