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
  updateFactionsUnits,
  readRoomHost,
  readUserUuid
} = require('./rooms')

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  // CONNECTION
  io.on('connection', (socket) => {
    console.info(`# Connection ${socket.id} established`)

    // CREATE ROOM
    socket.on('create-room', (data) => {
      // data: { username }
      let username = data.username
      if (/^[a-zA-Z0-9]*$/.test(username) && username !== '') {
        const [roomUuid, userUuid] = createRoom(username, socket.id)
        socket.emit('room-created', { roomUuid: roomUuid, userUuid: userUuid, username: username, userColor: '#000000', isUserHost: 'true' })
      }
    })

    // JOIN ROOM
    socket.on('join-room', (data) => {
      // data: { roomUuid, userUuid, username }
      let userUuid = ''
      let isUserHost = false
      if (data.userUuid === '') {
        // New Player
        console.log('new player joining')
        userUuid = createUser(data.roomUuid, socket.id, data.username)
      } else {
        // Existing Player
        if (readUserUuid(data.roomUuid, data.userUuid) === undefined) {
        } else {
          userUuid = readUserUuid(data.roomUuid, data.userUuid)
        }
      }
      // Load Room Data
      socket.join(data.roomUuid)
      let mergedData = {
        ...readRoom(data.roomUuid),
        userUuid: userUuid,
        username: data.username,
        userColor: '#000000',
        isUserHost: isUserHost
      }
      socket.emit('room-joined', mergedData)
      createMessage(data.roomUuid, `System`, `${data.username} joined`)
      io.to(data.roomUuid).emit('message-sent', { messages: readMessages(data.roomUuid), log: readLog(data.roomUuid) })

      // DISCONNECTING
      socket.on('disconnecting', () => {
        // don't delete, put disconnected or something
        // deleteUser(data.roomUuid, userUuid)
        createMessage(data.roomUuid, `System`, `${data.username} left`)
        io.to(data.roomUuid).emit('message-sent', { messages: readMessages(data.roomUuid), log: readLog(data.roomUuid) })
      })
    })

    // SETUP STEPS
    socket.on('setup-factions', () => {
      // right after creating room, host chooses factions
      // players put themselves in factions

      // update factions
      // update players faction

      // emit faction and user data
    })

    socket.on('setup-units', () => {
      // players can be their own units on the factions
      // choose hd etc

      // update units
    })

    socket.on('setup-initiative', () => {
      // initiative
      // need to add datapoints in units
    })

    socket.on('setup-board', () => {
      // board updates
    })

    // GAMEPLAY

    // BOARD
    // socket.on('update-board', (data) => {
    //   // console.info(data.board)
    //   updateBoard(data.uuid, data.board)
    //   io.to(data.uuid).emit('board-updated', { board: readBoard(data.uuid), log: readLog(data.uuid) })
    // })

    // socket.on('update-board-size', (data) => {
    //   updateBoardSize(data.uuid, data.rows, data.columns)
    //   io.to(data.uuid).emit('board-size-updated', { rows: readBoardRows(data.uuid), columns: readBoardColumns(data.uuid), log: readLog(data.uuid) })
    // })

    // socket.on('update-board-terrain', (data) => {
    //   // update board terrain
    //   // indicate wich terrain and cell zone (single, line, square)
    //   updateBoardTerrain(data.uuid, data.terrain, data.zone)
    //   io.to(data.uuid).emit('board-terrain-updated', { board: readBoard(data.uuid), log: readLog(data.uuid) })
    // })

    // socket.on('update-board-unit', (data) => {
    //   updateBoardUnit(data.uuid, data.unitCode, data.startingCell, data.droppingCell)
    //   io.to(data.uuid).emit('board-unit-updated', { board: readBoard(data.uuid), log: readLog(data.uuid) })
    // })

    // FACTIONS
    // socket.on('update-factions', (data) => {
    //   updateFactions(data.uuid, data.factions)
    //   io.to(data.uuid).emit('factions-updated', { factions: readFactions(data.uuid), log: readLog(data.uuid) })
    // })

    // MESSAGES
    socket.on('send-message', (data) => {
      createMessage(data.uuid, readUsername(data.uuid, socket.id), data.message)
      io.to(data.uuid).emit('message-sent', { messages: readMessages(data.uuid), log: readLog(data.uuid) })
    })

    // UNITS
    // socket.on('update-units', (data) => {
    //   updateUnits(data.uuid, data.units)
    //   io.to(data.uuid).emit('units-updated', { units: readUnits(data.uuid), board: readBoard(data.uuid), log: readLog(data.uuid) })
    // })

    // socket.on('update-unit', (data) => {
    //   // for unit hd, casualties, fatigue, notes
    //   updateUnit(data.uuid, data.unitCode, data.unitData)
    //   io.to(data.uuid).emit('unit-updated', { units: readUnits(data.uuid), log: readLog(data.uuid) })
    // })

    // UNIT MANAGER SUBMIT
    // socket.on('update-factions-units', (data) => {
    //   updateFactionsUnits(data.uuid, data.factions, data.units)
    //   io.to(data.uuid).emit('factions-units-updated', { factions: readFactions(data.uuid), units: readUnits(data.uuid), board: readBoard(data.uuid), log: readLog(data.uuid) })
    // })

    // DISCONNECT
    socket.on('disconnect', () => {
      console.info(`# User ${socket.id} disconnected`)
    })
  })
}
