const express = require("express"); // importando o Express 
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http); // importando Socket.io
const jFive = require("johnny-five"); // importando o Johnny-five
const path = require('path'); // será utilizado para fazer o express reconhecer o caminho 
const port = 8080;

app.use(express.static(path.resolve(__dirname + "/../frontend"))); // atender requisições com pasta a frontend

(function main() {
	const arduino = new jFive.Board({ port: "/dev/ttyUSB0" });
	arduino.on('ready', function() {
		console.log('Arduino pronto');
		const analogSensor = new jFive.Sensor('A0', { freq: 250}); 
		io.on('connection', function(socket) { 
			console.log('Mandando dados para ' + socket.id);
			setInterval(function() {
				socket.emit('value', analogSensor.value)
			}, 100);
		});
		// ouvir na porta declarada 
		http.listen(port, function() {
			console.log('============ SISTEMA PRONTO ============');
			console.log(`   Abrir em: http://localhost:${port}`);
			console.log('>> ========================================');
		});
	});
})();