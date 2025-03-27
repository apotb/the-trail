//=============================================================================
// Fullscreen.js
//=============================================================================
 
/*:
 * @plugindesc Starts the game in fullscreen
 * @author Christian Schicho
 *
 * @help
 */
 
;(function() {
  function extend(obj, name, func) {
    var orig = obj.prototype[name]
    obj.prototype[name] = function() {
      orig.call(this)
      func.call(this)
    }
  }
 
  extend(Scene_Boot, 'start', function() {
		if (Graphics._isFullScreen() && !$gameTemp.isPlaytest()) Graphics._switchFullScreen();
  })

  const width = 1280;
  const height = 720;
  
  extend(Scene_Base, 'create', function() {
		Graphics.width = width;
		Graphics.height = height;
		Graphics.boxWidth = width;
    Graphics.boxHeight = height;
  })
 
})()