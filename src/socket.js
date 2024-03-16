const { Server } = require('socket.io')
const {
  createRoom,
  createUser,
  deleteUser,
  readRoom,
  readBoard,
  readBoardRows,
  readBoardColumns,
  updateBoard,
  updateBoardSize,
  updateFactions,
  readFactions,
  readMessages,
  updateMessages,
  createMessage,
  readUsername,
  readUnits,
  updateUnits,
  updateUnit,
  readLog,
  updateBoardTerrain,
  updateBoardUnit,
  updateFactionsUnits
} = require('./rooms')

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  // CONNECTION
  io.on('connection', (socket) => {
    console.info(`# User ${socket.id} connected`)

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
      createMessage(data.uuid, `System`, `${data.username} joined`)
      socket.emit('room-joined', readRoom(data.uuid))
      io.to(data.uuid).emit('message-sent', { messages: readMessages(data.uuid), log: readLog(data.uuid) })

      // DISCONNECTING
      socket.on('disconnecting', () => {
        deleteUser(data.uuid, socket.id)
        createMessage(data.uuid, `System`, `${data.username} left`)
        io.to(data.uuid).emit('message-sent', { messages: readMessages(data.uuid), log: readLog(data.uuid) })
      })
    })

    // BOARD
    socket.on('update-board', (data) => {
      // console.info(data.board)
      updateBoard(data.uuid, data.board)
      io.to(data.uuid).emit('board-updated', { board: readBoard(data.uuid), log: readLog(data.uuid) })
    })

    socket.on('update-board-size', (data) => {
      updateBoardSize(data.uuid, data.rows, data.columns)
      io.to(data.uuid).emit('board-size-updated', { rows: readBoardRows(data.uuid), columns: readBoardColumns(data.uuid), log: readLog(data.uuid) })
    })

    socket.on('update-board-terrain', (data) => {
      // update board terrain
      // indicate wich terrain and cell zone (single, line, square)
      updateBoardTerrain(data.uuid, data.terrain, data.zone)
      io.to(data.uuid).emit('board-terrain-updated', { board: readBoard(data.uuid), log: readLog(data.uuid) })
    })

    socket.on('update-board-unit', (data) => {
      updateBoardUnit(data.uuid, data.unitCode, data.startingCell, data.droppingCell)
      io.to(data.uuid).emit('board-unit-updated', { board: readBoard(data.uuid), log: readLog(data.uuid) })
    })

    // FACTIONS
    socket.on('update-factions', (data) => {
      updateFactions(data.uuid, data.factions)
      io.to(data.uuid).emit('factions-updated', { factions: readFactions(data.uuid), log: readLog(data.uuid) })
    })

    // MESSAGES
    socket.on('send-message', (data) => {
      createMessage(data.uuid, readUsername(data.uuid, socket.id), data.message)
      io.to(data.uuid).emit('message-sent', { messages: readMessages(data.uuid), log: readLog(data.uuid) })
    })

    // UNITS
    socket.on('update-units', (data) => {
      updateUnits(data.uuid, data.units)
      io.to(data.uuid).emit('units-updated', { units: readUnits(data.uuid), board: readBoard(data.uuid), log: readLog(data.uuid) })
    })

    socket.on('update-unit', (data) => {
      // for unit hd, casualties, fatigue, notes
      updateUnit(data.uuid, data.unitCode, data.unitData)
      io.to(data.uuid).emit('unit-updated', { units: readUnits(data.uuid), log: readLog(data.uuid) })
    })

    // UNIT MANAGER SUBMIT
    socket.on('update-factions-units', (data) => {
      updateFactionsUnits(data.uuid, data.factions, data.units)
      io.to(data.uuid).emit('factions-units-updated', { factions: readFactions(data.uuid), units: readUnits(data.uuid), board: readBoard(data.uuid), log: readLog(data.uuid) })
    })

    // DISCONNECT
    socket.on('disconnect', () => {
      console.info(`# User ${socket.id} disconnected`)
    })
  })
}
