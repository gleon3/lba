/** Class representing a production. */
export class Production{
    /**
     * Create a production.
     * @param {String[]} left - The left side of the production.
     * @param {String[]} right - The right side of the production.
     */
    constructor(left, right){
        this.left = left
        this.right = right
    }
}

/** Class representing a grammar. */
export class Grammar{
    /**
     * Create a grammar.
     * @param {String[]} nonterminals - The nonterminals.
     * @param {String[]} terminals - The terminals.
     * @param {Production[]} productions - The productions.
     * @param {String} start - The start symbol.
     */
    constructor(nonterminals, terminals, productions, start){
        this.nonterminals = nonterminals
        this.terminals = terminals
        this.productions = productions
        this.start = start
    }
}

/** Class representing a linear bounded automaton. */
export class LBA{
    /**
     * Creates an empty linear bounded automaton based upon a given grammar.
     * @param {Grammar} grammar - The grammar the lba is based upon.
     * @param {String} startState - The start state.
     * @param {String} left_endmarker - The left endmarker.
     * @param {String} right_endmarker - The right endmarker.
     * @param {String} blank - The blank symbol.
     */
    constructor(grammar, startState, left_endmarker, right_endmarker, blank)
    {
        this.states = [startState];
        this.input_alphabet = grammar.terminals.concat(grammar.nonterminals);
        this.tape_alphabet = this.input_alphabet.concat([left_endmarker, right_endmarker, blank]);
        this.startState = startState;
        this.blank = blank
        this.delta = new Map();
        this.endStates = [];
    }

    /**
     * Adds a transition to the lba.
     * @param {String} startState - The state where the transition begins.
     * @param {String} endState - The state the tranistion goes to.
     * @param {String} label - The text on the transition.
     */
    add_transition(startState, endState, label) {
        if(this.delta.get(startState)){
            if(this.delta.get(startState).get(endState)){
                if(!this.delta.get(startState).get(endState).includes(label)){
                    this.delta.set(startState, this.delta.get(startState).set(endState, (this.delta.get(startState).get(endState).concat([label]))))
                }
            }else{
                this.delta.set(startState, this.delta.get(startState).set(endState, [label]))
            }
        }else{
            let innerMap = new Map()
            
            
            this.delta.set(startState, innerMap.set(endState, [label]))
        }
    }

    /**
     * Adds a state to the lba.
     * 
     * @return {state} The state that was added to the lba.
     */
    add_state(){
        const state = 'z' + (this.states.length - 1)

        this.states.push(state)

        return state
    }

    /**
     * Adds a state to the lba.
     * 
     * @param {String} state - The name of the state to be added to the lba.
     * @return {state} The state that was added to the lba.
     */
    add_state_with_name(state){
        this.states.push(state)

        return state
    }

    /**
     * Adds a end state to the lba.
     * @param {String} state - The end state to add to the lba.
     */
    add_endState(state){
        this.endStates.push(state)
    }
}

/**
 * Checks if grammar is in kuroda normalform.
 * @param {Grammar} grammar - A type 1 grammar.
 * @return {boolean} True if grammar is in Kuroda normalform.
 */
export function is_kuroda(grammar){
    for(let production of grammar.productions){
        if((production.left.length == 1 && grammar.nonterminals.includes(production.left[0]) && production.right.length == 1) ||
            (production.left.length == 1 && grammar.nonterminals.includes(production.left[0]) && production.right.length == 2 && grammar.nonterminals.includes(production.right[0]) && grammar.nonterminals.includes(production.right[1])) ||
            (production.left.length == 2 && grammar.nonterminals.includes(production.left[0]) && grammar.nonterminals.includes(production.left[1]) && production.right.length == 2 && grammar.nonterminals.includes(production.right[0]) && grammar.nonterminals.includes(production.right[1]))) {
            //pass
        }else{
            return false
        }
    }
    return true
}

/**
 * Converts the given type 1 grammar to kuroda normalform.
 * @param {Grammar} grammar - A type 1 grammar.
 * @return {grammar} The type 1 grammar in kuroda normalform.
 */
export function convert_to_kuroda(grammar){
    //seperate terminals
    for(let i = 0; i < grammar.terminals.length; i++){
        let old_symbol = grammar.terminals[i]
        let new_variable = grammar.terminals[i].toUpperCase().concat(grammar.terminals[i])

        grammar.terminals[i] = new_variable

        for(let j = 0; j < grammar.productions.length; j++){
            //replace nonterminal in left side of production
            for(let k = 0; k < grammar.productions[j].left.length; k++){
                if(grammar.productions[j].left[k] == old_symbol){
                    grammar.productions[j].left[k] = new_variable
                }
            }
            
            //replace nonterminal in right side of production
            for(let k = 0; k < grammar.productions[j].right.length; k++){
                if(grammar.productions[j].right[k] == old_symbol){
                    grammar.productions[j].right[k] = new_variable
                }
            }
        }

        grammar.productions.push(new Production([new_variable], [old_symbol]))
    }

    let index = 0

    for(let i = 0; i < grammar.productions.length; i++){
        const n = grammar.productions[i].right.length 

        if(grammar.productions[i].left.length == 1 && n > 2){
            //new variables C1..CN-2, replace Productions A -> B1..BN with A->B1C1..Ci->Bi+1Ci+1
            //A->B1C1
            grammar.productions.push(new Production(grammar.productions[i].left, [grammar.productions[i].right[0], "C" + index.toString()]))

            //C1->B2C2..Bn-3Cn-3
            for(let j = 0; j < n - 3; j++){
                grammar.productions.push(new Production(["C" + (index + j).toString()], [grammar.productions[i].right[j+1], "C" + (index + j + 1).toString()]))
            }

            //Cn-2->Bn-1Bn
            grammar.productions.push(new Production(["C" + (index + n - 3).toString()], [grammar.productions[i].right[n-2], grammar.productions[i].right[n-1]]))

            //remove replaced production
            grammar.productions.splice(i, 1)
            i -= 1 

            index += n - 2
        }
    }

    for(let i = 0; i < grammar.productions.length; i++){
        const n = grammar.productions[i].right.length
        const m = grammar.productions[i].left.length

        if(m + 2 <= n){
            //new Variables D2..Dn-1

            //A1A2->B1D2
            grammar.productions.push(new Production([grammar.productions[i].left[0], grammar.productions[i].left[1]], [grammar.productions[i].right[0], "D1"]))
            
            //DiAi+1->BiDi+1
            for(let j = 1; j < m - 1; j++){
                grammar.productions.push(new Production(["D" + j.toString(), grammar.productions[i].left[j+1]], [grammar.productions[i].right[j], "D" + (j + 1).toString()]))
            }

            //Di->BiDi+1
            for(let j = m - 1; j < n - 2; j++){
                grammar.productions.push(new Production(["D" + j.toString()], [grammar.productions[i].right[j], "D" + (j + 1).toString()]))
            }

            //Dn-1->BnBn+1
            grammar.productions.push(new Production(["D" + (n - 2).toString()], [grammar.productions[i].right[n-2], grammar.productions[i].right[n-1]]))

            //remove replaced production
            grammar.productions.splice(i, 1)
            i -= 1 
        }
    }

    for(let i = 0; i < grammar.productions.length; i++){
        const n = grammar.productions[i].left.length

        if(grammar.productions[i].right.length == n + 1 && n >= 2){
            //new Variables D2..Dn

            //A1A2->B1D2
            grammar.productions.push(new Production([grammar.productions[i].left[0], grammar.productions[i].left[1]], [grammar.productions[i].right[0], "D2"]))

            //DiAi+1->BiDi+1
            for(let j = 1; j < n - 1; j++){
                grammar.productions.push(new Production(["D" + j.toString(), grammar.productions[i].left[j+1]], [grammar.productions[i].right[j], "D" + (j + 1).toString()]))
            }

            //Dn-1->BnBn+1
            grammar.productions.push(new Production(["D" + (n - 1).toString()], [grammar.productions[i].right[n-1], grammar.productions[i].right[n]]))

            //remove replaced production
            grammar.productions.splice(i, 1)
            i -= 1
        }
    }

    for(let i = 0; i < grammar.productions.length; i++){
        const n = grammar.productions[i].right.length
        const m = grammar.productions[i].left.length

        if(m == n && n > 2){
             //new Variables D2..Dn-1

            //A1A2->B1D2
            grammar.productions.push(new Production([grammar.productions[i].left[0], grammar.productions[i].left[1]], [grammar.productions[i].right[0], "D2"]))

            //DiAi+1->BiDi+1
            for(let j = 1; j < n - 2; j++){
                grammar.productions.push(new Production(["D" + j.toString(), grammar.productions[i].left[j+1]], [grammar.productions[i].right[j], "D" + (j + 1).toString()]))
            }

            //Dn-1An->Bn-1Bn
            n = grammar.productions[i].right.length
            grammar.productions.push(new Production(["D" + (n - 2).toString(), grammar.productions[i].left[n-1]], [grammar.productions[i].right[n-2], grammar.productions[i].right[n-1]]))

            //remove replaced production
            grammar.productions.splice(i, 1)
            i -= 1
        }
    }

    return grammar
}

/**
 * Converts the given type 1 grammar (in kuroda normalform) to a linear bounded automaton.
 * @param {Grammar} grammar - A type 1 grammar in kuroda normalform.
 * @return {lba} The linear bounded automaton.
 */
export function grammar_to_lba(grammar){
    const lba = new LBA(grammar, 'zs', '<', '>', 'x')

    lba.add_state('z0')
    lba.add_transition('zs', 'z0', '< : <, R')

    for(const i of grammar.productions){
        if(i.right.length == 1){
            //for A->a or A->B replace current symbol with A
            //(z,a) -> (z,A,R)
            //(z,B) -> (z,B,R)
            
            const newState = lba.add_state()
            lba.add_transition('z0', newState, i.right[0] + ' : ' + i.left[0] +  ', L')
            

            for(let symbol of grammar.terminals.concat(grammar.nonterminals).concat(['>', 'x'])){
                lba.add_transition(newState, newState, symbol + ' : ' + symbol + ', L')
            }

            lba.add_transition(newState, 'z0', '< : <, R')
        } else if(i.right.length == 2){
            if(i.left.length == 2){
                
                //for AB->CD, write B, change head to left, write A 
                //(z,C) -> (z,A,R)
                const newState1 = lba.add_state()
                lba.add_transition('z0', newState1, i.right[0] + ' : ' + i.left[0] + ', R')
                
                // if B (z,D) -> (z,B,R)
                const newState2= lba.add_state()
                lba.add_transition(newState1, newState2, i.right[1] + ' : ' +  i.left[1] + ', L')

                for(let symbol of grammar.terminals.concat(grammar.nonterminals).concat(['>', 'x'])){
                    lba.add_transition(newState2, newState2, symbol + ' : ' + symbol + ', L')
                }

                lba.add_transition(newState2, 'z0', '< : <, R')
                
            }else if(i.left.length == 1){
                const newState1 = lba.add_state()
                lba.add_transition('z0', newState1, i.right[0] + ' : ' + i.right[0] + ', R')
                
                const newState2 = lba.add_state()
                lba.add_transition(newState1, newState2, i.right[1] + ' : ' + i.left[0] + ', L')

                const newState3 = lba.add_state()
                lba.add_transition(newState2, newState3, i.right[0] + ' : x, L')
                
                for(let symbol of grammar.terminals.concat(grammar.nonterminals).concat(['>', 'x'])){
                    lba.add_transition(newState3 , newState3, symbol + ' : ' + symbol + ', L')
                }

                lba.add_transition(newState3 , 'M', '< : <, R')

                lba.add_transition('M', 'z0', '< : <, R')
            }else{
                throw new Error('not in kuroda normalform')
            }
        } else{
            throw new Error('not in kuroda normalform')
        }
    }
    const newState1 = lba.add_state()
    lba.add_transition('z0', newState1, '> : >, L')
    
    const newState2 = lba.add_state()
    lba.add_transition(newState1, newState2, 'S : S, L')

    //final state
    const newState3 = lba.add_state()
    lba.add_endState(newState3)
    lba.add_transition(newState2, newState3, '< : <, N')
    
    return lba
}

/**
 * Creates a linear bounded automaton that is used as a step in productions of the form of A->BC to remove the blank symbol.
 * @param {Grammar} grammar - A type 1 grammar in kuroda normalform.
 * @return {lba} A linear bounded automaton that overwrites the blank symbol.
 */
export function lba_eliminate_x(grammar){
    let throwaway = new LBA(grammar, 'zi', '<', '>', 'x')

    for(let symbol of grammar.terminals.concat(grammar.nonterminals)){
        const newStateSymbol = throwaway.add_state_with_name(symbol)
        throwaway.add_transition('zi', newStateSymbol, symbol + ' : <, R')

        for(let innerSymbol of grammar.terminals.concat(grammar.nonterminals)){
            throwaway.add_transition(symbol, innerSymbol ,innerSymbol + ' : ' + symbol + ', R')
        }

        throwaway.add_transition(newStateSymbol, 'zo', 'x : ' + symbol + ', L')
    }

    //lba.add_transition(newState, 'z0', '< : <, R')

    return throwaway.delta
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