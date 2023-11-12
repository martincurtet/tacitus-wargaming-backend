const { v4: uuidv4 } = require('uuid')

let rooms = {}

// ROOM CRUD
const createRoom = () => {
  const uuid = uuidv4()
  rooms[uuid] = {
    uuid: uuid,
    board: [],
    factions: [],
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
    console.error(`# Could find room ${uuid}`)
  }
}

const deleteRoom = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    createLog(uuid, `Room deleted`)
    delete rooms[uuid]
    console.log(`# Room ${uuid} deleted`)
  } else {
    console.error(`# Could find room ${uuid}`)
  }
}

// USER CRUD
const createUser = (uuid, userId, username) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].users.push({ id: userId, username: username })
    createLog(uuid, `User ${userId} joined room with username ${username}`)
  } else {
    console.error(`# Could find room ${uuid}`)
  }
}

const deleteUser = (uuid, userId) => {
  if (rooms.hasOwnProperty(uuid)) {
    const userIndex = rooms[uuid].users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      rooms[uuid].users.splice(userIndex, 1)[0]
      createLog(uuid, `User ${userId} left room`)
    } else {
      console.error(`# Could find user ${userId}`)
    }
  } else {
    console.error(`# Could find room ${uuid}`)
  }
}

// LOG CRUD
const createLog = (uuid, log) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].log.push({ timestamp: new Date().getTime(), log: log })
  } else {
    console.error(`# Could find room ${uuid}`)
  }
}

module.exports = {
  rooms,
  createRoom,
  readRoom,
  deleteRoom,
  createUser,
  deleteUser
}
