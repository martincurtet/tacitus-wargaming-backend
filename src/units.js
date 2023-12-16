// {
//   code: '',
//   hdPerMen: '',
//   icon: '',
//   name: '',
//   veterancy: ''
// }

const unitShop = [
  {
    code: 'MSPR',
    hdPerMen: '1',
    icon: 'spearman.png',
    name: 'Militia Spearman',
    veterancy: '0'
  },
  {
    code: 'MBOM',
    hdPerMen: '1',
    icon: 'infantry.png',
    name: 'Militia Band of Misfits',
    veterancy: '0'
  },
  {
    code: 'NDWLN',
    hdPerMen: '2',
    icon: 'infantry.png',
    name: 'Normal Dwarfen Longbeard',
    veterancy: '1'
  },
  {
    code: 'NLINF',
    hdPerMen: '2',
    icon: 'infantry.png',
    name: 'Normal Light Infantry',
    veterancy: '1'
  },
  {
    code: 'NJINF',
    hdPerMen: '2',
    icon: 'infantry.png',
    name: 'Normal Javelin Infantry',
    veterancy: '1'
  },
  {
    code: 'VMINF',
    hdPerMen: '3',
    icon: 'infantry.png',
    name: 'Veteran Medium Infantry',
    veterancy: '2'
  },
  {
    code: 'VHINF',
    hdPerMen: '3',
    icon: 'infantry.png',
    name: 'Veteran Heavy Infantry',
    veterancy: '2'
  },
  {
    code: 'VPHAL',
    hdPerMen: '3',
    icon: 'infantry.png',
    name: 'Veteran Phalanx',
    veterancy: '2'
  },
  {
    code: 'EHASS',
    hdPerMen: '5',
    icon: 'infantry.png',
    name: 'Elite Human Assassins',
    veterancy: '3'
  },
  {
    code: 'EHINF',
    hdPerMen: '5',
    icon: 'infantry.png',
    name: 'Elite Heavy Infantry',
    veterancy: '3'
  },
  {
    code: 'VPATH',
    hdPerMen: '3',
    icon: 'spearman.png',
    name: 'Veteran Pathfinder',
    veterancy: '2'
  },
  {
    code: 'VDROW',
    hdPerMen: '3',
    icon: 'infantry.png',
    name: 'Veteran Drow Sappers',
    veterancy: '2'
  }
]

const compareUnits = (unit1, unit2) => {
  const modifiedProperties = ['hd', 'casualties', 'fatigue', 'notes']
  let modifiedPropertyCount = 0
  let modifiedProperty = ''

  for (const prop of modifiedProperties) {
    if (unit1[prop] !== unit2[prop]) {
      modifiedPropertyCount++
      modifiedProperty = prop
    }
  }

  if (modifiedPropertyCount === 1) {
    const originalValue = unit1[modifiedProperty]
    const newValue = unit2[modifiedProperty]
    return [modifiedProperty, originalValue, newValue]
  } else {
    return null
  }
}


module.exports = {
  unitShop,
  compareUnits
}
