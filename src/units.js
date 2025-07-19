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
    icon: 'Peasant_spear_1.png',
    name: 'Militia Spearman',
    veterancy: '0',
    fontColor: 'black'
  },
  {
    code: 'MBOM',
    hdPerMen: '1',
    icon: 'Band_of_misfits_1.png',
    name: 'Militia Band of Misfits',
    veterancy: '0',
    fontColor: 'black'
  },
  {
    code: 'NDWLN',
    hdPerMen: '2',
    icon: 'Dwarf_longbeard_1.png',
    name: 'Normal Dwarfen Longbeard',
    veterancy: '1',
    fontColor: 'orange'
  },
  {
    code: 'NLINF',
    hdPerMen: '2',
    icon: 'Light_infantry_1.png',
    name: 'Normal Light Infantry',
    veterancy: '1',
    fontColor: 'black'
  },
  {
    code: 'NJINF',
    hdPerMen: '2',
    icon: 'Javelin_1.png',
    name: 'Normal Javelin Infantry',
    veterancy: '1',
    fontColor: 'black'
  },
  {
    code: 'VMINF',
    hdPerMen: '3',
    icon: 'Medium_infantry_1.png',
    name: 'Veteran Medium Infantry',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'VHINF',
    hdPerMen: '3',
    icon: 'Heavy_infantry_1.png',
    name: 'Veteran Heavy Infantry',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'VPHAL',
    hdPerMen: '3',
    icon: 'Phalanx_1.png',
    name: 'Veteran Phalanx',
    veterancy: '2',
    fontColor: 'white'
  },
  {
    code: 'EHASS',
    hdPerMen: '5',
    icon: 'Assassin_1.png',
    name: 'Elite Human Assassins',
    veterancy: '3',
    fontColor: 'white'
  },
  {
    code: 'EHINF',
    hdPerMen: '5',
    icon: 'Heavy_infantry_elite_1.png',
    name: 'Elite Heavy Infantry',
    veterancy: '3',
    fontColor: 'white'
  },
  {
    code: 'VPATH',
    hdPerMen: '3',
    icon: 'Pathfinder_1.png',
    name: 'Veteran Pathfinder',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'VDROW',
    hdPerMen: '3',
    icon: 'Drow_sapper_1.png',
    name: 'Veteran Drow Sappers',
    veterancy: '2',
    fontColor: 'white'
  },
  {
    code: 'NYTSK',
    hdPerMen: '3',
    icon: 'Yuan_ti_skirmisher_1.png',
    name: 'Normal Yuan-ti Skirmishers',
    veterancy: '1',
    fontColor: 'white'
  },
  {
    code: 'NDWAQ',
    hdPerMen: '2',
    icon: 'Dwarf_crossbow_1.png',
    name: 'Normal Dwarven Quarreler',
    veterancy: '1',
    fontColor: 'black'
  },
  {
    code: 'VARCH',
    hdPerMen: '3',
    icon: 'Archer_1.png',
    name: 'Veteran Archer',
    veterancy: '2',
    fontColor: 'white'
  },
  {
    code: 'VLHOR',
    hdPerMen: '4',
    icon: 'Light_cavalry_1.png',
    name: 'Veteran Light Horsemen',
    veterancy: '2',
    fontColor: 'white'
  },
  {
    code: 'VHORA',
    hdPerMen: '2',
    icon: 'Horse_archer_1.png',
    name: 'Veteran Horse Archer',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'EDICA',
    hdPerMen: '6',
    icon: 'Dinosaur_cavalry_1.png',
    name: 'Elite Dinosaur Cavalry',
    veterancy: '3',
    fontColor: 'black'
  },
  {
    code: 'EHECA',
    hdPerMen: '5',
    icon: 'Heavy_cavalry_1.png',
    name: 'Elite Heavy Cavalry',
    veterancy: '3',
    fontColor: 'black'
  },
  {
    code: 'EKICA',
    hdPerMen: '5',
    icon: 'Heavy_cavalry_2.png',
    name: 'Elite Kingsguard Cavalry',
    veterancy: '3',
    fontColor: 'white'
  },
  {
    code: 'EGRA',
    hdPerMen: '6',
    icon: 'Griffon_archer_1.png',
    name: 'Elite Griffon Rider Archers',
    veterancy: '3',
    fontColor: 'black'
  },
  {
    code: 'EGR',
    hdPerMen: '6',
    icon: 'Griffon_rider_1.png',
    name: 'Elite Griffon Rider',
    veterancy: '3',
    fontColor: 'white'
  },
  {
    code: 'EWYVR',
    hdPerMen: '9',
    icon: 'Wyvern_rider_1.png',
    name: 'Elite Wyvern Rider',
    veterancy: '3',
    fontColor: 'black'
  },
  {
    code: 'VMIM',
    hdPerMen: '3',
    icon: 'Medium_infantry_1.png',
    name: 'Veteran Medium Infantry, Mounted',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'NDRET',
    hdPerMen: '4',
    icon: 'Dretch_1.png',
    name: 'Normal Dretch',
    veterancy: '1',
    fontColor: 'black'
  },
  {
    code: 'VMAWD',
    hdPerMen: '6',
    icon: 'Maw_demon_1.png',
    name: 'Veteran Maw Demon',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'VHIW5',
    hdPerMen: '3',
    icon: 'Wizard_heavy_infantry_1.png',
    name: 'Veteran Heavy Infantry (with lvl5 wizard)',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'NWTD6',
    hdPerMen: '2',
    icon: 'Wolf_tamer_1.png',
    name: 'Normal Wolf Tamer (with lvl6 druid)',
    veterancy: '1',
    fontColor: 'black'
  },
  {
    code: 'EWIZ5',
    hdPerMen: '5',
    icon: 'Wizard_1.png',
    name: 'Elite Wizards',
    veterancy: '3',
    fontColor: 'white'
  },
  {
    code: 'VWIZ4',
    hdPerMen: '4',
    icon: 'Wizard_2.png',
    name: 'Veteran Wizards',
    veterancy: '2',
    fontColor: 'white'
  },
  {
    code: 'NORC2',
    hdPerMen: '2',
    icon: 'Rouge_cleric_1.png',
    name: 'Normal Order of Rouge Clerics',
    veterancy: '1',
    fontColor: 'black'
  },
  {
    code: 'EAMC6',
    hdPerMen: '6',
    icon: 'Amaunator_cleric_1.png',
    name: 'Elite Amaunator Clerics',
    veterancy: '3',
    fontColor: 'black'
  },
  {
    code: 'VABW4',
    hdPerMen: '4',
    icon: 'Flying_wizard_1.png',
    name: 'Veteran Airborne Wizards',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'VGLB3',
    hdPerMen: '3',
    icon: 'Glamour_bard_1.png',
    name: 'Veteran Glamour Bards',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'VORC3',
    hdPerMen: '3',
    icon: 'Rouge_cleric_2.png',
    name: 'Veteran Order of Rouge Clerics',
    veterancy: '2',
    fontColor: 'black'
  },
  {
    code: 'EMOW5',
    hdPerMen: '5',
    icon: 'Mounted_wizard_1.png',
    name: 'Elite Mounted Wizards',
    veterancy: '3',
    fontColor: 'white'
  },
  {
    code: 'NWMD2',
    hdPerMen: '2',
    icon: 'Mounted_wizard_2.png',
    name: 'Normal Wizard Mounted Dropouts',
    veterancy: '1',
    fontColor: 'black'
  },
  {
    code: 'EABW5',
    hdPerMen: '5',
    icon: 'Flying_wizard_2.png',
    name: 'Elite Airborne Wizards',
    veterancy: '3',
    fontColor: 'white'
  },
  {
    code: 'EAMP3',
    hdPerMen: '3',
    icon: 'Amaunator_paladin_1.png',
    name: 'Elite Amaunator Paladins',
    veterancy: '3',
    fontColor: 'black'
  },
  {
    code: 'VFEW3',
    hdPerMen: '3',
    icon: 'Fey_warlock_1.png',
    name: 'Veteran Fey Warlocks',
    veterancy: '2',
    fontColor: 'white'
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
  if (hd > maxHd / 2) {
    return 0
  }
  const effectiveHd = Math.floor(maxHd / 2) - hd
  const casualtyRate = veterancy === 3 ? 5 : veterancy + 1
  return Math.max(0, Math.floor(effectiveHd / casualtyRate) + 1)
}

module.exports = {
  unitShop,
  compareUnits,
  calculateCasualties
}
