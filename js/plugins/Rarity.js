//==============================
// YEP_ItemCore.js
//==============================
const RARITY_COLOR_CODES = {
    0: 0,    // Common
    1: 24,   // Uncommon
    2: 16,   // Rare
    3: 30,   // Epic
    4: 21,   // Legendary
    5: 27,   // Mythic
   11: 25,   // Trophy
};

DataManager.initRarity = function(item) {
    item.rarity = DataManager.getBaseItem(item).rarity;
    if (!item.textColor) {
      item.textColor = RARITY_COLOR_CODES[item.rarity] || 0;
    }
};

___Window_ItemInfo__prototype__drawItemRarity___ = function(window, dy) {
    var item = window._item;
    if (item.rarity === undefined) DataManager.initRarity(item);

    // Rarity Text
    if (item.rarity === 11) item.rarityText = "TROPHY";
    else if (item.rarity >= 5) item.rarityText = "MYTHIC";
    else if (item.rarity >= 4) item.rarityText = "LEGENDARY";
    else if (item.rarity >= 3) item.rarityText = "EPIC";
    else if (item.rarity >= 2) item.rarityText = "RARE";
    else if (item.rarity >= 1) item.rarityText = "UNCOMMON";
    else item.rarityText = "COMMON";

    // Type Text
    if (DataManager.isItem(item)) {
      if (item.disassemblerTypes.length > 0) item.typeText = "SALVAGE KIT"; 
      else if (!!item.meta.rod) item.typeText = "FISHING ROD";
      else if (!!item.meta.bait) item.typeText = "BAIT";
      else if (item.consumable) item.typeText = "CONSUMABLE";
      else if (item.upgradeEffect.length > 0) item.typeText = "UPGRADER";
      else if (!!item.meta.Pet) item.typeText = "PET ITEM";
      else if (item.types.contains("KEY")) item.typeText = "KEY ITEM";
      else item.typeText = "ITEM";
    }
    else if (DataManager.isWeapon(item)) {
      if (item.wtypeId === 1) item.typeText = "WEAPON";
      else item.typeText = $dataSystem.weaponTypes[item.wtypeId].toUpperCase();
    }
    else if (DataManager.isArmor(item)) {
      if (item.atypeId === 1) {
        item.typeText = $dataSystem.equipTypes[item.etypeId].toUpperCase();
        if ([3, 4, 5].contains(item.etypeId)) item.typeText += " ARMOR";
      }
      else item.typeText = $dataSystem.armorTypes[item.atypeId].toUpperCase();
    }
    else item.typeText = "";
    
    let infoText = `\\fb\\c[${item.textColor}]${item.rarityText} ${item.typeText}\\c[0]\\fr`;
    if (infoText === '') return dy;
    var info = infoText.split(/[\r\n]+/);
    for (var i = 0; i < info.length; ++i) {
      var line = info[i];
      window.resetFontSettings();
      window.drawTextEx(line, window.textPadding(), dy);
      dy += window.contents.fontSize + 8;
    }
    return dy;
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