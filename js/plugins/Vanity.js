(function() {
    var _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        _Game_Actor_changeEquip.call(this, slotId, item);
        if (!item) {
            if (slotId == 8) updateVanity(this, 10, $dataArmors[this.equips()[10]?.baseItemId]);
            return;
        }
        baseItem = $dataArmors[item.baseItemId];
        if (slotId == 8 && !baseItem.meta['Vanity']) updateVanity(this, 10, $dataArmors[this.equips()[10]?.baseItemId]);
        if (baseItem.meta['Vanity'] && !($gameVariables.value(55) >= 16 && $gameVariables.value(55) <= 21)) updateVanity(this, slotId, baseItem);
    };

    Game_Event.prototype.actorCharacter = function(image) {
        let index = image.characterIndex;
        let actor = $gameActors.actor(index % 4 + 1);
        let equips = actor.equips();
        let item;

        if (DataManager.getBaseItem(equips[8])?.meta['Vanity']) item = DataManager.getBaseItem(equips[8]); // Magic Equip slot takes priority
        else if (DataManager.getBaseItem(equips[10])?.meta['Vanity']) item = DataManager.getBaseItem(equips[10]); // Vanity slot
        else return image;
        
        let params = item.meta['Vanity'].split(',');
        image.characterName = params[2];
        image.characterIndex = params[3];
        return image;
    };

    function updateVanity(actor, slotId, item) {
        if (!item) return;
        if (slotId != 8) if (actor.equips()[8]) if (actor.equips()[8].baseItemId == 199) return;
        params = item.meta['Vanity'].split(',');
        actor.setFaceImage(params[0], params[1]);
        actor.setCharacterImage(params[2], params[3]);
        actor.setBattlerImage(params[4]);
        actor.refresh();
    }

    var _Scene_Equip_popScene = Scene_Equip.prototype.popScene;
    Scene_Equip.prototype.popScene = function() {
        _Scene_Equip_popScene.call(this);
        $gamePlayer.refresh();
    };
})();
