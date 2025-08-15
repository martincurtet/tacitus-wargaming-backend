const { v4: uuidv4 } = require('uuid')
const { unitShop, compareUnits, calculateCasualties } = require('./units')
const { factionShop } = require('./factions')
const { calculateCellRange, findClosestFreeTile, assignUserColor } = require('./functions')
const { veterancyMap } = require('./veterancy')

const DEFAULT_MEN_VALUE = 20

let rooms = {}

// TERRAIN HELPERS
const BASE_TOKENS = new Set([
  'plains', 'forest', 'mud', 'jungle', 'undergrowth', 'marsh', 'shallow-water', 'deep-water', 'road'
])
const OVERLAY_TOKENS = new Set([
  'high-ground', 'high-ground-2', 'low-ground', 'low-ground-2', 'impassable-r', 'impassable-b', 'fire'
])

const normalizeTerrainString = (input) => {
  if (input === undefined || input === null) return ''
  const raw = String(input).trim()
  // Compatibility: treat empty string as a clear request
  if (raw === '') return 'clear'
  const delimiterNormalized = raw.replace(/,/g, '+')
  if (delimiterNormalized.toLowerCase() === 'clear') return 'clear'
  const tokens = delimiterNormalized.split('+').map(t => t.trim()).filter(Boolean)
  // de-duplicate while preserving order
  const seen = new Set()
  const ordered = []
  for (const token of tokens) {
    if (!seen.has(token)) {
      seen.add(token)
      ordered.push(token)
    }
  }
  return ordered.join('+')
}

const clearOverlayTokens = (terrainString) => {
  if (!terrainString) return ''
  const delimiterNormalized = String(terrainString).replace(/,/g, '+')
  const tokens = delimiterNormalized.split('+').map(t => t.trim()).filter(Boolean)
  // Keep only recognized base tokens; remove overlays and any unknown tokens
  const baseTokensOnly = tokens.filter(t => BASE_TOKENS.has(t))
  return baseTokensOnly.join('+')
}

const ensureTerrainMigration = (roomUuid) => {
  const room = rooms[roomUuid]
  if (!room || room.__terrainMigrated) return
  const board = room.board || {}
  for (const cell in board) {
    if (!Object.prototype.hasOwnProperty.call(board, cell)) continue
    const tile = board[cell] || {}
    const hasTokens = typeof tile.terrainType === 'string' && tile.terrainType.trim() !== ''
    if (!hasTokens && tile.impassable === true) {
      board[cell] = {
        ...tile,
        terrainType: 'high-ground'
      }
    }
  }
  room.__terrainMigrated = true
}

// Simple per-room FIFO queue to serialize terrain updates (last-write-wins by arrival order)
const roomUpdateQueues = new Map()

const enqueueRoomTask = (roomUuid, task) => {
  const previous = roomUpdateQueues.get(roomUuid) || Promise.resolve()
  const next = previous.then(() => task()).catch((err) => {
    console.error(`# Room ${roomUuid} task error`, err)
  })
  roomUpdateQueues.set(roomUuid, next)
  return next
}

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
  //   stratAbility: parseInt(process.env.DEFAULT_STRAT_ABILITY || 3)
  // }],
  initiativeHistory: [],
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
    initiativeHistory: [],
    log: [],
    messages: [],
    unitShop: unitShop,
    units: [],
    users: [{
      userUuid: userUuid,
      username: username,
      userColor: assignUserColor([]),
      currentSocketId: socketId,
      faction: '',
      stratAbility: parseInt(process.env.DEFAULT_STRAT_ABILITY || 3)
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
      createLog(roomUuid, `Step ${currentStep} complete, moving to step ${currentStep+1}`)
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
      createLog(roomUuid, `Moving back to step ${currentStep-1}`)
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
    // one-time backward compatibility migration
    ensureTerrainMigration(uuid)
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

const updateBoardSize = (roomUuid, boardSize) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const rowNumber = Math.max(1, Math.min(100, boardSize['rowNumber']));
    const columnNumber = Math.max(1, Math.min(100, boardSize['columnNumber']));
    let prevRowNumber = rooms[roomUuid].boardSize['rowNumber']
    let prevColumnNumber = rooms[roomUuid].boardSize['columnNumber']
    rooms[roomUuid].boardSize['rowNumber'] = rowNumber
    rooms[roomUuid].boardSize['columnNumber'] = columnNumber
    createLog(roomUuid, `Board size updated from r:${prevRowNumber}, c:${prevColumnNumber} to r:${rowNumber}, c:${columnNumber}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateBoardSize`)
  }
}

const updateBoardTerrain = (roomUuid, startCell, endCell, terrainType) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const zone = calculateCellRange(startCell, endCell)
    let board = rooms[roomUuid].board
    const normalized = normalizeTerrainString(terrainType)
    // Diagnostics: log normalized
    console.log(`[updateBoardTerrain] normalized`, { roomUuid, startCell, endCell, normalized })
    let loggedOneCell = false
    zone.forEach(cell => {
      const prevTile = board[cell] || {}
      if (normalized === 'clear') {
        // Remove overlay tokens only, preserve base tokens
        const cleared = clearOverlayTokens(prevTile.terrainType || '')
        board[cell] = {
          ...prevTile,
          terrainType: cleared,
          fire: false
        }
        if (!loggedOneCell) {
          console.log(`[updateBoardTerrain] clear cell`, {
            roomUuid,
            startCell,
            endCell,
            normalized,
            cell,
            before: prevTile.terrainType || '',
            after: board[cell].terrainType || '',
            prevFire: prevTile.fire === true,
            nextFire: board[cell].fire === true
          })
          loggedOneCell = true
        }
      } else {
        // Parse existing tokens
        const existingTokens = (prevTile.terrainType || '').replace(/,/g, '+').split('+').map(t => t.trim()).filter(Boolean)
        // Separate existing base and overlays (keep unknowns as-is)
        let existingBase = existingTokens.find(t => BASE_TOKENS.has(t)) || ''
        const existingOverlays = existingTokens.filter(t => !BASE_TOKENS.has(t))

        // Parse incoming tokens
        const incomingTokens = normalized.split('+').map(t => t.trim()).filter(Boolean)
        const incomingBaseTokens = incomingTokens.filter(t => BASE_TOKENS.has(t))
        const incomingOverlayTokens = incomingTokens.filter(t => OVERLAY_TOKENS.has(t))

        // Base: if any base token is provided, replace base with the first provided
        let nextBase = existingBase
        let nextOverlays = [...existingOverlays]
        let nextFire = prevTile.fire === true

        // Base replace: if any base token present in input, set it
        if (incomingBaseTokens.length >= 1) {
          nextBase = incomingBaseTokens[0]
        }

        // Overlays additive: add provided overlay tokens; set fire if included
        for (const tok of incomingOverlayTokens) {
          if (tok === 'fire') {
            nextFire = true
            continue
          }
          if (!nextOverlays.includes(tok)) nextOverlays.push(tok)
        }

        // Deduplicate and rebuild terrainType without 'fire'
        const resultTokens = []
        if (nextBase) resultTokens.push(nextBase)
        const seen = new Set()
        for (const tok of nextOverlays) {
          if (tok === 'fire') continue
          if (!seen.has(tok)) {
            seen.add(tok)
            resultTokens.push(tok)
          }
        }

        board[cell] = {
          ...prevTile,
          terrainType: resultTokens.join('+'),
          fire: nextFire
        }
        if (!loggedOneCell) {
          console.log(`[updateBoardTerrain] set cell`, {
            roomUuid,
            startCell,
            endCell,
            normalized,
            cell,
            before: prevTile.terrainType || '',
            after: board[cell].terrainType || '',
            prevFire: prevTile.fire === true,
            nextFire: board[cell].fire === true
          })
          loggedOneCell = true
        }
      }
    })
    createLog(roomUuid, `${normalized} terrain type applied between cells ${startCell} and ${endCell}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateBoardTerrain`)
  }
}

// Public async API to serialize terrain updates per room
const queueBoardTerrainUpdate = async (roomUuid, startCell, endCell, terrainType) => {
  await enqueueRoomTask(roomUuid, () => {
    updateBoardTerrain(roomUuid, startCell, endCell, terrainType)
  })
}

const updateBoardMarker = (roomUuid, userUuid, coordinates) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const board = rooms[roomUuid].board
    const users = rooms[roomUuid].users

    const userIndex = users.findIndex(u => u.userUuid === userUuid)
    if (userIndex === -1) return
    if (board.hasOwnProperty(coordinates)) {
      if (board[coordinates].markerColor === users[userIndex].userColor) {
        // Case 3: Cell has marker of same user
        board[coordinates] = {
          ...board[coordinates],
          markerColor: '',
          markerUserUuid: ''
        }
        createLog(roomUuid, `Marker removed on cell ${coordinates} by user ${users[userIndex].username}`)
      } else {
        // Case 2: Cell has marker of another user
        board[coordinates] = {
          ...board[coordinates],
          markerColor: users[userIndex].userColor,
          markerUserUuid: userUuid
        }
        createLog(roomUuid, `Marker overwrote on cell ${coordinates} by user ${users[userIndex].username}`)
      }
    } else {
      // Case 1: Cell is empty
      board[coordinates] = {
        ...board[coordinates],
        markerColor: users[userIndex].userColor,
        markerUserUuid: userUuid
      }
      createLog(roomUuid, `Marker placed on cell ${coordinates} by user ${users[userIndex].username}`)
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateBoardMarker`)
  }
}

const updateBoardFire = (roomUuid, userUuid, coordinates) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const users = rooms[roomUuid].users
    const userIndex = users.findIndex(u => u.userUuid === userUuid)
    const board = rooms[roomUuid].board
    const currentFire = board[coordinates]?.fire
    board[coordinates] = {
      ...board[coordinates],
      fire:!currentFire
    }
    createLog(roomUuid, `Fire toggled${currentFire ? ' off' : ' on'} on cell ${coordinates} by user ${users[userIndex].username}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateBoardFire`)
  }
}

const removeMarkerUser = (roomUuid, userUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const board = rooms[roomUuid].board
    const users = rooms[roomUuid].users
    const userIndex = users.findIndex(u => u.userUuid === userUuid)
    if (userIndex === -1) return

    for (const coordinates in board) {
      if (board.hasOwnProperty(coordinates)) {
        if (board[coordinates].markerUserUuid === userUuid) {
          board[coordinates].markerColor = ''
          board[coordinates].markerUserUuid = ''
        }
      }
    }
    createLog(roomUuid, `All markers removed for user ${users[userIndex].username}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - removeMarkerUser`)
  }
}

// FACTION CRUD
const addFaction = (roomUuid, factionCode) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    if (rooms[roomUuid].factions.some(f => f.code === factionCode)) {
      console.error(`# Faction already exists`)
    } else {
      let faction = factionShop.find(f => f.code === factionCode)
      rooms[roomUuid].factions.push({
        ...faction,
        stratAbility: parseInt(process.env.DEFAULT_STRAT_ABILITY || 3)
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
      f.stratAbility = parseInt(process.env.DEFAULT_STRAT_ABILITY || 3) // Default value if no users belong to the faction
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

// UNIT CRUD
const addUnit = (roomUuid, factionCode, unitCode) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    // Check if faction is full (100 units)
    if (units.filter(u => u.factionCode === factionCode).length >= 100) return
    // get unit information
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
      initiativeOrder: null,
      coordinates: '',
      deathCoordinates: '',
      isAlive: true,
      fire: false,
      fontColor: unitShopItem.fontColor // unitShop
    }
    // check if same unit type exists in faction
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
    createLog(roomUuid, `Unit ${unitCode}${newUnit.identifier === '' ? '' : `-${newUnit.identifier} `}added to faction ${factionCode}`)
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

const updateUnitIdentifier = (roomUuid, unitCode, oldIdentifier, newIdentifier) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // find unit
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.unitCode === unitCode && u.identifier === oldIdentifier)
    const factionCode = units[unitIndex].factionCode
    // update identifier
    rooms[roomUuid].units[unitIndex].identifier = newIdentifier
    createLog(roomUuid, `Unit ${factionCode}-${unitCode} changed identifier ${oldIdentifier === '' ? '' : `from ${oldIdentifier}`}to ${newIdentifier}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitIdentifier`)
  }
}

const updateUnitMen = (roomUuid, factionCode, unitCode, identifier, men) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    // min max value of men
    const menValue = men
    if (men < 1) menValue = 1
    if (men > 99999) menValue = 99999
    // find unit
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    const previousMen = units[unitIndex].men
    const previousMaxHd = units[unitIndex].maxHd
    // update identifier and calculate new max hd
    units[unitIndex].men = menValue
    const unitShopItem = unitShop.find(u => u.code === unitCode)
    units[unitIndex].maxHd = parseInt(menValue * unitShopItem.hdPerMen)
    units[unitIndex].hd = parseInt(menValue * unitShopItem.hdPerMen)
    createLog(roomUuid, `Unit ${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`} changed men value from ${previousMen} to ${menValue}`)
    createLog(roomUuid, `Unit ${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`} changed maxHd value from ${previousMaxHd} to ${menValue * unitShopItem.hdPerMen}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitMen`)
  }
}

const updateUnitsRawInitiative = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const initiativeMap = {}
    units.forEach(unit => {
      const unitType = `${unit.factionCode}-${unit.unitCode}`
      if (!initiativeMap.hasOwnProperty(unitType)) {
        initiativeMap[unitType] = Math.floor(Math.random() * 20) + 1
      }
      unit.initiativeRaw = initiativeMap[unitType]
    })
    createLog(roomUuid, `Units raw initiative assigned`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitsRawInitiative`)
  }
}

const updateUnitTypeInitiative = (roomUuid, factionCode, unitCode, initiative, initiativeOrder) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units

    // update other units
    units.forEach(unit => {
      if (
        unit.initiative === parseInt(initiative) &&
        `${unit.factionCode}-${unit.unitCode}` !== `${factionCode}-${unitCode}` &&
        unit.initiativeOrder >= parseInt(initiativeOrder)
      ) {
        console.log(`${unit.factionCode}-${unit.unitCode} increase initiativeOrder from ${unit.initiativeOrder} to ${unit.initiativeOrder+1}`)
        unit.initiativeOrder = unit.initiativeOrder + 1
      }
    })

    // update this unitType units
    let unitTypeInitiativeRaw
    units.forEach(unit => {
      if (unit.factionCode === factionCode && unit.unitCode === unitCode) {
        unit.initiative = parseInt(initiative)
        unitTypeInitiativeRaw = unit.initiativeRaw
        unit.initiativeRaw = null,
        unit.initiativeOrder = parseInt(initiativeOrder)
      }
    })

    // reorder
    units.sort((a, b) => {
      if (a.initiative !== b.initiative) {
        return a.initiative - b.initiative
      }

      if (a.initiativeOrder !== b.initiativeOrder) {
        return a.initiativeOrder - b.initiativeOrder
      }

      if (a.identifier < b.identifier) {
        return -1
      } else if (a.identifier > b.identifier) {
        return 1
      }

      return 0
    })

    // update history
    rooms[roomUuid].initiativeHistory.push({
      unitType: `${factionCode}-${unitCode}`,
      initiativeRaw: unitTypeInitiativeRaw,
      initiative: parseInt(initiative),
      initiativeOrder: parseInt(initiativeOrder)
    })

    createLog(roomUuid, `Unit type ${factionCode}-${unitCode} changed initiative to ${initiative} (order: ${initiativeOrder})`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitTypeInitiative`)
  }
}

const revertInitiativeChanges = (roomUuid, steps = 1) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const initiativeHistory = rooms[roomUuid].initiativeHistory

    if (initiativeHistory.length === 0) return

    const revertSteps = steps === 'all' ? initiativeHistory.length : Math.min(steps, initiativeHistory.length);

    for (let i = 0; i < revertSteps; i++) {
      const lastEntry = initiativeHistory.pop()

      // Restore initiative and initiativeOrder for the target unit type
      units.forEach(unit => {
        if (`${unit.factionCode}-${unit.unitCode}` === lastEntry.unitType) {
          unit.initiative = null
          unit.initiativeRaw = lastEntry.initiativeRaw
          unit.initiativeOrder = null // Reset the initiativeOrder for this unit type
        }
      })
  
      // Adjust initiativeOrder for other units with the same initiative value
      units.forEach(unit => {
        if (
          unit.initiative === lastEntry.initiative &&
          unit.initiativeOrder > lastEntry.initiativeOrder
        ) {
          unit.initiativeOrder -= 1 // Decrement the initiativeOrder to fill the gap
        }
      })

      createLog(roomUuid, `Reverted initiative change for ${lastEntry.unitType} from ${lastEntry.initiative} to previous value ${lastEntry.initiativeRaw}`);
    }
  } else {
    console.error(`# Couldn't find room ${roomUuid} - revertInitiativeChanges`)
  }
}


const reorderUnitsByInitiative = (roomUuid) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    rooms[roomUuid].units.sort((a, b) => b.initiative - a.initiative)
    console.log(roomUuid, `Units have been reordered by initiative`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - reorderUnitsByInitiative`)
  }
}

const updateUnitCoordinates = (roomUuid, factionCode, unitCode, identifier, coordinates) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const board = rooms[roomUuid].board
    const factions = rooms[roomUuid].factions

    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    const unit = units[unitIndex]
    const prevCoordinates = unit.coordinates
    unit.coordinates = coordinates

    // add unit in board cell
    board[coordinates] = {
      ...board[coordinates],
      unitFullCode: `${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`}`,
      unitIcon: unit.iconName,
      unitIdentifier: unit.identifier,
      factionIcon: factions.find(f => f.code === factionCode).icon,
      veterancyIcon: veterancyMap[parseInt(unit.veterancy)].iconName,
      identifier: unit.identifier,
      identifierColor: unit.fontColor
    }

    // remove unit from previous board cell
    if (prevCoordinates !== '') {
      board[prevCoordinates] = {
        ...board[prevCoordinates],
        unitFullCode: '',
        unitIcon: '',
        unitIdentifier: '',
        factionIcon: '',
        veterancyIcon: '',
        identifier: '',
        identifierColor: ''
      }

      unit.fire = board[coordinates].fire
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
    const prevCasualties = units[unitIndex].casualties
    const casualties = calculateCasualties(parseInt(hd), parseInt(units[unitIndex].maxHd), parseInt(units[unitIndex].veterancy))
    units[unitIndex].casualties = casualties
    createLog(roomUuid, `Unit ${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`} changed hd from ${prevHd} to ${hd} ${casualties === 0 ? '' : `and casualties from ${prevCasualties} to ${casualties}`}`)
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
    createLog(roomUuid, `Unit ${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`} changed fatigue from ${prevFatigue} to ${fatigue}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitFatigue`)
  }
}

const updateUnitNotes = (roomUuid, factionCode, unitCode, identifier, notes) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    units[unitIndex].notes = notes
    createLog(roomUuid, `Unit ${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`} changed notes to ${notes}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - updateUnitFatigue`)
  }
}

const killUnit = (roomUuid, coordinates) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const board = rooms[roomUuid].board

    const unitIndex = units.findIndex(u => u.coordinates === coordinates)
    if (unitIndex === -1) return
    units[unitIndex].isAlive = false
    units[unitIndex].deathCoordinates = units[unitIndex].coordinates
    units[unitIndex].coordinates = ''
    board[coordinates] = {
      ...board[coordinates],
      unitFullCode: '',
      unitIcon: '',
      factionIcon: '',
      veterancyIcon: ''
    }
    createLog(roomUuid, `Unit ${units[unitIndex].factionCode}-${units[unitIndex].unitCode}${units[unitIndex].identifier === '' ? '' : `-${units[unitIndex].identifier}`} was killed`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - killUnit`)
  }
}

const reviveUnit = (roomUuid, factionCode, unitCode, identifier) => {
  if (rooms.hasOwnProperty(roomUuid)) {
    const units = rooms[roomUuid].units
    const board = rooms[roomUuid].board
    const boardSize = rooms[roomUuid].boardSize
    const factions = rooms[roomUuid].factions

    const unitIndex = units.findIndex(u => u.factionCode === factionCode && u.unitCode === unitCode && u.identifier === identifier)
    if (unitIndex === -1) return
    units[unitIndex].isAlive = true

    let newCoordinates = findClosestFreeTile(board, units[unitIndex].deathCoordinates, boardSize['rowNumber'], boardSize['columnNumber'])

    units[unitIndex].coordinates = newCoordinates
    units[unitIndex].deathCoordinates = ''
    board[newCoordinates] = {
      ...board[newCoordinates],
      unitFullCode: `${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`}`,
      unitIcon: units[unitIndex].iconName,
      factionIcon: factions.find(f => f.code === factionCode).icon,
      veterancyIcon: veterancyMap[parseInt(units[unitIndex].veterancy)].iconName
    }
    createLog(roomUuid, `Unit ${factionCode}-${unitCode}${identifier === '' ? '' : `-${identifier}`} was revived on cell ${newCoordinates}`)
  } else {
    console.error(`# Couldn't find room ${roomUuid} - reviveUnit`)
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
    const users = rooms[roomUuid].users
    users.push({
      userUuid: userUuid,
      username: username,
      userColor: assignUserColor(users),
      currentSocketId: socketId,
      faction: '',
      stratAbility: parseInt(process.env.DEFAULT_STRAT_ABILITY || 3)
    })
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
  createRoom, readRoom, readRoomHost, deleteRoom,
  nextStep, prevStep, readStep,
  readBoard, readBoardSize, updateBoardSize, queueBoardTerrainUpdate, updateBoardMarker, updateBoardFire,
  removeMarkerUser,
  createUser, readUsers,readUserUuid,readUserFaction, updateUserSocket, updateUserFaction, updateUserStratAbility, disconnectUser,
  addFaction, readFactions, updateFactionsStratAbility, removeFaction,
  createMessage, readMessages,
  addUnit, readUnits, updateUnitMen, updateUnitsRawInitiative, updateUnitTypeInitiative, revertInitiativeChanges, updateUnitCoordinates, updateUnitHd, updateUnitFatigue, updateUnitNotes, killUnit, reviveUnit, reorderUnitsByInitiative, removeUnit,
  readLog,
  updateFactionsUnits
}
