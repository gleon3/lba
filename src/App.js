import React from "react";
import { useState } from "react";
import './App.css';
import { Production, Grammar, convert_to_kuroda, grammar_to_lba, is_kuroda } from "./lba.js";


type Point = {
  x: number;
  y: number;
};

const Transition = ({ startPoint, endPoint, text }) => {
  //TODO
}

const LBA_Graph = ({ lba }) => {
  const states = []
  const alreadyDrawn = new Map()


  const radius = 50

  let height = 100
  let width = 0
  let test = 0


  let j = 0
  let i = 1

  function drawTransition(startState) {

    if (height <= j * 200 + + (100 + 2 * radius)) {
      height += (100 + 2 * radius)
    }



    let transitions = lba.list.get(startState)

    if (!transitions) {
      //draw endstate
    } else {
      let startX = alreadyDrawn.get(startState)[0]
      let startY = alreadyDrawn.get(startState)[1]
      for (let [key, v] of transitions) {
        //console.log(key, value)
        let transition_name = ''
        for (let value of v) {
          transition_name += value[0] + ' : ' + value[1] + ', ' + value[2] + '\n'
        }


        if (alreadyDrawn.get(key)) {
          if (startState == key) {
            //self transition
            states.push(
              <svg>
                <path d={'M ' + (i * 150 - radius) + ' ' + (100 + 2 * radius + j * 200) +
                  ' c -100 0 0 -50 0 -5'} stroke="blue" fill="none" strokeWidth={2} />
                <text x={i*150 - radius} y={100 + 2*radius + j*200} textAnchor="middle">{
                  v.map(value => {
                    return <tspan x={i*150 - radius} dy='15'>{value[0] + ' : ' + value[1] + ', ' + value[2]}</tspan>
                  })}
                </text>
              </svg>
            )

          } else {
            //transition to state that already has been drawn
            let stateX = alreadyDrawn.get(key)[0]
            let stateY = alreadyDrawn.get(key)[1] + 1

            states.push(
              <svg>
                <path d={'M ' + (i * 150) + ' ' + (100 - radius + 2 * radius + j * 200) + ' Q ' + (i * 150) + ' ' + (100 - radius + 2 * radius + j * 200) + ' ' + ((stateX * 150)) + ' ' + (stateY * 200 + radius)} fill="none" stroke="red" strokeWidth={2} />
              </svg>
            )

            /*states.push(
              <svg>
                <text x={stateX*150 + radius} y={radius + stateY*200 - radius} text-anchor="middle">{transition_name}</text>
                <line stroke="#aaa" strokeWidth={1} x1={startX*150} y1={radius + stateY*200 + 100} x2={stateX*150 + radius} y2={radius + stateY*200-radius}/>
              </svg>
            )*/
          }
        } else {

          j += 1
          states.push(
            <svg>
              <path id={'line' + i + j} d={'M ' + (startX * 150) + ' ' + (radius + j * 200) + ' L ' + (i * 150) + ' ' + (radius + j * 200 + 100)} stroke="#aaa" strokeWidth={2} />
              <text textAnchor="middle"><textPath href={'#line' + i + j} startOffset='50%'>{transition_name}</textPath></text>
              <circle cx={i * 150} cy={100 + 2 * radius + j * 200} r={radius} fill="none" stroke="black" />
              <text x={i * 150} y={100 + 2 * radius + j * 200} text-anchor="middle">{key}</text>

            </svg>)

          if (!alreadyDrawn.get(key)) {
            alreadyDrawn.set(key, [i, j])
          }

          drawTransition(key)
          i += 1
          j -= 1
        }

      }
      if (width < i * 150) {
        width += 150
      }
      i = startX
    }
  }


  if (lba) {
    states.push(
      <svg>
        <line stroke="#aaa" strokeWidth={1} x1={150} y1={radius} x2={150} y2={radius + 100} />
        <circle cx={150} cy={100 + 2 * radius} r={radius} fill="none" stroke="black" />
        <text x={i * 150} y={100 + 2 * radius} text-anchor="middle">{'zs'}</text>
      </svg>)
    alreadyDrawn.set('zs', [1, 0])
    drawTransition('zs')
    /*
    for(let [key,value] of lba.list){
      //console.log('draw state', key)
      //draw state : with name key 
      for(let [innerkey, innervalue] of value){
        if(true){
          let transition_name = innerkey + ' : ' + innervalue[1] + ', ' + innervalue[2]

          
          //draw state : with name innervalue[0]

          if(alreadyDrawn.includes(innervalue[0])){
            
          }else{
            alreadyDrawn.push(innervalue[0])
            states.push(
              <svg>
                <circle cx={i} cy={radius + j} r={radius} fill="none" stroke="black"/>
                <text x={i} y={radius + j} text-anchor="middle">{innervalue[0]}</text>
                <line stroke="#aaa" strokeWidth={1} x1={i} y1={radius + j} x2={i} y2={radius + j + 100}/>
              </svg>)
            test += 1
            i += 150
          }
        }
      }
      if(width < i){
        width += i
      }
      i = 100
      if(test > 0){
        j += 150
        height += 150
        test = 0
      }
    }*/
  }


  return (
    <svg
      width={width}
      height={height}
    >
      {states}

    </svg>
  )
}

const StateTransition = ({ startPoint, endPoint, radius, stateIndex, stateIndex2, description }) => {

  const canvasStartPoint = {
    x: Math.min(startPoint.x, endPoint.x),
    y: Math.min(startPoint.y, endPoint.y),
  };
  const canvasWidth = Math.abs(endPoint.x - startPoint.x);
  const canvasHeight = Math.abs(endPoint.y - startPoint.y) + radius * 2;

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
      <circle cx={startX} cy={startY} r={radius} fill="none" stroke="black" />
      <text x={startX} y={startY} text-anchor="middle">{stateIndex}</text>
      <line
        stroke="#aaa"
        strokeWidth={1}
        x1={startPoint.x - canvasStartPoint.x + radius * 2 * Math.sign(endPoint.x - startPoint.x)}
        y1={startPoint.y - canvasStartPoint.y + radius}
        x2={endPoint.x - canvasStartPoint.x - radius * 2 * Math.sign(endPoint.x - startPoint.x)}
        y2={endPoint.y - canvasStartPoint.y + radius}
      />
      <text x="50%" y="50%" text-anchor="middle">{description}</text>
      <circle cx={endX} cy={endY} r={radius} fill="none" stroke="black" />
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
    for (let production of productions) {
      console.log(production.left + " -> " + production.right)
    }

    let kuroda_grammar = is_kuroda(grammar) ? grammar : convert_to_kuroda(grammar)

    console.log('\nnew grammar:')
    for (let production of kuroda_grammar.productions) {
      console.log(production.left + " -> " + production.right)
    }

    setLBA(grammar_to_lba(kuroda_grammar))

    console.log(lba.list)
  }

  function handleStartValue(startValue) {
    //TODO: check if startValue input is correct
  }

  function handleNonterminals(nonterminals) {
    //TODO: check if nonterminals input is correct
  }

  function handleTerminals(terminals) {
    //TODO: check if terminals input is correct
  }

  function handleProductions(productionsString) {
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
        <textarea onChange={(e) => setTerminalValue(e.target.value)}></textarea>
        <label>productions:</label>
        <textarea rows={5} onChange={(e) => setProductionValue(e.target.value)}></textarea>
        <button onClick={handleSubmit}>submit</button>
      </div>
      <div>
        <tbody>
          {
            <LBA_Graph lba={lba}></LBA_Graph>
        /*Array.from(lba).map(([key, value]) => 
          <StateTransition startPoint={startPoint} endPoint={endPoint} radius={radius} stateIndex={key[0]} stateIndex2={value[0]} description={key[1] + ' : ' + value[1] + ', ' + value[2]}/>)
        */}
        </tbody>
      </div>
    </div>
  );
}

export default App;