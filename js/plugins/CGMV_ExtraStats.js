/*:
 * @plugindesc CGMV Tracking for extra statistics.
 * @author Casper Gaming
 * @help
 * ==============================================================================
 * For terms and conditions using this plugin in your game please visit:
 * http://caspergaming.com/dev/terms_of_use/
 * ==============================================================================
 * Become a Patron to get access to a demo for this plugin as well as beta plugins
 * https://www.patreon.com/CasperGamingRPGM
 * ==============================================================================
 * Version: 1.0
 * ------------------------------------------------------------------------------
 * Compatibility: Only tested with my CGMV plugins.
 * Made for RPG Maker MV 1.5.1
 * ------------------------------------------------------------------------------
 * Description: This plugin tracks additional stats and
 * stores them in variables.
 * ------------------------------------------------------------------------------
 * Documentation:
 * The tracked stats are stored in the variables specified here.
 * 
 * Stats Tracked:
 * Gold spent at shops
 * Gold earned at shops
 * Items bought from shops
 * Items sold to shops
 * Damage taken
 * Damage dealt
 * Items used
 * Gold looted from battle
 *
 * @param ItemsBought
 * @type variable
 * @desc Variable to store items bought from shop count
 * Default: 1
 * @default 1
 *
 * @param ItemsSold
 * @type variable
 * @desc Variable to store items sold from shop count
 * Default: 2
 * @default 2
 *
 * @param GoldProfit
 * @type variable
 * @desc Variable to store gold gained from shop sales
 * Default: 3
 * @default 3
 *
 * @param GoldSpent
 * @type variable
 * @desc Variable to store gold lost from shop buy
 * Default: 4
 * @default 4
 *
 * @param ItemsUsed
 * @type variable
 * @desc Variable to store items used from menu or from battle
 * Default: 5
 * @default 5
 *
 * @param GoldLooted
 * @type variable
 * @desc Variable to store gold looted from battle
 * Default: 6
 * @default 6
 *
 * @param DamageTaken
 * @type variable
 * @desc Variable to store damage taken
 * Default: 7
 * @default 7
 *
 * @param DamageDealt
 * @type variable
 * @desc Variable to store damage dealt
 * Default: 8
 * @default 8
 * 
 * @param DamageHealed
 * @type variable
 * @desc Variable to store damage healed
 * Default: 9
 * @default 9
*/
var Imported = Imported || {};
Imported.CGMV_ExtraStats = true;
var CGMV = CGMV || {};
CGMV.ExtraStats = CGMV.ExtraStats || {};
CGMV.ExtraStats.version = 1.0;
CGMV.ExtraStats.parameters = PluginManager.parameters('CGMV_ExtraStats');
CGMV.ExtraStats.ItemsBought = Number(CGMV.ExtraStats.parameters["ItemsBought"]) || 1;
CGMV.ExtraStats.ItemsSold = Number(CGMV.ExtraStats.parameters["ItemsSold"]) || 2;
CGMV.ExtraStats.GoldProfit = Number(CGMV.ExtraStats.parameters["GoldProfit"]) || 3;
CGMV.ExtraStats.GoldSpent = Number(CGMV.ExtraStats.parameters["GoldSpent"]) || 4;
CGMV.ExtraStats.ItemsUsed = Number(CGMV.ExtraStats.parameters["ItemsUsed"]) || 5;
CGMV.ExtraStats.GoldLooted = Number(CGMV.ExtraStats.parameters["GoldLooted"]) || 6;
CGMV.ExtraStats.DamageTaken = Number(CGMV.ExtraStats.parameters["DamageTaken"]) || 7;
CGMV.ExtraStats.DamageDealt = Number(CGMV.ExtraStats.parameters["DamageDealt"]) || 8;
CGMV.ExtraStats.DamageHealed = Number(CGMV.ExtraStats.parameters["DamageHealed"]) || 9;
//=============================================================================
// Scene_Schop
//-----------------------------------------------------------------------------
// Automatic tracking for items bought, sold, and gold gained from sell, lost from buy
// modified functions: doBuy, doSell
//=============================================================================
//-----------------------------------------------------------------------------
// Alias: Track items bought, gold spent on items.
//-----------------------------------------------------------------------------
var alias_CGMV_ExtraStats_SceneShop_doBuy = Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number) {
	alias_CGMV_ExtraStats_SceneShop_doBuy.call(this, number);
	var oldItemBuyCount = $gameVariables.value(CGMV.ExtraStats.ItemsBought);
	$gameVariables.setValue(CGMV.ExtraStats.ItemsBought, oldItemBuyCount + number);
	var oldSpentCount = $gameVariables.value(CGMV.ExtraStats.GoldSpent);
	$gameVariables.setValue(CGMV.ExtraStats.GoldSpent, oldSpentCount + (number * this.buyingPrice()));
};
//-----------------------------------------------------------------------------
// Alias: Track items sold, gold gained from sale
//-----------------------------------------------------------------------------
var alias_CGMV_ExtraStats_SceneShop_doSell = Scene_Shop.prototype.doSell;
Scene_Shop.prototype.doSell = function(number) {
	alias_CGMV_ExtraStats_SceneShop_doSell.call(this, number);
	number += $gameVariables.value(CGMV.ExtraStats.ItemsSold);
	$gameVariables.setValue(CGMV.ExtraStats.ItemsSold, number);
	OrangeGreenworks.setStat('bitsFromSelling', number);
	/*var oldProfitCount = $gameVariables.value(CGMV.ExtraStats.GoldProfit);
	$gameVariables.setValue(CGMV.ExtraStats.GoldProfit, oldProfitCount + (number * this.sellingPrice()));*/
};
//=============================================================================
// Game_Party
//-----------------------------------------------------------------------------
// Automatic tracking for items used
// modified functions: consumeItem
//=============================================================================
//-----------------------------------------------------------------------------
// Alias: Track items used
//-----------------------------------------------------------------------------
var alias_CGMV_ExtraStats_GameParty_consumeItem = Game_Party.prototype.consumeItem;
Game_Party.prototype.consumeItem = function(item) {
	alias_CGMV_ExtraStats_GameParty_consumeItem.call(this, item);
	var oldItemsUsed = $gameVariables.value(CGMV.ExtraStats.ItemsUsed);
	$gameVariables.setValue(CGMV.ExtraStats.ItemsUsed, oldItemsUsed + 1);
};
//=============================================================================
// BattleManager
//-----------------------------------------------------------------------------
// Automatic tracking for gold looted from battle
// modified functions: gainGold
//=============================================================================
//-----------------------------------------------------------------------------
// Alias: Track gold looted
//-----------------------------------------------------------------------------
var alias_CGMV_ExtraStats_Game_Party_gainGold = Game_Party.prototype.gainGold;
Game_Party.prototype.gainGold = function(amount) {
    alias_CGMV_ExtraStats_Game_Party_gainGold.call(this, amount);
	if (amount < 0) return;
	amount += $gameVariables.value(CGMV.ExtraStats.GoldLooted);
	$gameVariables.setValue(CGMV.ExtraStats.GoldLooted, amount);
	OrangeGreenworks.setStat('bitsCollected', amount);
};
//=============================================================================
// Game_Action
//-----------------------------------------------------------------------------
// Automatic tracking for damage taken/dealt
// modified functions: executeDamage
//=============================================================================
//-----------------------------------------------------------------------------
// Alias: Track damage taken/dealt/healed
//-----------------------------------------------------------------------------
var alias_CGMV_ExtraStats_GameAction_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
	alias_CGMV_ExtraStats_GameAction_executeHpDamage.call(this, target, value);
	if (value == Number.MAX_SAFE_INTEGER) return;
    if(target.isActor()) {
		if (value > 0) {
			var oldDamageTaken = $gameVariables.value(CGMV.ExtraStats.DamageTaken);
			$gameVariables.setValue(CGMV.ExtraStats.DamageTaken, oldDamageTaken + value);
		} else if (value < 0) {
			var oldDamageHealed = $gameVariables.value(CGMV.ExtraStats.DamageHealed);
			$gameVariables.setValue(CGMV.ExtraStats.DamageHealed, oldDamageHealed + Math.abs(value));
		}
	}
	else if(target.isEnemy()) {
		var oldDamageDealt = $gameVariables.value(CGMV.ExtraStats.DamageDealt);
		$gameVariables.setValue(CGMV.ExtraStats.DamageDealt, oldDamageDealt + value);
		OrangeGreenworks.setStat('damageDealt', oldDamageDealt + value);
		OrangeGreenworks.setStat('highestDamage', value);
	}
};