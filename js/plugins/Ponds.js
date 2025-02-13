Galv.FISH.ponds = {
    "The Promenade": [
        [1, 12, true],
        [3, 12, true]
    ],
    "Lake of Telluria": [
        [1, 8, true],
        [2, 16, true]
    ],
    "North Telluria Field": [
        [2, 5, true],
        [4, 5, '$gameSwitches.value(69)']
    ],
    "Fish-Flavored Fish": [
        [5, 1, true]
    ]
}

__Galv_Fish_clearPond__ = Galv.FISH.clearPond;
Galv.FISH.clearPond = function() {
	__Galv_Fish_clearPond__.call(this);
    $gameSystem.fishing.hole.name = "";
};

Galv.FISH.initPond = function(name) {
    $gameSystem.fishing.hole.name = name;
    pond = $gameSystem.fishing.ponds[name];
    pond.forEach(fish => {
        const cond = eval(this.ponds[name].find(f => f[0] == fish)[2]);
        if (cond) this.addFish(fish);
    });
};

__Game_System_prototype_initialize__ = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    __Game_System_prototype_initialize__.call(this);
    this.initPonds();
};

Game_System.prototype.initPonds = function() {
    this.fishing.ponds = {};
    this.fishing.respawn = {};
    for (const key in Galv.FISH.ponds) {
        // Starting fish in pond
        const pondData = Galv.FISH.ponds[key];
        pond = this.fishing.ponds[key] = [];
        pondData.forEach(fish => {
            while (pond.filter(id => id == fish[0]).length < fish[1]) pond.push(fish[0]);
        });
        // Respawn counter
        respawn = this.fishing.respawn[key] = {};
        [...new Set(pond)].forEach(id => respawn[id] = 0);
    }
};

Game_System.prototype.fishRespawnTick = function() {
    for (const pond in this.fishing.respawn) {
        respawn = this.fishing.respawn[pond];
        for (const fish in respawn) {
            respawn[fish]++;
            if (respawn[fish] >= Galv.FISH.fish[fish].respawn) {
                this.respawnFish(pond, fish);
                respawn[fish] = 0;
            }
        }
    }
};

Game_System.prototype.respawnFish = function(pondKey, fish) {
    pond = this.fishing.ponds[pondKey];
    const current = pond.filter(f => f == fish).length;
    const max = Galv.FISH.ponds[pondKey].find(f => f[0] == fish)[1];
    if (current < max) pond.push(Number(fish));
};

__Scene_Fishing_prototype_caughtFish__ = Scene_Fishing.prototype.caughtFish;
Scene_Fishing.prototype.caughtFish = function(fish) {
    __Scene_Fishing_prototype_caughtFish__.call(this, fish);
    pond = $gameSystem.fishing.ponds[$gameSystem.fishing.hole.name];
    index = pond.indexOf(fish._fishId);
    if (index != -1) pond.splice(index, 1);
};