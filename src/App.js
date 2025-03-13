import React from "react";
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
    y: position.y + transition_length + 2*radius,
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
      <text x={position.x} y={position.y} text-anchor="middle">{name}</text>
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
  if(startPoint.x == endPoint.x && startPoint.y == endPoint.y){ //self transition
    const transitionStart = {
      x: startPoint.x + 50,
      y: startPoint.y //TODO: radius
    }
  
    const transitionEnd = {
      x: endPoint.x,
      y: endPoint.y //TODO: radius
    }

    return(
      <svg>
        <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
        </defs>
        <path d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' q 125 -12.5 0 -25'} stroke="#aaa" fill="none" strokeWidth={2} markerEnd="url(#arrow)"/>
        <text x={transitionStart.x} y={transitionStart.y} textAnchor="middle">{
          label.map(value => {
            return <tspan x={transitionStart.x + 125/2} dy='15'>{value}</tspan>
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

    return(
      <svg>
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <path id={'from (' + transitionStart.x + ',' + transitionStart.y + ' to (' + transitionEnd.x + ',' + transitionEnd.y + ')'} d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' S ' + (transitionStart.x - 100) + ' ' + ((transitionStart.y + transitionEnd.y)/2) + ' ' + transitionEnd.x + ' ' + transitionEnd.y} stroke="#aaa" strokeWidth={2} fill="transparent" marker-end="url(#arrow)"/>
          <text textAnchor="middle">
            <textPath href={'#from (' + transitionStart.x + ',' + transitionStart.y + ' to (' + transitionEnd.x + ',' + transitionEnd.y + ')'} startOffset="50%">{
              label.map(element => {
                return <tspan x='0' dy={15}>{element}</tspan>
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

    return(
      <svg>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <path id={'from (' + transitionStart.x + ',' + transitionStart.y + ' to (' + transitionEnd.x + ',' + transitionEnd.y + ')'} d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' S ' + ((directionX == -1 && directionY == 1) ? (transitionStart.x + ' ' + transitionEnd.y) : (transitionEnd.x + ' ' + transitionStart.y)) + ' ' + transitionEnd.x + ' ' + transitionEnd.y} stroke="#aaa" strokeWidth={2} fill="transparent" marker-end="url(#arrow)"/>
        <text textAnchor="middle">
          <textPath href={'#from (' + transitionStart.x + ',' + transitionStart.y + ' to (' + transitionEnd.x + ',' + transitionEnd.y + ')'} startOffset="50%">{
            label.map(element => {
              return <tspan x='0' dy={15}>{element}</tspan>
            })}
          </textPath>
        </text>
      </svg>
    )
  }
}

//TOdo: rework
const LBA_Graph = ({ lba }) => {
  const lbaGraph = []
  const alreadyDrawn = new Map()

  const radius = 50
  const distanceY = 300
  const distanceX = 300

  let height = 100
  let width = 0
  let test = 0

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
              <Transition startPoint={startPoint} endPoint={startPoint} label={v}></Transition>
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

            lbaGraph.push(<Transition startPoint={startPoint} endPoint={endPoint} label={v}></Transition>)
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
              <svg>
                <Transition startPoint={startPoint} endPoint={endPoint} label={v}></Transition>
                <EndState position={endPoint} radius={radius} name={key}></EndState>
              </svg>
            )
          }else{
            lbaGraph.push(
              <svg>
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
      x: 300, 
      y: 0,
    }

    lbaGraph.push(<StartState position={startPosition} radius={stateRadius} name={lba.startState} transition_length={200}></StartState>)
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


    console.log(lba.delta)
    console.log('M = ', lba_eliminate_x(kuroda_grammar))
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