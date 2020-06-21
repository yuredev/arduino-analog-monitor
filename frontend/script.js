const socket = io(); // constante que armazenará o objeto do socket.io
let value = 0; // valores de y inseridos nos gráficos
let pause = false; // determina se o gráfico está pausado
let x = 0; // x representa os pontos no eixo x do gráfico
let executingGraph; // armazenará dos dois gráficos

// layout a ser usado nos gráficos
let layout = {
  height: 250,
  autosize: true,
  margin: { b: 50, t: 30 },
};

// array de linhas do primeiro gráfico
let traces = [createTrace('sinal análogico', value, '#D00')];

window.onload = main;

function main() {
  socket.on('value', function (receivedData) {
    value = receivedData
  });
  startPloting();
}

// começa a plotar os gráficos dinamicamente
function startPloting() {
  Plotly.plot('chart', traces, layout); // plotar primeiro gráfico
  executingGraph = setInterval(updateGraph, 100);
}

// cria uma nova linha
function createTrace(name, valueTrace, color) {
  return {
    name,
    y: [valueTrace],
    type: 'line',
    mode: 'lines',
    line: { color },
  };
}

// função para pausar ou retomar o gráfico
function pauseResume() {
  pause = !pause;
  if (pause) {
    document.getElementById('pause-resume').innerText = 'Retomar';
    clearInterval(executingGraph); // pausa primeiro gráfico
  } else {
    document.getElementById('pause-resume').innerText = 'Pausar';
    executingGraph = setInterval(updateGraph, 100); // retoma primeiro gráfico
  }
}

// update do primeiro gráfico
function updateGraph() {
  Plotly.extendTraces('chart', { y: [[value]] }, [0]);
  x++;
  graphRelayout('chart', 'sinal analógico', 0, 1023);
  
  const valueLabel =  document.getElementById('value');
  valueLabel.innerText = 'Sinal analógico: ' + value.toFixed(2);
}

// faz o redesenho de um gráfico
function graphRelayout(divName, graphName, rangeMin, rangeMax) {
  Plotly.relayout(divName, {
    xaxis: {
      showticklabels: false,
      range: [x - 50, x + 10],
    },
    yaxis: {
      title: graphName,
      range: [rangeMin, rangeMax],
    },
  });
}