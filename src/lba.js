/** Class representing a transition of a Turing Machine. */
export class Transition {
    /**
     * Create a transition.
     * @param {String} fromState - The state where the transition starts.
     * @param {String} toState - The state where the transition ends.
     * @param {String} readSymbol - The symbol that was read on the tape.
     * @param {String} newSymbol - The symbol that will replace the readSymbol.
     * @param {String} direction - The direction the head will move to. L for left, N for Neutral, R for right
     */
    constructor(fromState, toState, readSymbol, newSymbol, direction) {
        this.fromState = fromState
        this.toState = toState
        this.readSymbol = readSymbol
        this.newSymbol = newSymbol
        this.direction = direction
        this.edgeLabel = readSymbol + ' : ' + newSymbol + ', ' + direction
    }

    /**
     * Returns a String that shows the transition.
     * 
     * @return {String} The transition as a String.
     */
    toString() {
        return (" ẟ(" + this.fromState + ',' + this.readSymbol + ') = (' + this.toState + ' : ' + this.newSymbol + ', ' + this.direction + ')')
    }
}

/** Class representing a production. */
export class Production {
    /**
     * Create a production.
     * @param {String[]} left - The left side of the production.
     * @param {String[]} right - The right side of the production.
     */
    constructor(left, right) {
        this.left = left
        this.right = right
    }

    /**
     * Returns a String that shows the production.
     * 
     * @return {String} The production as a String.
     */
    toString() {
        return this.left.join(" ") + "->" + this.right.join(" ")
    }

    /**
     * Returns a copy of the production.
     * 
     * @return {Production} The copy of the production.
     */
    clone() {
        return new Production(Array.from(this.left), Array.from(this.right))
    }

    /**
     * Returns a copy of the production.
     * 
     * @param production - An object of class Production
     * @return {boolean} True if the object is equal.
     */
    equals(production) {
        if (this.left.length !== production.left.length) {
            return false
        }

        if (this.right.length !== production.right.length) {
            return false
        }

        for (let i = 0; i < this.left.length; i++) {
            if (this.left[i] !== production.left[i])
                return false
        }

        for (let i = 0; i < this.right.length; i++) {
            if (this.right[i] !== production.right[i])
                return false
        }


        return true
    }
}

/** Class representing a grammar. */
export class Grammar {
    /**
     * Create a grammar.
     * @param {String[]} nonterminals - The nonterminals.
     * @param {String[]} terminals - The terminals.
     * @param {Production[]} productions - The productions.
     * @param {String} start - The start symbol.
     */
    constructor(nonterminals, terminals, productions, start) {
        this.nonterminals = nonterminals
        this.terminals = terminals
        this.productions = productions
        this.start = start
    }
}

/** Class representing a linear bounded automaton. */
class LBA {
    /**
     * Creates an empty linear bounded automaton based upon a given grammar.
     * @param {Grammar} grammar - The grammar the lba is based upon.
     * @param {String} startState - The start state.
     * @param {String} leftEndmarker - The left endmarker.
     * @param {String} rightEndmarker - The right endmarker.
     * @param {String} blank - The blank symbol.
     */
    constructor(grammar, startState, leftEndmarker, rightEndmarker, blank) {
        this.leftEndmarker = leftEndmarker
        this.rightEndmarker = rightEndmarker
        this.states = [startState]
        this.inputAlphabet = grammar.terminals.concat(grammar.nonterminals).concat([leftEndmarker, rightEndmarker])
        this.tapeAlphabet = this.inputAlphabet.concat([blank])
        this.startState = startState
        this.blank = blank
        this.delta = new Map()
        this.endStates = []
    }

    /**
     * Adds a transition to the lba.
     * @param {Transition} transition - The transition to add.
     */
    addTransition(transition) {
        const fromState = transition.fromState
        const toState = transition.toState

        const label = transition.edgeLabel

        //LBA never moves head to left on left endmarker
        if (transition.readSymbol === this.leftEndmarker && transition.direction === 'L') {
            return
        }

        //LBA never moves head to right endmarker
        if (transition.readSymbol === this.rightEndmarker && transition.direction === 'R') {
            return
        }

        //LBA never overwrites endmarkers
        if ((transition.readSymbol === this.leftEndmarker && transition.newSymbol !== this.leftEndmarker) ||
            ((transition.readSymbol === this.rightEndmarker && transition.newSymbol !== this.rightEndmarker))) {
            return
        }

        //LBA stops when in end state
        if (this.endStates.includes(fromState)) {
            return
        }

        if (this.delta.get(fromState)) {
            if (this.delta.get(fromState).get(toState)) {
                if (!this.delta.get(fromState).get(toState).includes(label)) {
                    this.delta.set(fromState, this.delta.get(fromState).set(toState, (this.delta.get(fromState).get(toState).concat([label]))))
                }
            } else {
                this.delta.set(fromState, this.delta.get(fromState).set(toState, [label]))
            }
        } else {
            let innerMap = new Map()


            this.delta.set(fromState, innerMap.set(toState, [label]))
        }
    }

    /**
     * Adds a state to the lba.
     * 
     * @param {String} [state] - The name of the state to be added to the lba (is optional). If no name is provided the index is the amount of states - 1 (as counting starts at 0).
     * @return {state} The state that was added to the lba.
     */
    addState(state = null) {
        if (state) {
            this.states.push(state)

            return state
        } else {
            if (this.states.length === 0) {
                throw Error("somehow added state to empty lba without startstate in states")
            }

            const state = 'z' + (this.states.length - 1)

            this.states.push(state)

            return state
        }
    }

    /**
     * Adds a end state to the lba.
     * @param {String} state - The end state to add to the lba.
     */
    addEndState(state) {
        this.endStates.push(state)
    }
}

/**
 * Checks if grammar is of typ 1.
 * @param {Grammar} grammar - A type 1 grammar.
 * @return {boolean} True if grammar is of type 1.
 */
function isContextSenstive(grammar) {
    for (let production of grammar.productions) {
        if(production.left.length > production.right.length){
            return false
        } 
    }
    return true
}

/**
 * Checks if grammar is in kuroda normalform.
 * @param {Grammar} grammar - A type 1 grammar.
 * @return {boolean} True if grammar is in Kuroda normalform.
 */
function isKuroda(grammar) {
    for (let production of grammar.productions) {
        if ((production.left.length === 1 && grammar.nonterminals.includes(production.left[0]) && production.right.length === 1) ||
            (production.left.length === 1 && grammar.nonterminals.includes(production.left[0]) && production.right.length === 2 && grammar.nonterminals.includes(production.right[0]) && grammar.nonterminals.includes(production.right[1])) ||
            (production.left.length === 2 && grammar.nonterminals.includes(production.left[0]) && grammar.nonterminals.includes(production.left[1]) && production.right.length === 2 && grammar.nonterminals.includes(production.right[0]) && grammar.nonterminals.includes(production.right[1]))) {
            //pass
        } else {
            return false
        }
    }
    return true
}

/**
 * Returns the given type 1 grammar in kuroda normalform.
 * @param {Grammar} inputGrammar - A type 1 grammar.
 * @return {Object} An object containing the type 1 grammar in kuroda normalform and an Array containing objects containing information about the process of the algorithm.
 */
export function getKurodaGrammar(inputGrammar) {
    if(!isContextSenstive(inputGrammar)){
        throw new Error("Input grammar is not from type 1. Please input a context-senstive grammar.")
    }

    if(isKuroda(inputGrammar)){
        return {
            grammar: inputGrammar,
            steps: []
        }
    }

    //create copy of inputGrammar, so we dont edit the input
    const nonterminals = inputGrammar.nonterminals.map((nonterminal) => nonterminal)
    const terminals = inputGrammar.terminals.map((terminal) => terminal)
    const productions = inputGrammar.productions.map((production) => production.clone())
    const startValue = inputGrammar.start

    const grammar = new Grammar(nonterminals, terminals, productions, startValue)

    //create productions in the form A->a and A->B by seperating the terminals from the rest of the productions
    const seperateTerminals = {
        description: "seperate terminals, create rules in the form A->B and A->a",
        newVariables: [],
        newProductions: [],
        replacedProductions: new Map()
    }

    for (const terminal of grammar.terminals) {
        const old_symbol = terminal
        const new_variable = "A" + terminal

        grammar.nonterminals.push(new_variable)
        seperateTerminals.newVariables.push(new_variable)

        for (let i = 0; i < grammar.productions.length; i++) {
            const old = grammar.productions[i].clone()

            //replace nonterminal in left and right side of production
            grammar.productions[i] = new Production(grammar.productions[i].left.map(item => item === old_symbol ? new_variable : item), grammar.productions[i].right.map(item => item === old_symbol ? new_variable : item))

            if (!old.equals(grammar.productions[i])) {
                seperateTerminals.replacedProductions.set(old, grammar.productions[i].clone())
            }
        }


        const newProduction = new Production([new_variable], [old_symbol])
        grammar.productions.push(newProduction)
        seperateTerminals.newProductions.push(newProduction)
    }


    //create productions in the form A->BC by splitting up the right sides of the productions
    const splitRightSides = {
        description: "split right sides, create rules in the form A->BC",
        newVariables: [],
        replacedProductions: new Map()
    }

    let index = 0

    for (let i = 0; i < grammar.productions.length; i++) {
        const n = grammar.productions[i].right.length

        if (grammar.productions[i].left.length === 1 && n > 2) {
            const newProductions = []

            //add new variables C1..CN-2
            for (let i = 1; i <= n - 2; i++) {
                grammar.nonterminals.push("C" + (i + index))
                splitRightSides.newVariables.push("C" + (i + index))
            }

            // replace Productions A -> B1..BN with A->B1C1..Ci->Bi+1Ci+1
            //A->B1C1
            const newProduction1 = new Production(grammar.productions[i].left, [grammar.productions[i].right[0], "C" + (1 + index)])
            newProductions.push(newProduction1)
            grammar.productions.push(newProduction1)

            //C1->B2C2..Bn-3Cn-3
            for (let j = 1; j <= n - 3; j++) {
                const newProduction2 = new Production(["C" + (index + j)], [grammar.productions[i].right[j], "C" + (index + j + 1)])
                newProductions.push(newProduction2)
                grammar.productions.push(newProduction2)
            }

            //Cn-2->Bn-1Bn
            const newProduction3 = new Production(["C" +  (index + n - 2)], [grammar.productions[i].right[n - 2], grammar.productions[i].right[n - 1]])
            newProductions.push(newProduction3)
            grammar.productions.push(newProduction3)

            splitRightSides.replacedProductions.set(grammar.productions[i].clone(), newProductions)
            grammar.productions.splice(i, 1)
            i -= 1

            index += n - 2
        }
    }

    index = 0
    //create productions in the form AB->CD by removing chain rules
    const removeChainRules = {
        description: "remove chain rules, create rules in the form AB->CD",
        newVariables: [],
        replacedProductions: new Map()
    }

    for (let i = 0; i < grammar.productions.length; i++) {
        const n = grammar.productions[i].right.length
        const m = grammar.productions[i].left.length

        if (m + 2 <= n) {
            const newProductions = []

            //new Variables D2..Dn-1
            for (let i = 2; i <= n - 1; i++) {
                grammar.nonterminals.push("D" + (i + index))
                removeChainRules.newVariables.push("D" + (i + index))
            }


            //A1A2->B1D2
            const newProduction1 = new Production([grammar.productions[i].left[0], grammar.productions[i].left[1]], [grammar.productions[i].right[0], "D" + (2 + index)])
            newProductions.push(newProduction1)
            grammar.productions.push(newProduction1)

            //DiAi+1->BiDi+1
            for (let j = 2; j <= m - 1; j++) {
                const newProduction2 = new Production(["D" + (j + index), grammar.productions[i].left[j]], [grammar.productions[i].right[j - 1], "D" + (j + index + 1)])
                newProductions.push(newProduction2)
                grammar.productions.push(newProduction2)
            }

            //Di->BiDi+1
            for (let j = m; j <= n - 2; j++) {
                const newProduction3 = new Production(["D" + (j + index)], [grammar.productions[i].right[j - 1], "D" + (j + index + 1)])
                newProductions.push(newProduction3)
                grammar.productions.push(newProduction3)
            }

            //Dn-1->BnBn+1
            const newProduction4 = new Production(["D" + (n - 1 + index)], [grammar.productions[i].right[n - 1], grammar.productions[i].right[n]])
            newProductions.push(newProduction4)
            grammar.productions.push(newProduction4)

            //remove replaced production
            removeChainRules.replacedProductions.set(grammar.productions[i].clone(), newProductions)
            grammar.productions.splice(i, 1)
            i -= 1
            index += n - 2
        }
    }

    for (let i = 0; i < grammar.productions.length; i++) {
        const newProductions = []

        const n = grammar.productions[i].left.length

        if (grammar.productions[i].right.length === n + 1 && n >= 2) {
            //new Variables D2..Dn
            for (let i = 2; i <= n; i++) {
                grammar.nonterminals.push("D" + (i + index))
                removeChainRules.newVariables.push("D" + (i + index))
            }

            //A1A2->B1D2
            const newProduction1 = new Production([grammar.productions[i].left[0], grammar.productions[i].left[1]], [grammar.productions[i].right[0], "D" + (2 + index)])
            newProductions.push(newProduction1)
            grammar.productions.push(newProduction1)

            //DiAi+1->BiDi+1
            for (let j = 2; j <= n - 1; j++) {
                const newProduction2 = new Production(["D" + (j + index), grammar.productions[i].left[j]], [grammar.productions[i].right[j - 1], "D" + (j + index + 1)])
                newProductions.push(newProduction2)
                grammar.productions.push(newProduction2)
            }

            //Dn-1->BnBn+1
            const newProduction3 = new Production(["D" + (n - 1 + index)], [grammar.productions[i].right[n - 1], grammar.productions[i].right[n]])
            newProductions.push(newProduction3)
            grammar.productions.push(newProduction3)

            //remove replaced production
            removeChainRules.replacedProductions.set(grammar.productions[i].clone(), newProductions)
            grammar.productions.splice(i, 1)
            i -= 1
            index += n - 2
        }
    }

    for (let i = 0; i < grammar.productions.length; i++) {
        const newProductions = []

        const n = grammar.productions[i].right.length
        const m = grammar.productions[i].left.length

        if (m === n && n > 2) {
            //new Variables D2..Dn-1
            for (let i = 2; i <= n - 1; i++) {
                grammar.nonterminals.push("D" + (i + index))
                removeChainRules.newVariables.push("D" + (i + index))
            }

            //A1A2->B1D2
            const newProduction1 = new Production([grammar.productions[i].left[0], grammar.productions[i].left[1]], [grammar.productions[i].right[0], "D" + (2 + index)])

            newProductions.push(newProduction1)
            grammar.productions.push(newProduction1)

            //DiAi+1->BiDi+1
            for (let j = 2; j <= n - 2; j++) {
                const newProduction2 = new Production(["D" + (j + index), grammar.productions[i].left[j]], [grammar.productions[i].right[j - 1], "D" + (j + index + 1)])

                newProductions.push(newProduction2)
                grammar.productions.push(newProduction2)
            }

            //Dn-1An->Bn-1Bn
            const newProduction3 = new Production(["D" + (n - 1 + index), grammar.productions[i].left[n - 1]], [grammar.productions[i].right[n - 2], grammar.productions[i].right[n - 1]])
            newProductions.push(newProduction3)
            grammar.productions.push(newProduction3)

            //remove replaced production
            removeChainRules.replacedProductions.set(grammar.productions[i].clone(), newProductions)
            grammar.productions.splice(i, 1)
            i -= 1
            index += n - 2
        }
    }

    return {
        grammar: grammar,
        steps: [seperateTerminals, splitRightSides, removeChainRules]
    }
}

/**
 * Converts the given type 1 grammar (in kuroda normalform) to a linear bounded automaton.
 * @param {Grammar} grammar - A type 1 grammar in kuroda normalform.
 * @return {Object} An Object containing the linear bounded automaton, the productions mapped to the added transitions and the step to eliminate the blank symbol (can be undefined for grammars that dont change the word length).
 */
export function grammarToLBA(grammar) {
    /*
    if(!isKuroda(grammar)){
        throw Error("this method only works for grammars in kuroda normal form. please use a grammar in kuroda normal form")
    }*/

    const lba = new LBA(grammar, 'zs', '<', '>', 'x')
    let eliminateBlank

    const steps = new Map()

    const startTransitions = []

    lba.addState('z0')
    const transitionStart1 = new Transition('zs', 'z0', '<', '<', 'R')
    lba.addTransition(transitionStart1)
    startTransitions.push(transitionStart1)

    for (let symbol of lba.tapeAlphabet) {
        const transitionStart2 = new Transition('z0', 'z0', symbol, symbol, 'R')
        lba.addTransition(transitionStart2)
        startTransitions.push(transitionStart2)
    }

    const startStep = {
        newStates: ['zs', 'z0'],
        newTransitions: startTransitions
    }

    steps.set('start', startStep)

    for (const production of grammar.productions) {
        const addedStates = []
        const addedTransitions = []

        if (production.right.length === 1) {
            //for A->a replace a with A
            const newState = lba.addState()
            addedStates.push(newState)
            const transition1 = new Transition('z0', newState, production.right[0], production.left[0], 'L')
            lba.addTransition(transition1)
            addedTransitions.push(transition1)

            for (let symbol of lba.tapeAlphabet) {
                const transition2 = new Transition(newState, newState, symbol, symbol, 'L')
                lba.addTransition(transition2)
                addedTransitions.push(transition2)
            }

            const transition3 = new Transition(newState, 'z0', lba.leftEndmarker, lba.leftEndmarker, 'R')
            lba.addTransition(transition3)
            addedTransitions.push(transition3)
        } else if (production.right.length === 2) {
            if (production.left.length === 2) {
                //for AB->CD replace CD with AB
                const newState1 = lba.addState()
                addedStates.push(newState1)

                //save C in state and move head to right, so we can ensure that C is on the left of head
                const transition1 = new Transition('z0', newState1, production.right[0], production.right[0], 'R')
                lba.addTransition(transition1)
                addedTransitions.push(transition1)

                const newState2 = lba.addState()
                addedStates.push(newState2)

                //write B if head reads D and move left
                const transition2 = new Transition(newState1, newState2, production.right[1], production.left[1], 'L')
                lba.addTransition(transition2)
                addedTransitions.push(transition2)

                const newState3 = lba.addState()
                addedStates.push(newState3)

                //write A if head reads C
                const transition3 = new Transition(newState2, newState3, production.right[0], production.left[0], 'L')
                lba.addTransition(transition3)
                addedTransitions.push(transition3)

                for (let symbol of lba.tapeAlphabet) {
                    const transition4 = new Transition(newState3, newState3, symbol, symbol, 'L')
                    lba.addTransition(transition4)
                    addedTransitions.push(transition4)
                }

                const transition4 = new Transition(newState3, 'z0', lba.leftEndmarker, lba.leftEndmarker, 'R')
                lba.addTransition(transition4)
                addedTransitions.push(transition4)

            } else if (production.left.length === 1) {
                //for A->BC replace BC with xA and then use step to eliminate x (x = Blank)
                const newState1 = lba.addState()
                addedStates.push(newState1)


                //save B in state and move head to right, so we can ensure that C is on the left of head
                const transition1 = new Transition('z0', newState1, production.right[0], production.right[0], 'R')
                lba.addTransition(transition1)
                addedTransitions.push(transition1)

                const newState2 = lba.addState()
                addedStates.push(newState2)

                //write A if head reads C and move left
                const transition2 = new Transition(newState1, newState2, production.right[1], production.left[0], 'L')
                lba.addTransition(transition2)
                addedTransitions.push(transition2)

                const newState3 = lba.addState()
                addedStates.push(newState3)

                //write x if head reads B and move left
                const transition3 = new Transition(newState2, newState3, production.right[0], lba.blank, 'L')
                lba.addTransition(transition3)
                addedTransitions.push(transition3)

                for (let symbol of lba.tapeAlphabet) {
                    const transition4 = new Transition(newState3, newState3, symbol, symbol, 'L')
                    lba.addTransition(transition4)
                    addedTransitions.push(transition4)
                }

                addedStates.push('M')

                const transition5 = new Transition(newState3, 'M', lba.leftEndmarker, lba.leftEndmarker, 'R')
                lba.addTransition(transition5)
                addedTransitions.push(transition5)

                eliminateBlank = lbaEliminateBlank(grammar)

                const transition6 = new Transition('M', 'z0', lba.leftEndmarker, lba.leftEndmarker, 'R')
                lba.addTransition(transition6)
                addedTransitions.push(transition6)
            } else {
                throw new Error('not in kuroda normalform')
            }
        } else {
            throw new Error('not in kuroda normalform')
        }

        const step = {
            newStates: addedStates,
            newTransitions: addedTransitions
        }

        steps.set(production, step)

    }


    const newState1 = lba.addState()

    const transitionEnd1 = new Transition('z0', newState1, lba.rightEndmarker, lba.rightEndmarker, 'L')
    lba.addTransition(transitionEnd1)

    const newState2 = lba.addState()
    const transitionEnd2 = new Transition(newState1, newState2, grammar.start, grammar.start, 'L')
    lba.addTransition(transitionEnd2)

    //final state
    const newState3 = lba.addState()
    lba.addEndState(newState3)
    const transitionEnd3 = new Transition(newState2, newState3, lba.leftEndmarker, lba.leftEndmarker, 'N')
    lba.addTransition(transitionEnd3)

    const endStep = {
        newVariables: [newState1, newState2, newState3],
        newTransitions: [transitionEnd1, transitionEnd2, transitionEnd3]
    }

    steps.set('end', endStep)

    if (eliminateBlank) {
        lba.addState('M')
        steps.set('M - eliminate Blank', eliminateBlank.steps)
    }

    return {
        LBA: lba,
        M: eliminateBlank,
        steps: steps
    }
}

/**
 * Creates a linear bounded automaton that is used as a step in productions of the form of A->BC to remove the blank symbol.
 * @param {Grammar} grammar - A type 1 grammar in kuroda normalform.
 * @return {LBA} A linear bounded automaton that overwrites the blank symbol.
 */
export function lbaEliminateBlank(grammar) {
    const startState = 'zin'

    let TM = new LBA(grammar, startState, '<', '>', 'x')

    const newStates = [startState]
    const newTransitions = []

    const outState = TM.addState('zout')
    //if first symbol is blank we need transition to endstate
    const transition1 = new Transition(startState, outState, TM.blank, TM.leftEndmarker, 'R')
    TM.addTransition(transition1)
    newTransitions.push(transition1)

    for (let symbol of TM.inputAlphabet) {
        if (symbol === TM.rightEndmarker || symbol === TM.leftEndmarker) {
            continue
        }
        const newStateSymbol = TM.addState(symbol)
        newStates.push(newStateSymbol)


        const transition2 = new Transition('zin', newStateSymbol, symbol, TM.leftEndmarker, 'R')
        TM.addTransition(transition2)
        newTransitions.push(transition2)

        for (let innerSymbol of TM.inputAlphabet) {
            if (innerSymbol === TM.rightEndmarker || innerSymbol === TM.leftEndmarker) {
                continue
            }

            const transition3 = new Transition(symbol, innerSymbol, innerSymbol, symbol, 'R')
            TM.addTransition(transition3)
            newTransitions.push(transition3)
        }



        const transition4 = new Transition(newStateSymbol, outState, TM.blank, symbol, 'R')
        TM.addTransition(transition4)
        newTransitions.push(transition4)
    }

    for (let symbol of TM.tapeAlphabet) {
        const transition5 = new Transition(outState, outState, symbol, symbol, 'L')
        TM.addTransition(transition5)
        newTransitions.push(transition5)
    }


    newStates.push(outState)

    const step = {
        newStates: newStates,
        newTransitions: newTransitions
    }

    return {
        LBA: TM,
        steps: step
    }
}

/* example grammar 1
S->AB,
AB->ab

other example grammars
S->aSBc,
S->abc,
cB->Bc,
bB->bb

S->AB,
S->A,
A->a,
B->b,
AB->BA

S->AS,
S->BS,
S->a,
ABAA->AAAB,
ABAB->AABB,
BAA->AAB,
BAB->ABB,
BBA->ABB,
AA->aa,
BB->bb
*/

/*example code from thesis
const terminals = ["a", "b"]
const nonterminals = ["A", "B"]
const startValue = "S"
const productions = [new Production(["S"], ["A", "B"]),
new Production(["A", "B"], ["a", "b"])]

const grammar = new Grammar(nonterminals, terminals, productions, startValue)

const startState = "zs"
const leftEndmarker = "<"
const rightEndmarker = ">"
const blank = "x"

export const lba = new LBA(grammar, startState, leftEndmarker, rightEndmarker, blank)

lba.addState()
lba.addState()
lba.addTransition(new Transition("zs", "z0", 
                                 lba.leftEndmarker, lba.leftEndmarker, "R"))
lba.addTransition(new Transition("z0", "z1", 
                                 "a", "A", "L"))

for(const symbol of lba.tapeAlphabet){
    lba.addTransition(new Transition("z1", "z1", 
                                     symbol, symbol, "L"))
}

lba.addTransition(new Transition("z1", "z0", 
                                 lba.leftEndmarker, lba.leftEndmarker, "R"))

const kurodaOutput = getKurodaGrammar(grammar)

const kurodaGrammar = kurodaOutput.grammar
const getKurodaGrammarSteps = kurodaOutput.steps

const lbaObject = grammarToLBA(kurodaGrammar)

const createdLBA =  lbaObject.LBA
const eliminateBlank = lbaObject.M
const grammarToLBASteps = lbaObject.steps

console.log(createdLBA)
*/