// var os = require('os')
// var io = require('socket.io')(3000)
// var redis = require('socket.io-redis')
// io.adapter(redis({host: 'localhost', port: 6379}))

// console.log(os.cpus().length)

var io = require('socket.io')
var server = io.listen(3000)
var redis = require('socket.io-redis')
server.adapter(redis({host: 'localhost', port: 6379}))

var roomName = 'school'

let sequenceNumberByClient = new Map()

// event fired every time a new client connects:
server.on('connection', (socket) => {
  console.info(`Client connected [id=${socket.id}]`)
  // initialize this client's sequence number
  sequenceNumberByClient.set(socket, 1)

  socket.join(roomName)

  // when socket disconnects, remove it from the list:
  socket.on('disconnect', () => {
    sequenceNumberByClient.delete(socket)
    console.info(`Client gone [id=${socket.id}]`)
  })

  socket.on('to-server', (msg) => {
    console.log(`from client: ${msg}`)
  })
})

// sends each client its current sequence number
setInterval(() => {
  for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
    client.emit('seq-num', sequenceNumber)
    client.to(roomName).emit(`join room:${roomName}`, `msg from skt id:${client.id}`)

    sequenceNumberByClient.set(client, sequenceNumber + 1)
  }
}, 10000)
