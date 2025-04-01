//=============================================================================
// Yanfly Engine Plugins - Music Menu
// YEP_MusicMenu.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_MusicMenu = true;

var Yanfly = Yanfly || {};
Yanfly.MusicMenu = Yanfly.MusicMenu || {};
Yanfly.MusicMenu.version = 1.01;

//=============================================================================
 /*:
 * @plugindesc v1.01 Access and play music from a menu! Players can unlock
 * songs from in the game as they play.
 * @author Yanfly Engine Plugins + Chickie Collaboration
 *
 * @param ---General---
 * @default
 *
 * @param Music Icon
 * @parent ---General---
 * @desc This icon will be displayed next to each song entry!
 * @default 80
 *
 * @param Hidden Name
 * @parent ---General---
 * @desc This will be a song's name in the song list if it hasn't been
 * unlocked in the music menu yet.
 * @default ? ? ? ? ?
 *
 * @param Hidden Help
 * @parent ---General---
 * @desc This text will display in the help window at the top of the
 * page when a song hasn't been unlocked yet.
 * @default This song hasn't been unlocked yet.
 *
 * @param Song List
 * @desc All song data. Format:
 * filename; display name; volume; pitch; pan; description; icon
 * @type text[]
 * @default []
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin adds a new menu that you can send the player into. In it, the
 * player will be able to play any songs previously encountered within the game
 * that you allow them to be able to play. You can set the filename, display
 * name of the song, the volume, pitch, pan, and even the help description for
 * when the song will be replayed. 
 *
 * This is a collaboration plugin by Chickie and Yanfly to ensure compatibility
 * with the Yanfly Engine Plugins library.
 *
 * ============================================================================
 * Instructions
 * ============================================================================
 *
 * The songs displayed in the Music Menu will only be the ones you list within
 * the plugin parameters labled as Song x Data.
 *
 * When entering the song data, it has to be done in a certain format:
 *
 *   filename; display name; description; icon
 *
 * Each data segment is separated by a ; and must be entered in that particular
 * order to keep all the data ordered and read correctly. Here is how to apply
 * each entry:
 *
 *   filename
 *   - This is the filename of the song. This must be case sensitive and must
 *   not include the file extension. For example, theme.mp3 will be written as
 *   theme for the parameters
 *
 *   display name
 *   - This is the name displayed in the game in the music menu. This has no
 *   effect on the actual song itself.
 *
 *   volume
 *   - This will be the volume the song will be played at inside the music menu
 *   scene. Use an integar value from 0 to 100 for the plugin parameters.
 *
 *   pitch
 *   - This is the pitch played for the song inside the music menu. Use an
 *   integar value from 0 to 200 for the plugin parameters.
 *
 *   pan
 *   - This is the pan applied to the song inside the music menu. Use a value
 *   from -100 to 100 for the plugin parameters.
 *
 *   description
 *   - The help description that appears when the song is selected. The help
 *   description will appear at the top of the screen. You can use any kind of
 *   text code you want for this setting.
 *
 * ============================================================================
 * Main Menu Manager - Positioning the Music Menu
 * ============================================================================
 *
 * For those using the Main Menu Manager and would like to position the Music
 * Menu command in a place you'd like, use the following format:
 *
 *       Name: "Music Menu"
 *     Symbol: musicMenu
 *       Show: $gameSwitches.value(Insert a Switch ID to show this command)
 *    Enabled: $gameSwitches.value(Insert a Switch ID to enable this command)
 *        Ext: 
 *  Main Bind: this.commandMusicMenu.bind(this)
 * Actor Bind: 
 *
 * Insert the above setup within a Main Menu Manager slot. Provided you copy
 * the exact settings to where you need it, it will appear there while using
 * all of the naming, enabling, disabling, hiding, and showing effects done by
 * the plugin parameters.
 *
 * Remember to turn off 'Auto Add Menu' from the plugin parameters.
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * You can use the following plugin commands to alter the music menu settings
 * for your game in many ways.
 *
 * Plugin Commands:
 *
 *   GoToMusicMenu
 *   - Sends the player to the music menu scene.
 *
 *   AllMusicMenuSongs
 *   - Unlocks all music for the player without the player needing to hear it
 *   in the game at least once.
 *
 *   NormalMusicMenuSongs
 *   - Removes the unlock all setting. The player now needs to hear music in
 *   the game at least once to unlock the song. This does not remove already
 *   unlocked song entries.
 *
 *   UnlockMusicMenuSong x
 *   UnlockMusicMenuSong x x x
 *   - This will unlock song ID x for the game. Use multiple x's to unlock a
 *   group of songs at once. x will refer to the ID found in the plugin's
 *   parameters. The referred song will be unlocked without the player needing
 *   to hear the song in the game at least once.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.01:
 * - Updated for RPG Maker MV version 1.5.0.
 *
 * Version 1.00:
 * - Finished Plugin!
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('YEP_MusicMenu');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.MusicMenuIcon = Number(Yanfly.Parameters['Music Icon']);
Yanfly.Param.MusicMenuHiddenName = String(Yanfly.Parameters['Hidden Name']);
Yanfly.Param.MusicMenuHiddenHelp = String(Yanfly.Parameters['Hidden Help']);

Yanfly.SetupMusicMenuParameters = function() {
  Yanfly.Param.MusicMenuSongFilenameList = [''];
  Yanfly.Param.MusicMenuSongIconList = [''];
  Yanfly.Param.MusicMenuSongList = [['']];
  const songs = JSON.parse(Yanfly.Parameters['Song List']);
  for (var i = 0; i < songs.length; i++) {
    var paramStr = songs[i];
    var paramData = paramStr.split(';')
    Yanfly.Param.MusicMenuSongList.push(paramData);
    Yanfly.Param.MusicMenuSongFilenameList.push(paramData[0]);
    Yanfly.Param.MusicMenuSongIconList.push(paramData[3]);
  }
}

Yanfly.SetupMusicMenuParameters();

//=============================================================================
// AudioManager
//=============================================================================

Yanfly.MusicMenu.AudioManager_playBgm = AudioManager.playBgm;
AudioManager.playBgm = function(bgm, pos) {
  Yanfly.MusicMenu.AudioManager_playBgm.call(this, bgm, pos);
  var bgmName = bgm?.name;
  if (bgmName && Yanfly.Param.MusicMenuSongFilenameList.contains(bgmName)) {
    if ($gameSystem) {
      var index = Yanfly.Param.MusicMenuSongFilenameList.indexOf(bgmName);
      $gameSystem.unlockMusicMenuSong(index);
    }
  }
};

//=============================================================================
// Game_System
//=============================================================================

Yanfly.MusicMenu.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
  Yanfly.MusicMenu.Game_System_initialize.call(this);
  this.initMusicMenuSettings();
};

Game_System.prototype.initMusicMenuSettings = function() {
  this._unlockedMusicMenuSongs = [];
  this._unlockAllMusicMenuSongs = false;
};

Game_System.prototype.getUnlockedMusicMenuSongs = function() {
  if (this._unlockedMusicMenuSongs === undefined) {
    this.initMusicMenuSettings();
  }
  return this._unlockedMusicMenuSongs;
};

Game_System.prototype.unlockMusicMenuSong = function(id) {
  if (this._unlockedMusicMenuSongs === undefined) {
    this.initMusicMenuSettings();
  }
  if (this._unlockedMusicMenuSongs.contains(id)) {
    return;
  } else {
    this._unlockedMusicMenuSongs.push(id);
  }
};

Game_System.prototype.isUnlockedMusicMenuSong = function(id) {
  if (this._unlockedMusicMenuSongs === undefined) {
    this.initMusicMenuSettings();
  }
  if (this.isUnlockedAllMusicMenuSongs()) {
    return true;
  }
  return this._unlockedMusicMenuSongs.contains(id);
};

Game_System.prototype.unlockAllMusicMenuSongs = function(value) {
  if (this._unlockedMusicMenuSongs === undefined) {
    this.initMusicMenuSettings();
  }
  this._unlockAllMusicMenuSongs = value;
};

Game_System.prototype.isUnlockedAllMusicMenuSongs = function() {
  if (this._unlockedMusicMenuSongs === undefined) {
    this.initMusicMenuSettings();
  }
  return this._unlockAllMusicMenuSongs;
};

//=============================================================================
// Game_Interpreter
//=============================================================================

Yanfly.MusicMenu.Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  Yanfly.MusicMenu.Game_Interpreter_pluginCommand.call(this, command, args);
  if (command === 'GoToMusicMenu') {
    SceneManager.push(Scene_MusicMenu);
  }
  if (command === 'AllMusicMenuSongs') {
    $gameSystem.unlockAllMusicMenuSongs(true);
  }
  if (command === 'NormalMusicMenuSongs') {
    $gameSystem.unlockAllMusicMenuSongs(false);
  }
  if (command === 'UnlockMusicMenuSong') {
    for (var i = 0; i < args.length; i++) {
      var songId = args[i];
      if (songId > 0) {
        $gameSystem.unlockMusicMenuSong(parseInt(songId));
      }
    }
  }
};

//=============================================================================
// Window_MusicMenuList
//=============================================================================

function Window_MusicMenuList() {
    this.initialize.apply(this, arguments);
}

Window_MusicMenuList.prototype = Object.create(Window_Command.prototype);
Window_MusicMenuList.prototype.constructor = Window_MusicMenuList;

Window_MusicMenuList.prototype.initialize = function(helpWindow) {
  this._helpWindow = helpWindow;
  Window_Command.prototype.initialize.call(this, 0, helpWindow.height);
  this.setHelpWindow(helpWindow);
};

Window_MusicMenuList.prototype.windowWidth = function() {
  return Graphics.boxWidth;
};

Window_MusicMenuList.prototype.windowHeight = function() {
  return Graphics.boxHeight - this._helpWindow.height;
};

Window_MusicMenuList.prototype.makeCommandList = function() {
  var array = Yanfly.Param.MusicMenuSongList;
  var length = array.length;
  for (var i = 0; i < length; ++i) {
    var data = array[i];
    if (data.length > 1) {
      var ext = {
        name: data[0],
        volume: 100,
        pitch: 100,
        pan: 0,
        description: ''
      }
      if ($gameSystem.isUnlockedMusicMenuSong(i)) {
        var name = [i] + ". " + data[1].trim();
        ext.description = data[2].trim();
        var enabled = true;
      } else {
        var name = [i] + ". " + Yanfly.Param.MusicMenuHiddenName.trim();
        ext.description = Yanfly.Param.MusicMenuHiddenHelp.trim();
        var enabled = false;
      }
      this.addCommand(name, 'playsong', enabled, ext);
    }
  }
};

Window_MusicMenuList.prototype.updateHelp = function() {
  this.setHelpWindowItem(this.currentExt());
};

Window_MusicMenuList.prototype.drawItem = function(index) {
  var rect = this.itemRectForText(index);
  var align = this.itemTextAlign();
  this.resetTextColor();
  this.changePaintOpacity(this.isCommandEnabled(index));
  var icon = Yanfly.Param.MusicMenuSongIconList[index + 1];
  this.drawIcon(icon, rect.x + 2, rect.y + 2);
  var ibw = Window_Base._iconWidth + 4;
  var name = this.commandName(index);
  this.drawText(name, rect.x + ibw, rect.y, rect.width - ibw, align);
};

//=============================================================================
// Scene_Menu
//=============================================================================

Scene_Menu.prototype.commandMusicMenu = function() {
  SceneManager.push(Scene_MusicMenu);
};

//=============================================================================
// Scene_MusicMenu
//=============================================================================

function Scene_MusicMenu() {
  this.initialize.apply(this, arguments);
}

Scene_MusicMenu.prototype = Object.create(Scene_MenuBase.prototype);
Scene_MusicMenu.prototype.constructor = Scene_MusicMenu;

Scene_MusicMenu.prototype.initialize = function() {
  Scene_MenuBase.prototype.initialize.call(this);
};

Scene_MusicMenu.prototype.create = function() {
  Scene_MenuBase.prototype.create.call(this);
  this.saveBgmAndBgs();
  AudioManager.fadeOutBgm(1)
  AudioManager.fadeOutBgs(1)
  this.createHelpWindow();
  this.createMusicListWindow();
};

Scene_MusicMenu.prototype.saveBgmAndBgs = function() {
  this._mapBgm = AudioManager.saveBgm();
  this._mapBgs = AudioManager.saveBgs();
};

Scene_MusicMenu.prototype.replayBgmAndBgs = function() {
  if (this._mapBgm) {
    AudioManager.replayBgm(this._mapBgm);
  } else {
    AudioManager.stopBgm();
  }
  if (this._mapBgs) {
    AudioManager.replayBgs(this._mapBgs);
  }
};

Scene_MusicMenu.prototype.createMusicListWindow = function() {
  this._musicListWindow = new Window_MusicMenuList(this._helpWindow);
  this.addWindow(this._musicListWindow);
  this._musicListWindow.setHandler('cancel', this.exitScene.bind(this));
  this._musicListWindow.setHandler('playsong', this.playSong.bind(this));
};

Scene_MusicMenu.prototype.exitScene = function() {
  this.replayBgmAndBgs();
  this.popScene();
};

Scene_MusicMenu.prototype.playSong = function() {
  var songData = this._musicListWindow.currentExt();
  AudioManager.playBgm(songData);
  this._musicListWindow.activate();
};

//=============================================================================
// End of File
//=============================================================================