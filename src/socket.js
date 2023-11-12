const { Server } = require('socket.io')
const { createRoom, createUser, deleteUser, readRoom, readBoard, updateBoard } = require('./rooms')

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  // CONNECTION
  io.on('connection', (socket) => {
    console.log(`# User ${socket.id} connected`)

    // CREATE ROOM
    socket.on('create-room', () => {
      const uuid = createRoom()
      socket.emit('room-created', { uuid: uuid })
    })

    // JOIN ROOM
    // uuid, username
    socket.on('join-room', (data) => {
      createUser(data.uuid, socket.id, data.username)
      socket.join(data.uuid)
      console.log(`# User ${socket.id} (${data.username}) joined room ${data.uuid}`)
      socket.emit('room-joined', readRoom(data.uuid))

      // DISCONNECTING
      socket.on('disconnecting', () => {
        deleteUser(data.uuid, socket.id)
        console.log(`# User ${socket.id} left room ${data.uuid}`)
      })
    })

    // BOARD
    socket.on('update-board', (data) => {
      updateBoard(data.uuid, data.board)
      console.log(`# Board from room ${data.uuid} updated`)
      io.to(data.uuid).emit('board-updated', { board: readBoard(data.uuid) })
    })

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`# User ${socket.id} disconnected`)
    })
  })
}
