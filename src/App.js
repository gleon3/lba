import React from "react";
import { useState, useRef } from "react";
import './App.css';
import { Production, Grammar, convert_to_kuroda, grammar_to_lba, is_kuroda } from "./lba.js";

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
  return (
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
  return (
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
  return (
    <svg>
      <State position={position} radius={radius} name={name}></State>
      <circle cx={position.x} cy={position.y} r={radius - 5} fill="none" stroke="black" />
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
  const [isFocused, setFocus] = useState(false)
  const elementRef = useRef()

  /**
  * Handles hovering mouse over transition. Tells compontent that mouse is over transition. Removes transition to "redraw" it over other svg elements. 
  */
  function handleMouseOver() {
    var target = elementRef.current
    var parent = target.ownerSVGElement

    target.remove()
    parent.appendChild(target)

    setFocus(true)
  }

  /**
  * Handles leaving mouse from transition after hovering. Tells compontent that mouse is no longer over transition.
  */
  function handleMouseLeave() {
    setFocus(false)
  }

  if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) { //self transition
    const transitionStart = {
      x: startPoint.x + radius,
      y: startPoint.y
    }

    const transitionEnd = transitionStart

    const urlString = transitionStart.x + "," + transitionStart.y + "," + transitionEnd.x + "," + transitionEnd.y

    return (
      <svg ref={elementRef} pointerEvents="stroke" onMouseOver={() => handleMouseOver()} onMouseLeave={() => handleMouseLeave()}>
        <marker
          id={"arrow" + urlString}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse">
          <path stroke="context-stroke" d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <path d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' q 125 -12.5 0 -25'} stroke={isFocused ? "red" : "#aaa"} fill="none" strokeWidth={2} markerEnd={"url(#arrow" + urlString + ")"} />
        <text fill={isFocused ? "red" : "black"} x={transitionStart.x} y={transitionStart.y - radius} textAnchor="middle">{
          label.map(value => {
            return <tspan key={value} x={transitionStart.x + 2 * radius} dy='13'>{value}</tspan>
          })
        }
        </text>
      </svg>
    )
  }
  else if (startPoint.x === endPoint.x && startPoint.y >= endPoint.y) { //transition to earlier already drawn state on the same column
    const transitionStart = {
      x: startPoint.x - radius,
      y: startPoint.y
    }

    const transitionEnd = {
      x: endPoint.x - radius,
      y: endPoint.y
    }

    const urlString = transitionStart.x + "," + transitionStart.y + "," + transitionEnd.x + "," + transitionEnd.y

    return (
      <svg ref={elementRef} pointerEvents="stroke" onMouseOver={() => handleMouseOver(urlString)} onMouseLeave={() => handleMouseLeave()}>
        <marker
          id={"arrow" + urlString}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse">
          <path stroke="context-stroke" d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <path id={urlString} d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' S ' + (transitionStart.x - 2 * radius) + ' ' + ((transitionStart.y + transitionEnd.y) / 2) + ' ' + transitionEnd.x + ' ' + transitionEnd.y} stroke={isFocused ? "red" : "#aaa"} strokeWidth={2} fill="transparent" markerEnd={"url(#arrow" + urlString + ")"} />
        <text fill={isFocused ? "red" : "black"} textAnchor="middle">
          <textPath href={"#" + urlString} startOffset="50%">{
            label.map(element => {
              return <tspan key={element} x='0' dy='15'>{element}</tspan>
            })}
          </textPath>
        </text>
      </svg>
    )
  } else {
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

    return (
      <svg ref={elementRef} pointerEvents="stroke" onMouseOver={() => handleMouseOver(urlString)} onMouseLeave={() => handleMouseLeave()}>
        <marker
          id={"arrow" + urlString}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse">
          <path stroke="context-stroke" d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <path id={urlString} d={'M ' + transitionStart.x + ' ' + transitionStart.y + ' S ' + ((directionX === -1 && directionY === 1) ? (transitionStart.x + ' ' + transitionEnd.y) : (transitionEnd.x + ' ' + transitionStart.y)) + ' ' + transitionEnd.x + ' ' + transitionEnd.y} stroke={isFocused ? "red" : "#aaa"} strokeWidth={2} fill="transparent" markerEnd={"url(#arrow" + urlString + ")"} />
        <text fill={isFocused ? "red" : "black"} textAnchor="middle">
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

/**
 * A component that displays a state diagram of a linear bounded automaton.
 *
 * @typedef {Object} LbaGraphProps
 * @property {LBA} lba - The lba that will be represented by the state diagram.
 * @property {Number} radius - The radius that will be used for displaying the states of the lba.
 * @property {Number} distanceY - The distance between states in the Y Direction.
 * @property {Number} distanceX - The distance between states in the X Direction.
 *
 * @param {LbaGraphProps} props
 * @returns {JSX.Element}
 */
const LbaGraph = ({ lba, radius, distanceY, distanceX }) => {
  const lbaElements = []
  const alreadyDrawn = new Map()

  const marginX = 200
  const marginY = radius

  let height = 0
  let width = 0

  let row = 0
  let col = 0

  /**
  * Draws the all states recursively from a given start state.
  * 
  * @param {String} state - The start state.
  */
  function drawStatesFromState(state) {
    if (width < col * distanceX) {
      width += distanceX
    }

    if (height < row * distanceY) {
      height += distanceY
    }

    const statePoint = {
      x: col * distanceX + marginX,
      y: row * distanceY + marginY,
    }

    if (state === lba.startState) {
      //start states have a transition built in, so they need extra space compared to normal states
      row += 1
      height += distanceY

      const startPoint = statePoint

      const startStatePoint = {
        x: statePoint.x,
        y: statePoint.y + distanceY,
      }

      lbaElements.push(
        <StartState key={'start state ' + state} startPosition={startPoint} statePosition={startStatePoint} radius={radius} name={state}></StartState>
      )
    }
    else if (lba.endStates.includes(state)) {
      lbaElements.push(
        <EndState key={'end state ' + state} position={statePoint} radius={radius} name={state}></EndState>
      )
    } else {
      lbaElements.push(
        <State key={'state ' + state} position={statePoint} radius={radius} name={state}></State>
      )
    }

    if (!alreadyDrawn.get(state)) {
      alreadyDrawn.set(state, [col, row])
    }

    const transitions = lba.delta.get(state)

    //there are no more states to draw for this iteration, so exit the function early and do nothing
    if (!transitions)
      return

    const stateCol = alreadyDrawn.get(state)[0]
    for (let newState of transitions.keys()) {
      if (!alreadyDrawn.get(newState)) {
        row++
        drawStatesFromState(newState)
        row--
        col++
      }

    }
    col = stateCol
  }

  /**
  * Draws all transitions from a recursively from a given state.
  * 
  * @param {String} state - The state.
  */
  function drawTransitions(state) {
    if (alreadyDrawn.get(state)) {
      const stateCol = alreadyDrawn.get(state)[0]
      const stateRow = alreadyDrawn.get(state)[1]

      const transitions = lba.delta.get(state)

      //there are no transitions for the given state, so exit the function early and do nothing
      if (!transitions)
        return

      for (let [toState, label] of transitions) {
        if (alreadyDrawn.get(toState)) {
          const toStateCol = alreadyDrawn.get(toState)[0]
          const toStateRow = alreadyDrawn.get(toState)[1]

          const startPoint = {
            x: stateCol * distanceX + marginX,
            y: stateRow * distanceY + marginY,
          }

          const endPoint = {
            x: toStateCol * distanceX + marginX,
            y: toStateRow * distanceY + marginY
          }

          lbaElements.push(<Transition key={'Transition from state ' + state + ' to ' + toState} startPoint={startPoint} endPoint={endPoint} radius={radius} label={label}></Transition>)
        } else {
          throw new Error("Trying to draw a transition to a state that hasnt been drawn yet!")
        }
      }

    } else {
      throw new Error("Trying to draw transitions from a state that hasnt been drawn yet!" + state)
    }
  }


  /**
  * Draws a list of states in a row next to each other.
  * 
  * @param {String[]} states - The list of states that are drawn.
  * @param {Number} row - The index of the row the states are drawn in.
  */
  function drawStates(states, row) {
    let count = 1
    for (let state of states) {
      const statePosition = {
        x: count * distanceX,
        y: row * distanceY
      }

      if (!alreadyDrawn.get(state)) {
        alreadyDrawn.set(state, [count, row - 1])
      }

      lbaElements.push(
        <State position={statePosition} radius={radius} name={state}></State>
      )
      count++
      width += distanceX
    }
    height += row * distanceY
    row += 1
  }


  if (lba) {
    //alreadyDrawn.set(lba.startState, [0, j])

    drawStatesFromState(lba.startState)

    for (const state of lba.states) {
      drawTransitions(state)
    }

    width += radius + marginX * 2
    height += radius + marginY * 2

    //drawTransition(lba.startState)
  }
  return (
    <svg width={width} height={height}>
      {lbaElements}
    </svg>
  )
}

/**
 * The main function of the program. Displays the program and handles user interaction.
 *
 * @returns {JSX.Element}
 */
function App() {
  const [startValue, setStartValue] = useState('')
  const [nonterminalValue, setNonterminalValue] = useState('')
  const [terminalValue, setTerminalValue] = useState('')
  const [productionValue, setProductionValue] = useState('')

  const [lba, setLBA] = useState('')
  const [eliminateBlank, setEliminateBlank] = useState('')

  const [inputGrammar, setInputGrammar] = useState('')
  const [output, setOutput] = useState('')

  function handleSubmit(e) {
    e.preventDefault();

    const nonterminals = nonterminalValue.split(' ').join('').split(',')
    const terminals = terminalValue.split(' ').join('').split(',')
    const productions = handleProductions(productionValue.split(' ').join('').split(','))

    const inputGrammar = new Grammar(nonterminals, terminals, productions, startValue)
    setInputGrammar(inputGrammar)

    if (!is_kuroda(inputGrammar)) {
      const kuroda_grammar = convert_to_kuroda(inputGrammar)

      const createdLBA = grammar_to_lba(kuroda_grammar.grammar)
      console.log("LBA", createdLBA.LBA)
      console.log("M", createdLBA.M)

      setLBA(createdLBA.LBA)
      setEliminateBlank(createdLBA.M)

      console.log(kuroda_grammar.steps)

      setOutput(kuroda_grammar)
    } else {
      const grammarObject = {
        steps: [],
        grammar: inputGrammar
      }

      const createdLBA = grammar_to_lba(grammarObject.grammar)
      console.log("LBA", createdLBA.LBA)
      if(createdLBA.M){
        console.log("M", createdLBA.M)
      }

      setLBA(createdLBA.LBA)
      setEliminateBlank(createdLBA.M)

      setOutput(grammarObject)
    }
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

  function setExample() {
    const exampleStart = "S"
    const exampleNonterminals = "S, A, B"
    const exampleTerminals = "a, b"
    const exampleProductions = "S->AB,\nAB->ab"

    setUserInput(exampleStart, exampleNonterminals, exampleTerminals, exampleProductions)
  }

  /**
     * Sets the user input to the given parameters.
     * @param {String} start - The text to put in the start textarea.
     * @param {String} nonterminals - The text to put in the nonterminals textarea.
     * @param {String} terminals - The text to put in the terminals textarea.
     * @param {String} productions - The text to put in the productions textarea.
     */
  function setUserInput(start, nonterminals, terminals, productions) {
    document.getElementById('start textarea').value = start
    setStartValue(start)
    document.getElementById('nonterminals textarea').value = nonterminals
    setNonterminalValue(nonterminals)
    document.getElementById('terminals textarea').value = terminals
    setTerminalValue(terminals)
    document.getElementById('productions textarea').value = productions
    setProductionValue(productions)
  }

  const example1 = {
    startValue: "S",
    nonterminalValue: "S, A, B",
    terminalValue: "a, b",
    productionValue: "S->AB,\nAB->ab"
  }

  const example2 = {
    startValue: "S",
    nonterminalValue: "S, A, B",
    terminalValue: "a, b",
    productionValue: "S->AS,\nS->BS,\nS->a,\nABAA->AAAB,\nABAB->AABB,\nBAA->AAB,\nBAB->ABB,\nBBA->ABB,\nAA->aa,\nBB->bb"
  }
  
  const example3 = {
    startValue: "S",
    nonterminalValue: "S, A, B",
    terminalValue: "a, b",
    productionValue: "S->AB,\nS->A,\nA->a,\nB->b,\nAB->BA"
  }  
  
  const example4 = {
    startValue: "S",
    nonterminalValue: "S, B",
    terminalValue: "a, b, c",
    productionValue: "S->aSBc,\nS->abc,\ncB->Bc,\nbB->bb"
  }

  const examples = [example1, example2, example3, example4]


  return (
    <div>
      <div className="menu gui-element">
        <legend>Menu</legend>
        <label>start:</label>
        <textarea id="start textarea" onChange={(e) => setStartValue(e.target.value)}></textarea>
        <label>nonterminals:</label>
        <textarea id="nonterminals textarea" onChange={(e) => setNonterminalValue(e.target.value)}></textarea>
        <label>terminals:</label>
        <textarea id="terminals textarea" onChange={(e) => setTerminalValue(e.target.value)}></textarea>
        <label>productions:</label>
        <textarea id="productions textarea" onChange={(e) => setProductionValue(e.target.value)}></textarea>
        <button onClick={handleSubmit}>submit</button>
        {examples && (
          <div className="example">
            <select name="examples" id="examples">
              {examples.map((example, i) => {
                return <option key={i} value={i}>{example.productionValue}</option>
              })}
            </select>
            <button onClick={
              () => {
                const exampleList = document.getElementById("examples")
                const selected = exampleList.selectedOptions

                if(selected.length > 1){
                  throw Error("somehow selected more than 1 option from dropdown menu.")
                }

                const example = examples[selected[0].value]

                setUserInput(example.startValue, example.nonterminalValue, example.terminalValue, example.productionValue)
            }}>use example</button>
          </div>)}
      </div>
      {inputGrammar && (
        
          
        <div className="grammar-info gui-element">
          <legend>input-info</legend>
          <div>
            <p>{"nonterminals: " + inputGrammar.nonterminals.join(", ")}</p>
            <p>{"terminals: " + inputGrammar.terminals.join(", ")}</p>
            <p>{"start symbol: " + inputGrammar.start}</p>
            <p>{"productions: " + inputGrammar.productions.join(", ")}</p>
          </div>
        </div>
      )}
      {output && (
        <div className="grammar-info gui-element">
          <legend>grammar-info</legend>
          <p>{(inputGrammar === output.grammar ? "The Grammar is already in Kuroda-Normalform." : "The Grammar was converted to Kuroda-Normalform.")}</p>
          {(inputGrammar !== output.grammar) && (
            <div>
              <p>{"nonterminals: " + output.grammar.nonterminals.join(", ")}</p>
              <p>{"terminals: " + output.grammar.terminals.join(", ")}</p>
              <p>{"start symbol: " + output.grammar.start}</p>
              <p>{"productions: " + output.grammar.productions.join(", ")}</p>
              <p>{JSON.stringify(output.steps)}</p>
            </div>
          )}
        </div>
      )}
      {lba && (
        <div>
          <div className="lba-info gui-element">
            <legend>lba-info</legend>
            <div>
              <p>{"states: " + lba.states.join(", ")}</p>
              <p>{"alphabet: " + lba.inputAlphabet.join(", ")}</p>
              <p>{"tape alphabet: " + lba.tapeAlphabet.join(", ")}</p>
              <p>{"delta: to view delta check the browser console"}</p>
              <p>{"start state: " + lba.startState}</p>
              <p>{"blank symbol: " + lba.blank}</p>
              <p>{"end states: " + lba.endStates.join(", ")}</p>
              <br></br>
              {eliminateBlank && <p>{"M simplifies the step to remove the blank symbol for productions in the form of A->BC, check the browser console to view the delta of M"}</p>}
            </div>
          </div>
          <div className="LBA gui-element">
            <legend>Linear Bounded Automaton</legend>
            {(lba) && (
              <LbaGraph lba={lba} radius={50} distanceX={300} distanceY={300}></LbaGraph>
            )}
          </div>
          <div className="LBA gui-element">
            <legend>M</legend>
            {(eliminateBlank) && (
              <LbaGraph lba={eliminateBlank} radius={50} distanceX={300} distanceY={300}></LbaGraph>
            )}
          </div>
        </div>
      )}


      <div className="LBA gui-element">
        <legend>test zone</legend>
        <svg width={1000} height={1000}>
          <State position={{ x: 300, y: 300 }} radius={50} name="z1"></State>
          <State position={{ x: 600, y: 400 }} radius={50} name="z2"></State>
          <Transition startPoint={{ x: 300, y: 300 }} endPoint={{ x: 600, y: 400 }} radius={50} label={["a"]}></Transition>
        </svg>
      </div>
    </div>
  );
}

export default App;