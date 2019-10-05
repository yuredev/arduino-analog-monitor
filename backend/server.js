const express = require("express"); // importando o Express 
const app = express();
const http = require("http").createServer(app); // criando servidor Express com o http
const io = require("socket.io")(http); // importando Socket.io
const five = require("johnny-five"); // importando o Johnny-five
const path = require('path');

const port = 8080;
app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend

let setPoint; // valor de setpoint passado pelo usuário 
let v1; // valor do primeiro potenciômetro
let v2; // valor do segundo potenciômetro
let controlBit

// declarando Arduino na porta ao qual está conectado
const arduino = new five.Board({ port: "COM6" });

// quando o arduino estiver pronto executar 
arduino.on("ready", function () {
	console.log("Placa pronta");
	pot1 = new five.Sensor({ pin: "A0", freq: 250 }); // primeiro potenciômetro
	pot2 = new five.Sensor({ pin: "A1", freq: 250 }); // segundo potenciômetro

	arduino.repl.inject({ pot: pot1 });
	arduino.repl.inject({ pot: pot2 });
	// executa quando o cliente conectar 
	io.on("connection", socket => { 
		//  executar  quando receber a mensagem de retorno do cliente
		socket.on("connected", msg => {
			console.log('\nMandando dados para: ' + msg);
			// se potenciômetros estiverem ok, executar
			pot1.on('data', () => {
				pot2.on('data', () => {
					setInterval(() => {
						// v1 = Math.random() * 5 // quando estiver sem o Arduino 
						// v2 = Math.random() * 5 // quando estiver sem o Arduino 
						v1 = pot1.value * 5 / 1024; // conversão de 1024 bits para tensão 
						v2 = pot2.value * 5 / 1024; // conversão de 1024 bits para tensão 
						controlBit = (v1 > setPoint && v2 > setPoint) ? 1 : 0;
						socket.emit('values', {v1, v2, controlBit});
					}, 400);
				});
			});
		});
		// quando receber um novo setPoint 
		socket.on("changeSetPoint", msg => {
			setPoint = msg;
			console.log(`Set point alterado para: ${setPoint} volts`);
		});
	});
});
// ouvir na porta declarada 
http.listen(port, () => console.log('Abrir em: http://localhost:' + port));