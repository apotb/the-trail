//=============================================================================
// MOG_TrPopUpBattle.js
//=============================================================================

/*:
 * @plugindesc (v1.0) Apresenta os ícones dos tesouros após o inimigo morrer.
 * @author Moghunter
 *
 * @param Drop Item Real Time
 * @desc Ganhar o item em tempo real.
 * @default true 
 *
 * @param Animation Type
 * @desc Tipo de animação.
 * 0 - Bouncing     1 - Floating
 * @default 0
 *
 * @param Fade Duration
 * @desc Tempo para fazer o item desaparecer.
 * @default 20
 *
 * @param Scale
 * @desc Tamanho do ícone do tesouro.
 * @default 0.8
 *
 * @help  
 * =============================================================================
 * +++ MOG Treasure PopUp Battle (v1.0) +++
 * By Moghunter 
 * https://atelierrgss.wordpress.com/
 * =============================================================================
 * Apresenta os ícones dos tesouros após o inimigo morrer.
 *
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
　　var Imported = Imported || {};
　　Imported.MOG_TrPopUpBattle = true;
　　var Moghunter = Moghunter || {}; 

  　Moghunter.parameters = PluginManager.parameters('MOG_TrPopUpBattle');
    Moghunter.trPopup_animation = Number(Moghunter.parameters['Animation Type'] || 0);
	Moghunter.trPopup_scale = Number(Moghunter.parameters['Scale'] || 0.8);
	Moghunter.trPopup_fadeDuration = Number(Moghunter.parameters['Fade Duration'] || 20);
	Moghunter.trPopup_dropRealTime = String(Moghunter.parameters['Drop Item Real Time'] || 'false');

//=============================================================================
// ** Game Temp
//=============================================================================

//==============================
// * Initialize
//==============================
var _mog_trPopBattle_tempInitialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
	_mog_trPopBattle_tempInitialize.call(this);
	this._trBatNeedPopUp = false;
	this._trBatRealTimeDrop = (Moghunter.trPopup_dropRealTime) == 'true' ? true : false;
	this._trBatDropLock = false;
};

//=============================================================================
// ** Game Enemy
//=============================================================================
var _mog_trPopBattle_gEnemy_initMembers = Game_Enemy.prototype.initMembers;
Game_Enemy.prototype.initMembers = function() {
    _mog_trPopBattle_gEnemy_initMembers.call(this);
    this._treasure = {};
	this._treasure.needPopup = false;
	this._treasure.checked = false;
	this._treasure.item = [];
};

//==============================
// * make Drop Items
//==============================
Game_Enemy.prototype.makeDropItems = function() {
	if (this._treasure.checked) {
	    return this._treasure.item;
	} else {
		return this.enemy().dropItems.reduce(function(r, di) {
			if (di.kind > 0 && Math.random() * di.denominator < this.dropItemRate()) {
				return r.concat(this.itemObject(di.kind, di.dataId));
			} else {
				return r;
			}
		}.bind(this), []);
	};
};
		
//=============================================================================
// ** Battle Manager
//=============================================================================

//==============================
// * gain Drip Items
//==============================
var _mog_BMangr_gainDropItems = BattleManager.gainDropItems;
BattleManager.gainDropItems = function() {
	if ($gameTemp._trBatDropLock) {return};
	// This should NEVER run; it duplicates drops for some boss battles
	// _mog_BMangr_gainDropItems.call(this);
};

//=============================================================================
// ** Scene Map
//=============================================================================

//==============================
// * Initialize
//==============================
var _mog_trPopup_scMap_initialize = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function() {
	$gameTemp._trBatDropLock = false;
	_mog_trPopup_scMap_initialize.call(this)
};		
		
//=============================================================================
// ** Sprite Enemy
//=============================================================================

//==============================
// * Update Collapse
//==============================
var _mog_trPopBattle_sprEnemy_updateCollapse = Sprite_Enemy.prototype.updateCollapse;
Sprite_Enemy.prototype.updateCollapse = function() {
    _mog_trPopBattle_sprEnemy_updateCollapse.call(this);
	if (this._effectDuration === 0 && !this._enemy._treasure.checked) {this.checkTreasurePopup()};
};

//==============================
// * Update Boss Collapse
//==============================
var _mog_trPopBattle_sprEnemy_updateBossCollapse = Sprite_Enemy.prototype.updateBossCollapse;
Sprite_Enemy.prototype.updateBossCollapse = function() {
    _mog_trPopBattle_sprEnemy_updateBossCollapse.call(this);
    if (this._effectDuration === 0 && !this._enemy._treasure.checked) {this.checkTreasurePopup()};
};

//==============================
// * Update Instant Collapse
//==============================
var _mog_trPopBattle_sprEnemy_updateInstantCollapse = Sprite_Enemy.prototype.updateInstantCollapse;
Sprite_Enemy.prototype.updateInstantCollapse = function() {
    _mog_trPopBattle_sprEnemy_updateInstantCollapse.call(this);
	if (this._effectDuration === 0 && !this._enemy._treasure.checked) {this.checkTreasurePopup()};
};

//==============================
// * check Treasure Popup
//==============================
Sprite_Enemy.prototype.checkTreasurePopup = function() {
     this._enemy._treasure.item = this._enemy.makeDropItems();
	 this._enemy._treasure.checked = true;
	 if (this._enemy._treasure.item) {
		 this._enemy._treasure.needPopup = true;
		 $gameTemp._trBatNeedPopUp = true;
	 };
};

//=============================================================================
// ** Spriteset Battle
//=============================================================================

//==============================
// * create Enemies
//==============================
var _mog_trPopupBat_sprBat_update = Spriteset_Battle.prototype.update;
Spriteset_Battle.prototype.update = function() {
	_mog_trPopupBat_sprBat_update.call(this);
	if ($gameTemp._trBatNeedPopUp) {this.treasurePopupR()};
};

//==============================
// * create Enemies
//==============================
Spriteset_Battle.prototype.treasurePopupR = function() {
	$gameTemp._trBatNeedPopUp = false;
	if (!this._enemiesTreasure) {this._enemiesTreasure = []};
	for (var i = 0; i < this._enemySprites.length; i++) {
		 if (this._enemySprites[i]._enemy && this._enemySprites[i]._enemy._treasure.needPopup) {
			 this._enemySprites[i]._enemy._treasure.needPopup = false;
		     this._enemiesTreasure[i] = new SpriteEnemyTrP(this._enemySprites[i]);
		     this._enemiesTreasure[i].z = this._enemySprites[i].z ? this._enemySprites[i].z + 1 : 2;
		     this._battleField.addChild(this._enemiesTreasure[i]);
		 };
	};
};

//=============================================================================
// * Sprite Enemy TrP
//=============================================================================
function SpriteEnemyTrP() {
    this.initialize.apply(this, arguments);
};

SpriteEnemyTrP.prototype = Object.create(Sprite.prototype);
SpriteEnemyTrP.prototype.constructor = SpriteEnemyTrP;

//==============================
// * Initialize
//==============================
SpriteEnemyTrP.prototype.initialize = function(sprite) {
    Sprite.prototype.initialize.call(this);	
	this._sprite = sprite;
	this._mode = Moghunter.trPopup_animation;
	this.visible = false;
	this._enemy = this._sprite._enemy;
    this.createIcon();
	if ($gameTemp._trBatRealTimeDrop) {
		$gameTemp._trBatDropLock = true;
		this.gainDropItems();
	};
};

//==============================
// * Initialize
//==============================
SpriteEnemyTrP.prototype.gainDropItems = function() {
    var items = this._enemy._treasure.item;
    items.forEach(function(item) {
        $gameParty.gainItem(item, 1);
		$droppeditems.push(item) // Edit: Added to show exact number of drops.
    });
};

//==============================
// * create Icon
//==============================
const RARITY_COLORS = {
    1: 0x80ff80,	// Uncommon
    2: 0x84aaff,	// Rare
    3: 0xa060e0,	// Epic
    4: 0xf0c040,	// Legendary
    5: 0xff80ff,	// Mythic
};

SpriteEnemyTrP.prototype.createIcon = function () {
    this._iconImg = ImageManager.loadSystem("IconSet");
    this._glowImg = ImageManager.loadSystem("Glow");
    this._icons = [];
    this._glows = [];
    this._iconContainers = [];

    const items = this._enemy._treasure.item;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;

        const group = new Sprite();
        const icon = new Sprite(this._iconImg);
        icon.item = item;
        icon.index = i;
        icon.anchor.set(0.5, 1);
        this.refreshIcons(icon);
        group.icon = icon;

        if (item.rarity >= 1) {
            const glow = new Sprite(this._glowImg);
            glow.anchor.set(0.5, 0.5);
            glow.scale.set(0.6 + item.rarity * 0.4);
            glow.tint = RARITY_COLORS[item.rarity] || 0xffffff;
            glow.alpha = 0.8;
            glow._baseScale = glow.scale.x;
            glow._pulseTime = 0;
            glow._icon = icon;
            glow.update = function () {
                this._pulseTime += 0.06;
                const scaleMod = 0.1 * Math.sin(this._pulseTime);
                this.scale.set(this._baseScale + scaleMod);
                if (this._icon) {
                    this.x = this._icon.x;
                    this.y = this._icon.y - Window_Base._iconHeight / 2;
                    this.opacity = this._icon.opacity;
                    this.visible = this._icon.visible;
                }
            };
            this._glows.push(glow);
            group.addChild(glow);
        }

        group.addChild(icon);
        icon.z = 1;
        group.intY = icon.intY || 0;

        this._icons.push(group);
        this._iconContainers.push(group);
        this.addChild(group);
        this.refreshWait(icon, i, items.length);
    }

    this.children.sort((a, b) => (a.intY || 0) - (b.intY || 0));
};

//==============================
// * refresh Wait
//==============================
SpriteEnemyTrP.prototype.refreshWait = function(sprite,index,maxv) {
	var mv = maxv * 20;
	var mvt = mv - (20 * index)
    sprite.wait = Moghunter.trPopup_fadeDuration + mvt;
};

//==============================
// * refresh Icons
//==============================
SpriteEnemyTrP.prototype.refreshIcons = function(sprite) {
	var w = Window_Base._iconWidth;
	var h = Window_Base._iconHeight;
	var iconindex = sprite.item.iconIndex;
	var sx = iconindex % 16 * w;
	var sy = Math.floor(iconindex / 16) * h;
	var hr = Math.randomInt(h);
    sprite.setFrame(sx,sy,w,h);
	sprite.intY = ((this._sprite.height / 3) + hr) - h;
	sprite.dr = 60;
	sprite.dy = 15;
	sprite.y = -40;
	sprite.ry = sprite.y + sprite.intY;
	var randx = (Math.random() * 0.5) + (sprite.index / 8);
	var rands = Math.randomInt(2);
	sprite.sx = rands === 0 ? randx : -randx;
	sprite.scale.x = Moghunter.trPopup_scale;
	sprite.scale.y = sprite.scale.x;
};

//==============================
// * Update Bounce
//==============================
SpriteEnemyTrP.prototype.updateBounce = function(sprite) {
	 sprite.dy += 0.6;
	 sprite.ry += sprite.dy;
	 if (sprite.ry >= 0) {
		 sprite.ry = 0;
		 sprite.dy *= -0.7;
	 };
	 sprite.y = -sprite.intY + Math.round(sprite.ry);
	 if (sprite.y < -sprite.intY) {sprite.x += sprite.sx};	
	 if (sprite.y === -sprite.intY) {this.updateFade(sprite)}; 
};

//==============================
// * Update Float
//==============================
SpriteEnemyTrP.prototype.updateFloat= function(sprite) {
	sprite.wait--;
	if (sprite.wait > 0) {return};	
    sprite.y -= 3
	sprite.opacity -= 8; 
};

//==============================
// * Update Animation
//==============================
SpriteEnemyTrP.prototype.updateAnimation= function(sprite) {
   if (this._mode === 1) {
	   this.updateFloat(sprite);
   } else {
       this.updateBounce(sprite);
   };
};

//==============================
// * Update Fade
//==============================
SpriteEnemyTrP.prototype.updateFade = function(sprite) {
	sprite.wait--;
	if (sprite.wait > 0) {return};
	sprite.opacity -= 15;
	sprite.scale.x -= 0.05
	sprite.scale.y += 0.15
};

//==============================
// * Update Sprites
//==============================
SpriteEnemyTrP.prototype.updateSprites = function(sprite) {
	this.visible = true;
	this.updateAnimation(sprite);

	for (let i = 0; i < sprite.children.length; i++) {
		if (sprite.children[i].update) {
			sprite.children[i].update();
		}
	}

	if (sprite.opacity <= 0) {
		sprite.visible = false;
	}
};

//==============================
// * Update
//==============================
SpriteEnemyTrP.prototype.update = function () {
    Sprite.prototype.update.call(this);
    this.x = this._sprite.x;
    this.y = this._sprite.y;

    if (this._iconImg.isReady()) {
        for (const group of this._icons) {
            const icon = group?.icon;
            if (icon?.visible) this.updateSprites(icon);
        }
    }

    for (const glow of this._glows) {
        glow.update?.();
    }
};