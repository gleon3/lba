class Production{
    constructor(left, right){
        this.left = left
        this.right = right
    }
}

class Grammar{
    constructor(nonterminals, terminals, productions, start){
        this.nonterminals = nonterminals
        this.terminals = terminals
        this.productions = productions
        this.start = start
    }
}

/**
 * converts the given type 1 grammar to kuroda normalform
 * @param {Grammar} grammar A type 1 grammar
 */
function convert_to_kuroda(grammar){
    //seperate terminals
    for(let i = 0; i < grammar.terminals.length; i++){
        old_symbol = grammar.terminals[i]
        new_variable = grammar.terminals[i].toUpperCase().concat(grammar.terminals[i])

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

    index = 0

    for(let i = 0; i < grammar.productions.length; i++){
        n = grammar.productions[i].right.length 

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
        n = grammar.productions[i].right.length
        m = grammar.productions[i].left.length

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
        n = grammar.productions[i].left.length

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
        n = grammar.productions[i].right.length
        m = grammar.productions[i].left.length

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
function grammar_to_lba(grammar){
    tape_alphabet = grammar.terminals.concat(grammar.nonterminals).concat(['<', '>', 'x'])
    index = 0
    const gamma = new Map()

    for(const i of grammar.productions){
        if(i.right.length == 1){            
            //for A->a or A->B replace current symbol with A
            //(z,a) -> (z,A,L)
            //(z,B) -> (z,B,L)

            gamma.set(['z' + index.toString(), i.right[0]], ['z' + (index + 1).toString(), i.left[0], 'L'])
            index += 1
        } else if(i.right.length == 2){
            if(i.left.length == 2){
                //for AB->CD, write B, change head to left, write A 
                //(z,D) -> (z,B,L)
                gamma.set(['z' + index.toString(), i.right[1]], ['z'+ (index + 1).toString(), i.left[1], 'L'])
                index += 1
                
                // if C (z,C) -> (z,A,L)
                gamma.set(['z' + index.toString(), i.right[0]], ['z'+ (index + 1).toString(), i.left[0], 'L'])
                index += 1
                //if no C -> go back right
            }else if(i.left.length == 1){
                //for A->BC, write A, change head to left
                gamma.set(gamma.set(['z' + index.toString(), i.right[1]], ['z'+ (index + 1).toString(), i.left[0], 'L']))
                index += 1
                
                //write x, change head to left and do step 2 until x is replaced
                gamma.set(gamma.set(['z' + index.toString(), i.right[0]], ['z'+ (index + 1).toString(), 'x', 'L']))
                index += 1
        
                //step 2:
                //save left symbol and write <
                //change head to right, change current symbol with saved symbol
                //stop swapping when x is replaced by another symbol
            }else{
                throw new Error('not in kuroda normalform')
            }
        } else{
            throw new Error('not in kuroda normalform')
        }
    }
    return gamma
}

nonterminals = ['S', 'B']
terminals = ['a', 'b', 'c']
start = 'S'
productions = [new Production(['S'], ['a', 'S', 'B', 'c']), 
                new Production(['S'], ['a', 'b', 'c']),
                new Production(['c', 'B'], ['B', 'c']),  
                new Production(['b', 'B'], ['b', 'b']) 
            ]
productions2 = [new Production(['S', 'B'], ['a', 'S', 'B', 'c']), 
        ]
productions3 = [new Production(['S', 'B', 'a', 'b'], ['a', 'S', 'B', 'c']), 
    ]

console.log('old grammar:')
for(let production of productions){
    console.log(production.left + " -> " + production.right)
}

grammar = convert_to_kuroda(new Grammar(nonterminals, terminals, productions, start))

console.log('\nnew grammar:')
for(let production of grammar.productions){
    console.log(production.left + " -> " + production.right)
}

lba = grammar_to_lba(grammar)

console.log(lba)
