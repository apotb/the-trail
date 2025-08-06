/* globals WAY, WAYModuleLoader */
// ===========================================================================
// WAY_AP_YEP_ShopMenuCore.js
// ===========================================================================

/*:
@plugindesc v1.0.0 Addon to Yanfly's Item Synthesis Plugin. <WAY_AP_YEP_ShopMenuCore>
@author waynee95 & AP

@help
==============================================================================
 ■ Lunatic Mode - Custom Shop Show Requirements
==============================================================================

For those who would like to show certain items only if a certain condition
is met. Use the following Lunatic Code:

Item Notetag:
<Custom Craft Show Eval>
visible = !$gameParty.hasItem(item);
</Custom Craft Show Eval>

If the visible is set to false, the item will not appear in the shop.

<Custom Craft Enable Eval>
enable = $gameSwitches.value(1);
</Custom Craft Enable Eval>

If enable is set to false, the item will be greyed out in the shop.

==============================================================================
 ■ Terms of Use
==============================================================================
This work is licensed under the MIT license.

More info here: https://github.com/waynee95/mv-plugins/blob/master/LICENSE

==============================================================================
 ■ Contact Information
==============================================================================
Forum Link: https://forums.rpgmakerweb.com/index.php?members/waynee95.88436/
Website: http://waynee95.me/
Discord Name: waynee95#4261
*/
"use strict";

if (typeof WAY === "undefined") {
  console.error("You need to install WAY_Core!"); // eslint-disable-line no-console

  if (Utils.isNwjs() && Utils.isOptionValid("test")) {
    var gui = require("nw.gui"); //eslint-disable-line


    gui.Window.get().showDevTools();
  }

  SceneManager.stop();
} else {
  WAYModuleLoader.registerPlugin("WAY_AP_YEP_ShopMenuCore", "1.0.0", "waynee95 & AP");
}

(function ($) {
  var _WAY$Util = WAY.Util,
      getMultiLineNotetag = _WAY$Util.getMultiLineNotetag,
      trim = _WAY$Util.trim;

  var parseNotetags = function parseNotetags(obj) {
    obj.customCraftShowEval = getMultiLineNotetag(obj.note, "Custom Craft Show Eval", null, trim);
    obj.customCraftEnableEval = getMultiLineNotetag(obj.note, "Custom Craft Enable Eval", null, trim);
  };

  WAY.EventEmitter.on("load-item-notetags", parseNotetags);
  WAY.EventEmitter.on("load-weapon-notetags", parseNotetags);
  WAY.EventEmitter.on("load-armor-notetags", parseNotetags);

  var meetsCustomCraftShowEval = function meetsCustomCraftShowEval(item) {
    if (!item || item.customCraftShowEval === null) {
      return true;
    }

    var visible = true;
    /* eslint-disable */

    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    var p = $gameParty;

    try {
      eval(item.customCraftShowEval);
      /* eslint-enable */
    } catch (e) {
      throw e;
    }

    return visible;
  };
  Window_SynthesisList.prototype.meetsCustomCraftShowEval = meetsCustomCraftShowEval;

  $.alias.Window_SynthesisList_makeItemList = Window_SynthesisList.prototype.makeItemList;

  Window_SynthesisList.prototype.makeItemList = function () {
    $.alias.Window_SynthesisList_makeItemList.call(this);
    this._data = this._data.filter(function (item) {
      return meetsCustomCraftShowEval(item) || SceneManager._scene._justCrafted.includes(item);
    });
  }

  var meetsCustomCraftEnableEval = function meetsCustomCraftEnableEval(item) {
    if (!item || item.customCraftEnableEval === null) {
      return true;
    }
    /* eslint-disable */


    var enable = true;
    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    var p = $gameParty;

    try {
      eval(item.customCraftEnableEval);
      /* eslint-disable */
    } catch (e) {
      throw e;
    }

    return enable;
  };

  $.alias.Window_SynthesisList_isEnabled = Window_SynthesisList.prototype.isEnabled;

  Window_SynthesisList.prototype.isEnabled = function (item) {
    var condition = $.alias.Window_SynthesisList_isEnabled.call(this, item);
    return condition && meetsCustomCraftEnableEval(item);
  };

  $.alias.Scene_Synthesis_initialize = Scene_Synthesis.prototype.initialize;

  Scene_Synthesis.prototype.initialize = function () {
    $.alias.Scene_Synthesis_initialize.call(this);
    this._justCrafted = [];
  }

  $.alias.Scene_Synthesis_onNumberOk = Scene_Synthesis.prototype.onNumberOk;

  Scene_Synthesis.prototype.onNumberOk = function () {
    this._justCrafted.push(this._listWindow.item());

    $.alias.Scene_Synthesis_onNumberOk.call(this);

    this._listWindow.refresh();
  };
})(WAYModuleLoader.getModule("WAY_YEP_ShopMenuCore"));