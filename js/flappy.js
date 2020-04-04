const jogo = document.querySelector('[flappy]')

function criarElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function criarBarreira(reversa = false) {
    this.elemento = criarElemento('div', 'barreira')

    const borda = criarElemento('div', 'borda')
    const corpo = criarElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = (altura) => corpo.style.height = `${altura}px`
}


function parDeBarreira(altura, abertura, posicaoX) {
    this.elemento = criarElemento('div', 'par-de-barreiras')

    this.superior = new criarBarreira(true)
    this.inferior = new criarBarreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.aberturaAleatoria = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.aberturaAleatoria()
    this.setX(posicaoX)
}


function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [ // momento inicial do jogo
        new parDeBarreira(altura, abertura, largura),
        new parDeBarreira(altura, abertura, largura + espaco),
        new parDeBarreira(altura, abertura, largura + espaco * 2),
        new parDeBarreira(altura, abertura, largura + espaco * 3),
    ]
    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach(barreira => {
            barreira.setX(barreira.getX() - deslocamento)

            // quando a barreira sair da tela
            if (barreira.getX() < -barreira.getLargura()) { // pode sofrer alterações
                barreira.setX(barreira.getX() + espaco * this.pares.length)
                barreira.aberturaAleatoria()
            }

            const meio = largura / 2
            const cruzouOMeio = barreira.getX() + deslocamento >= meio && barreira.getX() < meio

            if (cruzouOMeio) notificarPonto()

        })
    }
    this.reset = () =>{
        this.pares.forEach( (barreira , index) =>{
            if(index != 0){
                barreira.setX(largura + (espaco*index) ) // espaço entre barreira
            } else{
                barreira.setX(largura)
            }
        })
    }

}

function Passaro(alturaDoJogo) {
    let voando = false

    this.elemento = criarElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = (y) => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)

        const alturaMaxima = alturaDoJogo - 125
        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaDoJogo / 2)
}

function Progresso() {
    this.elemento = criarElemento('span', 'pontuacao')
    this.atualizarPonto = (pontos) => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPonto(0)
}


function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const verttical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && verttical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(par => {
        if (!colidiu) {
            const superior = par.superior.elemento
            const inferior = par.inferior.elemento

            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}
function gameOver() {
    this.elemento = criarElemento('img', 'gameOver')
    this.elemento.src = 'imgs/gameover.png'
}

function Start() {
    this.elemento = criarElemento('img', 'start')
    this.elemento.src = 'imgs/start.png'
}

function Restart() {
    this.elemento = criarElemento('img', 'restart')
    this.elemento.src = 'imgs/restart.png'
}
function Pause(){
    this.elemento = criarElemento('img' , 'pause')
    this.elemento.src = 'imgs/pause.png'
   
}
function Resume(){
    this.elemento = criarElemento('img', 'resume')
    this.elemento.src = 'imgs/resume.png'

}

function FlappyBird() {
    let pontos = 0
    

    const areaDoJogo = document.querySelector('[flappy]')

    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPonto(++pontos))
    const passaro = new Passaro(altura)
    const resume = new Resume()
    const pause = new Pause()
    const gameover = new gameOver();

    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    areaDoJogo.appendChild(pause.elemento)    
    areaDoJogo.appendChild(resume.elemento)    
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)


    const start = new Start();
    areaDoJogo.appendChild(start.elemento);

    const restart = new Restart()


    this.start = () => {
        if (document.getElementsByClassName('gameOver')[0] != null) { //verifica se existe
            areaDoJogo.removeChild(gameover.elemento)
        }
        if (document.getElementsByClassName('start')[0] != null) {
            areaDoJogo.removeChild(start.elemento)
        }
        if (document.getElementsByClassName('restart')[0] != null) {
            areaDoJogo.removeChild(restart.elemento)
        }

        // loop do jogo
        const temporizador = setInterval(() => {
            pause.elemento.onclick = event => clearInterval(temporizador)
            resume.elemento.onclick = event => this.start()

            barreiras.animar()
            passaro.animar()
            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)

                areaDoJogo.appendChild(gameover.elemento)
                areaDoJogo.appendChild(restart.elemento)

                restart.elemento.onclick = e => {
                    this.restart()
                }

            }
        }, 20)
    }

    this.restart = () => {
        barreiras.reset()
        passaro.setY(altura / 2)
        this.start()

        progresso.atualizarPonto(0)
        pontos = 0;
    }
}


let Jogo = new FlappyBird();

if (document.querySelector('.start') != null) {
    document.querySelector('.start').addEventListener('click', event => {
        Jogo.start()
    })
}








