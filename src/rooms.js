const { v4: uuidv4 } = require('uuid')
const { unitShop, compareUnits, calculateCasualties } = require('./units')
const { factionShop } = require('./factions')

let rooms = {}

// ROOM CRUD
const createRoom = () => {
  const uuid = uuidv4()
  rooms[uuid] = {
    uuid: uuid,
    board: {
    'rows': 12,
    'columns': 12,
    'drop-zone': [],
    // 'C2': { unit: 'KAR-SPE-0' },
    // 'D2': { unit: 'KAR-INF-1' },
    // 'B7': { unit: 'CRI-ARC-1-A' },
    // 'D7': { unit: 'CRI-ARC-1-B' },
    // 'C8': { unit: 'CRI-ARC-2' },
    },
    factionShop: factionShop,
    factions: [],
    // factions: [{
    //   code: 'KAR',
    //   color: '#ed1b24',
    //   icon: 'karinia.png',
    //   name: 'Karinia'
    // }],
    log: [],
    messages: [], // { timestamp: '', username: '', message: '' }
    unitShop: unitShop,
    units: [
      // { code: 'KAR-SPE-0', name: 'Spearman', veterancy: '0', identifier: '', faction: 'Karinia', icon: 'spearman.png', men: '20', hdPerMen: '2', maxHd: '40', hd: '40', casualties: '0', fatigue: '0', notes: '' },
      // { code: 'KAR-INF-1', name: 'Infantry', veterancy: '1', identifier: '', faction: 'Karinia', icon: 'infantry.png', men: '20', hdPerMen: '2', maxHd: '40', hd: '40', casualties: '0', fatigue: '0', notes: '' },
      // { code: 'CRI-ARC-1-A', name: 'Archer', veterancy: '1', identifier: 'A', faction: 'Crienica', icon: 'archer.png', men: '20', hdPerMen: '1', maxHd: '20', hd: '20', casualties: '0', fatigue: '0', notes: '' },
      // { code: 'CRI-ARC-1-B', name: 'Archer', veterancy: '1', identifier: 'B', faction: 'Crienica', icon: 'archer.png', men: '20', hdPerMen: '1', maxHd: '20', hd: '20', casualties: '0', fatigue: '0', notes: '' },
      // { code: 'CRI-ARC-2', name: 'Archer', veterancy: '2', identifier: '', faction: 'Crienica', icon: 'archer.png', men: '20', hdPerMen: '1', maxHd: '20', hd: '20', casualties: '0', fatigue: '0', notes: '' }
    ],
    users: [] // { id: '', username: '' }
  }
  // console.log(`# Room ${uuid} created`)
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
    // will want to save it at some point
    delete rooms[uuid]
    // console.log(`# Room ${uuid} deleted`)
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

const readBoardRows = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].board['rows']
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

const readBoardColumns = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].board['columns']
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

const updateBoard = (uuid, board) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].board = board
    createLog(uuid, `Board updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

const updateBoardSize = (uuid, newRows, newColumns) => {
  if (rooms.hasOwnProperty(uuid)) {
    let oldRows = rooms[uuid].board['rows']
    let oldColumns = rooms[uuid].board['columns']
    rooms[uuid].board['rows'] = newRows
    rooms[uuid].board['columns'] = newColumns
    createLog(uuid, `Board size updated from r:${oldRows}, c:${oldColumns} to r:${newRows}, c:${newColumns}`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoardSize`)
  }
}

const updateBoardTerrain = (uuid, terrain, zone) => {
  if (rooms.hasOwnProperty(uuid)) {
    // zone is list of cells, need to paint the terrain
    // get board, add rules
    let tempBoard = rooms[uuid].board
    zone.forEach(cell => {
      tempBoard[cell] = { ...tempBoard[cell], terrain: terrain }
    })
    rooms[uuid].board = tempBoard
    createLog(uuid, `Board terrain updated with: ${terrain} on zone ${zone}`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoardSize`)
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
    createLog(uuid, `Factions updated`)
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
    createLog(uuid, `Messages updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

// UNIT CRUD
const readUnits = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].units
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const updateUnits = (uuid, units) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].units = units
    createLog(uuid, `Units updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

const updateUnit = (uuid, unitCode, unitData) => {
  if (rooms.hasOwnProperty(uuid)) {
    let oldUnit = rooms[uuid].units.find(u => u.code === unitCode)
    let newUnit = unitData

    let comparison = compareUnits(oldUnit, newUnit)
    if (comparison === null) {
      console.error(`# Error comparing the two units`)
    } else {
      newUnit.casualties = calculateCasualties(newUnit.hd, newUnit.maxHd, newUnit.veterancy).toString()
      let unitIndex = rooms[uuid].units.findIndex(u => u.code === unitCode)
      rooms[uuid].units[unitIndex] = newUnit
      createLog(uuid, `Unit ${unitCode} updated ${comparison[0]} from ${comparison[1]} to ${comparison[2]}`)
      if (oldUnit.casualties !== newUnit.casualties) {
        createLog(uuid, `Unit ${unitCode} updated casualties from ${oldUnit.casualties} to ${newUnit.casualties}`)
      }
    }
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoard`)
  }
}

// USER CRUD
const createUser = (uuid, userId, username) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].users.push({ id: userId, username: username })
    createLog(uuid, `User ${userId} (${username}) joined`)
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
      let username = rooms[uuid].users[userIndex].username
      rooms[uuid].users.splice(userIndex, 1)[0]
      createLog(uuid, `User ${userId} (${username}) left`)
    } else {
      console.error(`# Couldn't find user ${userId}`)
    }
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

// LOG CRUD
const readLog = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].log
  } else {
    console.error(`# Couldn't find room ${uuid}`)
  }
}

const createLog = (uuid, log) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].log.push({ timestamp: new Date().getTime(), log: log })
    console.log(`[${uuid}] ${log}`)
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
  readBoardRows,
  readBoardColumns,
  updateBoard,
  updateBoardSize,
  updateBoardTerrain,

  createUser,
  readUsername,
  deleteUser,

  readFactions,
  updateFactions,

  createMessage,
  readMessages,
  updateMessages,

  readUnits,
  updateUnits,
  updateUnit,

  readLog
}
