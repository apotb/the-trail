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