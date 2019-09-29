const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
// const five = require("johnny-five")
// const arduino = new five.Board({ port: "COM12" })
const port = 8000
let setPoint,
	v1,
	v2,
	controlBit = false,
	wasAltered;

app.use(express.static(__dirname + "/client"))

// arduino.on("ready", function () {
// console.log("Arduino Pronto")

// potenciometro = new five.Sensor({
//     pin: "A3",
//     freq: 250
// })

// arduino.repl.inject({
//     pot: potenciometro
// })

io.on(
	"connection",
	socket => {
		console.log("Nova conexão com o id:", socket.id)
		socket.on("connected", msg => {
			console.log(msg)
			// potenciometro.on('data', function () {
			setInterval(() => {
				v1 = Math.random() * 5
				v2 = Math.random() * 5
				socket.emit("controlBit", v1 > setPoint && v2 > setPoint ? 1 : 0)
				socket.emit("value1", v1)
				socket.emit("value2", v2)
			}, 300)
			// })
		})
		socket.on("setPoint", msg => {
			setPoint = msg
			console.log(`Set point alterado para: ${setPoint} volts`)
		})
	},
	1000
)
// })

http.listen(port, () => {
	console.log(`Servidor executando na porta: ${port}`)
	console.log(`abrir em: http://localhost:${port}`)
})
