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

___Game_Player__prototype__locate___ = Game_Player.prototype.locate;
Game_Player.prototype.locate = function(x, y) {
    ___Game_Player__prototype__locate___.call(this, x, y);
    sendTransfer($gameMap.mapId(), $gameMap.mapId(), x, y, $gamePlayer.direction());
};

___Game_Player__prototype__jump___ = Game_Player.prototype.jump;
Game_Player.prototype.jump = function(xPlus, yPlus) {
    ___Game_Player__prototype__jump___.call(this, xPlus, yPlus);
    sendJump(xPlus, yPlus);
};

//=============================================================================
// Game_Vehicle
//=============================================================================

___Game_Vehicle__prototype__getOn___ = Game_Vehicle.prototype.getOn;
Game_Vehicle.prototype.getOn = function() {
    ___Game_Vehicle__prototype__getOn___.call(this);
    sendVanity(this.characterName(), this.characterIndex());
};

___Game_Vehicle__prototype__getOff___ = Game_Vehicle.prototype.getOff;
Game_Vehicle.prototype.getOff = function() {
    ___Game_Vehicle__prototype__getOff___.call(this);
    sendVanity();
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
    if (socket && socket.readyState === WebSocket.OPEN) sendPlayer();
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
    this.createCommandWindow();
    this.createActorWindow();
};

Scene_Online.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_OnlineCommand();
    this._commandWindow.y = Graphics.boxHeight - this._commandWindow.windowHeight();
    this._commandWindow.setHandler('actor', this.actorCommand.bind(this));
    this._commandWindow.setHandler('main', this.mainServerCommand.bind(this));
    this._commandWindow.setHandler('connect', this.connectCommand.bind(this));
    this._commandWindow.setHandler('disconnect', this.disconnectCommand.bind(this));
    this._commandWindow.setHandler('cancel', this.cancel.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Online.prototype.actorCommand = function() {
    this._actorWindow.activate();
};

Scene_Online.prototype.mainServerCommand = function() {
    SceneManager.push(Scene_Map);
    startMultiplayerConnection(API_STEAM.username());
    this._commandWindow.activate();
};

Scene_Online.prototype.connectCommand = function() {
    const input = window.prompt('Enter the IP you wish to connect to:');
    if (input) {
        const params = input.split(':');
        SceneManager.push(Scene_Map);
        if (input[1]) startMultiplayerConnection(API_STEAM.username(), params[0], params[1]);
        else startMultiplayerConnection(API_STEAM.username(), params[0]);
    }
    this._commandWindow.activate();
};

Scene_Online.prototype.disconnectCommand = function() {
    SceneManager.push(Scene_Map);
    disconnectFromServer();
    this._commandWindow.activate();
    $gameTemp._forceDisconnect = true;
};

Scene_Online.prototype.createActorWindow = function() {
    this._actorWindow = new Window_MenuActor();
    this._actorWindow.setHandler('ok',     this.onActorOk.bind(this));
    this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
    this._actorWindow.visible = true;
    this._actorWindow.height = Graphics.boxHeight - this._commandWindow.height;
    this._actorWindow.select($gameVariables.value(87));
    this._actorWindow.refresh();
    this.addWindow(this._actorWindow);
};

Scene_Online.prototype.onActorOk = function() {
    SoundManager.playOk();
    $gameVariables.setValue(87, $gameParty.members()[this._actorWindow.index()].actorId() - 1);
    sendVanity();
    this._actorWindow.deactivate();
    this._commandWindow.activate();
};

Scene_Online.prototype.onActorCancel = function() {
    this._actorWindow.deactivate();
    this._commandWindow.activate();
};

Scene_Online.prototype.cancel = function() {
    if (!$gameTemp._inGame) this.startFadeOut(this.fadeSpeed(), false);
    this.popScene();
};

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
    return 4;
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
    this.addCommand("Change representative", 'actor');
    this.addCommand("Connect to main server", 'main', !(socket && socket.readyState === WebSocket.OPEN))
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