//=============================================================================
// Game_Player
//=============================================================================

___Game_Player__prototype__moveStraight___ = Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d) {
    ___Game_Player__prototype__moveStraight___.call(this, d);
    if (this.isMovementSucceeded()) sendMove(d);
};

Game_Player.prototype.performTransfer = function() {
    if (this.isTransferring()) {
        sendTransfer($gameMap.mapId(), this._newMapId, this._newX, this._newY, this._newDirection); // Multiplayer
        this.setDirection(this._newDirection);
        if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
            $gameMap.setup(this._newMapId);
            this._needsMapReload = false;
        }
        this.locate(this._newX, this._newY);
        this.refresh();
        this.clearTransferInfo();
    }
};

//=============================================================================
// Game_Map
//=============================================================================

___Game_Map__prototype__setupEvents___ = Game_Map.prototype.setupEvents;
Game_Map.prototype.setupEvents = function() {
    ___Game_Map__prototype__setupEvents___.call(this);
    sendPlayer({ mapId: $gamePlayer._newMapId, x: $gamePlayer._newX, y: $gamePlayer._newY });
};

//=============================================================================
// Scene_Menu
//=============================================================================

Scene_Menu.prototype.commandOnline = function() {
    SceneManager.push(Scene_Online);
};

//=============================================================================
// Scene_Map
//=============================================================================

___Scene_Map__prototype__onMapLoaded___ = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function() {
    ___Scene_Map__prototype__onMapLoaded___.call(this);
    if (!(socket && socket.readyState === WebSocket.OPEN) && !$gameTemp._forceDisconnect) startMultiplayerConnection(API_STEAM.username());
};

//=============================================================================
// Scene_Online
//=============================================================================

function Scene_Online() {
    this.initialize.apply(this, arguments);
}

Scene_Online.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Online.prototype.constructor = Scene_Online;

Scene_Online.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Online.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createWindows();
    if (!$gameTemp._inGame) this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Online.prototype.createWindows = function() {
    // this.createLeaderboardWindow();
    this.createCommandWindow();
};

Scene_Online.prototype.createLeaderboardWindow = function() {
    this._leaderboardWindow = new Window_Leaderboard();
    this.addWindow(this._leaderboardWindow);
};

Scene_Online.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_OnlineCommand();
    this._commandWindow.y = Graphics.boxHeight - this._commandWindow.windowHeight();
    this._commandWindow.setHandler('connect', this.connectCommand.bind(this));
    this._commandWindow.setHandler('disconnect', this.disconnectCommand.bind(this));
    this._commandWindow.setHandler('cancel', this.cancel.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Online.prototype.connectCommand = function() {
    const input = window.prompt('Enter the IP you wish to connect to:').split(':');
    SceneManager.push(Scene_Map);
    if (input[1]) startMultiplayerConnection(API_STEAM.username(), input[0], input[1]);
    else startMultiplayerConnection(API_STEAM.username(), input[0]);
    this._commandWindow.activate();
};

Scene_Online.prototype.disconnectCommand = function() {
    SceneManager.push(Scene_Map);
    disconnectFromServer();
    this._commandWindow.activate();
    $gameTemp._forceDisconnect = true;
};

Scene_Online.prototype.cancel = function() {
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
// Window_OnlineCommand
//=============================================================================

function Window_OnlineCommand() {
    this.initialize.apply(this, arguments);
}

Window_OnlineCommand.prototype = Object.create(Window_Command.prototype);
Window_OnlineCommand.prototype.constructor = Window_OnlineCommand;

Window_OnlineCommand.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_OnlineCommand.prototype.maxCols = function() {
    return 2;
};

Window_OnlineCommand.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_OnlineCommand.prototype.windowHeight = function () {
    return this.lineHeight() * 2;
};

Window_OnlineCommand.prototype.itemTextAlign = function() {
    return 'center';
};

Window_OnlineCommand.prototype.makeCommandList = function() {
    this.addCommand("Connect to IP", 'connect', !(socket && socket.readyState === WebSocket.OPEN));
    this.addCommand("Disconnect", 'disconnect', socket && socket.readyState === WebSocket.OPEN);
};

Window_OnlineCommand.prototype.drawItem = function(index) {
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