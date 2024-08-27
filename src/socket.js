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
  readBoardSize,
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
  readUserFaction,
  updateFactionStratAbility,
  readFactionStratAbility,
  updateFactionsStratAbility,
  nextStep,
  readStep,
  addUnit,
  removeUnit,
  updateUnitMen,
  updateUnitsRawInitiative,
  updateUnitInitiative,
  updateUnitCoordinates,
  updateUnitHd,
  updateUnitFatigue,
  updateUnitNotes,
  updateUnitTypeInitiative,
  reorderUnitsByInitiative,
  killUnit,
  reviveUnit,
  updateBoardMarker,
  updateBoardFire,
  revertInitiativeChanges,
  removeMarkerUser,
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
        socket.emit('room-created', { roomUuid: roomUuid, userUuid: userUuid, username: username, userColor: '#000000', isHost: true, isSpectator: true })
      }
    })

    // JOIN ROOM
    socket.on('join-room', (data) => {
      // data: { roomUuid, userUuid, username }
      let roomUuid = data.roomUuid
      let userUuid = ''
      let userFaction = ''
      let isHost = false
      let isSpectator = false
      if (data.userUuid === '') {
        // New Player
        userUuid = createUser(roomUuid, socket.id, data.username)
      } else {
        // Existing Player
        if (readUserUuid(roomUuid, data.userUuid) !== undefined) {
          userUuid = readUserUuid(roomUuid, data.userUuid)
          updateUserSocket(roomUuid, userUuid, socket.id)
          isHost = userUuid === readRoomHost(roomUuid)
          userFaction = readUserFaction(roomUuid, data.userUuid)
          isSpectator = userFaction === ''
        }
      }
      // Load Room Data
      socket.join(roomUuid)
      let mergedData = {
        ...readRoom(roomUuid),
        userUuid: userUuid,
        username: data.username,
        userColor: '#000000',
        userFaction: userFaction,
        isHost: isHost,
        isSpectator: isSpectator
      }
      socket.emit('room-joined', mergedData)
      createMessage(roomUuid, `System`, `${data.username} joined`)
      io.to(roomUuid).emit('user-joined', { users: readUsers(roomUuid), messages: readMessages(roomUuid), log: readLog(roomUuid) })

      // DISCONNECTING
      socket.on('disconnecting', () => {
        disconnectUser(roomUuid, userUuid)
        createMessage(roomUuid, `System`, `${data.username} left`)
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
      if (currentUserFaction !== data.factionCode || data.factionCode === '') {
        updateUserFaction(data.roomUuid, data.userUuid, data.factionCode)
        updateFactionsStratAbility(data.roomUuid)
        io.to(data.roomUuid).emit('faction-assigned', { users: readUsers(data.roomUuid), factions: readFactions(data.roomUuid), log: readLog(data.roomUuid)})
      }
    })

    socket.on('change-strat-ability', (data) => {
      updateUserStratAbility(data.roomUuid, data.userUuid, data.stratAbility)
      updateFactionsStratAbility(data.roomUuid)
      io.to(data.roomUuid).emit('strat-ability-changed', { users: readUsers(data.roomUuid), factions: readFactions(data.roomUuid), log: readLog(data.roomUuid)})
    })

    // SETUP STEPS
    socket.on('next-step', (data) => {
      if (readStep(data.roomUuid) === 2) {
        // Going from Unit step to Initiative step
        updateUnitsRawInitiative(data.roomUuid)
      }
      if (readStep(data.roomUuid) === 3) {
        // Going from Initiative step to Board step
        reorderUnitsByInitiative(data.roomUuid)
      }
      nextStep(data.roomUuid)
      io.to(data.roomUuid).emit('step-next', { step: readStep(data.roomUuid), units: readUnits(data.roomUuid) })
    })

    // SETUP STEP 2 - UNITS
    socket.on('add-unit', (data) => {
      addUnit(data.roomUuid, data.factionCode, data.unitCode)
      io.to(data.roomUuid).emit('unit-added', { units: readUnits(data.roomUuid) })
    })

    socket.on('remove-unit', (data) => {
      removeUnit(data.roomUuid, data.factionCode, data.unitCode, data.identifier)
      io.to(data.roomUuid).emit('unit-removed', { units: readUnits(data.roomUuid) })
    })

    socket.on('change-men', (data) => {
      updateUnitMen(data.roomUuid, data.factionCode, data.unitCode, data.identifier, data.men)
      io.to(data.roomUuid).emit('men-changed', { units: readUnits(data.roomUuid) })
    })

    // SETUP STEP 3 - INITIATIVE
    socket.on('change-initiative', (data) => {
      updateUnitTypeInitiative(data.roomUuid, data.factionCode, data.unitCode, data.initiative, data.initiativeOrder)
      io.to(data.roomUuid).emit('initiative-changed', { units: readUnits(data.roomUuid) })
    })

    socket.on('revert-initiative', (data) => {
      revertInitiativeChanges(data.roomUuid, data.steps)
      io.to(data.roomUuid).emit('initiative-reverted', { units: readUnits(data.roomUuid), log: readLog(data.roomUuid) })
    })

    // SETUP STEP 4 - BOARD
    socket.on('update-board-size', (data) => {
      updateBoardSize(data.roomUuid, data.boardSize)
      io.to(data.roomUuid).emit('board-size-updated', { boardSize: readBoardSize(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('update-board-terrain', (data) => {
      updateBoardTerrain(data.roomUuid, data.startCell, data.endCell, data.terrainType)
      io.to(data.roomUuid).emit('board-terrain-updated', { board: readBoard(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('update-unit-coordinates', (data) => {
      const unitFullCodeSplit = data.unitFullCode.split('-')
      const factionCode = unitFullCodeSplit[0] || ''
      const unitCode = unitFullCodeSplit[1] || ''
      const identifier = unitFullCodeSplit[2] || ''
      updateUnitCoordinates(data.roomUuid, factionCode, unitCode, identifier, data.coordinates)
      io.to(data.roomUuid).emit('unit-coordinates-updated', { board: readBoard(data.roomUuid), units: readUnits(data.roomUuid), log: readLog(data.roomUuid) })
    })

    // GAMEPLAY
    socket.on('kill-unit', (data) => {
      killUnit(data.roomUuid, data.coordinates)
      io.to(data.roomUuid).emit('unit-killed', { board: readBoard(data.roomUuid), units: readUnits(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('revive-unit', (data) => {
      reviveUnit(data.roomUuid, data.factionCode, data.unitCode, data.identifier)
      io.to(data.roomUuid).emit('unit-revived', { board: readBoard(data.roomUuid), units: readUnits(data.roomUuid), log: readLog(data.roomUuid) })
    })

    // BOARD
    socket.on('toggle-marker', (data) => {
      updateBoardMarker(data.roomUuid, data.userUuid, data.coordinates)
      io.to(data.roomUuid).emit('marker-toggled', { board: readBoard(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('remove-markers', (data) => {
      removeMarkerUser(data.roomUuid, data.userUuid)
      io.to(data.roomUuid).emit('markers-removed', { board: readBoard(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('toggle-fire', (data) => {
      updateBoardFire(data.roomUuid, data.userUuid, data.coordinates)
      io.to(data.roomUuid).emit('fire-toggled', { board: readBoard(data.roomUuid), log: readLog(data.roomUuid) })
    })

    // UNITS
    socket.on('update-unit-hd', (data) => {
      updateUnitHd(data.roomUuid, data.factionCode, data.unitCode, data.identifier, data.hd)
      io.to(data.roomUuid).emit('unit-hd-updated', { units: readUnits(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('update-unit-fatigue', (data) => {
      updateUnitFatigue(data.roomUuid, data.factionCode, data.unitCode, data.identifier, data.fatigue)
      io.to(data.roomUuid).emit('unit-fatigue-updated', { units: readUnits(data.roomUuid), log: readLog(data.roomUuid) })
    })

    socket.on('update-unit-notes', (data) => {
      updateUnitNotes(data.roomUuid, data.factionCode, data.unitCode, data.identifier, data.notes)
      io.to(data.roomUuid).emit('unit-notes-updated', { units: readUnits(data.roomUuid), log: readLog(data.roomUuid) })
    })

    // MESSAGES
    socket.on('send-message', (data) => {
      createMessage(data.roomUuid, data.username, data.message)
      io.to(data.roomUuid).emit('message-sent', { messages: readMessages(data.roomUuid), log: readLog(data.roomUuid) })
    })

    // DISCONNECT
    socket.on('disconnect', () => {
      console.info(`# User ${socket.id} disconnected`)
    })
  })
}
