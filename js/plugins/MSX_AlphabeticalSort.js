/* MSX Alphabetical Sort
 * Version: 1.0
 * Author: Melosx
 * Release Date: Jan 22nd 2017
 * Last Update:  Jan 22nd 2017
 */

var Imported = Imported || {};
Imported.MSX_AlphabeticalSort = true;

var MSX = MSX || {};
MSX.AlphabeticalSort = MSX.AlphabeticalSort || {};


/*:
 * @plugindesc v1.0 Sort alphabetically Items and Skills list.
 * @author Melosx
 *
 * @param Items List
 * @desc Sort the list of items in inventory?
 * YES -> true      NO -> false
 * @default true
 *
 * @param Skills List
 * @desc Sort the list of skills learned?
 * YES -> true      NO -> false
 * @default false
 *
 * @help
 * --- THIS PLUGIN DON'T PROVIDE ANY GUIDE ---
*/



var params = PluginManager.parameters(/([^\/]+)\.js$/.exec(document.currentScript.src)[1]);

MSX.AlphabeticalSort.sortItemList = eval(String(params["Items List"]));
MSX.AlphabeticalSort.sortSkillList = eval(String(params["Skills List"]));

DataManager.getSortName = function(item) {
    if (item.priorityName && item.priorityName.length > 0) return item.priorityName;
    return DataManager.getBaseItem(item).name;
}

Window_ItemList.prototype.sortItemList = function(data) {
    var allItems = data || $gameParty.allItems();
    this._data = allItems.filter(function(item) {
        return this.includes(item);
    }, this);
    this._data = ((arr, key) => {
        const seen = new Map();
        return arr.reverse().filter(obj => {
            if (!DataManager.isBaseItem(obj)) return true;
            if (!seen.has(obj[key])) {
                seen.set(obj[key], true);
                return true;
            }
            return false;
        }).reverse();
    })(this._data, 'baseItemId');
    this._data.sort(function(a,b){
        if (DataManager.getSortName(a).toLowerCase() < DataManager.getSortName(b).toLowerCase()) return -1;
        if (DataManager.getSortName(a).toLowerCase() > DataManager.getSortName(b).toLowerCase()) return 1;
        return 0;
    });
    if (this.includes(null)) {
        this._data.push(null);
    }
};

if(MSX.AlphabeticalSort.sortItemList){
    Window_ItemList.prototype.makeItemList = function() {
        this.sortItemList();
        if(Imported.YEP_ItemCore){
            if (SceneManager._scene instanceof Scene_Item) this.listEquippedItems();
        }
    };
}

if(MSX.AlphabeticalSort.sortSkillList){
    Window_SkillList.prototype.makeItemList = function() {
        if (this._actor) {
            var actorSkills = this._actor.skills();
            actorSkills.sort(function(a,b){
                if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
            });
            this._data = actorSkills.filter(function(item) {
                return this.includes(item);
            }, this);
        } else {
            this._data = [];
        }
    };
}