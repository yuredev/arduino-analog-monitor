const express = require("express"); // importando o Express 
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http); // importando Socket.io
const five = require("johnny-five"); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 

const port = 8080;
app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend

let setPoint = null; // valor de setpoint passado pelo usuário 
let v1; // valor do primeiro potenciômetro
let v2; // valor do segundo potenciômetro
let controlBit 

// declarando Arduino na porta ao qual está conectado
// const arduino = new five.Board({ port: "COM6" });

// quando o arduino estiver pronto executar 
// arduino.on('ready', function () {
	// executa quando o cliente conectar 
	io.on('connection', socket => { 
		// receberá um array com os canais escolhidos pelo usuário 
		socket.on('setPins', pins => {
			// pot1 = new five.Sensor({ pin: pins[0], freq: 250 }); // primeiro potenciômetro
			// pot2 = new five.Sensor({ pin: pins[1], freq: 250 }); // segundo potenciômetro
			// arduino.repl.inject({ pot: pot1 });
			// arduino.repl.inject({ pot: pot2 });		
			console.log(pins[0]);
			console.log(pins[1]);
		});
		
		socket.on('clientReady', msg => {
			console.log('\nMandando dados para: ' + msg);
			console.log('Placa pronta');
			
			// na hora que um usuário se conectar, é preciso 
			// passar o set point para ele 
			socket.emit('changeSetPoint', setPoint);

			// quando receber um novo setPoint 
			socket.on('changingSetPoint', newSetPoint => {
				setPoint = newSetPoint;
				socket.broadcast.emit('changeSetPoint', setPoint);
			});
			// se potenciômetros estiverem ok, executar
			// pot1.on('data', () => {
				// setInterval(() => socket.emit('v1', pot1.value * 5 / 1024),400);
				setInterval(() => socket.emit('v1', Math.random() * 5));
			// });
			// pot2.on('data', () => {
				// setInterval(() => socket.emit('v2', pot2.value * 5 / 1024),400);
				setInterval(() => socket.emit('v2', Math.random() * 5));
			// });
		});
	});
// });
// ouvir na porta declarada 
http.listen(port, () => console.log('Abrir em: http://localhost:' + port));