const { v4: uuidv4 } = require('uuid')
const { unitShop, compareUnits, calculateCasualties } = require('./units')
const { factionShop } = require('./factions')
const { calculateCellRange, terrainColorMap } = require('./functions')
const { veterancyMap } = require('./veterancy')

const DEFAULT_MEN_VALUE = 20

let rooms = {}

// EXAMPLE ROOM
let exampleRoom = {
  roomUuid: 'uuid',
  hostUuid: '',
  step: 1,
  // step 1 factions and users
  // step 2 units
  // step 3 initiative
  // step 4 board
  // step 5 play
  boardSize: {
    'rowNumber': 30,
    'columnNumber': 30,
  },
  board: {
  // 'C2': { terrainType: 'plain', terrainColor: '#000000', unitFullCode: '', unitIcon: '', factionIcon: '', veterancyIcon: '' },
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
  //   name: 'Karinia',
  //   stratAbility: 0
  // }],
  log: [],
  messages: [], // { timestamp: '', username: '', message: '' }
  unitShop: unitShop,
  units: [
    // { code: 'KAR-SPE-0', name: 'Spearman', veterancy: '0', identifier: '', factionCode: 'KAR, iconName: 'spearman.png', men: '20', hdPerMen: '2', maxHd: '40', hd: '40', casualties: 0, fatigue: 0, notes: '' },
    // { code: 'KAR-INF-1', name: 'Infantry', veterancy: '1', identifier: '', factionCode: 'KAR, iconName: 'infantry.png', men: '20', hdPerMen: '2', maxHd: '40', hd: '40', casualties: 0, fatigue: 0, notes: '' },
    // { code: 'CRI-ARC-1-A', name: 'Archer', veterancy: '1', identifier: 'A', factionCode: 'CRI', iconName: 'archer.png', men: '20', hdPerMen: '1', maxHd: '20', hd: '20', casualties: 0, fatigue: 0, notes: '' },
    // { code: 'CRI-ARC-1-B', name: 'Archer', veterancy: '1', identifier: 'B', factionCode: 'CRI', iconName: 'archer.png', men: '20', hdPerMen: '1', maxHd: '20', hd: '20', casualties: 0, fatigue: 0, notes: '' },
    // { code: 'CRI-ARC-2', name: 'Archer', veterancy: '2', identifier: '', factionCode: 'CRI', iconName: 'archer.png', men: '20', hdPerMen: '1', maxHd: '20', hd: '20', casualties: 0, fatigue: 0, notes: '' }
  ],
  users: [] // { userUuid: '', username: '', currentSocketId: '', faction: 'KAR', stratAbility: 0 }
}

// ROOM CRUD
const createRoom = (username, socketId) => {
  const roomUuid = uuidv4()
  const userUuid = uuidv4()
  rooms[roomUuid] = {
    roomUuid: roomUuid,
    hostUuid: userUuid,
    step: 1,
    boardSize: {
      'rowNumber': 30,
      'columnNumber': 30,
    },
    board: {},
    factionShop: factionShop,
    // faction strategic ability modifier FSAM
    // not present during creation, get set up during step 1
    factions: [],
    log: [],
    messages: [],
    unitShop: unitShop,
    units: [],
    users: [{
      userUuid: userUuid,
      username: username,
      currentSocketId: socketId,
      faction: '',
      stratAbility: 0
    }]
  }
  // commander strategic ability modifier: CSAM
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

const readRoomHost = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid].hostUuid
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readRoomHost`)
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

// STEPS
const nextStep = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // STEP MAX 5
    let currentStep = rooms[roomUuid].step
    if (currentStep <= 4) {
      rooms[roomUuid].step = currentStep + 1
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - nextStep`)
  }
}

const prevStep = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // STEP MIN 1
    let currentStep = rooms[roomUuid].step
    if (currentStep >= 2) {
      rooms[roomUuid].step = currentStep - 1
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - prevStep`)
  }
}

const readStep = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid].step
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readStep`)
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

const readBoardSize = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid].boardSize
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readBoardSize`)
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

const updateBoardSize = (roomUuid, boardSize) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    let prevRowNumber = rooms[roomUuid].boardSize['rowNumber']
    let prevColumnNumber = rooms[roomUuid].boardSize['columnNumber']
    rooms[roomUuid].boardSize['rowNumber'] = boardSize['rowNumber']
    rooms[roomUuid].boardSize['columnNumber'] = boardSize['columnNumber']
    createLog(roomUuid, `Board size updated from r:${prevRowNumber}, c:${prevColumnNumber} to r:${boardSize['rowNumber']}, c:${boardSize['columnNumber']}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateBoardSize`)
  }
}

const updateBoardTerrainZone = (uuid, terrain, zone) => {
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

const updateBoardTerrain = (roomUuid, startCell, endCell, terrainType) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const zone = calculateCellRange(startCell, endCell)
    let board = rooms[roomUuid].board
    zone.forEach(cell => {
      board[cell] = {
        ...board[cell],
        terrainType: terrainType,
        terrainColor: terrainColorMap[terrainType]
      }
    })
    createLog(roomUuid, `${terrainType} terrain type applied between cells ${startCell} and ${endCell}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateBoardTerrain`)
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
// const createFaction = (roomUuid, factionData) => {
//   // factionData: name, color, code, iconName
//   if (rooms.hasOwnProperty(roomUuid)) {
//     if (rooms[roomUuid].factions.some(f => f.code === factionData.code)) {
//       console.error(`# Faction already exists`)
//     } else {
//       rooms[roomUuid].push({
//         code: factionData.code,
//         color: factionData.color,
//         icon: factionData.iconName,
//         name: factionData.name,
//         stratAbility: ''
//       })
//     }
//   } else {
//     console.error(`# Couldn't find room ${roomUuid} - createFaction`)
//   }
// }

const addFaction = (roomUuid, factionCode) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    if (rooms[roomUuid].factions.some(f => f.code === factionCode)) {
      console.error(`# Faction already exists`)
    } else {
      let faction = factionShop.find(f => f.code === factionCode)
      rooms[roomUuid].factions.push({
        ...faction,
        stratAbility: 0
      })
      createLog(roomUuid, `Faction ${factionCode} added to room ${roomUuid}`)
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - addFaction`)
  }
}

const readFactions = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid].factions
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readFactions`)
  }
}

const readFactionStratAbility = (roomUuid, factionCode) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const factions = rooms[roomUuid].factions
    return factions.find(f => f.code === factionCode)?.stratAbility
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readFactionStratAbility`)
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

const updateFactionStratAbility = (roomUuid, factionCode, stratAbility) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // find faction
    const factions = rooms[roomUuid].factions
    let factionIndex = factions.findIndex(f => f.code === factionCode)
    // update strat ability
    rooms[roomUuid].factions[factionIndex].stratAbility = parseInt(stratAbility)
    createLog(roomUuid, `Faction ${factionCode} changed stratAbility to ${stratAbility}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateFactionStratAbility`)
  }
}

const updateFactionsStratAbility = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // Initialize an object to hold the maximum strat ability for each faction
  let factionStratAbilities = {}

  // Iterate through the users in the room
  rooms[roomUuid].users.forEach(u => {
    let userFaction = u.faction
    let userStratAbility = u.stratAbility

    // Check if the faction already has a recorded strat ability
    if (factionStratAbilities[userFaction] === undefined) {
      // If not, initialize it with the user's strat ability
      factionStratAbilities[userFaction] = userStratAbility
    } else {
      // If it does, update it to be the maximum of the current and the user's strat ability
      factionStratAbilities[userFaction] = Math.max(factionStratAbilities[userFaction], userStratAbility)
    }
  });

  // Update the factions in the room with the calculated strat abilities
  rooms[roomUuid].factions.forEach(f => {
    if (factionStratAbilities[f.code] !== undefined) {
      f.stratAbility = factionStratAbilities[f.code]
    } else {
      f.stratAbility = 0 // Default value if no users belong to the faction
    }
  })
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateFactionsStratAbility`)
  }
}

const removeFaction = (roomUuid, factionCode) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const factionIndex = rooms[roomUuid].factions.findIndex(f => f.code === factionCode)
    if (factionIndex !== -1) {
      rooms[roomUuid].factions.splice(factionIndex, 1)
      createLog(roomUuid, `Faction ${factionCode} removed from room ${roomUuid}`)
      // remove faction from users
      const users = rooms[roomUuid].users
      // TODO go through users and if it matches factionCode, change it to empty string
      users.forEach((u, i) => {
        if (u.faction === factionCode) {
          updateUserFaction(roomUuid, u.userUuid, '')
        }
      })
    } else {
      console.error(`# Faction doesn't exists`)
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - removeFaction`)
  }
}

// MESSAGE CRUD
const createMessage = (roomUuid, username, message) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    rooms[roomUuid].messages.push({ timestamp: new Date().getTime(), username: username, message: message })
  } else {
    console.error(`# Couldn't find room ${roomUuid} - createMessage`)
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
const addUnit = (roomUuid, factionCode, unitCode) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const unitShopItem = unitShop.find(u => u.code === unitCode)
    let newUnit = {
      unitCode: unitCode, // parameters
      name: unitShopItem.name, // unitShop
      veterancy: unitShopItem.veterancy, // unitShop
      identifier: '', // calculated below
      factionCode: factionCode, // parameters
      iconName: unitShopItem.icon, // unitShop
      men: DEFAULT_MEN_VALUE, // default value
      hdPerMen: unitShopItem.hdPerMen, // unitShop
      maxHd: parseInt(unitShopItem.hdPerMen) * DEFAULT_MEN_VALUE, // calculated
      hd: parseInt(unitShopItem.hdPerMen) * DEFAULT_MEN_VALUE, // calculated
      casualties: 0, // default value
      fatigue: 0, // default value
      notes: '', // empty
      initiativeRaw: null,
      initiative: null,
      coordinates: ''
    }
    // check if same unit type exists in faction
    const units = rooms[roomUuid].units
    const sameUnits = units.filter(u => u.unitCode === unitCode && u.factionCode === factionCode)
    // update identifier to all units of this type
    if (sameUnits.length === 1) {
      // only one unit without identifier, add A to it then B to the new one
      updateUnitIdentifier(roomUuid, unitCode, '', 'A')
      newUnit.identifier = 'B'
    } else if (sameUnits.length > 1) {
      // multiple units with existing identifiers
      // find the latest one and increment identifier
      // order the array
      sameUnits.sort((a, b) => {
        if (a.identifier < b.identifier) return -1
        if (a.identifier > b.identifier) return 1
        return 0
      })
      // find last id and get next one
      let lastIdentifier = sameUnits[sameUnits.length - 1].identifier
      newUnit.identifier = String.fromCharCode(lastIdentifier.charCodeAt(0) + 1)
    }
    // push unit
    rooms[roomUuid].units.push(newUnit)
    createLog(roomUuid, `Unit ${unitCode} ${newUnit.identifier === '' ? '' : `${newUnit.identifier} `}added to faction ${factionCode}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - addUnit`)
  }
}

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

const updateUnitIdentifier = (roomUuid, unitCode, oldIdentifier, newIdentifier) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // find unit
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.unitCode === unitCode && u.identifier === oldIdentifier)
    const factionCode = units[unitIndex].factionCode
    // update identifier
    rooms[roomUuid].units[unitIndex].identifier = newIdentifier
    createLog(roomUuid, `Unit ${unitCode} in faction ${factionCode} changed identifier ${oldIdentifier === '' ? '' : `from ${oldIdentifier}`}to ${newIdentifier}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitIdentifier`)
  }
}

const updateUnitMen = (roomUuid, factionCode, unitCode, identifier, men) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // find unit
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    const previousMen = units[unitIndex].men
    const previousMaxHd = units[unitIndex].maxHd
    // update identifier and calculate new max hd
    units[unitIndex].men = men
    const unitShopItem = unitShop.find(u => u.code === unitCode)
    units[unitIndex].maxHd = parseInt(men * unitShopItem.hdPerMen)
    createLog(roomUuid, `Unit ${unitCode} in faction ${factionCode} changed men value from ${previousMen} to ${men}`)
    createLog(roomUuid, `Unit ${unitCode} in faction ${factionCode} changed maxHd value from ${previousMaxHd} to ${men * unitShopItem.hdPerMen}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitMen`)
  }
}

const updateUnitsRawInitiative = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    // assign random numbers from 0 to 20 to each unit
    units.forEach(unit => {
      unit.initiativeRaw = Math.floor(Math.random() * 20) + 1
    })
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitsRawInitiative`)
  }
}

const updateUnitInitiative = (roomUuid, factionCode, unitCode, identifier, initiative) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    units[unitIndex].initiative = parseInt(initiative)
    units[unitIndex].initiativeRaw = null
    createLog(roomUuid, `Unit ${unitCode} in faction ${factionCode} changed initiative to ${initiative}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitInitiative`)
  }
}

const updateUnitCoordinates = (roomUuid, factionCode, unitCode, identifier, coordinates) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    const prevCoordinates = units[unitIndex].coordinates
    units[unitIndex].coordinates = coordinates
    // add unit in board cell
    const board = rooms[roomUuid].board
    const factions = rooms[roomUuid].factions
    board[coordinates] = {
      ...board[coordinates],
      unitFullCode: `${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`}`,
      unitIcon: units[unitIndex].iconName,
      factionIcon: factions.find(f => f.code === factionCode).icon,
      veterancyIcon: veterancyMap[parseInt(units[unitIndex].veterancy)].iconName
    }
    // board[coordinates].unitFullCode = `${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`}`
    // board[coordinates].unitIcon = units[unitIndex].iconName
    // board[coordinates].factionIcon = factions.find(f => f.code === factionCode).icon
    // board[coordinates].veterancyIcon = veterancyMap[parseInt(units[unitIndex].veterancy)]
    // remove unit from previous board cell
    if (prevCoordinates !== '') {
      board[prevCoordinates] = {
        ...board[prevCoordinates],
        unitFullCode: '',
        unitIcon: '',
        factionIcon: '',
        veterancyIcon: ''
      }
      // board[prevCoordinates].unitFullCode = ''
      // board[prevCoordinates].unitIcon = ''
      // board[prevCoordinates].factionIcon = ''
      // board[prevCoordinates].veterancyIcon = ''
    }
    createLog(roomUuid, `Unit ${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`} changed coordinates from ${prevCoordinates} to ${coordinates}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitCoordinates`)
  }
}

const updateUnitHd = (roomUuid, factionCode, unitCode, identifier, hd) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    const prevHd = units[unitIndex].hd
    units[unitIndex].hd = parseInt(hd)
    createLog(roomUuid, `Unit ${unitCode} in faction ${factionCode} changed hd from ${prevHd} to ${hd}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitHd`)
  }
}

const updateUnitFatigue = (roomUuid, factionCode, unitCode, identifier, fatigue) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    const prevFatigue = units[unitIndex].fatigue
    units[unitIndex].fatigue = parseInt(fatigue)
    createLog(roomUuid, `Unit ${unitCode} in faction ${factionCode} changed hd from ${prevFatigue} to ${fatigue}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitFatigue`)
  }
}

const updateUnitNotes = (roomUuid, factionCode, unitCode, identifier, notes) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    units[unitIndex].notes = notes
    createLog(roomUuid, `Unit ${unitCode} in faction ${factionCode} changed notes to ${notes}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitFatigue`)
  }
}

const removeUnit = (roomUuid, factionCode, unitCode, identifier) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const unitIndex = rooms[roomUuid].units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    if (unitIndex !== -1) {
      rooms[roomUuid].units.splice(unitIndex, 1)
      createLog(roomUuid, `Unit ${unitCode} ${identifier === '' ? '' : `${identifier} `}removed from faction ${factionCode}`)
      // Get units identifiers to update
      const unitsToUpdate = rooms[roomUuid].units.filter(u => u.factionCode === factionCode && u.unitCode === unitCode)
      unitsToUpdate.sort((a, b) => {
        if (a.identifier < b.identifier) return -1
        if (a.identifier > b.identifier) return 1
        return 0
      })

      // Update identifiers sequentially
      unitsToUpdate.forEach((u, i) => {
        u.identifier = String.fromCharCode('A'.charCodeAt(0) + i);
      })
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - removeUnit`)
  }
}

// USER CRUD
const createUser = (roomUuid, socketId, username) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    let userUuid = uuidv4()
    rooms[roomUuid].users.push({ userUuid: userUuid, username: username, currentSocketId: socketId, faction: '', stratAbility: 0 })
    createLog(roomUuid, `User ${userUuid} (${username}) joined`)
    return userUuid
  } else {
    console.error(`# Couldn't find room ${roomUuid} - createUser`)
  }
}

const readUsers = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    return rooms[roomUuid].users
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readUsers`)
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

const readUserFaction = (roomUuid, userUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const users = rooms[roomUuid].users
    return users.find(u => u.userUuid === userUuid)?.faction
  } else {
    console.error(`# Couldn't find room ${roomUuid} - readUserUuid`)
  }
}

const updateUserSocket = (roomUuid, userUuid, socketId) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // find user
    const users = rooms[roomUuid].users
    let userIndex = users.findIndex(u => u.userUuid === userUuid)
    let username = users[userIndex].username
    // update socket
    rooms[roomUuid].users[userIndex].currentSocketId = socketId
    createLog(roomUuid, `User ${userUuid} (${username}) reconnected`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUserSocket`)
  }
}

const updateUserFaction = (roomUuid, userUuid, factionCode) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // find user
    const users = rooms[roomUuid].users
    let userIndex = users.findIndex(u => u.userUuid === userUuid)
    if (userIndex === -1) console.error(`bro the index is negative`)
    let username = users[userIndex].username
    // update faction
    rooms[roomUuid].users[userIndex].faction = factionCode
    createLog(roomUuid, `User ${userUuid} (${username}) changed faction to ${factionCode === '' ? 'none' : factionCode}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUserFaction`)
  }
}

const updateUserStratAbility = (roomUuid, userUuid, stratAbility) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // find user
    const users = rooms[roomUuid].users
    let userIndex = users.findIndex(u => u.userUuid === userUuid)
    let username = users[userIndex].username
    // update strat ability
    rooms[roomUuid].users[userIndex].stratAbility = parseInt(stratAbility)
    createLog(roomUuid, `User ${userUuid} (${username}) changed stratAbility to ${stratAbility}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUserStratAbility`)
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

const disconnectUser = (roomUuid, userUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const userIndex = rooms[roomUuid].users.findIndex(u => u.userUuid === userUuid)
    if (userIndex !== -1) {
      let username = rooms[roomUuid].users[userIndex].username
      rooms[roomUuid].users[userIndex].currentSocketId = ''
      createLog(roomUuid, `User ${userUuid} (${username}) disconnected`)
    } else {
      console.error(`# Couldn't find user ${userUuid}`)
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - disconnectUser`)
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

const createLog = (roomUuid, log) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    rooms[roomUuid].log.push({ timestamp: new Date().getTime(), log: log })
    console.log(`[${roomUuid}] ${log}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - createLog`)
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

  nextStep,
  prevStep,
  readStep,

  readBoard,
  readBoardSize,
  updateBoard,
  updateBoardSize,
  updateBoardTerrain,
  updateBoardUnit,

  createUser,
  readUsers,
  readUsername,
  readUserUuid,
  readUserFaction,
  updateUserSocket,
  updateUserFaction,
  updateUserStratAbility,
  deleteUser,
  disconnectUser,

  addFaction,
  readFactions,
  readFactionStratAbility,
  updateFactions,
  updateFactionStratAbility,
  updateFactionsStratAbility,
  removeFaction,

  createMessage,
  readMessages,
  updateMessages,

  addUnit,
  readUnits,
  updateUnits,
  updateUnit,
  updateUnitMen,
  updateUnitsRawInitiative,
  updateUnitInitiative,
  updateUnitCoordinates,
  updateUnitHd,
  updateUnitFatigue,
  updateUnitNotes,
  removeUnit,

  readLog,

  updateFactionsUnits
}
