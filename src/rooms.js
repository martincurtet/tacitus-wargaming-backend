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
      { name: 'Karinia', color: '#ed1b24', icon: 'karinia.png' },
      { name: 'Crienica', color: '#800040', icon: 'crienica.png' },
      { name: 'The Confederation Below', color: '#808080', icon: 'confederation.png' },
      { name: 'Ostea', color: '#00a2e8', icon: 'ostea.png' }
    ],
    log: [],
    messages: [], // { timestamp: '', username: '', message: '' }
    units: [
      { name: 'Spearman', experience: 'Militia', color: '#ed1b24' },
      { name: 'Light Infantry', experience: 'Normal', color: '#ed1b24' },
      { name: 'Archer', experience: 'Normal', color: '#00a2e8' },
      { name: 'Archer', experience: 'Veteran', color: '#00a2e8' }
    ],
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

// FACTION CRUD
const readFactions = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].factions
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const updateFactions = (uuid, factions) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].factions = factions
    createLog(uuid, `Factions from room ${uuid} were updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

// MESSAGE CRUD
const createMessage = (uuid, username, message) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].messages.push({ timestamp: new Date().getTime(), username: username, message: message })
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const readMessages = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].messages
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const updateMessages = (uuid, messages) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].messages = messages
    createLog(uuid, `Messages from room ${uuid} were updated`)
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

const readUsername = (uuid, userId) => {
  if (rooms.hasOwnProperty(uuid)) {
    const users = rooms[uuid].users
    return users.find((u) => u.id === userId).username
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
  readUsername,
  deleteUser,

  readFactions,
  updateFactions,

  createMessage,
  readMessages,
  updateMessages
}
