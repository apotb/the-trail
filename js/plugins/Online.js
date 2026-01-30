//=============================================================================
// Game_System
//=============================================================================

___Game_System__prototype__initialize___ = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    ___Game_System__prototype__initialize___.call(this);
    this._raidMaps = [];
};

//=============================================================================
// Game_Temp
//=============================================================================

___Game_Temp__prototype__initialize___ = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    ___Game_Temp__prototype__initialize___.call(this);
    this._players = {};
    this._chat = [];
};

//=============================================================================
// Game_Event
//=============================================================================

Game_Event.prototype.isOtherPlayer = function() {
    return this._spawned && this._spawnMapId === '172' && this._spawnEventId === '3';
};

//=============================================================================
// Game_Player
//=============================================================================

___Game_Player__prototype__moveStraight___ = Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d) {
    ___Game_Player__prototype__moveStraight___.call(this, d);
    if (this.isMovementSucceeded()) {
        sendMove(d);
    } else {
        sendTurn(d);
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

___Game_Player__prototype__updateVehicleGetOn___ = Game_Player.prototype.updateVehicleGetOn;
Game_Player.prototype.updateVehicleGetOn = function() {
    ___Game_Player__prototype__updateVehicleGetOn___.call(this);
    sendPlayer({
        shadow: false,
        stepAnime: true
    });
};

___Game_Player__prototype__getOffVehicle___ = Game_Player.prototype.getOffVehicle;
Game_Player.prototype.getOffVehicle = function() {
    sendPlayer({
        shadow: true,
        stepAnime: false,
        spriteName: representative().characterName(),
        spriteIndex: representative().characterIndex()
    });
    ___Game_Player__prototype__getOffVehicle___.call(this);
};

//=============================================================================
// Game_Map
//=============================================================================

Game_Map.prototype.isRaidMap = function() {
    $gameSystem._raidMaps = $gameSystem._raidMaps || [];
    return $gameSystem._raidMaps.includes(this.mapId());
};

//=============================================================================
// Sprite_Character
//=============================================================================

___Sprite_Character__prototype__update___ = Sprite_Character.prototype.update;
Sprite_Character.prototype.update = function() {
    ___Sprite_Character__prototype__update___.call(this);
    // Keep player sprite always on top of other players
    if (this._character === $gamePlayer && SceneManager._scene._spriteset) {
        var playerSprite = this;
        var maxZ = 0;
        SceneManager._scene._spriteset._characterSprites.forEach(function(sprite) {
            if (sprite._character && sprite._character.isOtherPlayer && sprite._character.isOtherPlayer()) {
                if (sprite.z > maxZ) maxZ = sprite.z;
            }
        });
        if (maxZ > 0) playerSprite.z = maxZ + 1;
    }
};

//=============================================================================
// Scene_Menu
//=============================================================================

Scene_Menu.prototype.commandOnline = function() {
    SceneManager.push(Scene_Online);
};

Scene_Menu.prototype.commandLobby = function() {
    SceneManager.push(Scene_LobbyParties);
};

//=============================================================================
// Scene_Map
//=============================================================================

___Scene_Map__prototype__onMapLoaded___ = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function() {
    ___Scene_Map__prototype__onMapLoaded___.call(this);
    if (!(socket && socket.readyState === WebSocket.OPEN) && !$gameTemp._forceDisconnect) startMultiplayerConnection(API_STEAM.username());
    if (socket && socket.readyState === WebSocket.OPEN) {
        clearPlayers();
        sendPlayer();
    }
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
    this._commandWindow.setHandler('lobby', this.lobbyCommand.bind(this));
    this._commandWindow.setHandler('disconnect', this.disconnectCommand.bind(this));
    this._commandWindow.setHandler('cancel', this.cancel.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Online.prototype.actorCommand = function() {
    this._actorWindow.activate();
};

Scene_Online.prototype.mainServerCommand = function() {
    $gameTemp._inParty = false;
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

Scene_Online.prototype.lobbyCommand = function() {
    SceneManager.push(Scene_LobbyParties);
    this._commandWindow.activate();
};

Scene_Online.prototype.disconnectCommand = function() {
    SceneManager.push(Scene_Map);
    disconnectFromServer();
    this._commandWindow.activate();
    $gameTemp._forceDisconnect = true;
    $gameTemp._inParty = false;
    $gameTemp._isReady = false;
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
// Scene_LobbyParties
//=============================================================================

function Scene_LobbyParties() {
    this.initialize.apply(this, arguments);
}

Scene_LobbyParties.prototype = Object.create(Scene_MenuBase.prototype);
Scene_LobbyParties.prototype.constructor = Scene_LobbyParties;

Scene_LobbyParties.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._lobbyData = null;
    this._lobbyId = 'laeryidyean_ex'; // Hardcoded for now
    this._refreshInterval = null;
};

Scene_LobbyParties.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this.createPartyListWindow();
    this.createPartyDetailWindow();
    this._commandWindow.setPartyListWindow(this._partyListWindow);
    this._commandWindow.activate();
    this.loadLobbyData(this._lobbyId);
    this.startAutoRefresh();
};

Scene_LobbyParties.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_PartyCommand();
    this._commandWindow.setHandler('browse', this.browseCommand.bind(this));
    this._commandWindow.setHandler('create', this.createCommand.bind(this));
    this._commandWindow.setHandler('leave', this.leaveCommand.bind(this));
    this._commandWindow.setHandler('refresh', this.refreshCommand.bind(this));
    this._commandWindow.setHandler('ready', this.readyCommand.bind(this));
    this._commandWindow.setHandler('unready', this.unreadyCommand.bind(this));
    this._commandWindow.setHandler('start', this.startCommand.bind(this));
    this._commandWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_LobbyParties.prototype.createPartyListWindow = function() {
    var wy = this._commandWindow.height;
    var wh = Graphics.boxHeight - wy;
    var ww = Graphics.boxWidth / 2;
    this._partyListWindow = new Window_PartyList(0, wy, ww, wh);
    this._partyListWindow.setHandler('ok', this.onPartyJoin.bind(this));
    this._partyListWindow.setHandler('cancel', this.onPartyListCancel.bind(this));
    this.addWindow(this._partyListWindow);
};

Scene_LobbyParties.prototype.createPartyDetailWindow = function() {
    var wy = this._commandWindow.height;
    var wh = Graphics.boxHeight - wy;
    var ww = Graphics.boxWidth / 2;
    var wx = ww;
    this._partyDetailWindow = new Window_PartyDetail(wx, wy, ww, wh);
    this._partyDetailWindow.setPartyListWindow(this._partyListWindow);
    this.addWindow(this._partyDetailWindow);
};

Scene_LobbyParties.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    if (this._partyDetailWindow) {
        this._partyDetailWindow.refresh();
    }
};

Scene_LobbyParties.prototype.browseCommand = function() {
    this._partyListWindow.activate();
    if (this._partyListWindow.maxItems() > 0) {
        this._partyListWindow.select(0);
    }
};

Scene_LobbyParties.prototype.createCommand = async function() {
    const result = await createParty(this._lobbyId);
    if (result && result.success) {
        $gameTemp._inParty = true;
        $gameTemp._partyId = result.partyId; // Store party ID
        SceneManager.goto(Scene_Map);
    } else {
        this._commandWindow.activate();
    }
};

Scene_LobbyParties.prototype.leaveCommand = async function() {
    try {
        const result = await leaveParty();
        if (result && result.success) {
            $gameTemp._inParty = false;
            $gameTemp._partyId = null; // Clear party ID
            $gameTemp._isReady = false; // Clear ready status
            SceneManager.goto(Scene_Map);
        } else {
            SoundManager.playBuzzer();
            this._commandWindow.activate();
        }
    } catch (error) {
        console.error("Error in leaveCommand:", error);
        SoundManager.playBuzzer();
        this._commandWindow.activate();
    }
};

Scene_LobbyParties.prototype.refreshCommand = function() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn("Server disconnected, returning to map");
        SceneManager.goto(Scene_Map);
        return;
    }
    this.loadLobbyData(this._lobbyId);
    this._commandWindow.activate();
};

Scene_LobbyParties.prototype.readyCommand = async function() {
    const result = await partyReady();
    if (result && result.success) {
        $gameTemp._isReady = true;
        this.loadLobbyData(this._lobbyId);
        this._commandWindow.refresh();
    }
    this._commandWindow.activate();
};

Scene_LobbyParties.prototype.unreadyCommand = async function() {
    const result = await partyUnready();
    if (result && result.success) {
        $gameTemp._isReady = false;
        this.loadLobbyData(this._lobbyId);
        this._commandWindow.refresh();
    }
    this._commandWindow.activate();
};

Scene_LobbyParties.prototype.startCommand = async function() {
    const result = await partyStart();
    if (result && result.success) {
        // Handle party start (e.g., transfer to battle map)
        console.log("Party started!", result);
    }
    this._commandWindow.activate();
};

Scene_LobbyParties.prototype.startAutoRefresh = function() {
    var self = this;
    this._refreshInterval = setInterval(function() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            self.loadLobbyData(self._lobbyId);
        }
    }, 5000); // Refresh every 5 seconds
};

Scene_LobbyParties.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
    }
};

Scene_LobbyParties.prototype.onPartyJoin = async function() {
    if ($gameTemp._inParty) {
        SoundManager.playBuzzer();
        this._partyListWindow.activate();
        return;
    }
    
    var party = this._partyListWindow.currentParty();
    if (party) {
        const result = await joinParty(this._lobbyId, party.id);
        if (result && result.success) {
            $gameTemp._inParty = true;
            $gameTemp._partyId = result.partyId; // Store party ID
            sendPlayer(); // Update server with current player data
            SceneManager.goto(Scene_Map);
        } else {
            this._partyListWindow.activate();
        }
    }
};

Scene_LobbyParties.prototype.onPartyListCancel = function() {
    if ($gameTemp._inParty && $gameTemp._partyId && this._partyListWindow._parties) {
        var partyIndex = this._partyListWindow._parties.findIndex(p => p.id === $gameTemp._partyId);
        if (partyIndex >= 0) {
            this._partyListWindow.select(partyIndex);
        } else {
            this._partyListWindow.deselect();
        }
    } else {
        this._partyListWindow.deselect();
    }
    this._partyListWindow.deactivate();
    this._commandWindow.activate();
};

Scene_LobbyParties.prototype.loadLobbyData = async function(lobbyId) {
    // Remember current selection
    var currentIndex = this._partyListWindow ? this._partyListWindow.index() : -1;
    
    const lobbyData = await fetchLobby(lobbyId);
    
    if (!lobbyData || !lobbyData.lobby) {
        this._partyListWindow.setParties([]);
        this._partyDetailWindow.setParties([]);
        if (this._commandWindow) this._commandWindow.refresh();
        return;
    }
    
    const lobby = lobbyData.lobby;
    let parties = lobby.parties || [];
    
    this._lobbyData = lobbyData;
    this._partyListWindow.setParties(parties, true); // Skip auto-select
    this._partyDetailWindow.setParties(parties);
    
    // Restore selection or auto-select player's party
    if ($gameTemp._inParty && $gameTemp._partyId) {
        var partyIndex = parties.findIndex(p => p.id === $gameTemp._partyId);
        if (partyIndex >= 0) {
            this._partyListWindow.select(partyIndex);
        } else {
            this._partyListWindow.deselect();
        }
    } else if (currentIndex >= 0 && currentIndex < parties.length) {
        // Restore previous selection if still valid
        this._partyListWindow.select(currentIndex);
    } else {
        this._partyListWindow.deselect();
    }
    
    if (this._commandWindow) this._commandWindow.refresh();
};

//=============================================================================
// Window_PartyCommand
//=============================================================================

function Window_PartyCommand() {
    this.initialize.apply(this, arguments);
}

Window_PartyCommand.prototype = Object.create(Window_Command.prototype);
Window_PartyCommand.prototype.constructor = Window_PartyCommand;

Window_PartyCommand.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this._partyListWindow = null;
};

Window_PartyCommand.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_PartyCommand.prototype.maxCols = function() {
    return 3;
};

Window_PartyCommand.prototype.itemTextAlign = function() {
    return 'center';
};

Window_PartyCommand.prototype.setPartyListWindow = function(window) {
    this._partyListWindow = window;
};

Window_PartyCommand.prototype.makeCommandList = function() {
    var hasParties = this._partyListWindow && this._partyListWindow.maxItems() > 0;
    var inParty = $gameTemp._inParty || false;
    var isReady = $gameTemp._isReady || false;
    
    // Check if player is the party leader, has enough members, and all are ready
    var canStart = false;
    if (inParty && $gameTemp._partyId && this._partyListWindow) {
        var currentParty = this._partyListWindow._parties.find(p => p.id === $gameTemp._partyId);
        if (currentParty && currentParty.members) {
            // Check if current player is the party leader (party ID matches player's ID)
            var isLeader = currentParty.id === API_STEAM.userId();
            var hasEnoughMembers = currentParty.members.length >= 2;
            var allReady = currentParty.members.every(m => m && m.ready);
            canStart = isLeader && hasEnoughMembers && allReady;
        }
    }
    
    // Row 1
    this.addCommand('Browse Parties', 'browse', hasParties);
    this.addCommand('Create Party', 'create', !inParty);
    this.addCommand('Leave Party', 'leave', inParty);
    
    // Row 2
    if (isReady) {
        this.addCommand('Unready', 'unready', inParty);
    } else {
        this.addCommand('Ready Up', 'ready', inParty);
    }
    this.addCommand('Start', 'start', canStart);
    this.addCommand('Refresh', 'refresh');
};

//=============================================================================
// Window_PartyList
//=============================================================================

function Window_PartyList(x, y, width, height) {
    this.initialize.apply(this, arguments);
}

Window_PartyList.prototype = Object.create(Window_Selectable.prototype);
Window_PartyList.prototype.constructor = Window_PartyList;

Window_PartyList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._parties = [];
    this.refresh();
};

Window_PartyList.prototype.setParties = function(parties, skipSelect) {
    this._parties = parties || [];
    this.refresh();
    if (!skipSelect && this._parties.length > 0) {
        this.select(0);
    }
};

Window_PartyList.prototype.maxItems = function() {
    return (this._parties && this._parties.length) || 0;
};

Window_PartyList.prototype.itemHeight = function() {
    return 36;
};

Window_PartyList.prototype.drawItem = function(index) {
    var party = this._parties[index];
    if (!party) return;
    
    var rect = this.itemRectForText(index);
    var partyName = party.name || 'Unknown Party';
    var memberCount = party.members ? party.members.length : 0;
    var text = partyName + ' (' + memberCount + '/4)';
    
    this.resetTextColor();
    this.drawText(text, rect.x, rect.y, rect.width);
};

Window_PartyList.prototype.currentParty = function() {
    return this._parties[this.index()] || null;
};

//=============================================================================
// Window_PartyDetail
//=============================================================================

function Window_PartyDetail(x, y, width, height) {
    this.initialize.apply(this, arguments);
}

Window_PartyDetail.prototype = Object.create(Window_Base.prototype);
Window_PartyDetail.prototype.constructor = Window_PartyDetail;

Window_PartyDetail.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._parties = [];
    this._partyListWindow = null;
    this.refresh();
};

Window_PartyDetail.prototype.setPartyListWindow = function(partyListWindow) {
    this._partyListWindow = partyListWindow;
};

Window_PartyDetail.prototype.setParties = function(parties) {
    this._parties = parties || [];
    this.refresh();
};

Window_PartyDetail.prototype.refresh = function() {
    this.contents.clear();
    if (!this._partyListWindow || this._parties.length === 0) {
        return;
    }
    
    var party = this._partyListWindow.currentParty();
    if (!party) {
        this.drawText('Select a party to view details', 0, 0, this.contentsWidth());
        return;
    }
    
    this.drawPartyDetails(party);
};

Window_PartyDetail.prototype.drawPartyDetails = function(party) {
    var lineHeight = this.lineHeight();
    var y = 0;
    
    // Draw party name and creation time
    this.changeTextColor(this.systemColor());
    this.drawText('Party Information:', 0, y, this.contentsWidth());
    y += lineHeight;
    
    this.resetTextColor();
    this.drawText('Name: ' + (party.name || 'Unknown'), 20, y, this.contentsWidth());
    y += lineHeight;
    
    if (party.createdAt) {
        var createdDate = new Date(party.createdAt);
        this.drawText('Created: ' + createdDate.toLocaleTimeString(), 20, y, this.contentsWidth());
        y += lineHeight;
    }
    
    // Draw members header
    y += lineHeight / 2;
    this.changeTextColor(this.systemColor());
    this.drawText('Members (' + (party.members ? party.members.length : 0) + '):', 0, y, this.contentsWidth());
    y += lineHeight;
    
    // Draw members list
    this.resetTextColor();
    if (party.members && party.members.length > 0) {
        for (var i = 0; i < party.members.length; i++) {
            var member = party.members[i];
            var memberName = 'Unknown Player';
            var isReady = false;
            
            if (member && typeof member === 'object') {
                memberName = member.name || 'Unknown Player';
                isReady = member.ready || false;
            } else if (member) {
                memberName = member;
            }
            
            var readyIcon = isReady ? '✓ ' : '✗ ';
            this.drawText((i + 1) + '. ' + readyIcon + memberName, 20, y, this.contentsWidth());
            y += lineHeight;
        }
    } else {
        this.drawText('No members', 20, y, this.contentsWidth());
    }
};

Window_PartyDetail.prototype.open = function() {
    this.refresh();
    Window_Base.prototype.open.call(this);
};

//=============================================================================
// End
//=============================================================================