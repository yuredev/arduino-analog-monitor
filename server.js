const express = require("express") // importando o Express 
const app = express()
const http = require("http").createServer(app) // criando servidor Express com o http
const io = require("socket.io")(http) // importando Socket.io
// const five = require("johnny-five") // importando o Johnny-five

const port = 8000
app.use(express.static(__dirname + "/client")) // atender requisições com pasta /client

// declarando Arduino na porta ao qual está conectado
// const arduino = new five.Board({ port: "COM6" })
let setPoint // valor de setpoint passado pelo usuário 
let v1 // valor do primeiro potenciômetro
let v2 // valor do segundo potenciômetro

// quando o arduino estiver pronto executar 
// arduino.on("ready", function () {
	console.log("Arduino Pronto")

	// pot1 = new five.Sensor({ pin: "A1", freq: 250 }) // primeiro potenciômetro
	// pot2 = new five.Sensor({ pin: "A3", freq: 250 }) // segundo potenciômetro

	// arduino.repl.inject({  // pesquisar
	// 	pot: pot1
	// })
	// arduino.repl.inject({ // pesquisar 
	// 	pot: pot2
	// })
	io.on("connection", socket => { // executa quando conectar 
		console.log("Nova conexão com o id:", socket.id)
		//  executar  quando recever a mensagem de retorno do cliente
		socket.on("connected", msg => {
			console.log(msg)
			// se potenciômetro 1 estiver ok, executar 
			// pot1.on('data', () => {
				setInterval(function () {
					v1 = Math.random() * 5
					// v1 = pot1.value * 5 / 1024 // pesquisar
					socket.emit("value1", v1) // mandar pro cliente
				}, 300)
			// })
			// se potenciômetro 2 estiver ok, executar 
			// pot2.on('data', function () {
				setInterval(function () {
					v2 = Math.random() * 5
					// v2 = pot2.value * 5 / 1024
					socket.emit("value2", v2)
					socket.emit("controlBit", v1 > setPoint && v2 > setPoint ? 1 : 0)
				}, 300)
			// })
		})
		// quando receber um novo setPoint 
		socket.on("setPoint", msg => {
			setPoint = msg
			console.log(`Set point alterado para: ${setPoint} volts`)
		})
	}, 1000) // pesquisar
// })

http.listen(port, () => { // ouvir na porta declarada 
	console.log(`Servidor executando na porta: ${port}`)
	console.log(`abrir em: http://localhost:${port}`)
})
