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
      if (item.consumable) item.typeText = "CONSUMABLE";
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