const socket = io();           // constante que armazenará o objeto do socket.io
const startTime = new Date(); // armazenar o tempo inicial ao executar em milisegundos 
let value1 = null, value2 = null, controlBitValue = null; // valores de y inseridos nos gráficos  
let setPoint;         // determina o valor do set point do primeiro gráfico 
let showBitGraph = false;    // determina se o gráfico do set point será mostrado 
let pause = false;           // determina se o gráfico está pausado 
let x = 0;                   // x representa os pontos no eixo x do gráfico
let cntSec = 0;              // cntSec conta os segundos passados a cada minuto ele ganha 60
let minutes = 0;             // minutes representa os minutos passados
let secP;                     // armazenar o tempo passado (secP = seconds passed)
let scaleMin = 0, scaleMax = 5; // escalas do primeiro gráfico 
let option = 'Voltagem';        // gráfico a ser exibido 
let executingGraph, executingGraphCB  // armazenará dos dois gráficos 
let layout = {                 // layout a ser usado nos gráficos 
    height: 250,
    autosize: true,
    margin: { b: 50, t: 30 }
};

// array de linhas do primeiro gráfico
let traces = [new Trace('potenciômetro 1', value1, '#D00'),
new Trace('potenciômetro 2', value1, 'orange'),
new Trace('set point', setPoint, '00A')
];
// array de linhas do gráfico do bit de controle (CB: Bit Control)
let traceCB = [new Trace('bit de controle', controlBitValue)];

window.onload = initialize

// inicializar a aplicação
function initialize() {
    socket.emit('clientReady', socket.id);
    startPloting();
    startSocketListening();
    $('#' + option).addClass('marked');      // marcar a opção atual do gráfico
    $('#controlBit').prop('checked', false); // deixar o checkbox desmarcado por padrão via jquery  
}

// faz o cliente começar a ouvir os dados do servidor 
function startSocketListening() {
    socket.on('v1', receivedData => value1 = receivedData);
    socket.on('v2', receivedData2 => value2 = receivedData2);
    socket.on('changeSetPoint', newSetPoint => setPoint = newSetPoint);
}

// começa a plotar os gráficos dinamicamente
function startPloting() {
    Plotly.plot('chart', traces, layout, { responsive: true });      // plotar primeiro gráfico 
    Plotly.plot('chart2', traceCB, layout, { responsive: true });    // plotar gráfico do bit de controle 
    executingGraph = setInterval(updateGraph, 100);
    executingGraphCB = setInterval(updateGraphCB, 100);
}

function changePins() {
    window.location.href = 'setpins.html'
}

// função construtora para gerar objetos do tipo linha 
function Trace(name = 'unnamed trace', valueTrace, color = '#000') {
    this.name = name;
    this.y = [valueTrace];
    this.type = 'line';
    this.line = { color };
}
// retorna o tempo passado em segundos 
function secondsPassed() {
    let endTime = new Date();
    let timeDiff = endTime - startTime; // retorno em milisegundos
    timeDiff /= 1000; // convertendo para segundos 
    return Math.round(timeDiff);
}
// mudar gráfico atual
function changeGraph(optionName) {
    $('#' + option).removeClass('marked');
    option = optionName;
    $('#' + option).addClass('marked');
}
// função para mudar o setPoint 
function changeSetPoint() {
    setPoint = document.getElementById('setPoint').value;
    socket.emit('changingSetPoint', setPoint); // mandar set point para o servidor
}
// função para mostrar ou ocultar o segundo gráfico 
function switchControlBitGraph() {
    document.getElementById('container2').style.display = showBitGraph ? 'none' : 'block';
    showBitGraph = !showBitGraph;
}
// função para pausar ou retomar o gráfico 
function pauseResume() {
    pause = !pause;
    if (pause) {
        document.getElementById('pause-resume').innerText = 'Retomar';
        clearInterval(executingGraph);    // pausa primeiro gráfico 
        clearInterval(executingGraphCB);  // pausa segundo gráfico 
    } else {
        document.getElementById('pause-resume').innerText = 'Pausar';
        executingGraph = setInterval(updateGraph, 100);     // retoma primeiro gráfico 
        executingGraphCB = setInterval(updateGraphCB, 100); // retoma segundo gráfico 
    }
}
// update do primeiro gráfico 
function updateGraph() {
    Plotly.extendTraces('chart', { y: [[value1], [value2], [setPoint]] }, [0, 1, 2]);
    secP = secondsPassed();
    x++;
    if (secP - cntSec > 59) {
        cntSec += 60;
        minutes++;
    }
    Plotly.relayout('chart', {
        xaxis: {
            showticklabels: false,
            title: `tempo percorrido: ${minutes}:${secP < 60 ? secP : secP - cntSec}`,
            range: [x - 50, x],
        },
        yaxis: {
            title: 'voltagem',
            range: [scaleMin, scaleMax]
        },
    });
    if (value1 != null)
        document.getElementById('volts1').innerHTML = `1° potenciômetro: ${value1.toFixed(2)} volts`;
    if (value2 != null)
        document.getElementById('volts2').innerHTML = `2° potenciômetro: ${value2.toFixed(2)} volts`;
}
// update do gráfico de bit de controle 
function updateGraphCB() {
    Plotly.extendTraces('chart2', { y: [[controlBitValue]] }, [0]);
    Plotly.relayout('chart2', {
        xaxis: {
            showticklabels: false,
            title: `tempo percorrido: ${minutes}:${secP < 60 ? secP : secP - cntSec}`,
            range: [x - 50, x],
        },
        yaxis: {
            title: 'bit de controle',
            range: [-0.5, 1.5]
        },
    });
}