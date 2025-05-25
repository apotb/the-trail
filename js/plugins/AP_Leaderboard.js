var AP = AP || {};
AP.Leaderboard = AP.Leaderboard || {};

//=============================================================================
// API_ITCH
//=============================================================================

API_STEAM = new Object();

API_STEAM._dataVariable = 82;

API_STEAM.loggedIn = function() {
    return OrangeGreenworks.isSteamRunning();
};

API_STEAM.getData = function() {
    data = $gameVariables.value(this._dataVariable);
    return data != 0 ? data : {};
};

API_STEAM.setData = function(data) {
    $gameVariables.setValue(this._dataVariable, data);
};

API_STEAM.resetData = function() {
    this.setData({});
};

API_STEAM.username = function() {
    return OrangeGreenworks.getScreenName();
};

API_STEAM.userId = function() {
    return OrangeGreenworks.steamId.steamId;
};

//=============================================================================
// API_LEADERBOARD
//=============================================================================

API_LEADERBOARD = new Object();

API_LEADERBOARD._url = `https://script.google.com/macros/s/AKfycbxYCy8EA_cRaI62Ijd2-RIWLsGzhrvsOpc_zwJG2YMW2haf7OPfk8mnunYK2d7IZqk/exec`;
API_LEADERBOARD._dataVariable = 83;

API_LEADERBOARD.leaderboards = function() {
    return [
        ["Bits Collected", $gameVariables.value(CGMV.ExtraStats.GoldLooted)],
        ["Damage Dealt", $gameVariables.value(CGMV.ExtraStats.DamageDealt)],
        ["Enemies Defeated", $gameParty.killCount()],
        ["Playtime", $gameSystem.playtime()],
        ["Fish Caught", Galv.FISH.totalCaught()]
    ];
};

API_LEADERBOARD.fetchLeaderboard = async function(leaderboard) {
    const url = this._url + "?leaderboard=" + leaderboard;
    return fetch(url, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        this.setLeaderboard(leaderboard, data);
    })
    .catch(error => {
        if ($gameTemp.isPlaytest()) alert("Error fetching data: " + error);
        throw error;
    });
};

API_LEADERBOARD.addToLeaderboard = async function(leaderboard, value) {
    return fetch(this._url, {
        method: "POST",
        body: JSON.stringify([leaderboard, API_STEAM.userId(), API_STEAM.username(), value])
    })
    .catch(error => {
        if ($gameTemp.isPlaytest()) alert("Error adding data: " + error);
        throw error;
    });
};

API_LEADERBOARD.getLeaderboard = function(leaderboard) {
    return this.getData()[leaderboard] ? this.getData()[leaderboard].sort((a, b) => b[2] - a[2]) : [];
};

API_LEADERBOARD.setLeaderboard = function(leaderboard, data) {
    tempData = this.getData();
    tempData[leaderboard] = data;
    this.setData(tempData);
};

API_LEADERBOARD.getData = function() {
    data = $gameVariables.value(this._dataVariable);
    return data != 0 ? data : {};
};

API_LEADERBOARD.setData = function(data) {
    $gameVariables.setValue(this._dataVariable, data);
};

API_LEADERBOARD.push = function() {
    if ($gameTemp.isDemo()) return;
    const promises = this.leaderboards().map(l => this.addToLeaderboard(l[0], l[1]));
    return Promise.all(promises);
};

API_LEADERBOARD.pull = function() {
    const promises = this.leaderboards().map(l => this.fetchLeaderboard(l[0]));
    return Promise.all(promises);
};

API_LEADERBOARD.refresh = function() {
    return new Promise(async (resolve, reject) => {
        try {
            if (API_STEAM.loggedIn() && $gameTemp._inGame) {
                await API_LEADERBOARD.push();
            }
            await API_LEADERBOARD.pull();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

//=============================================================================
// Scene_Title
//=============================================================================

Scene_Title_prototype_start = Scene_Title.prototype.start;
Scene_Title.prototype.start = function() {
    Scene_Title_prototype_start.call(this);
    if (!AP.Leaderboard.InitialAPIPull) {
        API_LEADERBOARD.pull();
        AP.Leaderboard.InitialAPIPull = true;
    }
};

Scene_Title_prototype_createCommandWindow = Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function() {
    Scene_Title_prototype_createCommandWindow.call(this);
    this._commandWindow.setHandler('leaderboard', this.commandLeaderboard.bind(this));
};

Scene_Title.prototype.commandLeaderboard = function() {
    this._commandWindow.close();
    this.startFadeOut(this.fadeSpeed(), false);
    SceneManager.push(Scene_Leaderboard);
};

//=============================================================================
// Scene_File
//=============================================================================

Scene_File_prototype_onSaveSuccess = Scene_File.prototype.onSaveSuccess;
Scene_File.prototype.onSaveSuccess = function() {
    Scene_File_prototype_onSaveSuccess.call(this);
    if (API_STEAM.loggedIn()) {
        API_LEADERBOARD.push();
        // Update local leaderboard
        lbData = API_LEADERBOARD.getData();
        API_LEADERBOARD.leaderboards().forEach(lb => {
            const name = lb[0];
            const value = lb[1];
            lbData[name].forEach(entry => {
                if (entry[0] == API_STEAM.userId() && value > entry[2]) entry[2] = value;
            });
        });
        API_LEADERBOARD.setData(lbData);
    }
};

//=============================================================================
// Scene_Menu
//=============================================================================

Scene_Menu.prototype.commandLeaderboard = function() {
    SceneManager.push(Scene_Leaderboard);
};

//=============================================================================
// Scene_Leaderboard
//=============================================================================

function Scene_Leaderboard() {
    this.initialize.apply(this, arguments);
}

Scene_Leaderboard.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Leaderboard.prototype.constructor = Scene_Leaderboard;

Scene_Leaderboard.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Leaderboard.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createWindows();
    if (!$gameTemp._inGame) this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Leaderboard.prototype.createWindows = function() {
    this.createLeaderboardWindow();
    this.createLoginWindow();
};

Scene_Leaderboard.prototype.createLeaderboardWindow = function() {
    this._leaderboardWindow = new Window_Leaderboard();
    this.addWindow(this._leaderboardWindow);
};

Scene_Leaderboard.prototype.createLoginWindow = function() {
    this._loginWindow = new Window_Login();
    this._loginWindow.y = Graphics.boxHeight - this._loginWindow.windowHeight();
    this._loginWindow.setHandler('refresh', this.refreshCommand.bind(this));
    this._loginWindow.setHandler('cancel', this.cancel.bind(this));
    this.addWindow(this._loginWindow);
};

Scene_Leaderboard.prototype.refreshCommand = async function() {
    await API_LEADERBOARD.refresh();
    alert("Leaderboard refreshed");
    this._leaderboardWindow.refresh();
    this._loginWindow.activate();
};

Scene_Leaderboard.prototype.cancel = function() {
    if (!$gameTemp._inGame) this.startFadeOut(this.fadeSpeed(), false);
    this.popScene();
};

//=============================================================================
// Window_Leaderboard
//=============================================================================

function Window_Leaderboard() {
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
};

//=============================================================================
// Window_Login
//=============================================================================

function Window_Login() {
    this.initialize.apply(this, arguments);
}

Window_Login.prototype = Object.create(Window_Command.prototype);
Window_Login.prototype.constructor = Window_Login;

Window_Login.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_Login.prototype.maxCols = function() {
    return 2;
};

Window_Login.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_Login.prototype.windowHeight = function () {
    return this.lineHeight() * 2;
};

Window_Login.prototype.itemTextAlign = function() {
    return 'center';
};

Window_Login.prototype.makeCommandList = function() {
    this.addCommand(this.loginText(), 'login', false);
    this.addCommand("Refresh", 'refresh');
};

Window_Login.prototype.loginText = function() {
    return API_STEAM.loggedIn() ? "Logged in as " + API_STEAM.username() : "No Steam account detected";
};

Window_Login.prototype.drawItem = function(index) {
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