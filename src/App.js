import React, { useEffect } from "react";
import { useState } from "react";
import './App.css';
import { Production, Grammar, convert_to_kuroda, grammar_to_lba, is_kuroda, lba_eliminate_x } from "./lba.js";

/**
 * A component that displays a start state.
 *
 * @typedef {Object} StartStateProps
 * @property {Object} position - The x and y position of the state.
 * @property {Number} radius - The radius of the outer circle of the state.
 * @property {String} name - The name of the state.
 * @property {Number} transition_length - The length of the transition to the start state.
 *
 * @param {StartStateProps} props
 * @returns {JSX.Element}
 */
const StartState = ({ position, radius, name, transition_length }) => {
  const statePosition = {
    x: position.x,
    y: position.y + transition_length,
  }

  return(
    <svg>
      <Transition startPoint={position} endPoint={statePosition} label={["start"]}></Transition>
      <State position={statePosition} radius={radius} name={name}></State>
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
 * A component that displays the arrowhead of a transition.
 *
 * @typedef {Object} TransitionProps
 * @property {Object} startPoint - The x and y position of the state the transition starts at.
 * @property {Object} endPoint - The x and y position of the state the transition ends at.
 * @property {Number} angle - The angle of the arrow.
 * @property {Number} arrowLength - The length of the arrow.
 *
 * @param {TransitionProps} props
 * @returns {JSX.Element}
 */
const ArrowHead = ({startPoint, endPoint, angle, arrowLength}) => {
  let dirx = startPoint.x - endPoint.x
  let diry = startPoint.y - endPoint.y

  let dir_length = Math.sqrt(dirx*dirx+diry*diry)

  //normalize
  dirx = dirx/dir_length
  diry = diry/dir_length

  let ax = dirx * Math.cos(angle) - diry * Math.sin(angle)
  let ay = dirx * Math.sin(angle) + diry * Math.cos(angle)
          
  let bx = dirx * Math.cos(angle) + diry * Math.sin(angle)
  let by = - dirx * Math.sin(angle) + diry * Math.cos(angle)
  
  return(
    <svg>
      <line x1={endPoint.x} y1={endPoint.y} x2={endPoint.x + arrowLength*ax} y2={endPoint.y + arrowLength*ay} stroke="black" strokeWidth={3}></line>
      <line x1={endPoint.x} y1={endPoint.y} x2={endPoint.x + arrowLength*bx} y2={endPoint.y + arrowLength*by} stroke="black" strokeWidth={3}></line>
    </svg>
  )
}

/**
 * A component that displays a transition between two states.
 *
 * @typedef {Object} TransitionProps
 * @property {Object} startPoint - The x and y position of the state the transition starts at.
 * @property {Object} endPoint - The x and y position of the state the transition ends at.
 * @property {String[]} label - The label of the transition.
 *
 * @param {TransitionProps} props
 * @returns {JSX.Element}
 */
const Transition = ({ startPoint, endPoint, label }) => { //TODO: tweak numbers
  const [isFocused, setFocus] = useState(false);

  if(startPoint.x == endPoint.x && startPoint.y == endPoint.y){ //self transition
    const transitionStart = {
      x: startPoint.x + 50,
      y: startPoint.y //TODO: radius
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
        <text x={transitionStart.x} y={transitionStart.y - 50} textAnchor="middle">{
          label.map(value => {
            return <tspan key={value} x={transitionStart.x + 100} dy='13'>{value}</tspan>
          })
        }
        </text>
      </svg>
    )
  }
  else if(startPoint.x == endPoint.x && startPoint.y >= endPoint.y){ //transition to earlier already drawn state on the same column
    const transitionStart = {
      x: startPoint.x -50,
      y: startPoint.y //TODO: radius
    }
  
    const transitionEnd = {
      x: endPoint.x - 50,
      y: endPoint.y//TODO: radius
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
          <path id={urlString} d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' S ' + (transitionStart.x - 100) + ' ' + ((transitionStart.y + transitionEnd.y)/2) + ' ' + transitionEnd.x + ' ' + transitionEnd.y} stroke={isFocused ? "red" : "#aaa"} strokeWidth={2} fill="transparent" markerEnd={"url(#arrow" + urlString + ")"}/>
          <text fill={isFocused ? "red" : "black"} textAnchor="middle">
            <textPath   href={"#" + urlString} startOffset="50%">{
              label.map(element => {
                return <tspan key={element} x='0' dy={15}>{element}</tspan>
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
      y: startPoint.y + 50 * directionY//TODO: radius
    }
  
    const transitionEnd = {
      x: endPoint.x,
      y: endPoint.y - 50 * directionY//TODO: radius
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
              return <tspan key={element} x='0' dy={15}>{element}</tspan>
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
              <Transition key={'self transition from state ' + startState + ' at ' + startPoint} startPoint={startPoint} endPoint={startPoint} label={v}></Transition>
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

            lbaGraph.push(<Transition key={'transition from state ' + startState + ' at ' + startPoint + ' to ' + endPoint} startPoint={startPoint} endPoint={endPoint} label={v}></Transition>)
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
                <Transition startPoint={startPoint} endPoint={endPoint} label={v}></Transition>
                <EndState position={endPoint} radius={radius} name={key}></EndState>
              </svg>
            )
          }else{
            lbaGraph.push(
              <svg key={'end state ' + key  + ' from ' + startPoint + ' to ' + endPoint}>
                <Transition startPoint={startPoint} endPoint={endPoint} label={v}></Transition>
                <State position={endPoint} radius={radius} name={key}></State>
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

    lbaGraph.push(<StartState key={'start state'} position={startPosition} radius={stateRadius} name={lba.startState} transition_length={distanceY}></StartState>)
    alreadyDrawn.set(lba.startState, [1, 0])
    drawTransition(lba.startState)
  }
  return (
    <svg width={width} height={height}>{lbaGraph}</svg>
  )
}

//TOdo: rework
function App() {
  const [startValue, setStartValue] = useState('')
  const [nonterminalValue, setNonterminalValue] = useState('')
  const [terminalValue, setTerminalValue] = useState('')
  const [productionValue, setProductionValue] = useState('')

  const [lba, setLBA] = useState('')
  const [eliminateX, setEliminateX] = useState('')

  const [kurodaGrammar, setKurodaGrammar] = useState('')

  function handleSubmit(e) {
    e.preventDefault();

    const nonterminals = nonterminalValue.split(' ').join('').split(',')
    const terminals = terminalValue.split(' ').join('').split(',')
    let productions = productionValue.split(' ').join('').split(',')

    productions = handleProductions(productions)

    let grammar = new Grammar(nonterminals, terminals, productions, startValue)

    console.log('old grammar:')
    for (let production of productions) {
      console.log(production.left + " -> " + production.right)
    }

    let kuroda_grammar = is_kuroda(grammar) ? grammar : convert_to_kuroda(grammar)

    setKurodaGrammar(kuroda_grammar)

    console.log('\nnew grammar:')
    for (let production of kuroda_grammar.productions) {
      console.log(production.left + " -> " + production.right)
    }

    setLBA(grammar_to_lba(kuroda_grammar))
    setEliminateX(lba_eliminate_x(kuroda_grammar))
    


    console.log(lba.delta)
    console.log('M = ', eliminateX)
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
        <legend>grammar-info</legend>
        <pre>
          {JSON.stringify(kurodaGrammar, null, 2)}
        </pre>
        <p>{kurodaGrammar.start}</p>
        <p>add old grammar, is kuroda? if no add kuroda grammar if yes explain how it is already</p>
      </div>
      <div className="lba-info gui-element">
        <legend>lba-info</legend>
        <pre>
          {JSON.stringify(lba, null, 2)}
        </pre>
        <label>M=</label>
        <pre>
          {JSON.stringify(eliminateX, null, 2)}
        </pre>
      </div>
      <div className="LBA gui-element">
        <legend>Linear Bounded Automaton</legend>
        <LBA_Graph lba={lba} radius={50} distanceX={300} distanceY={300}></LBA_Graph>
      </div>
    </div>
  );
}

export default App;