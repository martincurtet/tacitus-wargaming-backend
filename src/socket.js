const { Server } = require('socket.io')
const {
  createRoom,
  createUser,
  readUsers,
  readUserUuid,
  updateUserFaction,
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
  addFaction,
  removeFaction,
  disconnectUser,
  updateUserSocket,
  updateUserStratAbility,
  readUserFaction
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
        socket.emit('room-created', { roomUuid: roomUuid, userUuid: userUuid, username: username, userColor: '#000000', isUserHost: true })
      }
    })

    // JOIN ROOM
    socket.on('join-room', (data) => {
      // data: { roomUuid, userUuid, username }
      let roomUuid = data.roomUuid
      let userUuid = ''
      let isUserHost = false
      if (data.userUuid === '') {
        // New Player
        userUuid = createUser(roomUuid, socket.id, data.username)
      } else {
        // Existing Player
        if (readUserUuid(roomUuid, data.userUuid) !== undefined) {
          userUuid = readUserUuid(roomUuid, data.userUuid)
          updateUserSocket(roomUuid, userUuid, socket.id)
          isUserHost = userUuid === readRoomHost(roomUuid)
        }
      }
      // Load Room Data
      socket.join(roomUuid)
      let mergedData = {
        ...readRoom(roomUuid),
        userUuid: userUuid,
        username: data.username,
        userColor: '#000000',
        isUserHost: isUserHost
      }
      socket.emit('room-joined', mergedData)
      createMessage(roomUuid, `System`, `${data.username} joined`)
      // io.to(roomUuid).emit('message-sent', { messages: readMessages(roomUuid), log: readLog(roomUuid) })
      io.to(roomUuid).emit('user-joined', { users: readUsers(roomUuid), messages: readMessages(roomUuid), log: readLog(roomUuid) })

      // DISCONNECTING
      socket.on('disconnecting', () => {
        disconnectUser(roomUuid, userUuid)
        createMessage(roomUuid, `System`, `${data.username} left`)
        // io.to(roomUuid).emit('message-sent', { messages: readMessages(roomUuid), log: readLog(roomUuid) })
        io.to(roomUuid).emit('user-left', { users: readUsers(roomUuid), messages: readMessages(roomUuid), log: readLog(roomUuid) })
      })
    })

    // SETUP STEP 1 - FACTION
    socket.on('add-faction', (data) => {
      addFaction(data.roomUuid, data.factionCode)
      io.to(data.roomUuid).emit('faction-added', { factions: readFactions(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('remove-faction', (data) => {
      removeFaction(data.roomUuid, data.factionCode)
      io.to(data.roomUuid).emit('faction-removed', { users: readUsers(data.roomUuid), factions: readFactions(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('assign-faction', (data) => {
      let currentUserFaction = readUserFaction(data.roomUuid, data.userUuid)
      if (currentUserFaction !== data.factionCode) {
        updateUserFaction(data.roomUuid, data.userUuid, data.factionCode)
        io.to(data.roomUuid).emit('faction-assigned', { users: readUsers(data.roomUuid), log: readLog(data.roomUuid)})
      }
    })

    socket.on('change-strat-ability', (data) => {
      updateUserStratAbility(data.roomUuid, data.userUuid, data.stratAbility)
      io.to(data.roomUuid).emit('strat-ability-changed', { users: readUsers(data.roomUuid), log: readLog(data.roomUuid)})
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
