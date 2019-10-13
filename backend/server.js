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
const arduino = new five.Board({ port: "COM6" });
let pot1, pot2;
// quando o arduino estiver pronto executar 
arduino.on('ready', function () {
	console.log('Placa pronta');
	io.on('connection', socket => { 
		socket.on('setPins', pins => {
			pot1 = new five.Sensor({ pin: pins[0], freq: 250 }); // primeiro potenciômetro
			pot2 = new five.Sensor({ pin: pins[1], freq: 250 }); // segundo potenciômetro
			arduino.repl.inject({ pot: pot1 });
			arduino.repl.inject({ pot: pot2 });		
			console.log('1° canal setado como ', pins[0]);
			console.log('2° canal setado como ', pins[1]);		
		});
		socket.on('clientReady', clientId => startSending(socket, clientId));	
	});
});

function startSending(socket, clientId) {
	console.log('Mandando dados para ' + clientId);
	// passar o setPoint atual para o novo usuário conectado
	socket.emit('changeSetPoint', setPoint);
	// quando receber um novo setPoint é necessário mandar o novo set para todos os clientes 
	socket.on('changingSetPoint', newSetPoint => {
		setPoint = newSetPoint;
		socket.broadcast.emit('changeSetPoint', setPoint); // enviando para todos clientes exceto o atual 
	});
	pot1.on('data', () => {
		setInterval(() => socket.emit('v1', pot1.value * 5 / 1024),400);
		// setInterval(() => socket.emit('v1', Math.random() * 5), 400);
	});
	pot2.on('data', () => {
		setInterval(() => socket.emit('v2', pot2.value * 5 / 1024),400);
		// setInterval(() => socket.emit('v2', Math.random() * 5), 400);
	});
}

// ouvir na porta declarada 
http.listen(port, () => console.log('Abrir em: http://localhost:' + port));



