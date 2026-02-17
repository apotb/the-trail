battle = function(troop) {
    if (!SceneManager._scene instanceof Scene_Map) return console.error("NOT ON MAP");
    BattleManager.setup(troop, true, true);
    $gamePlayer.makeEncounterCount();
    SceneManager.push(Scene_Battle);
};

resetItems = function() {
    $dataWeapons.concat($dataArmors).filter(i => i && i.id > Yanfly.Param.ItemStartingId).forEach(i => ItemManager.effectIUSResetStat(i, 'FULL'));
};

allItems = function() {
    $dataItems.filter(item => item && item.name !== '' && !DataManager.isIndependent(item)).forEach(item => $gameParty.gainItem(item, 9999));
};

allEquips = function() {
    $dataWeapons.concat($dataArmors).filter(i => i && i.id < Yanfly.Param.ItemStartingId).forEach(i => $gameParty.gainItem(i, 1));
};

all = function() {
    allItems();
    allEquips();
};

scene = function() {
    return SceneManager._scene;
};

item = function(name, amount=1) {
    $gameParty.gainItem($dataItems[Yanfly.ItemIdRef[name]], amount);
};

weapon = function(name, amount=1) {
    $gameParty.gainItem($dataWeapons[Yanfly.WeaponIdRef[name]], amount);
};

armor = function(name, amount=1) {
    $gameParty.gainItem($dataArmors[Yanfly.ArmorIdRef[name]], amount);
};