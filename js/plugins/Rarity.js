//==============================
// YEP_ItemCore.js
//==============================
DataManager.initRarity = function(item) {
    item.rarity = DataManager.getBaseItem(item).rarity;
    if (item.textColor === 0) {
      if (item.rarity === 11) item.textColor = 25;
      else if (item.rarity >= 5) item.textColor = 27;
      else if (item.rarity >= 4) item.textColor = 21;
      else if (item.rarity >= 3) item.textColor = 30;
      else if (item.rarity >= 2) item.textColor = 16;
      else if (item.rarity >= 1) item.textColor = 24;
      else item.textColor = 0;
    }
};

//==============================
// MOG_TrPopUpBattle.js
//==============================
const RARITY_COLORS = {
    1: 0x80ff80,	// Uncommon
    2: 0x84aaff,	// Rare
    3: 0xa060e0,	// Epic
    4: 0xf0c040,	// Legendary
    5: 0xff80ff,	// Mythic
	11:0xc08080,	// Trophy
};

//==============================
// MOG_TreasurePopup.js
//==============================
const RARITY_COLORS_HEX = {
    1: '#80ff80',	// Uncommon
    2: '#84aaff',	// Rare
    3: '#a060e0',	// Epic
    4: '#f0c040',	// Legendary
    5: '#ff80ff',	// Mythic
	11:'#c08080',	// Trophy
};