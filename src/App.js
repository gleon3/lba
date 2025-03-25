import React, { useEffect } from "react";
import { useState } from "react";
import './App.css';
import { Production, Grammar, convert_to_kuroda, grammar_to_lba, is_kuroda, lba_eliminate_x } from "./lba.js";

/**
 * A component that displays a start state.
 * 
 * @typedef {Object} StartStateProps
 * @property {Object} startPosition - The x and y position of the start point of the transition going into the start state.
 * @property {Object} statePosition - The x and y position of the start state.
 * @property {Number} radius - The radius of the outer circle of the state.
 * @property {String} name - The name of the state.
 *
 * @param {StartStateProps} props
 * @returns {JSX.Element}
 */
const StartState = ({ startPosition, statePosition, radius, name }) => {

  return(
    <svg>
      <State position={statePosition} radius={radius} name={name}></State>
      <Transition startPoint={startPosition} endPoint={statePosition} radius={radius} label={["start"]}></Transition>
    </svg>
  )
}

/**
 * A component that displays a state.
 *
 * @typedef {Object} StateProps
 * @property {Object} position - The x and y position of the state.
 * @property {Number} radius - The radius of the outer circle of the state.
 * @property {String} name - The name of the string.
 *
 * @param {StateProps} props
 * @returns {JSX.Element}
 */
const State = ({ position, radius, name }) => {
  return(
    <svg>
      <circle cx={position.x} cy={position.y} r={radius} fill="none" stroke="black" />
      <text x={position.x} y={position.y} textAnchor="middle">{name}</text>
    </svg>
  )
}

/**
 * A component that displays a end state.
 *
 * @typedef {Object} EndStateProps
 * @property {Object} position - The x and y position of the state.
 * @property {Number} radius - The radius of the outer circle of the state.
 * @property {String} name - The name of the end state.
 *
 * @param {EndStateProps} props
 * @returns {JSX.Element}
 */
const EndState = ({ position, radius, name }) => {
  return(
    <svg>
      <State position={position} radius={radius} name={name}></State>
      <circle cx={position.x} cy={position.y} r={radius-5} fill="none" stroke="black" />
    </svg>
  )
}

/**
 * A component that displays a transition between two states.
 *
 * @typedef {Object} TransitionProps
 * @property {Object} startPoint - The x and y position of the state the transition starts at.
 * @property {Object} endPoint - The x and y position of the state the transition ends at.
 * @property {Number} radius - The radius of the states.
 * @property {String[]} label - The label of the transition.
 *
 * @param {TransitionProps} props
 * @returns {JSX.Element}
 */
const Transition = ({ startPoint, endPoint, radius, label }) => {
  const [isFocused, setFocus] = useState(false);

  if(startPoint.x == endPoint.x && startPoint.y == endPoint.y){ //self transition
    const transitionStart = {
      x: startPoint.x + radius,
      y: startPoint.y
    }
  
    const transitionEnd = transitionStart

    const urlString = transitionStart.x + "," + transitionStart.y + "," + transitionEnd.x + "," + transitionEnd.y

    return(
      <svg pointerEvents="stroke" onMouseOver={() => setFocus(true)} onMouseLeave={() => setFocus(false)} fill={isFocused ? "red" : "black"}>
        <marker
            id={"arrow" + urlString} 
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <path d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' q 125 -12.5 0 -25'} stroke={isFocused ? "red" : "#aaa"} fill="none" strokeWidth={2} markerEnd={"url(#arrow" + urlString + ")"}/>
        <text x={transitionStart.x} y={transitionStart.y - radius} textAnchor="middle">{
          label.map(value => {
            return <tspan key={value} x={transitionStart.x + 2*radius} dy='13'>{value}</tspan>
          })
        }
        </text>
      </svg>
    )
  }
  else if(startPoint.x == endPoint.x && startPoint.y >= endPoint.y){ //transition to earlier already drawn state on the same column
    const transitionStart = {
      x: startPoint.x - radius,
      y: startPoint.y
    }
  
    const transitionEnd = {
      x: endPoint.x - radius,
      y: endPoint.y
    }

    const urlString = transitionStart.x + "," + transitionStart.y + "," + transitionEnd.x + "," + transitionEnd.y

    return(
      <svg pointerEvents="stroke" onMouseOver={() => setFocus(true)} onMouseLeave={() => setFocus(false)} fill={isFocused ? "red" : "black"}>
          <marker
            id={"arrow" + urlString}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <path id={urlString} d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' S ' + (transitionStart.x - 2*radius) + ' ' + ((transitionStart.y + transitionEnd.y)/2) + ' ' + transitionEnd.x + ' ' + transitionEnd.y} stroke={isFocused ? "red" : "#aaa"} strokeWidth={2} fill="transparent" markerEnd={"url(#arrow" + urlString + ")"}/>
          <text fill={isFocused ? "red" : "black"} textAnchor="middle">
            <textPath   href={"#" + urlString} startOffset="50%">{
              label.map(element => {
                return <tspan key={element} x='0' dy='15'>{element}</tspan>
              })}
            </textPath>
          </text>
        </svg>
    )
  }else{
    const directionX = (startPoint.x <= endPoint.x) ? 1 : -1
    const directionY = (startPoint.y <= endPoint.y) ? 1 : -1

    const transitionStart = {
      x: startPoint.x,
      y: startPoint.y + radius * directionY
    }
  
    const transitionEnd = {
      x: endPoint.x,
      y: endPoint.y - radius * directionY
    }

    const urlString = transitionStart.x + "," + transitionStart.y + "," + transitionEnd.x + "," + transitionEnd.y

    return(
      <svg fill={isFocused ? "red" : "black"} pointerEvents="stroke" onMouseOver={() => setFocus(true)} onMouseLeave={() => setFocus(false)}>
        <marker 
          id={"arrow" + urlString} 
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z"/>
        </marker>
        <path id={urlString} d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' S ' + ((directionX == -1 && directionY == 1) ? (transitionStart.x + ' ' + transitionEnd.y) : (transitionEnd.x + ' ' + transitionStart.y)) + ' ' + transitionEnd.x + ' ' + transitionEnd.y} stroke={isFocused ? "red" : "#aaa"} strokeWidth={2} fill="transparent" markerEnd={"url(#arrow" + urlString + ")"}/>
        <text textAnchor="middle">
          <textPath href={"#" + urlString} startOffset="50%">{
            label.map(element => {
              return <tspan key={element} x='0' dy='15'>{element}</tspan>
            })}
          </textPath>
        </text>
      </svg>
    )
  }
}

//TOdo: rework
const LBA_Graph = ({ lba, radius, distanceY, distanceX }) => {
  const lbaGraph = []
  const alreadyDrawn = new Map()

  let height = distanceY + 2*radius
  let width = 0

  let j = 0
  let i = 1

  /**
  * Draws the transitions and the following states for a given start state.
  * 
  * @param {String} startState - The state where the transition begins.
  */
  function drawTransition(startState) {

    if (height <= j * distanceY + (100 + 2 * radius)) {
      height += distanceY
    }

    let transitions = lba.delta.get(startState)

    if(transitions) {
      let startX = alreadyDrawn.get(startState)[0]
      let startY = alreadyDrawn.get(startState)[1] + 1
      for (let [key, v] of transitions) {
        if (alreadyDrawn.get(key)) {
          if (startState == key) {
            //self transition
            const startPoint = {
              x: i*distanceX,
              y: distanceY +j * distanceY
            }

            lbaGraph.push(
              <Transition key={'self transition from state ' + startState + ' at ' + startPoint} startPoint={startPoint} endPoint={startPoint} radius={radius} label={v}></Transition>
            )

          } else {
            //transition to state that already has been drawn
            let stateX = alreadyDrawn.get(key)[0]
            let stateY = alreadyDrawn.get(key)[1] + 1

            const startPoint = {
              x: i*distanceX,
              y: distanceY + j*distanceY,
            }

            const endPoint = {
              x: stateX*distanceX,
              y: stateY*distanceY
            }

            lbaGraph.push(<Transition key={'transition from state ' + startState + ' at ' + startPoint + ' to ' + endPoint} startPoint={startPoint} endPoint={endPoint} radius={radius} label={v}></Transition>)
          }
        } else {
          j += 1

          const startPoint = {
            x: startX*distanceX,
            y: startY * distanceY
          }
          
          const endPoint = {
            x: i * distanceX,
            y: distanceY + j * distanceY,
          }
          
          if(key == lba.endStates){
            lbaGraph.push(
              <svg key={'state ' + key  + ' from ' + startPoint + ' to ' + endPoint}>
                <EndState position={endPoint} radius={radius} name={key}></EndState>
                <Transition startPoint={startPoint} endPoint={endPoint} radius={radius} label={v}></Transition>
              </svg>
            )
          }else{
            lbaGraph.push(
              <svg key={'end state ' + key  + ' from ' + startPoint + ' to ' + endPoint}>
                <State position={endPoint} radius={radius} name={key}></State>
                <Transition startPoint={startPoint} endPoint={endPoint} radius={radius} label={v}></Transition>
              </svg>
            )
          }
          

          if (!alreadyDrawn.get(key)) {
            alreadyDrawn.set(key, [i, j])
          }

          drawTransition(key)
          i += 1
          j -= 1
        }

      }
      if (width < i * distanceX) {
        width += distanceX  
      }
      i = startX
    }
  }


  if (lba) {
    const stateRadius = 50
    const startPosition = {
      x: distanceX, 
      y: 0,
    }

    const startStatePosition = {
      x: startPosition.x, 
      y: startPosition.y + distanceY,
    }

    lbaGraph.push(<StartState key={'start state'} startPosition={startPosition} statePosition={startStatePosition} radius={stateRadius} name={lba.startState} transition_length={distanceY}></StartState>)
    alreadyDrawn.set(lba.startState, [1, 0])
    drawTransition(lba.startState)
  }
  return (
    <svg width={width} height={height}>{lbaGraph}</svg>
  )
}

function App() {
  const [startValue, setStartValue] = useState('')
  const [nonterminalValue, setNonterminalValue] = useState('')
  const [terminalValue, setTerminalValue] = useState('')
  const [productionValue, setProductionValue] = useState('')

  const [lba, setLBA] = useState('')
  const [eliminateX, setEliminateX] = useState('')

  const [grammar, setGrammar] = useState('')
  const [kurodaGrammar, setKurodaGrammar] = useState('')

  function handleSubmit(e) {
    e.preventDefault();

    const nonterminals = nonterminalValue.split(' ').join('').split(',')
    const terminals = terminalValue.split(' ').join('').split(',')
    let productions = productionValue.split(' ').join('').split(',')

    productions = handleProductions(productions)

    const grammar = new Grammar(nonterminals, terminals, productions, startValue)
    setGrammar(grammar)

    const kuroda_grammar = is_kuroda(grammar) ? grammar : convert_to_kuroda(grammar)

    setKurodaGrammar(kuroda_grammar)

    const createdLBA = grammar_to_lba(kuroda_grammar)
    const eliminateXLBA = lba_eliminate_x(kuroda_grammar)

    setLBA(createdLBA)
    console.log("LBA delta: ", createdLBA.delta)
    setEliminateX(eliminateXLBA)
    console.log("M delta: ", eliminateXLBA)
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

  return (
    <div>
      <div className="menu gui-element">
        <legend>Menu</legend>
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
      <div className="grammar-info gui-element">
        <legend>input-info</legend>
        {(grammar) && (
        <div>
          <p>{"nonterminals: " +  grammar.nonterminals.join(", ")}</p>
          <p>{"terminals: " +  grammar.terminals.join(", ")}</p>
          <p>{"start symbol: " + grammar.start}</p>
          <p>{"productions: " +  grammar.productions.join(", ")}</p>
        </div>
        )}
      </div>
      <div className="grammar-info gui-element">
        <legend>grammar-info</legend>
        <p>{grammar ? (grammar == kurodaGrammar ? "The Grammar is already in Kuroda-Normalform." : "The Grammar was converted to Kuroda-Normalform.") : "" }</p>
        {(grammar != kurodaGrammar) && (
             <div>
              <p>{"nonterminals: " + kurodaGrammar.nonterminals.join(", ")}</p>
              <p>{"terminals: " + kurodaGrammar.terminals.join(", ")}</p>
              <p>{"start symbol: " + kurodaGrammar.start}</p>
              <p>{"productions: " + kurodaGrammar.productions.join(", ")}</p>
           </div>
         )}
        
      </div>
      <div className="lba-info gui-element">
        <legend>lba-info</legend>
        {(lba) && (
          <div>
            <p>{"states: " + lba.states.join(", ")}</p>
            <p>{"alphabet: " + lba.inputAlphabet.join(", ")}</p>
            <p>{"tape alphabet: " + lba.tapeAlphabet.join(", ")}</p>
            <p>{"delta: to view delta check the console"}</p>
            <p>{"start state: " + lba.startState }</p>
            <p>{"blank symbol: " + lba.blank }</p>
            <p>{"end states: " + lba.endStates.join(", ") }</p>
            <br></br>
            <p>{"M simplifies the step to remove the blank symbol for productions in the form of A->BC, check console to view the delta of M" }</p>
          </div>
        )}
      </div>
      <div className="LBA gui-element">
        <legend>Linear Bounded Automaton</legend>
        {(lba) && (
        <LBA_Graph lba={lba} radius={50} distanceX={300} distanceY={300}></LBA_Graph>
        )}
      </div>
    </div>
  );
}

export default App;