//
//
// COLLECTION
//
//

//
// Scene_Collection
//

function Scene_Collection() {
    this.initialize.apply(this, arguments);
}

Scene_Collection.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Collection.prototype.constructor = Scene_Collection;

Scene_Collection.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Collection.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createWindows();
};

Scene_Collection.prototype.createWindows = function() {
    this.createListWindow();
    if (this.showSummaryWindow()) this.createSummaryWindow();
};

Scene_Collection.prototype.createListWindow = function() {
    if (this._listWindow) {
        this._listWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._listWindow);
    }
};

Scene_Collection.prototype.createSummaryWindow = function() {
    if (this._summaryWindow) this.addWindow(this._summaryWindow);
};

Scene_Collection.prototype.showSummaryWindow = function() {
    return true;
};

//
// Window_CollectionList
//

function Window_CollectionList() {
    this.initialize.apply(this, arguments);
}

Window_CollectionList.prototype = Object.create(Window_Selectable.prototype);
Window_CollectionList.prototype.constructor = Window_CollectionList;

Window_CollectionList.prototype.initialize = function() {
    Window_Selectable.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, Graphics.boxHeight - (SceneManager._scene.showSummaryWindow() ? this.lineHeight() * 2 : 0));
    this._data = [];
    this.refresh();
    this.select(this.selection());
    this.activate();
};

Window_CollectionList.prototype.maxItems = function() {
    return this._data ? this._data.length : 1;
};

Window_CollectionList.prototype.isCurrentItemEnabled = function() {
    return this.isEnabled(this._data[this.index()]);
};

Window_CollectionList.prototype.isEnabled = function(item) {
    return item[3];
};

Window_CollectionList.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};

Window_CollectionList.prototype.makeItemList = function() {
    
};

Window_CollectionList.prototype.drawItem = function(index) {
    var item = this._data[index];
    var rect = this.itemRect(index);
    rect.width -= this.textPadding();
    this.changePaintOpacity(this.isEnabled(item));
    this.drawItemName(item, rect.x, rect.y, rect.width);
    this.drawText(item[2], rect.x, rect.y, rect.width, 'right');
    this.changePaintOpacity(true);
};

Window_CollectionList.prototype.drawItemName = function(item, x, y, width) {
    var iconWidth = Window_Base._iconWidth + 4;
    this.drawIcon(item[0], x + 2, y + 2);
    this.drawText(item[1], x + iconWidth, y, width - iconWidth);
};

Window_CollectionList.prototype.selection = function() {
    return 0;
};

//
// Window_CollectionSummary
//

function Window_CollectionSummary() {
    this.initialize.apply(this, arguments);
}

Window_CollectionSummary.prototype = Object.create(Window_CollectionList.prototype);
Window_CollectionSummary.prototype.constructor = Window_CollectionList;

Window_CollectionSummary.prototype.initialize = function() {
    Window_Selectable.prototype.initialize.call(this, 0, Graphics.boxHeight - this.lineHeight() * 2, Graphics.boxWidth, this.lineHeight() * 2);
    this._data = [];
    this.refresh();
};





//
//
// STATUES
//
//

//
// Scene_Statues
//

function Scene_Statues() {
    this.initialize.apply(this, arguments);
}

Scene_Statues.prototype = Object.create(Scene_Collection.prototype);
Scene_Statues.prototype.constructor = Scene_Collection;

Scene_Statues.prototype.initialize = function() {
    Scene_Collection.prototype.initialize.call(this);
};

Scene_Statues.prototype.createListWindow = function() {
    this._listWindow = new Window_StatueList();
    Scene_Collection.prototype.createListWindow.call(this);
};

Scene_Statues.prototype.createSummaryWindow = function() {
    this._summaryWindow = new Window_StatueSummary();
    Scene_Collection.prototype.createSummaryWindow.call(this);
};

//
// Window_StatueList
//

function Window_StatueList() {
    this.initialize.apply(this, arguments);
}

Window_StatueList.prototype = Object.create(Window_CollectionList.prototype);
Window_StatueList.prototype.constructor = Window_CollectionList;

Window_StatueList.prototype.initialize = function() {
    Window_CollectionList.prototype.initialize.call(this);
};

Window_StatueList.prototype.makeItemList = function() {
    this._data = [];
    var discovered = 0;
    states = $dataStates.filter(s => s).filter(s => s.meta["Statue Icon"] && s.meta["Statue Buff"]);
    states.forEach(s => {
        var statue = [];
        statue[0] = s.meta["Statue Icon"]; // Icon
        statue[1] = s.name.replace("Statue - ", ""); // Name
        statue[2] = s.meta["Statue Buff"]; // Buff Display
        statue[3] = s.passiveConditionEval(); // Discovered
        statue[4] = s.passiveConditionEval.toString().match(/\$gameSystem\.statue\((\d+)\)/i)[1]; // Map ID
        if (!statue[3]) {
            statue[0] = 635;
            statue[1] = "???";
            statue[2] = "???";
        } else discovered++;
        this._data.push(statue);
    }, this);
    OrangeGreenworks.setStat('statues', discovered);
};

Window_StatueList.prototype.selection = function() {
    return this._data.findIndex(s => s[4] == $gameTemp._statueMap);
};

//
// Window_StatueSummary
//

function Window_StatueSummary() {
    this.initialize.apply(this, arguments);
}

Window_StatueSummary.prototype = Object.create(Window_CollectionSummary.prototype);
Window_StatueSummary.prototype.constructor = Window_CollectionSummary;

Window_StatueSummary.prototype.initialize = function() {
    Window_CollectionSummary.prototype.initialize.call(this);
};

Window_StatueSummary.prototype.makeItemList = function() {
    Window_StatueList.prototype.makeItemList.call(this);
    
    const length = this._data.filter(s => s[3]).length;
    var desc = "-$% Incoming Light / +$% Outgoing Light".replace("$", length).replace("$", length);

    var summary = [];
    summary[0] = 102;
    summary[1] = "All Statues";
    summary[2] = desc;
    summary[3] = true;
    summary[4] = 0;

    this._data = [summary];
};





//
//
// FOOD
//
//

//
// Scene_Food
//

function Scene_Food() {
    this.initialize.apply(this, arguments);
}

Scene_Food.prototype = Object.create(Scene_Collection.prototype);
Scene_Food.prototype.constructor = Scene_Collection;

Scene_Food.prototype.initialize = function() {
    $gameSystem._food = $gameSystem._food || [];
    Scene_Collection.prototype.initialize.call(this);
};

Scene_Food.prototype.createListWindow = function() {
    this._listWindow = new Window_FoodList();
    Scene_Collection.prototype.createListWindow.call(this);
};

Scene_Food.prototype.createSummaryWindow = function() {
    this._summaryWindow = new Window_FoodSummary();
    Scene_Collection.prototype.createSummaryWindow.call(this);
};

//
// Window_FoodList
//

function Window_FoodList() {
    this.initialize.apply(this, arguments);
}

Window_FoodList.prototype = Object.create(Window_CollectionList.prototype);
Window_FoodList.prototype.constructor = Window_CollectionList;

Window_FoodList.prototype.initialize = function() {
    Window_CollectionList.prototype.initialize.call(this);
};

Window_FoodList.prototype.makeItemList = function() {
    this._data = [];
    items = $dataItems.filter(s => s).filter(s => s.itemCategory.contains('Foodstuffs')).sort((a, b) => a.name > b.name ? 1 : (b.name > a.name ? -1 : 0));
    this._total = items.length;
    items.forEach(i => {
        var item = [];
        item[0] = i.iconIndex; // Icon
        item[1] = i.name; // Name
        item[2] = ''; // Buff Display
        item[3] = $gameSystem._food.contains(i.id); // Discovered
        if (!item[3]) {
            item[0] = 635;
            item[1] = "???";
            item[2] = "";
        }
        this._data.push(item);
    }, this);
};

Window_FoodList.prototype.maxCols = function() {
    return 3;
};

//
// Window_FoodSummary
//

function Window_FoodSummary() {
    this.initialize.apply(this, arguments);
}

Window_FoodSummary.prototype = Object.create(Window_CollectionSummary.prototype);
Window_FoodSummary.prototype.constructor = Window_CollectionSummary;

Window_FoodSummary.prototype.initialize = function() {
    Window_CollectionSummary.prototype.initialize.call(this);
};

Window_FoodSummary.prototype.makeItemList = function() {
    Window_FoodList.prototype.makeItemList.call(this);
    
    const length = this._data.filter(s => s[3]).length;
    var desc = `${length}/${this._total} Foodstuffs`;

    var summary = [];
    summary[0] = 1299;
    summary[1] = "Total Foodstuffs";
    summary[2] = desc;
    summary[3] = true;
    summary[4] = 0;

    this._data = [summary];
};