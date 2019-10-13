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
// let pot1, pot2;
// quando o arduino estiver pronto executar 
// arduino.on('ready', function () {
	console.log('Placa pronta');
	io.on('connection', socket => { 
		startSending(socket);
		setPins();
		socket.on('setPins', pins => setPins(pins));
		// quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 
		socket.on('changingSetPoint', newSetPoint => changeSetPoint(newSetPoint, socket));	
	});
// });

// altera o atual set point 
function changeSetPoint(newSetPoint, socket) {
	console.log('Set point mudado para ' + newSetPoint);
	setPoint = newSetPoint;
	socket.broadcast.emit('changeSetPoint', setPoint); // enviando para todos clientes exceto o atual
}

function setPins(pins = ['A0','A1']) {
	// pot1 = new five.Sensor({ pin: pins[0], freq: 250 }); // primeiro potenciômetro
	// pot2 = new five.Sensor({ pin: pins[1], freq: 250 }); // segundo potenciômetro
	// arduino.repl.inject({ pot: pot1 });
	// arduino.repl.inject({ pot: pot2 });
	console.log(`Canais setados ${pins[0]} e ${pins[1]}`);
}

function startSending(socket) {
	console.log('Mandando dados para ' + socket.id);
	// passar o setPoint atual para o novo usuário conectado
	socket.emit('changeSetPoint', setPoint);
	// pot1.on('data', () => {
		// setInterval(() => socket.emit('v1', pot1.value * 5 / 1024), 400);
		setInterval(() => socket.emit('v1', Math.random() * 5), 400);
	// });
	// pot2.on('data', () => {
		// setInterval(() => socket.emit('v2', pot2.value * 5 / 1024), 400);
		setInterval(() => socket.emit('v2', Math.random() * 5), 400);
	// });
}

// ouvir na porta declarada 
http.listen(port, () => console.log('Abrir em: http://localhost:' + port));