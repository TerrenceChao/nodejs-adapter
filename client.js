var io = require('socket.io-client')
var ioClient = io.connect('http://localhost:8089')
var roomName = 'school'

ioClient.on('seq-num', (msg) => console.info(msg))
ioClient.on(`join room:${roomName}`, (msg) => console.info(msg))
ioClient.emit('to-server', 'to server\'s message')