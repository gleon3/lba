/** Class representing a transition of a Turing Machine. */
class Transition{
    /**
     * Create a transition.
     * @param {String} fromState - The state where the transition starts.
     * @param {String} toState - The state where the transition ends.
     * @param {String} readSymbol - The symbol that was read on the tape.
     * @param {String} newSymbol - The symbol that will replace the readSymbol.
     * @param {String} direction - The direction the head will move to. L for left, N for Neutral, R for right
     */
    constructor(fromState, toState,readSymbol, newSymbol, direction) {
        this.fromState = fromState
        this.toState = toState
        this.readSymbol = readSymbol
        this.newSymbol = newSymbol
        this.direction = direction
    }

    /**
     * Returns a String that shows the transition.
     * 
     * @return {String} The transition as a String.
     */
    toString(){
        return("ẟ(" + this.fromState + ',' + this.readSymbol + ') = (' + this.toState + ' : ' + this.newSymbol + ', ' + this.direction + ') ')
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
        this.states = [startState];
        this.inputAlphabet = grammar.terminals.concat(grammar.nonterminals);
        this.tapeAlphabet = this.inputAlphabet.concat([leftEndmarker, rightEndmarker, blank]);
        this.startState = startState;
        this.blank = blank
        this.delta = new Map();
        this.endStates = [];
    }

    /**
     * Adds a transition to the lba.
     * @param {Transition} transition - The transition to add.
     */
    add_transition(transition) {
        const fromState = transition.fromState
        const toState = transition.toState

        const label = transition.readSymbol + " : " + transition.newSymbol + ", " + transition.direction

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
    add_state(state = null) {
        if (state) {
            this.states.push(state)

            return state
        } else {
            if (this.states.length == 0) {
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
    add_endState(state) {
        this.endStates.push(state)
    }
}

/**
 * Checks if grammar is in kuroda normalform.
 * @param {Grammar} grammar - A type 1 grammar.
 * @return {boolean} True if grammar is in Kuroda normalform.
 */
export function is_kuroda(grammar) {
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
 * Converts the given type 1 grammar to kuroda normalform.
 * @param {Grammar} inputGrammar - A type 1 grammar.
 * @return {Object} An object containing the type 1 grammar in kuroda normalform and an Array containing objects containing information about the process of the algorithm.
 */
export function convert_to_kuroda(inputGrammar) {
    //make a copy of the grammar object to not edit the input grammars parameters
    let grammar = new Grammar(Array.from(inputGrammar.nonterminals), Array.from(inputGrammar.terminals), Array.from(inputGrammar.productions), inputGrammar.start)

    //create productions in the form A->a and A->B by seperating the terminals from the rest of the productions
    const seperateTerminals = {
        description: "seperate terminals",
        newVariables: [],
        replacedProductions: new Map(),
        newProductions: []
    }

    for (const terminal of grammar.terminals) {
        const old_symbol = terminal
        const new_variable = "A" + terminal

        grammar.nonterminals.push(new_variable)
        seperateTerminals.newVariables.push(new_variable)

        for (let production of grammar.productions) {
            const old = production.clone()

            //replace nonterminal in left and right side of production
            production = new Production(production.left.map(item => item === old_symbol ? new_variable : item), production.right.map(item => item === old_symbol ? new_variable : item))

            if (!old.equals(production)) {
                seperateTerminals.replacedProductions.set(old, production.clone())
            }
        }


        const newProduction = new Production([new_variable], [old_symbol])
        grammar.productions.push(newProduction)
        seperateTerminals.newProductions.push(newProduction)
    }


    //create productions in the form A->BC by splitting up the right sides of the productions
    const splitRightSides = {
        description: "split right sides",
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
            const newProduction3 = new Production(["C" + (n - 2)], [grammar.productions[i].right[n - 2], grammar.productions[i].right[n - 1]])
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
        description: "remove chain rules",
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
export function grammar_to_lba(grammar) {
    const lba = new LBA(grammar, 'zs', '<', '>', 'x')
    let eliminateBlank

    const steps = new Map()

    const startTransitions = []

    lba.add_state('z0')
    const transitionStart1 = new Transition('zs', 'z0', '<', '<', 'R')
    lba.add_transition(transitionStart1)
    startTransitions.push(transitionStart1)

    for (let symbol of lba.tapeAlphabet) {
        const transitionStart2 = new Transition('z0', 'z0', symbol, symbol, 'R')
        lba.add_transition(transitionStart2)
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
            //for A->a or A->B replace current symbol with A
            //(z,a) -> (z,A,R)
            //(z,B) -> (z,B,R)

            const newState = lba.add_state()
            addedStates.push(newState)
            const transition1 = new Transition('z0', newState, production.right[0], production.left[0], 'L')
            lba.add_transition(transition1)
            addedTransitions.push(transition1)

            for (let symbol of lba.tapeAlphabet) {
                const transition2 = new Transition(newState, newState, symbol, symbol, 'L')
                lba.add_transition(transition2)
                addedTransitions.push(transition2)
            }

            const transition3 = new Transition(newState, 'z0', lba.leftEndmarker, lba.leftEndmarker, 'R')
            lba.add_transition(transition3)
            addedTransitions.push(transition3)
        } else if (production.right.length === 2) {
            if (production.left.length === 2) {
                const addedStates = []
                const addedTransitions = []

                //for AB->CD, write B, change head to left, write A 
                //(z,C) -> (z,A,R)
                const newState1 = lba.add_state()
                addedStates.push(newState1)

                const transition1 = new Transition('z0', newState1, production.right[0], production.left[0], 'R')
                lba.add_transition(transition1)
                addedTransitions.push(transition1)

                // if B (z,D) -> (z,B,R)
                const newState2 = lba.add_state()
                addedStates.push(newState2)

                const transition2 = new Transition(newState1, newState2, production.right[1], production.left[1], 'L')
                lba.add_transition(transition2)
                addedTransitions.push(transition2)

                for (let symbol of lba.tapeAlphabet) {
                    const transition3 = new Transition(newState2, newState2, symbol, symbol, 'L')
                    lba.add_transition(transition3)
                    addedTransitions.push(transition3)
                }

                const transition4 = new Transition(newState2, 'z0', lba.leftEndmarker, lba.leftEndmarker, 'L')
                lba.add_transition(transition4)
                addedTransitions.push(transition4)

            } else if (production.left.length === 1) {
                const newState1 = lba.add_state()
                addedStates.push(newState1)

                const transition1 = new Transition('z0', newState1, production.right[0], production.right[0], 'R')
                lba.add_transition(transition1)
                addedTransitions.push(transition1)

                const newState2 = lba.add_state()
                addedStates.push(newState2)

                const transition2 = new Transition(newState1, newState2, production.right[1], production.left[0], 'L')
                lba.add_transition(transition2)
                addedTransitions.push(transition2)

                const newState3 = lba.add_state()
                addedStates.push(newState3)

                const transition3 = new Transition(newState2, newState3, production.right[0], lba.blank, 'L')
                lba.add_transition(transition3)
                addedTransitions.push(transition3)

                for (let symbol of lba.tapeAlphabet) {
                    const transition4 = new Transition(newState3, newState3, symbol, symbol, 'L')
                    lba.add_transition(transition4)
                    addedTransitions.push(transition4)
                }

                addedStates.push('M')

                const transition5 = new Transition(newState3, 'M', lba.leftEndmarker, lba.leftEndmarker, 'R')
                lba.add_transition(transition5)
                addedTransitions.push(transition5)

                eliminateBlank = lba_eliminate_blank(grammar)
                steps.set('M - eliminate Blank', eliminateBlank.steps)
                
                const transition6 = new Transition('M', 'z0', lba.leftEndmarker, lba.leftEndmarker, 'R')
                lba.add_transition(transition6)
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

    
    const newState1 = lba.add_state()

    const transitionEnd1 = new Transition('z0', newState1, lba.rightEndmarker, lba.rightEndmarker, 'L')
    lba.add_transition(transitionEnd1)

    const newState2 = lba.add_state()
    const transitionEnd2 = new Transition(newState1, newState2, grammar.start, grammar.start, 'L')
    lba.add_transition(transitionEnd2)

    //final state
    const newState3 = lba.add_state()
    lba.add_endState(newState3)
    const transitionEnd3 = new Transition(newState2, newState3, lba.leftEndmarker, lba.leftEndmarker, 'N')
    lba.add_transition(transitionEnd3)

    const endStep = {
        newVariables: [newState1, newState2, newState3],
        newTransitions: [transitionEnd1, transitionEnd2, transitionEnd3]
    }

    steps.set('end', endStep)

    if (eliminateBlank) {
        lba.add_state('M')
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
export function lba_eliminate_blank(grammar) {
    let TM = new LBA(grammar, 'zin', '<', '>', 'x')

    const newStates = ['zin']
    const newTransitions = []

    for (let symbol of TM.tapeAlphabet) {
        const newStateSymbol = TM.add_state(symbol)
        newStates.push(newStateSymbol)

        
        const transition1 = new Transition('zin', newStateSymbol, symbol, TM.leftEndmarker, 'R')
        TM.add_transition(transition1)
        newTransitions.push(transition1)

        for (let innerSymbol of TM.tapeAlphabet) {
            const transition2 = new Transition(symbol, innerSymbol, innerSymbol, symbol, 'R')
            TM.add_transition(transition2)
            newTransitions.push(transition2)
        }

        const outState = TM.add_state('zout')
        newStates.push(outState)

        const transition3 = new Transition(newStateSymbol, outState, TM.blank, symbol, 'R')
        TM.add_transition(transition3)
        newTransitions.push(transition3)
    }

    const step = {
        newStates: newStates,
        newTransitions: newTransitions
    }

    return {
        LBA: TM,
        steps: step
    }
}

/**
* Creates an object representing a transition .
* @param {Grammar} grammar - A type 1 grammar in kuroda normalform.
* @return {LBA} A linear bounded automaton that overwrites the blank symbol.
*/
function createTranisition() {

}

/*
const nonterminals = ['S', 'B']
const terminals = ['a', 'b', 'c']
const start = 'S'
let productions = [new Production(['S'], ['a', 'S', 'B', 'c']), 
                new Production(['S'], ['a', 'b', 'c']),
                new Production(['c', 'B'], ['B', 'c']),  
                new Production(['b', 'B'], ['b', 'b']) 
            ]
let productions2 = [new Production(['S', 'B'], ['a', 'S', 'B', 'c']), 
        ]
let productions3 = [new Production(['S', 'B', 'a', 'b'], ['a', 'S', 'B', 'c']), 
    ]

console.log('old grammar:')
for(let production of productions){
    console.log(production.left + " -> " + production.right)
}

const grammar = convert_to_kuroda(new Grammar(nonterminals, terminals, productions, start))

console.log('\nnew grammar:')
for(let production of grammar.productions){
    console.log(production.left + " -> " + production.right)
}

const lba = grammar_to_lba(grammar)

console.log(lba)
S->aSBc,
S->abc,
cB->Bc,
bB->bb
*/

/*
S->AB,
S->A,
A->a,
B->b,
AB->BA
 */

/*
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

/* example 1
S->AB,
AB->ab
*/