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
    icon: 'Light_infantry_1.png',
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
    icon: 'Medium_infantry_1.png',
    name: 'Veteran Medium Infantry',
    veterancy: '2'
  },
  {
    code: 'VHINF',
    hdPerMen: '3',
    icon: 'Heavy_infantry_1.png',
    name: 'Veteran Heavy Infantry',
    veterancy: '2'
  },
  {
    code: 'VPHAL',
    hdPerMen: '3',
    icon: 'Phalanx_1.png',
    name: 'Veteran Phalanx',
    veterancy: '2'
  },
  {
    code: 'EHASS',
    hdPerMen: '5',
    icon: 'Assassin_1.png',
    name: 'Elite Human Assassins',
    veterancy: '3'
  },
  {
    code: 'EHINF',
    hdPerMen: '5',
    icon: 'Heavy_infantry_1.png',
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
  },
  {
    code: 'NYTSK',
    hdPerMen: '3',
    icon: 'Yuan_ti_skirmisher_1.png',
    name: 'Normal Yuan-ti Skirmishers',
    veterancy: '1'
  },
  {
    code: 'NDWAQ',
    hdPerMen: '2',
    icon: 'infantry.png',
    name: 'Normal Dwarven Quarreler',
    veterancy: '1'
  },
  {
    code: 'VARCH',
    hdPerMen: '3',
    icon: 'Archer_1.png',
    name: 'Veteran Archer',
    veterancy: '2'
  },
  {
    code: 'VLHOR',
    hdPerMen: '4',
    icon: 'Light_cavalry_1.png',
    name: 'Veteran Light Horsemen',
    veterancy: '2'
  },
  {
    code: 'VHORA',
    hdPerMen: '2',
    icon: 'Horse_archer_1.png',
    name: 'Veteran Horse Archer',
    veterancy: '2'
  },
  {
    code: 'EDICA',
    hdPerMen: '6',
    icon: 'Dinosaur_cavalry_1.png',
    name: 'Elite Dinosaur Cavalry',
    veterancy: '3'
  },
  {
    code: 'EHECA',
    hdPerMen: '5',
    icon: 'Heavy_cavalry_1.png',
    name: 'Elite Heavy Cavalry',
    veterancy: '3'
  },
  {
    code: 'EKICA',
    hdPerMen: '5',
    icon: 'cavalry.png',
    name: 'Elite Kingsguard Cavalry',
    veterancy: '3'
  },
  {
    code: 'EGRA',
    hdPerMen: '6',
    icon: 'Griffon_archer_1.png',
    name: 'Elite Griffon Rider Archers',
    veterancy: '3'
  },
  {
    code: 'EGR',
    hdPerMen: '6',
    icon: 'Griffon_rider_1.png',
    name: 'Elite Griffon Rider',
    veterancy: '3'
  },
  {
    code: 'EWYVR',
    hdPerMen: '9',
    icon: 'archer.png',
    name: 'Elite Wyvern Rider',
    veterancy: '3'
  },
  {
    code: 'EYSD',
    hdPerMen: '29',
    icon: 'archer.png',
    name: 'Elite Young Sapphire Dragon',
    veterancy: '3'
  },
  {
    code: 'VMIM',
    hdPerMen: '3',
    icon: 'cavalry.png',
    name: 'Veteran Medium Infantry, Mounted',
    veterancy: '2'
  },
  {
    code: 'NDRET',
    hdPerMen: '4',
    icon: 'cavalry.png',
    name: 'Normal Dretch',
    veterancy: '1'
  },
  {
    code: 'VMAWD',
    hdPerMen: '6',
    icon: 'cavalry.png',
    name: 'Veteran Maw Demon',
    veterancy: '2'
  },
  {
    code: 'VHIW5',
    hdPerMen: '3',
    icon: 'infantry.png',
    name: 'Veteran Heavy Infantry (with lvl5 wizard)',
    veterancy: '2'
  },
  {
    code: 'NWTD6',
    hdPerMen: '2',
    icon: 'infantry.png',
    name: 'Normal Wolf Tamer (with lvl6 druid)',
    veterancy: '1'
  },
  {
    code: 'EWIZ5',
    hdPerMen: '5',
    icon: 'Wizard_1.png',
    name: 'Elite Wizards',
    veterancy: '3'
  },
  {
    code: 'VWIZ4',
    hdPerMen: '4',
    icon: 'Wizard_1.png',
    name: 'Veteran Wizards',
    veterancy: '2'
  },
  {
    code: 'NORC2',
    hdPerMen: '2',
    icon: 'Wizard_1.png',
    name: 'Normal Order of Rouge Clerics',
    veterancy: '1'
  },
  {
    code: 'EAMC6',
    hdPerMen: '6',
    icon: 'Wizard_1.png',
    name: 'Elite Amaunator Clerics',
    veterancy: '3'
  },
  {
    code: 'VABW4',
    hdPerMen: '4',
    icon: 'Wizard_1.png',
    name: 'Veteran Airborne Wizards',
    veterancy: '2'
  },
  {
    code: 'VGLB3',
    hdPerMen: '3',
    icon: 'Wizard_1.png',
    name: 'Veteran Glamour Bards',
    veterancy: '2'
  },
  {
    code: 'VORC3',
    hdPerMen: '3',
    icon: 'Wizard_1.png',
    name: 'Veteran Order of Rouge Clerics',
    veterancy: '2'
  },
  {
    code: 'EMOW5',
    hdPerMen: '5',
    icon: 'cavalry.png',
    name: 'Elite Mounted Wizards',
    veterancy: '3'
  },
  {
    code: 'NWMD2',
    hdPerMen: '2',
    icon: 'cavalry.png',
    name: 'Normal Wizard Mounted Dropouts',
    veterancy: '1'
  },
  {
    code: 'EABW5',
    hdPerMen: '5',
    icon: 'cavalry.png',
    name: 'Elite Airborne Wizards',
    veterancy: '3'
  },
  {
    code: 'EAMP3',
    hdPerMen: '3',
    icon: 'cavalry.png',
    name: 'Elite Amaunator Paladins',
    veterancy: '3'
  },
  {
    code: 'VFEW3',
    hdPerMen: '3',
    icon: 'cavalry.png',
    name: 'Veteran Fey Warlocks',
    veterancy: '2'
  }
]

const compareUnits = (unit1, unit2) => {
  const modifiedProperties = ['hd', 'fatigue', 'notes']
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

const calculateCasualties = (hd, maxHd, veterancy) => {
  let casualties = 0
  if (hd >= maxHd / 2) return casualties
  let hdBelowHalf = maxHd / 2 - hd
  if (veterancy === '0') {
    casualties = Math.floor(hdBelowHalf)
  } else if (veterancy === '1') {
    casualties = Math.floor(hdBelowHalf / 2)
  } else if (veterancy === '2') {
    casualties = Math.floor(hdBelowHalf / 3)
  } else if (veterancy === '3') {
    casualties = Math.floor(hdBelowHalf / 5)
  }
  return casualties
}

module.exports = {
  unitShop,
  compareUnits,
  calculateCasualties
}
