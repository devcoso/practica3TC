//Seleccionar input y boton
const expresion = document.getElementById('expresion')
const boton = document.getElementById('boton')
const alerta = document.getElementById('alerta');

//Iniciar PILA y Cadena
let pila = []
let cadena
let contador
//Arreglos de carácteres que interesan
const numeros0_9 = ["0","1", "2", "3", "4", "5", "6", "7", "8", "9"]
const numeros0_7 = ["0" ,"1", "2", "3", "4", "5", "6", "7"]
const numeros0_F = ["0" ,"1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
const caracteresIdentificadores = ['_', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z','a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
const palabrasReservadas = ["auto", "else", "long", "switch" ,"break", "enum", "register", "typedef","case", "extern", "return", "union","char", "float", "short", "unsigned","const", "for", "signed", "void","continue", "goto", "sizeof", "volatile","default", "if", "static", "while","do", "int", "struct", "_Packed","double"]
const operadores = ["=", "+", "-", "*", "/", "%"]

//Cuando click en el boton iniciar automata y mostrar alerta
boton.addEventListener('click', ()=> {
    cadena = expresion.value
    contador = 0;
    pila = []
    pila.push('z0')
    q0()
})

function q0(){
    pila.push('IN')
    q1()
}

function q1(){
    pila.pop() //SACAR IN(INICIO)
    //Obtener identificadores asignados y meter a pila
    let identificadorActual = "";
    let ultimoIgual = 0;
    for(let i = 0; i < cadena.length ; i++){
        let letra = cadena[i]
        if(letra == '='){
            if(identificadorValido(identificadorActual.trim())){
                ultimoIgual = i + 1
                contador++
                pila.push(identificadorActual.trim(), "=")
                identificadorActual = ""
            } else {
                muerte()
                return
            }
        } else {
            identificadorActual += letra
        }
        //Revisa que no tenga caracteres raros
        if(!([...numeros0_9, ...caracteresIdentificadores, ...operadores, '(', ')', ' ', ';', '.'].includes(letra))) {
            muerte() 
            return
        }
    }
    let cadenaExp = cadena.slice(ultimoIgual).trim()
    if(cadenaExp.length == 0) {
        muerte()
        return
    }
    let contador1 = 0
    for(let i = 0; i < cadenaExp.length ; i++){//Evualua (E2)
        let letra = cadenaExp[i]
        if(letra == '(') contador1++;
        else if(letra == ')') contador1--;
        if(contador1 < 0) {
            muerte()
            return
        }
    }
    if(contador1 != 0) {
        muerte()
        return
    }
    let idOConstanteActual = ''
    let letraA = ''
    let letra = ''
    for(let i = 0; i < cadenaExp.length ; i++){//Dividr E2 OP E2, y verificar que E2 es una constante o id
        letraA = letra 
        letra = cadenaExp[i]
        if ([...caracteresIdentificadores, ...numeros0_9, ' ', ';', '.'].includes(letra)) idOConstanteActual += letra
        else if(['(', ')'].includes(letra)) idOConstanteActual += ' '
        else if(letraA == 'E' && ['-', '+'].includes(letra)) idOConstanteActual += letra
        else if([...operadores].includes(letra)){
            pila.push(idOConstanteActual)
            idOConstanteActual = ''
        }
    }
    if(idOConstanteActual[idOConstanteActual.length -1].trim() != ';') { //Revisa ; en ID=E;
        muerte()
        return
    } else {
        pila.push(idOConstanteActual.trim().slice(0, -1))
    }

    let elementoSacado = pila.pop()
    while(elementoSacado != '='){
        if(!(identificadorValido(elementoSacado.trim()) || constanteValida(elementoSacado.trim()))){
            muerte()
            return 
        }
        elementoSacado = pila.pop()
    }
    pila.push('=')
    while(contador != 0){
        pila.pop()//Sacar ID
        pila.pop()//Sacar =
        contador--
    }

    //Revisa que este vacia la pila
    if(pila[pila.length-1] == 'z0'){
        q2()
    } else {
        muerte()
    }
}

function q2(){
    alerta.classList.remove('hidden')
    alerta.classList.add('bg-lime-600', 'border-l-lime-900')
    alerta.classList.remove('bg-red-400', 'border-l-red-900')
    alerta.textContent = "ACEPTADA"
}

function muerte(){    
    alerta.classList.remove('hidden')
    alerta.classList.add('bg-red-400', 'border-l-red-900')
    alerta.classList.remove('bg-lime-600', 'border-l-lime-900')
    alerta.textContent = "NO ACEPTADA"  
}

function identificadorValido(id){
    if(id == "") return false
    if(!caracteresIdentificadores.includes(id[0]) || palabrasReservadas.includes(id)) return false;
    for(let i = 1; i < id.length ; i++){
        let letra = id[i]
        if(!(caracteresIdentificadores.includes(letra) || numeros0_9.includes(letra))) return false;       
    }
    return true
}

function constanteValida(constante){
    let caracteresConstante = numeros0_9
    if(constante == "") return false
    if(constante.includes(' ')) return false
    if(constante[0] == '0'){
        if(constante[1] == 'x'){
            caracteresConstante = numeros0_F
            constante = constante.slice(2)
        } else {
            caracteresConstante = numeros0_7
        }
        for(let i = 0; i < constante.length ; i++){
            let letra = constante[i]
            if (!caracteresConstante.includes(letra)) return false
        }
    } else if(constante.includes('.')){
        let bandera = false
        if(constante.includes('E')){
            let indiceE = constante.indexOf('E')
            for(let i = 0; i < indiceE ; i++){
                let letra = constante[i]
                if(letra == '.'){
                    if(bandera == true) return false
                    bandera = true
                } else if (!caracteresConstante.includes(letra)) return false
            }
            for(let i = indiceE + 1; i < constante.length ; i++){
                let letra = constante[i]
                if(![...caracteresConstante, '+', '-'].includes(letra)) return false
            }
        } else {
            for(let i = 0; i < constante.length ; i++){
                let letra = constante[i]
                if(letra == '.'){
                    if(bandera == true) return false
                    bandera = true
                } else if (!caracteresConstante.includes(letra)) return false
            }
        }
    } else {
        for(let i = 0; i < constante.length ; i++){
            let letra = constante[i]
            if (!caracteresConstante.includes(letra)) return false
        }
    }
    return true
}
