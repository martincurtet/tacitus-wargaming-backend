const integerToLetter = (n) => {
  if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) {
    return null
  }
  if (n === 0) return 0
  let result = ''
  while (n > 0) {
    const remainder = (n - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}

const calculateCellRange = (start, end) => {
  if (start === end) return [start]

  const parseCoordinates = (coord) => {
    const match = coord.match(/([A-Z]*)([0-9]+)/)
    const [, column, row] = match
    let columnNumeric
    if (column === '') {
      columnNumeric = 0
    } else {
      columnNumeric = column.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0)
    }
    return { column: columnNumeric, row: parseInt(row, 10)}
  }

  const startCell = parseCoordinates(start)
  const endCell = parseCoordinates(end)

  if (startCell === null || endCell === null) return null

  const smallerColumn = startCell.column < endCell.column ? startCell.column : endCell.column
  const largerColumn = startCell.column >= endCell.column ? startCell.column : endCell.column
  const smallerRow = startCell.row < endCell.row ? startCell.row : endCell.row
  const largerRow = startCell.row >= endCell.row ? startCell.row : endCell.row

  const result = []
  for (let r = smallerRow; r <= largerRow; r++) {
    for (let c = smallerColumn; c <= largerColumn; c++) {
      if (c !== 0 && r !== 0) {
        result.push(`${integerToLetter(c)}${r}`)
      }
    }
  }
  return result
}

const terrainColorMap = {
  'plains': '#d9ead3',
  'forest': '#6aa84f',
  'mud': '#b46006',
  'jungle': '#274e13',
  'undergrowth': '#38761d',
  'marsh': '#134f5c',
  'high-ground': '#ffffff', // TBD
  'shallow-water': '#c9daf8',
  'deep-water': '#3c78d8',
  'fire': 'ffffff', // TBD
  'road': '#999999'
}

module.exports = {
  integerToLetter,
  calculateCellRange,
  terrainColorMap
}
