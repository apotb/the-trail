battle = function(troop) {
    if (!SceneManager._scene instanceof Scene_Map) return console.error("NOT ON MAP");
    BattleManager.setup(troop, true, true);
    $gamePlayer.makeEncounterCount();
    SceneManager.push(Scene_Battle);
};
