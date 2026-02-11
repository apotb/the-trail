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

MSX.AlphabeticalSort.getWellFedLevel = function(item) {
    var baseItem = DataManager.getBaseItem(item);
    if (!baseItem || !baseItem.effects) return 0;

    var levelMap = { 6: 1, 4: 2, 5: 3, 97: 4 };

    for (var i = 0; i < baseItem.effects.length; i++) {
        var effect = baseItem.effects[i];
        if (effect.code === 21 && levelMap.hasOwnProperty(effect.dataId)) {
            return levelMap[effect.dataId];
        }
    }
    return 0;
};

MSX.AlphabeticalSort.getRecoveryInfo = function(item) {
    var baseItem = DataManager.getBaseItem(item);
    if (!baseItem || !baseItem.effects) return { hasHP: false, hasMP: false, hpPercent: 0, hpFlat: 0, mpPercent: 0, mpFlat: 0 };
    
    var hpPercent = 0, hpFlat = 0, mpPercent = 0, mpFlat = 0;
    var hasHP = false, hasMP = false;
    
    for (var i = 0; i < baseItem.effects.length; i++) {
        var effect = baseItem.effects[i];
        if (effect.code === 11) {
            hasHP = true;
            hpPercent = Math.abs(effect.value1 || 0);
            hpFlat = Math.abs(effect.value2 || 0);
        }
        if (effect.code === 12) {
            hasMP = true;
            mpPercent = Math.abs(effect.value1 || 0);
            mpFlat = Math.abs(effect.value2 || 0);
        }
    }
    
    return { hasHP: hasHP, hasMP: hasMP, hpPercent: hpPercent, hpFlat: hpFlat, mpPercent: mpPercent, mpFlat: mpFlat };
};

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

    var isMealsWindow = this._ext === 'Meals';
    var isRecoveryWindow = this._ext === 'Recovery';
    var isSalvagingWindow = this._ext === 'Salvaging';
    
    // Cache sort keys to avoid repeated function calls
    var sortKeys = this._data.map(function(item) {
        var recoveryInfo = (isRecoveryWindow || isMealsWindow) ? MSX.AlphabeticalSort.getRecoveryInfo(item) : { hasHP: false, hasMP: false, hpPercent: 0, hpFlat: 0, mpPercent: 0, mpFlat: 0 };
        var baseItem = DataManager.getBaseItem(item);
        var hasDisassemblerTypes = baseItem && baseItem.disassemblerTypes && baseItem.disassemblerTypes.length > 0;
        return {
            name: DataManager.getSortName(item).toLowerCase(),
            wellFed: isMealsWindow ? MSX.AlphabeticalSort.getWellFedLevel(item) : 0,
            recovery: recoveryInfo,
            hasDisassemblerTypes: hasDisassemblerTypes
        };
    });

    this._data.sort(function(a,b){
        var indexA = this._data.indexOf(a);
        var indexB = this._data.indexOf(b);
        var keyA = sortKeys[indexA];
        var keyB = sortKeys[indexB];
        
        // If in Meals window, sort by Well Fed level first
        if (isMealsWindow && keyA.wellFed !== keyB.wellFed) {
            return keyB.wellFed - keyA.wellFed; // Sort by level descending (best first)
        }
        
        // If in Salvaging window, prioritize items with disassemblerTypes
        if (isSalvagingWindow && keyA.hasDisassemblerTypes !== keyB.hasDisassemblerTypes) {
            return keyA.hasDisassemblerTypes ? -1 : 1; // Items with disassemblerTypes first
        }
        
        // If in Recovery window OR Meals window (after Well Fed tier), sort by recovery type and amount
        if (isRecoveryWindow || isMealsWindow) {
            // Determine priority: both HP+MP > HP only > MP only
            var priorityA = (keyA.recovery.hasHP && keyA.recovery.hasMP) ? 3 : (keyA.recovery.hasHP ? 2 : (keyA.recovery.hasMP ? 1 : 0));
            var priorityB = (keyB.recovery.hasHP && keyB.recovery.hasMP) ? 3 : (keyB.recovery.hasHP ? 2 : (keyB.recovery.hasMP ? 1 : 0));
            
            if (priorityA !== priorityB) {
                return priorityB - priorityA; // Higher priority first
            }
            
            // Within same category, prioritize percentage healing over flat healing
            var hasPercentA = (keyA.recovery.hasHP && keyA.recovery.hpPercent > 0) || (keyA.recovery.hasMP && keyA.recovery.mpPercent > 0);
            var hasPercentB = (keyB.recovery.hasHP && keyB.recovery.hpPercent > 0) || (keyB.recovery.hasMP && keyB.recovery.mpPercent > 0);
            
            if (hasPercentA !== hasPercentB) {
                return hasPercentA ? -1 : 1; // Percentage healing first
            }
            
            // Sort by recovery amount descending (highest first)
            if (keyA.recovery.hasHP && keyA.recovery.hasMP && keyB.recovery.hasHP && keyB.recovery.hasMP) {
                // Use percentage if available, otherwise use flat
                var valueA = keyA.recovery.hpPercent + keyA.recovery.mpPercent || keyA.recovery.hpFlat + keyA.recovery.mpFlat;
                var valueB = keyB.recovery.hpPercent + keyB.recovery.mpPercent || keyB.recovery.hpFlat + keyB.recovery.mpFlat;
                if (valueA !== valueB) {
                    return valueB - valueA;
                }
            } else if (keyA.recovery.hasHP && keyB.recovery.hasHP) {
                var valueA = keyA.recovery.hpPercent > 0 ? keyA.recovery.hpPercent : keyA.recovery.hpFlat;
                var valueB = keyB.recovery.hpPercent > 0 ? keyB.recovery.hpPercent : keyB.recovery.hpFlat;
                if (valueA !== valueB) {
                    return valueB - valueA;
                }
            } else if (keyA.recovery.hasMP && keyB.recovery.hasMP) {
                var valueA = keyA.recovery.mpPercent > 0 ? keyA.recovery.mpPercent : keyA.recovery.mpFlat;
                var valueB = keyB.recovery.mpPercent > 0 ? keyB.recovery.mpPercent : keyB.recovery.mpFlat;
                if (valueA !== valueB) {
                    return valueB - valueA;
                }
            }
        }

        // Then sort alphabetically
        if (keyA.name < keyB.name) return -1;
        if (keyA.name > keyB.name) return 1;
        return 0;
    }.bind(this));
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