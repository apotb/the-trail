/*=============================================================================
 * Orange - Screenshot Saver
 * By Hudell - www.hudell.com
 * OrangeScreenshotSaver.js
 * Version: 1.0
 * Free for commercial and non commercial use.
 *=============================================================================*/
 /*:
 * @plugindesc This plugin will automatically save screenshots in a "Screenshots" folder inside the game
 *             
 * @author Hudell
 */
var Imported = Imported || {};

var OrangeScreenshotSaver = OrangeScreenshotSaver || {};

(function($) {
  "use strict";

  const fs = require('fs');
  const path = require('path');
  const screenshotPath = path.join(StorageManager.localFileDirectoryPath(), './screenshots');

  $.generateFileName = function(){
    var date = new Date();
    return '' + date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds() + '_' + date.getMilliseconds() + '.png';
  };

  $.saveScreenshot = function(){
    if (!Utils.isNwjs()) return;
    try {
      $gameSystem.setShowMapQuestWindow(false);
      if (scene() instanceof Scene_Map) {
        scene()._gabWindow?.hide();
        scene()._mapNameWindow?.hide();
      }

      if (!fs.existsSync(screenshotPath)) {
        fs.mkdirSync(screenshotPath, { recursive: true });
      }
      var fileName = screenshotPath + '/' + $.generateFileName();

      setTimeout(function() {
        requestAnimationFrame(function() {
          var snap = SceneManager.snap();
          var urlData = snap._canvas.toDataURL();
          var base64Data = urlData.replace(/^data:image\/png;base64,/, "");
        
          fs.writeFileSync(fileName, base64Data, 'base64');

          if (!fs.existsSync(fileName)) alert("Screenshot failed to save");
  
          setTimeout(function() {
            $gameSystem.setShowMapQuestWindow(true);
            if (scene() instanceof Scene_Map) {
              scene()._gabWindow?.show();
              scene()._mapNameWindow?.show();
            }
          }, 100);
        });
      }, 100);
    } catch (error) {
      console.error("An error occurred while saving the screenshot:", error);
      alert("Screenshot failed: " + error.message);
      $gameSystem.setShowMapQuestWindow(true);
    }
  };

  var oldInput_onKeyUp = Input._onKeyUp;
  Input._onKeyUp = function(event) {
    oldInput_onKeyUp.call(this, event);

    if ((event.keyCode == 44 || Input.keyMapper[event.keyCode] == "p") && !(SceneManager._scene instanceof Scene_Name)) {
      $.saveScreenshot();
      AudioManager.playSe({name: "Save", pan: 0, pitch: 100, volume: 100});
    }
  };

  var OrangeScreenshotSaver_Scene_Title_createCommandWindow = 
    Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function() {
    OrangeScreenshotSaver_Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler('screenshots', this.commandScreenshots.bind(this));
  };

  Scene_Title.prototype.commandScreenshots = function() {
    const openExplorer = require('open-file-explorer');
    if (!fs.existsSync(screenshotPath)) fs.mkdir(screenshotPath, (err) => { if (err) return console.error(err); }); 
    openExplorer(screenshotPath, err => {
      if (err) console.error(err);
    });
    this._commandWindow.activate();
  };
  Scene_Menu.prototype.commandScreenshots = Scene_Title.prototype.commandScreenshots;
})(OrangeScreenshotSaver);

Imported["OrangeScreenshotSaver"] = true;