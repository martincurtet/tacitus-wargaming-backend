const { v4: uuidv4 } = require('uuid')
const { unitShop, compareUnits, calculateCasualties } = require('./units')
const { factionShop } = require('./factions')

let rooms = {}

// EXAMPLE ROOM
let exampleRoom = {
  uuid: 'uuid',
  hostUuid: '',
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
  users: [] // { userUuid: '', username: '', currentSocketId: '' }
}

// ROOM CRUD
const createRoom = (username, socketId) => {
  const roomUuid = uuidv4()
  const userUuid = uuidv4()
  rooms[roomUuid] = {
    uuid: roomUuid,
    hostUuid: userUuid,
    board: {
    'rows': 12,
    'columns': 12,
    'drop-zone': [],
    },
    factionShop: factionShop,
    factions: [],
    log: [],
    messages: [],
    unitShop: unitShop,
    units: [],
    users: [{
      userUuid: userUuid,
      username: username,
      currentSocketId: socketId
    }]
  }
  // console.log(`# Room ${uuid} created`)
  createLog(roomUuid, `Room created`)
  createLog(roomUuid, `User ${userUuid} (${username}) joined`)
  return [roomUuid, userUuid]
}

const readRoom = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid]
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readRoom`)
  }
}

const readRoomHost = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].host
  } else {
    console.error(`# Couldn't find room ${uuid} - readRoomHost`)
  }
}

const deleteRoom = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    createLog(uuid, `Room deleted`)
    // will want to save it at some point
    delete rooms[uuid]
    // console.log(`# Room ${uuid} deleted`)
  } else {
    console.error(`# Couldn't find room ${uuid} - deleteRoom`)
  }
}

// BOARD CRUD
const readBoard = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].board
  } else {
    console.error(`# Couldn't find room ${uuid} - readBoard`)
  }
}

const readBoardRows = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].board['rows']
  } else {
    console.error(`# Couldn't find room ${uuid} - readBoardRows`)
  }
}

const readBoardColumns = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].board['columns']
  } else {
    console.error(`# Couldn't find room ${uuid} - readBoardColumns`)
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
    createLog(uuid, `Board terrain updated with ${terrain} terrain on zone: ${zone}`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoardTerrain`)
  }
}

const updateBoardUnit = (uuid, unitCode, startingCell, droppingCell) => {
  if (rooms.hasOwnProperty(uuid)) {
    let tempBoard = rooms[uuid].board
    // case 1 from drop-zone to cell
    if (startingCell === 'drop-zone') {
      tempBoard[droppingCell] = { ...tempBoard[droppingCell], unit: unitCode }
      tempBoard['drop-zone'].splice(tempBoard['drop-zone'].indexOf(unitCode), 1)
    }
    // case 2 from cell to drop-zone
    else if (droppingCell === 'drop-zone') {
      tempBoard['drop-zone'].push(unitCode)
      delete tempBoard[startingCell].unit
    }
    // case 3 from cell to cell
    else {
      tempBoard[droppingCell] = { ...tempBoard[droppingCell], unit: unitCode }
      delete tempBoard[startingCell].unit
    }
    createLog(uuid, `Unit ${unitCode} moved from ${startingCell} to ${droppingCell}`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateBoardUnit`)
  }
}

// FACTION CRUD
const readFactions = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].factions
  } else {
    console.error(`# Couldn't find room ${uuid} - readFactions`)
  }
}

const updateFactions = (uuid, factions) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].factions = factions
    createLog(uuid, `Factions updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateFactions`)
  }
}

// MESSAGE CRUD
const createMessage = (uuid, username, message) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].messages.push({ timestamp: new Date().getTime(), username: username, message: message })
  } else {
    console.error(`# Couldn't find room ${uuid} - createMessage`)
  }
}

const readMessages = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid].messages
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readMessages`)
  }
}

const updateMessages = (uuid, messages) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].messages = messages
    createLog(uuid, `Messages updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateMessages`)
  }
}

// UNIT CRUD
const readUnits = (uuid) => {
  if (rooms.hasOwnProperty(uuid)) {
    return rooms[uuid].units
  } else {
    console.error(`# Couldn't find room ${uuid} - readUnits`)
  }
}

const updateUnits = (uuid, units) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].units = units
    createLog(uuid, `Units updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateUnits`)
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
      if (oldUnit.casualties !== newUnit.casualties) {
        createLog(uuid, `Unit ${unitCode} updated ${comparison[0]} from ${comparison[1]} to ${comparison[2]} and casualties from ${oldUnit.casualties} to ${newUnit.casualties}`)
      } else {
        createLog(uuid, `Unit ${unitCode} updated ${comparison[0]} from ${comparison[1]} to ${comparison[2]}`)
      }
    }
  } else {
    console.error(`# Couldn't find room ${uuid} - updateUnit`)
  }
}

// USER CRUD
const createUser = (roomUuid, socketId, username) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    let userUuid = uuidv4()
    rooms[roomUuid].users.push({ userUuid: userUuid, username: username, currentSocketId: socketId })
    createLog(roomUuid, `User ${userUuid} (${username}) joined`)
    return userUuid
  } else {
    console.error(`# Couldn't find room ${roomUuid} - createUser`)
  }
}

const readUsername = (uuid, userId) => {
  if (rooms.hasOwnProperty(uuid)) {
    const users = rooms[uuid].users
    return users.find((u) => u.id === userId).username
  } else {
    console.error(`# Couldn't find room ${uuid} - readUsername`)
  }
}

const readUserUuid = (roomUuid, userUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const users = rooms[roomUuid].users
    return users.find((u) => u.userUuid === userUuid)?.userUuid
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readUserUuid`)
  }
}

const deleteUser = (roomUuid, userUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const userIndex = rooms[roomUuid].users.findIndex(u => u.userUuid === userUuid)
    if (userIndex !== -1) {
      let username = rooms[roomUuid].users[userIndex].username
      rooms[roomUuid].users.splice(userIndex, 1)[0]
      createLog(roomUuid, `User ${userUuid} (${username}) left`)
    } else {
      console.error(`# Couldn't find user ${userUuid}`)
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - deleteUser`)
  }
}

// LOG CRUD
const readLog = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid].log
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readLog`)
  }
}

const createLog = (uuid, log) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].log.push({ timestamp: new Date().getTime(), log: log })
    console.log(`[${uuid}] ${log}`)
  } else {
    console.error(`# Couldn't find room ${uuid} - createLog`)
  }
}

// UNIT MANAGER
const updateFactionsUnits = (uuid, factions, units) => {
  if (rooms.hasOwnProperty(uuid)) {
    rooms[uuid].factions = factions
    rooms[uuid].units = units
    units.map((u) => {
      rooms[uuid].board['drop-zone'].push(u.code)
    })
    createLog(uuid, `Factions, Units and Board updated`)
  } else {
    console.error(`# Couldn't find room ${uuid} - updateFactionsUnits`)
  }
}

module.exports = {
  rooms,
  createRoom,
  readRoom,
  readRoomHost,
  deleteRoom,

  readBoard,
  readBoardRows,
  readBoardColumns,
  updateBoard,
  updateBoardSize,
  updateBoardTerrain,
  updateBoardUnit,

  createUser,
  readUsername,
  readUserUuid,
  deleteUser,

  readFactions,
  updateFactions,

  createMessage,
  readMessages,
  updateMessages,

  readUnits,
  updateUnits,
  updateUnit,

  readLog,

  updateFactionsUnits
}
