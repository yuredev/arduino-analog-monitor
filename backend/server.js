const express = require("express"); // importando o Express 
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http); // importando Socket.io
const five = require("johnny-five"); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 

const port = 8080;
app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend
let setPoint = null; // valor de setpoint passado pelo usuário  
let pinWasInitialize = false

// declarando Arduino na porta ao qual está conectado
const arduino = new five.Board({ port: "COM6" });
let pot1, pot2;
// quando o arduino estiver pronto executar 
arduino.on('ready', function () {
	io.on('connection', socket => { 
		if(!pinWasInitialize)
			setPins();
		socket.on('setPins', pins => setPins(pins));
		socket.on('clientReady', clientId => startSending(socket, clientId));	
	});
	// ouvir na porta declarada 
	http.listen(port, () => {
		console.log('============ SISTEMA PRONTO ============');
		console.log(`   Abrir em: http://localhost:${port}`);
		console.log('>> ========================================');
	});
});
// setar canais A0 e A1 por padrão 
function setPins(pins = ['A0','A1']) {
	pot1 = new five.Sensor({ pin: pins[0], freq: 250 }); // primeiro potenciômetro
	pot2 = new five.Sensor({ pin: pins[1], freq: 250 }); // segundo potenciômetro
	arduino.repl.inject({ pot: pot1 });
	arduino.repl.inject({ pot: pot2 });
	console.log(`Canais setados: ${pins[0]} e ${pins[1]}`);
	pinWasInitialize = true;
}

// começa a mandar os dados para o arduino
function startSending(socket, clientId) {
	console.log('Mandando dados para ' + clientId);
	// passar o setPoint atual para o novo usuário conectado
	socket.emit('changeSetPoint', setPoint);
	// quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 
	socket.on('changingSetPoint', newSetPoint => {
		setPoint = newSetPoint;
		socket.broadcast.emit('changeSetPoint', setPoint); // enviando para todos clientes exceto o atual 
	});
	potSend(socket, pot1, 'v1');
	potSend(socket, pot2, 'v2');
}
// faz os dados de um potenciômetro começaremm a ser mandados pros clientes via socket.io
function potSend(socket, pot, socketMsg) {
	pot.on('data', () => {
		setInterval(() => socket.emit(socketMsg, pot.value * 5 / 1024), 400);
		// setInterval(() => socket.emit(socketMsg, Math.random() * 5), 400);
	});
}