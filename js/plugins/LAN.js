//=============================================================================
// Game_Player
//=============================================================================

___Game_Player__prototype__moveStraight___ = Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d) {
    ___Game_Player__prototype__moveStraight___.call(this, d);
    if (this.isMovementSucceeded()) sendMove(d);
};

//=============================================================================
// Scene_Menu
//=============================================================================

Scene_Menu.prototype.commandLAN = function() {
    SceneManager.push(Scene_LAN);
};

//=============================================================================
// Scene_LAN
//=============================================================================

function Scene_LAN() {
    this.initialize.apply(this, arguments);
}

Scene_LAN.prototype = Object.create(Scene_MenuBase.prototype);
Scene_LAN.prototype.constructor = Scene_LAN;

Scene_LAN.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_LAN.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createWindows();
    if (!$gameTemp._inGame) this.startFadeIn(this.fadeSpeed(), false);
};

Scene_LAN.prototype.createWindows = function() {
    // this.createLeaderboardWindow();
    this.createCommandWindow();
};

Scene_LAN.prototype.createLeaderboardWindow = function() {
    this._leaderboardWindow = new Window_Leaderboard();
    this.addWindow(this._leaderboardWindow);
};

Scene_LAN.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_LANCommand();
    this._commandWindow.y = Graphics.boxHeight - this._commandWindow.windowHeight();
    this._commandWindow.setHandler('connect', this.connectCommand.bind(this));
    this._commandWindow.setHandler('disconnect', this.disconnectCommand.bind(this));
    this._commandWindow.setHandler('cancel', this.cancel.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_LAN.prototype.connectCommand = function() {
    startMultiplayerConnection(API_STEAM.username());
    this._commandWindow.activate();
};

Scene_LAN.prototype.disconnectCommand = function() {
    disconnectFromServer();
    this._commandWindow.activate();
};

Scene_LAN.prototype.cancel = function() {
    if (!$gameTemp._inGame) this.startFadeOut(this.fadeSpeed(), false);
    this.popScene();
};

//=============================================================================
// Window_Leaderboard
//=============================================================================

/*function Window_Leaderboard() {
    this.initialize.apply(this, arguments);
}

Window_Leaderboard.prototype = Object.create(Window_Command.prototype);
Window_Leaderboard.prototype.constructor = Window_Leaderboard;

Window_Leaderboard.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.deselect();
    this.deactivate();
};

Window_Leaderboard.prototype.leaderboards = function() {
    let lb = API_LEADERBOARD.leaderboards();
    if ($gameTemp._lbFish) lb = lb.slice(4);
    else lb = lb.slice(0, 4);
    return lb;
};

Window_Leaderboard.prototype.maxCols = function() {
    return this.leaderboards().length;
};

Window_Leaderboard.prototype.maxRows = function() {
    return (this.windowHeight() / this.lineHeight()) - 1;
};

Window_Leaderboard.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_Leaderboard.prototype.windowHeight = function() {
    return Graphics.boxHeight - Window_Login.prototype.windowHeight();
};

Window_Leaderboard.prototype.itemTextAlign = function() {
    return 'center';
};

Window_Leaderboard.prototype.makeCommandList = function() {
    for (const lb of this.leaderboards()) {
        this.addCommand(lb[0], '');
        i = 0;
        leaderboard = API_LEADERBOARD.getLeaderboard(lb[0])
        for (i = 0; i < this.maxRows() - 1; i++) {
            if (leaderboard[i]) {
                entry = leaderboard[i];
                if (lb[0] == "Playtime") value = this.formatPlaytime(entry[2]);
                else value = Yanfly.Util.toGroup(entry[2]);
                this.addCommand("#" + (i + 1) + " " + entry[1] + ": " + value);
            } else {
                this.addCommand("");
            }
        }
    }
};

Window_Leaderboard.prototype.formatPlaytime = function(playtime) {
    var hour = Math.floor(playtime / 60 / 60);
    var min = Math.floor(playtime / 60) % 60;
    var sec = playtime % 60;
    return hour.padZero(2) + ':' + min.padZero(2) + ':' + sec.padZero(2);
};

Window_Leaderboard.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var maxCols = this.maxCols();
    var maxRows = this.maxRows();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = Math.floor(index / maxRows) * (rect.width + this.spacing()) - this._scrollX;
    rect.y = (index % maxRows) * rect.height - this._scrollY;
    return rect;
};

Window_Leaderboard.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    switch (index % this.maxRows()) {
        case 0:
            this.changeTextColor(this.textColor(28));
            break;
        case 1:
            this.changeTextColor(this.textColor(14));
            break;
        case 2:
            this.changeTextColor(this.textColor(0));
            break;
        case 3:
            this.changeTextColor(this.textColor(20));
            break;
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            this.changeTextColor(this.textColor(8));
            break;
        default:
            this.changeTextColor(this.textColor(7));
            break;
    }
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
};*/

//=============================================================================
// Window_LANCommand
//=============================================================================

function Window_LANCommand() {
    this.initialize.apply(this, arguments);
}

Window_LANCommand.prototype = Object.create(Window_Command.prototype);
Window_LANCommand.prototype.constructor = Window_LANCommand;

Window_LANCommand.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_LANCommand.prototype.maxCols = function() {
    return 2;
};

Window_LANCommand.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_LANCommand.prototype.windowHeight = function () {
    return this.lineHeight() * 2;
};

Window_LANCommand.prototype.itemTextAlign = function() {
    return 'center';
};

Window_LANCommand.prototype.makeCommandList = function() {
    this.addCommand("Connect to LAN", 'connect');
    this.addCommand("Disconnect from LAN", 'disconnect');
};

Window_LANCommand.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    var text = this.commandName(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(text, rect.x, rect.y, rect.width, align);
};

//=============================================================================
// End
//=============================================================================