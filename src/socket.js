const { Server } = require('socket.io')
const { createRoom, readRoom, deleteRoom } = require('./rooms')

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  // CONNECTION
  io.on('connection', (socket) => {
    console.log(`# User connected`)

    // CREATE ROOM
    socket.on('create-room', () => {
      const uuid = createRoom()
      socket.emit('room-created', { uuid: uuid })
    })

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`# User disconnected`)
    })
  })
}
