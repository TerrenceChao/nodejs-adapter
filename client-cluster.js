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
  var port = 80 // cluster.worker.id + PORT
  var io = require('socket.io-client')
  var ioClient = io.connect(`http://10.1.1.13:${port}`)
  var roomName = 'school'

  ioClient.on('seq-num', (msg) => console.info(msg))
  ioClient.on(`join room:${roomName}`, (msg) => console.info(msg))
  ioClient.emit('to-server', 'to server\'s message')
}
