const express = require("express"); // importando o Express 
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http); // importando Socket.io
const five = require("johnny-five"); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 

const port = 8080;
app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend
let setPoint = null; // valor de setpoint passado pelo usuário  

// declarando Arduino na porta ao qual está conectado
// const arduino = new five.Board({ port: "COM6" });
let pot1, pot2;
// quando o arduino estiver pronto executar 
// arduino.on('ready', function () {
	console.log('Placa pronta');
	io.on('connection', socket => { 
		startSending(socket);
		setPins();
		socket.on('setPins', pins => setPins(pins));
		// quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 
		socket.on('changingSetPoint', newSetPoint => changeSetPoint(socket, newSetPoint));	
	});
// });

// altera o atual set point 
function changeSetPoint(socket, newSetPoint) {
	console.log('Set point mudado para ' + newSetPoint);
	setPoint = newSetPoint;
	socket.broadcast.emit('changeSetPoint', setPoint); // enviando para todos clientes exceto o atual
}

// função para mudar canais do arduino 
// por padrão os canais são A0 e A1
function setPins(pins = ['A0','A1']) {
	// pot1 = new five.Sensor({ pin: pins[0], freq: 250 }); // primeiro potenciômetro
	// pot2 = new five.Sensor({ pin: pins[1], freq: 250 }); // segundo potenciômetro
	// arduino.repl.inject({ pot: pot1 });
	// arduino.repl.inject({ pot: pot2 });
	console.log(`Canais setados ${pins[0]} e ${pins[1]}`);
}

// faz o servidor começar a mandar os dados para os clientes 
function startSending(socket) {
	console.log('Mandando dados para ' + socket.id);
	// passar o setPoint atual para o novo usuário conectado
	socket.emit('changeSetPoint', setPoint);
	potSend(socket, pot1, 'v1');
	potSend(socket, pot2, 'v2');
}

// manda os dados dos potenciômetros 
function potSend(socket, pot, socketMsg) {
	// pot.on('data', () => {
		// setInterval(() => socket.emit(socketMsg, pot.value * 5 / 1024), 400);
		setInterval(() => socket.emit(socketMsg, Math.random() * 5), 400);
	// });
}

http.listen(port, () => console.log('Abrir em: http://localhost:' + port));