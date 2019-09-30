const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const five = require("johnny-five")
const arduino = new five.Board({ port: "COM6" })
const port = 8000
let setPoint, v1, v2

app.use(express.static(__dirname + "/client"))

arduino.on("ready", function () {
	console.log("Arduino Pronto")

	pot1 = new five.Sensor({ pin: "A1", freq: 250 })
	pot2 = new five.Sensor({ pin: "A3", freq: 250 })

	arduino.repl.inject({
		pot: pot1
	})
	arduino.repl.inject({
		pot: pot2
	})
	io.on("connection", socket => {
		console.log("Nova conexão com o id:", socket.id)
		socket.on("connected", msg => {
			console.log(msg)
			pot1.on('data', () => {
				setInterval(function () {
					v1 = pot1.value * 5 / 1024
					v2 = pot2.value * 5 / 1024
					socket.emit("value1", v1)
				}, 300)
			})
			pot2.on('data', function () {
				setInterval(function () {
					v2 = pot2.value * 5 / 1024
					socket.emit("value2", v2)
					socket.emit("controlBit", v1 > setPoint && v2 > setPoint ? 1 : 0)
				}, 300)
			})
		})
		socket.on("setPoint", msg => {
			setPoint = msg
			console.log(`Set point alterado para: ${setPoint} volts`)
		})
	}, 1000)
})

http.listen(port, () => {
	console.log(`Servidor executando na porta: ${port}`)
	console.log(`abrir em: http://localhost:${port}`)
})
