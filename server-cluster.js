var cluster = require('cluster')
var os = require('os')

if (cluster.isMaster) {
  for (var i = 0; i < os.cpus().length; i++) {
    cluster.fork().on('listening', (address) => {
      // console.log(JSON.stringify(address, null, 2))
      console.log(`worker: ${address.port} is listening`)
    })
  }
  cluster.on('exit', function (worker, code, signal) {
    console.log(`worker ${worker.process.pid} died`)
  })
}

if (cluster.isWorker) {
  const PORT = 3003
  var port = cluster.worker.id + PORT
  var io = require('socket.io')
  var server = io.listen(port)
  var redis = require('socket.io-redis')
  server.adapter(redis({
    host: 'localhost',
    port: 6379
  }))

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
}

// if (cluster.isWorker) {
//   var express = require('express')
//   var app = express()

//   var http = require('http')
//   var server = http.createServer(app)
//   var io = require('socket.io').listen(server)
//   var redis = require('socket.io-redis')

//   io.adapter(redis({host: 'localhost', port: 6379}))
//   io.on('connection', function (socket) {
//     socket.emit('data', `connected to worker: ${cluster.worker.id}`)
//   })

//   var port = PORT + cluster.worker.id
//   app.listen(port)
// }
