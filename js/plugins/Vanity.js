(function() {
    var _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        _Game_Actor_changeEquip.call(this, slotId, item);
        if (item.meta['Vanity']) this.updateVanity();
    };

    Game_Actor.prototype.getVanity = function () {
        let equips = this.equips();
        if (DataManager.getBaseItem(equips[8])?.meta['Vanity']) return DataManager.getBaseItem(equips[8]); // Magic Equip slot takes priority
        else if (DataManager.getBaseItem(equips[10])?.meta['Vanity']) return DataManager.getBaseItem(equips[10]); // Vanity slot
        else return false;
    };

    Game_Actor.prototype.updateVanity = function() {
        let item = this.getVanity();
        if (!item) return;
        
        let params = item.meta['Vanity'].split(',');
        this.setFaceImage(params[0], params[1]);
        this.setCharacterImage(params[2], params[3]);
        this.setBattlerImage(params[4]);
        this.refresh();
        if (this.actorId() === $gameVariables.value(87) + 1) sendVanity();
    };

    Game_Event.prototype.actorCharacter = function(image) {
        let index = image.characterIndex;
        let actor = $gameActors.actor(index % 4 + 1);
        let item = actor.getVanity();
        if (item) {
            let params = item.meta['Vanity'].split(',');
            image.characterName = params[2];
            image.characterIndex = params[3];
        }
        return image;
    };

    var _Scene_Equip_popScene = Scene_Equip.prototype.popScene;
    Scene_Equip.prototype.popScene = function() {
        _Scene_Equip_popScene.call(this);
        $gamePlayer.refresh();
    };
})();
