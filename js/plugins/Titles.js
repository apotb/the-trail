// Actor

___Game_Actor__prototype__setup___ = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
    ___Game_Actor__prototype__setup___.call(this, actorId);
    this._title = 0;
};

Game_Actor.prototype.isFemale = function() {
    return Boolean(Number(this.actor().meta['Gender']));
};

Game_Actor.prototype.title = function() {
    let titleId = this._title || Number(this.actor().meta['Title']);
    let pair = [];
    switch (titleId) {
        case 0: pair = ["Commoner", "Commoner"]; break;
        case 1: pair = ["Acolyte", "Acolyte"]; break;
        case 2: pair = ["Squire", "Squire"]; break;
        case 3: pair = ["Knight", "Knight"]; break;
        case 4: pair = ["Lord", "Lady"]; break;
        case 5: pair = ["Baron", "Baroness"]; break;
        case 6: pair = ["Viscount", "Viscountess"]; break;
        case 7: pair = ["Count", "Countess"]; break;
        case 8: pair = ["Marquis", "Marquise"]; break;
        case 9: pair = ["Duke", "Duchess"]; break;
        case 10: pair = ["Prince", "Princess"]; break;
        case 11: pair = ["King", "Queen"]; break;
    }
    let title = pair[Number(this.isFemale())] || "?";
    return title;
};

Game_Actor.prototype.titleEx = function() {
    let titleId = this._title || Number(this.actor().meta['Title']);
    let rarity = 0;
    if (titleId >= 11) rarity = 5;
    else if (titleId >= 9) rarity = 4;
    else if (titleId >= 7) rarity = 3;
    else if (titleId >= 4) rarity = 2;
    else if (titleId >= 2) rarity = 1;
    let color = RARITY_COLOR_CODES[rarity] || 0;
    title = `\\fb\\c[${color}]${this.title().toUpperCase()}\\c[0]\\fr`;
    return title;
};

// Window Base

Window_Base.prototype.drawActorTitle = function(actor, x, y, width) {
    width = width || 168;
    this.resetTextColor();
    this.drawTextEx(actor.titleEx(), x, y);
};

Window_Base.prototype.drawActorLevel = function(actor, x, y) {
    this.changeTextColor(this.systemColor());
    var dw1 = this.textWidth(TextManager.levelA);
    this.drawText(TextManager.levelA, x, y, dw1);
    this.resetTextColor();
    var level = Yanfly.Util.toGroup(actor.level);
    var dw2 = this.textWidth(Yanfly.Util.toGroup(actor.maxLevel()));
    this.drawText(level, x + dw1, y, dw2, 'right');
    // This is all I added:
    this.drawIcon(actor.currentClass().icon, x + dw1 + dw2 + 4, y + 2);
};

// Save Info

Window_SaveInfo.prototype.drawPartyTitles = function(dy) {
    if (!Yanfly.Param.SaveInfoActorName) return dy;
    this.resetFontSettings();
    this.contents.fontSize = Yanfly.Param.SaveInfoActorNameSz;
    var length = this._saveContents.party._actors.length;
    var dw = this.contents.width / length;;
    dw = Math.floor(dw);
    var dx = 0;
    for (var i = 0; i < length - Number(this._drawPet); ++i) {
        var actorId = this._saveContents.party._actors[i];
        var member = this._saveContents.actors._data[actorId];
        if (member) {
            var name = member.title();
            this.drawText(name, dx, dy, dw, 'center');
        }
        dx += dw
    }
    return dy += this.lineHeight() / 1.25;
};

Window_MenuStatus.prototype.drawActorClass = function(actor, x, y, width) {
    this.drawActorTitle(actor, x, y, width);
};
