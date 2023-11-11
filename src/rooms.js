const { v4: uuidv4 } = require('uuid')

let rooms = {}

// ROOM CRUD
const createRoom = () => {
  const uuid = uuidv4()
  rooms[uuid] = {
    uuid: uuid
  }
  console.log(`# Room ${uuid} created`)
  return uuid
}

const deleteRoom = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    delete rooms[uuid]
    console.log(`# Room ${uuid} was successfully deleted`)
  } else {
    console.error(`# Could not delete room ${uuid}`)
  }
}

const readRoom = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid]
  } else {
    console.error(`# Could not read room ${uuid}`)
  }
}

module.exports = {
  createRoom,
  deleteRoom,
  readRoom
}
