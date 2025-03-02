export class LBA{
    constructor()
    {
        this.list = new Map();
        
    }


    add(startState, symbol, endState) {

        if(this.list.get(startState)){
            if(this.list.get(startState).get(symbol)){
                //this.list.set(startState, this.list.get(startState).get(symbol).push(endState))
            }else{
                this.list.set(startState, this.list.get(startState).set(symbol, endState))
            }
            
        }else{
            let innerMap = new Map()
            
            
            this.list.set(startState, innerMap.set(symbol, endState))
        }
    }
}

export class Production{
    constructor(left, right){
        this.left = left
        this.right = right
    }
}

export class Grammar{
    constructor(nonterminals, terminals, productions, start){
        this.nonterminals = nonterminals
        this.terminals = terminals
        this.productions = productions
        this.start = start
    }
}

/**
 * checks if grammar is in kuroda normalform
 * @param {Grammar} grammar A type 1 grammar
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
 * converts the given type 1 grammar to kuroda normalform
 * @param {Grammar} grammar A type 1 grammar
 */
export function convert_to_kuroda(grammar){
    let newProductions = []
    let newTerminals = []

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
 * converts the given type 1 grammar (in kuroda normalform) to a linear bounded automaton
 * @param {Grammar} grammar A type 1 grammar in kuroda normalform
 */
export function grammar_to_lba(grammar){
    const tape_alphabet = grammar.terminals.concat(grammar.nonterminals).concat(['<', '>', 'x'])
    let index = 0
    const delta = new Map()

    const delta_test = new LBA()

    delta.set(['zs', '<'], ['z0', '<', 'R'])
    delta_test.add('zs', '<', ['z0', '<', 'R'])

    for(const i of grammar.productions){
        if(i.right.length == 1){
            //for A->a or A->B replace current symbol with A
            //(z,a) -> (z,A,R)
            //(z,B) -> (z,B,R)

            index+=1
            delta.set(['z0', i.right[0]], ['z' + index.toString(), i.left[0], 'L'])
            delta_test.add('z0', i.right[0], ['z' + index.toString(), i.left[0], 'L'])

            for(let symbol of grammar.terminals.concat(grammar.nonterminals)){
                delta.set(['z' + index.toString(), symbol], ['z' + index.toString(), symbol, 'L'])
                delta_test.add('z' + index.toString(), symbol, ['z' + index.toString(), symbol, 'L'])
            }

            delta.set(['z' + index.toString(), '<'], ['z0', '<', 'R']) 
            delta_test.add('z' + index.toString(), '<', ['z0', '<', 'R'])
        } else if(i.right.length == 2){
            if(i.left.length == 2){
                
                //for AB->CD, write B, change head to left, write A 
                //(z,C) -> (z,A,R)
                index += 1
                delta.set(['z0', i.right[0]], ['z'+ index.toString(), i.left[0], 'R'])
                delta_test.add('z0', i.right[0], ['z'+ index.toString(), i.left[0], 'R'])
                
                // if B (z,D) -> (z,B,R)
                delta.set(['z' + index.toString(), i.right[1]], ['z'+ (index + 1).toString(), i.left[1], 'L'])
                delta_test.add('z' + index.toString(), i.right[1], ['z'+ (index + 1).toString(), i.left[1], 'L'])

                for(let symbol of grammar.terminals.concat(grammar.nonterminals)){
                    delta.set(['z' + (index + 1).toString(), symbol], ['z' + (index + 1).toString(), symbol, 'L'])
                    delta_test.add('z' + (index + 1).toString(), symbol, ['z' + (index + 1).toString(), symbol, 'L'])
                }
                index += 1

                delta.set(['z' + index.toString(), '<'], ['z0', '<', 'R'])
                delta_test.add('z' + index.toString(), '<', ['z0', '<', 'R'])
                
            }else if(i.left.length == 1){
                
                index += 1
                delta.set(['z0', i.right[0]], ['z'+ index.toString(), i.right[0], 'R'])
                delta_test.add('z0', i.right[0], ['z'+ index.toString(), i.right[0], 'R'])
                
                delta.set(['z' + index.toString(), i.right[1]], ['z'+ (index + 1).toString(), i.left[0], 'L'])
                delta_test.add('z' + index.toString(), i.right[1], ['z'+ (index + 1).toString(), i.left[0], 'L'])
                index += 1

                delta.set(['z' + index.toString(), i.right[0]], ['z'+ (index + 1).toString(), 'x', 'L'])
                delta_test.add('z' + index.toString(), i.right[0], ['z'+ (index + 1).toString(), 'x', 'L'])
                index += 1
                
                for(let symbol of grammar.terminals.concat(grammar.nonterminals)){
                    delta.set(['z' + index.toString() , symbol], ['z' + index.toString(), symbol, 'L'])
                    delta_test.add('z' + index.toString() , symbol, ['z' + index.toString(), symbol, 'L'])
                }

                //delta.set(['z' + index.toString() , '<'], ['z' + (index + 1).toString(), '<', 'R'])
                //index += 1
                delta.set(['z' + index.toString() , '<'], ['M', '<', 'R'])
                delta_test.add('z' + index.toString() , '<', ['M', '<', 'R'])
                
                
                
                //var currentSymbol
                /*
                //step 2:
                //save right symbol and write >
                //change head to left, change current symbol with saved symbol
                //stop swapping when x is replaced by another symbol
                for(let symbol of grammar.terminals.concat(grammar.nonterminals)){     
                    delta.set(['z' + index.toString() , symbol], ['z' + (index+1).toString(), '>', 'L'])
                    currentSymbol = symbol
                    index += 1


                    for(let symbol of grammar.terminals.concat(grammar.nonterminals)){
                        if(symbol == 'x'){
                            delta.set(['z' + index.toString() , symbol], ['z' + (index+1).toString(), currentSymbol, 'R'])
                            index += 1
                        }else{
                            delta.set(['z' + index.toString() , symbol], ['z' + index.toString(), currentSymbol, 'L'])
                        }
                    }    
                }*/

                delta.set(['M', '<'], ['z0', '<', 'R'])
                delta_test.add('M', '<', ['z0', '<', 'R'])
                //delta.set(['z' + index.toString(), '<'], ['z0', '<', 'R'])
            }else{
                throw new Error('not in kuroda normalform')
            }
        } else{
            throw new Error('not in kuroda normalform')
        }
    }
    index += 1
    delta.set(['z0', '>'], ['z' + index.toString(), '>', 'L'])
    delta_test.add('z0', '>', ['z' + index.toString(), '>', 'L'])
    
    delta.set(['z' + index.toString(), 'S'], ['z' + (index+1).toString(), 'S', 'L'])
    delta_test.add('z' + index.toString(), 'S', ['z' + (index+1).toString(), 'S', 'L'])
    index += 1
    //final state
    delta.set(['z' + index.toString(), '<'], ['z' + (index+1).toString(), '<', 'N'])
    delta_test.add('z' + index.toString(), '<', ['z' + (index+1).toString(), '<', 'N'])
    //index += 1

    console.log(index)
    return delta_test
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