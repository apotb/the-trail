var AP = AP || {};
AP.Leaderboard = AP.Leaderboard || {};

//=============================================================================
// API_ITCH
//=============================================================================

API_ITCH = new Object();

API_ITCH._authUrl = `https://itch.io/user/oauth?client_id=1f07ac3cbec324309359a4983aedd4a6&scope=profile%3Ame&response_type=token&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob`;
API_ITCH._keyVariable = 81;
API_ITCH._dataVariable = 82;

API_ITCH.authenticate = function() {
    return new Promise((resolve, reject) => {
        nw.Shell.openExternal(this._authUrl);
        this.setKey(prompt("Paste in your API key:"));

        fetch(`https://itch.io/api/1/${this.getKey()}/me`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            this.setData(data.user);
            alert("Successfully logged in " + this.username());
            resolve();
        })
        .catch(err => {
            alert("Error fetching user data: " + err);
            this.resetKey();
            reject(err);
        });
    });
};


API_ITCH.logout = function() {
    return new Promise((resolve) => {
        alert("You have logged out of " + this.username());
        this.resetKey();
        this.resetData();
        resolve();
    });
};

API_ITCH.loggedIn = function() {
    return API_ITCH.username() != undefined;
};

API_ITCH.getKey = function() {
    return $gameVariables.value(this._keyVariable);
};

API_ITCH.setKey = function(key) {
    $gameVariables.setValue(this._keyVariable, key);
};

API_ITCH.resetKey = function() {
    this.setKey(0);
};

API_ITCH.getData = function() {
    data = $gameVariables.value(this._dataVariable);
    return data != 0 ? data : {};
};

API_ITCH.setData = function(data) {
    $gameVariables.setValue(this._dataVariable, data);
};

API_ITCH.resetData = function() {
    this.setData({});
};

API_ITCH.username = function() {
    return this.getData().username;
};

API_ITCH.userId = function() {
    return this.getData().id;
};

//=============================================================================
// API_LEADERBOARD
//=============================================================================

API_LEADERBOARD = new Object();

API_LEADERBOARD._url = `https://script.google.com/macros/s/AKfycby0KHaXUKbUi4aXDCE7eNp-JRbLMJC_86OcgzmZ3gpmI7YUIOTXkWljjeU78kRRsTs/exec`;
API_LEADERBOARD._dataVariable = 83;

API_LEADERBOARD.leaderboards = function() {
    return [
        ["Bits", $gameParty.gold()],
        ["Damage Dealt", $gameVariables.value(27)],
        ["Enemies Defeated", $gameParty.killCount()],
        ["Playtime", $gameSystem.playtime()]
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
        alert("Error fetching data: " + error);
        throw error;
    });
};

API_LEADERBOARD.addToLeaderboard = async function(leaderboard, value) {
    return fetch(this._url, {
        method: "POST",
        body: JSON.stringify([leaderboard, API_ITCH.userId(), API_ITCH.username(), value])
    })
    .catch(error => {
        alert("Error adding data: " + error);
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
            if (API_ITCH.loggedIn() && $gameTemp._inGame) {
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
    if (API_ITCH.loggedIn()) {
        API_LEADERBOARD.push();
        // Update local leaderboard
        lbData = API_LEADERBOARD.getData();
        API_LEADERBOARD.leaderboards().forEach(lb => {
            const name = lb[0];
            const value = lb[1];
            lbData[name].forEach(entry => {
                if (entry[0] == API_ITCH.userId() && value > entry[2]) entry[2] = value;
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
    this._loginWindow.setHandler('login', this.loginCommand.bind(this));
    this._loginWindow.setHandler('logout', this.logoutCommand.bind(this));
    this._loginWindow.setHandler('refresh', this.refreshCommand.bind(this));
    this._loginWindow.setHandler('cancel', this.cancel.bind(this));
    this.addWindow(this._loginWindow);
};

Scene_Leaderboard.prototype.loginCommand = async function() {
    await API_ITCH.authenticate();
    this._loginWindow.refresh();
    this._loginWindow.activate();
};

Scene_Leaderboard.prototype.logoutCommand = async function() {
    await API_ITCH.logout();
    this._loginWindow.refresh();
    this._loginWindow.activate();
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

Window_Leaderboard.prototype.maxCols = function() {
    return API_LEADERBOARD.leaderboards().length;
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
    for (const lb of API_LEADERBOARD.leaderboards()) {
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
            this.resetTextColor();
            break;
        case 1:
            this.changeTextColor(this.textColor(14));
            break;
        case 2:
            this.changeTextColor(this.textColor(8));
            break;
        case 3:
            this.changeTextColor(this.textColor(20));
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
    return 3;
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
    this.addCommand(this.loginText(), 'login', !API_ITCH.loggedIn());
    this.addCommand("Logout", 'logout', API_ITCH.loggedIn());
    this.addCommand("Refresh", 'refresh');
};

Window_Login.prototype.loginText = function() {
    return API_ITCH.loggedIn() ? "Logged in as " + API_ITCH.username() : "Login";
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