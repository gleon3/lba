class Productions{
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
        old_variable = grammar.terminals[i]
        new_variable = grammar.terminals[i].toUpperCase().concat(grammar.terminals[i])

        grammar.terminals[i] = new_variable

        for(const i in grammar.productions){
            i.right.replace(old_variable, new_variable)
        }
    }

    for(let i = 0; i < grammar.productions.length; i++){
        
        if(grammar.productions[i].left.length == 1 && grammar.productions[i].right.length > 2){
            //new variables C1..CN-2, replace Productions A -> B1..BN with A->B1C1..Ci->Bi+1Ci+1

            //A->B1C1
            //left side = grammar.productions[i].left
            //right side = [grammar.productions[i].right[0], "C1"]


            //C1->B2C2..Bn-3Cn-3
            for(let j = 1; j < grammar.productions[i].right.length - 2; j++){
                //left_side of production = ["C" + j.toString()]
                //right side of production = [grammar.productions[i].right[j+1], "C" + (j + 1).toString()]
            }

            //Cn-2->Bn-1Bn
            //n = grammar.productions[i].right.length
            //left_side = ["C" + (n - 2).toString()]
            //right side = [grammar.productions[i].right[n-1], grammar.productions[i].right[n]]
        }
    }

    for(const i in grammar.productions){
        if(i.left.length + 2 <=  i.right.length){
            //new Variables D2..Dn-1

            //A1A2->B1D2
            //left side = [grammar.productions[i].left[0], grammar.productions[i].left[1]]
            //right side = [grammar.productions[i].right[0], "D2"]


            //DiAi+1->BiDi+1
            for(let j = 2; j < grammar.productions[i].right.length - 1; j++){
                //left_side of production = ["D" + j.toString(), grammar.productions[i].left[j+1]]
                //right side of production = [grammar.productions[i].right[j], "D" + (j + 1).toString()]
            }

            //Dn-1->BnBn+1
            //n = grammar.productions[i].right.length
            //left_side = ["D" + (n - 1).toString()]
            //right side = [grammar.productions[i].right[n], grammar.productions[i].right[n+1]]
        }
    }

    for(const i in grammar.productions){
        if(i.left.length  == i.right.length + 1 && i.left.length >= 2){
            //new Variables D2..Dn

            //A1A2->B1D2
            //left side = [grammar.productions[i].left[0], grammar.productions[i].left[1]]
            //right side = [grammar.productions[i].right[0], "D2"]


            //DiAi+1->BiDi+1
            for(let j = 2; j < grammar.productions[i].right.length - 1; j++){
                //left_side of production = ["D" + j.toString(), grammar.productions[i].left[j+1]]
                //right side of production = [grammar.productions[i].right[j], "D" + (j + 1).toString()]
            }

            //Dn-1->BnBn+1
            //n = grammar.productions[i].right.length
            //left_side = ["D" + (n - 1).toString()]
            //right side = [grammar.productions[i].right[n], grammar.productions[i].right[n+1]]

        }
    }

    for(const i in grammar.productions){
        if(i.left.length  == i.right.length && i.left.length > 2){
             //new Variables D2..Dn-1

            //A1A2->B1D2
            //left side = [grammar.productions[i].left[0], grammar.productions[i].left[1]]
            //right side = [grammar.productions[i].right[0], "D2"]


            //DiAi+1->BiDi+1
            for(let j = 2; j < grammar.productions[i].right.length - 1; j++){
                //left_side of production = ["D" + j.toString(), grammar.productions[i].left[j+1]]
                //right side of production = [grammar.productions[i].right[j], "D" + (j + 1).toString()]
            }

            //Dn-1An->Bn-1Bn
            //n = grammar.productions[i].right.length
            //left_side = ["D" + (n - 1).toString(), grammar.productions[i].left[n]]
            //right side = [grammar.productions[i].right[n-1], grammar.productions[i].right[n]]
        }
    }   
}

/**
 * converts the given type 1 grammar (in kuroda normalform) to a linear bounded automaton
 * @param {Grammar} grammar A type 1 grammar in kuroda normalform
 */
function grammar_to_lba(grammar){
    tape_alphabet = grammar.terminals.concat(grammar.nonterminals).concat(['<', '>', 'x'])
    
    for(const i in grammar.productions){
        if(i.right.length == 1){            
            //for A->a or A->B replace current symbol with A
            //(z,a) -> (z,A,L)
            //(z,B) -> (z,B,L)
        } else if(i.right.length == 2){
            if(i.left.length == 2){
                //for AB->CD, write B, change head to left, write A 
                //(z,D) -> (z,B,L)
                // if C (z,C) -> (z,A,L), if no C -> go back right
            }else if(i.left.length == 1){
                //for A->BC, write A, change head to left, write x, change head to left and do step 2 until x is replaced
        
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
}