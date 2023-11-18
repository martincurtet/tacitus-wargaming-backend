const { v4: uuidv4 } = require('uuid')

let rooms = {}

// ROOM CRUD
const createRoom = () => {
  const uuid = uuidv4()
  rooms[uuid] = {
    uuid: uuid,
    board: {
    'rows': 8,
    'columns': 8
    },
    factions: [
      { name: 'faction1', color: '#ff4b4b' },
      { name: 'faction2', color: '#004777' }
    ],
    log: [],
    messages: [],
    units: [],
    users: [] // { id: '', username: '' }
  }
  console.log(`# Room ${uuid} created`)
  createLog(uuid, `Room created`)
  return uuid
}

const readRoom = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid]
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const deleteRoom = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    createLog(uuid, `Room deleted`)
    delete rooms[uuid]
    console.log(`# Room ${uuid} deleted`)
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

// BOARD CRUD
const readBoard = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].board
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const updateBoard = (uuid, board) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].board = board
    createLog(uuid, `Board from room ${uuid} was updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

// USER CRUD
const createUser = (uuid, userId, username) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].users.push({ id: userId, username: username })
    createLog(uuid, `User ${userId} joined room with username ${username}`)
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const deleteUser = (uuid, userId) => {
  if (rooms.hasOwnProperty(uuid)) {
    const userIndex = rooms[uuid].users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      rooms[uuid].users.splice(userIndex, 1)[0]
      createLog(uuid, `User ${userId} left room`)
    } else {
      console.error(`# Couldn't find user ${userId}`)
    }
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

// LOG CRUD
const createLog = (uuid, log) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].log.push({ timestamp: new Date().getTime(), log: log })
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

module.exports = {
  rooms,
  createRoom,
  readRoom,
  deleteRoom,
  readBoard,
  updateBoard,
  createUser,
  deleteUser
}
