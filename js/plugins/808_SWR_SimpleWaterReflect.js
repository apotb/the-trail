//===============================================================================
// Simple Water Reflection
//===============================================================================
// RPG Maker MV Plugin
// File: 808_SWR_SimpleWaterReflect.js
//...............................................................................
// Version: Beta 0.9
// Date: 18 Aug. 2024
//...............................................................................
//===============================================================================

/*:
 * @plugindesc v0.9b - Adds character reflections above the parallax layer using region tags.
 * Configurable effects, offset, directional reflect, and size options.
 * @author mugen808
 *
 * @param Reflect Regions
 * @type text
 * @desc Region IDs where reflections should appear. Enter as comma-separated values (e.g., 1,7,9).
 * @default 10
 *
 * @param Reflect Opacity
 * @type number
 * @desc Opacity of the reflection (0-255).
 * @default 128
 *
 * @param Reflect Scale
 * @type number
 * @desc Vertical scale of the reflection (0.1-2).
 * @default 1
 *
 * @param Reflect Horizontal Scale
 * @type number
 * @desc Horizontal scale of the reflection (0.1-2).
 * @default 1.05
 *
 * @param Reflect Vertical Scale
 * @type number
 * @desc Vertical scale of the reflection (0.1-2).
 * @default 0.85
 *
 * @param Reflect Hero
 * @type boolean
 * @desc Reflect the player (hero) character?
 * @default true
 *
 * @param Reflect Followers
 * @type boolean
 * @desc Reflect follower characters?
 * @default true
 *
 * @param Reflect Events
 * @type boolean
 * @desc Reflect map events?
 * @default true
 *
 * @param Wave Amplitude
 * @type number
 * @desc Amplitude of the wave effect (0.0 to 10.0).
 * @default 2
 *
 * @param Wave Frequency
 * @type number
 * @desc Frequency of the wave effect (0.1 to 10.0).
 * @default 3
 *
 * @param Distortion Amplitude
 * @type number
 * @desc Experimental. Amplitude of the distortion effect (0.0 to 10.0).
 * @default 0
 *
 * @param Distortion Frequency
 * @type number
 * @desc Experimental. Frequency of the distortion effect (0.1 to 10.0).
 * @default 0
 *
 * @param Ripple Amplitude
 * @type number
 * @desc Experimental. Amplitude of the ripple effect (0.0 to 10.0).
 * @default 0
 *
 * @param Ripple Frequency
 * @type number
 * @desc Experimental. Frequency of the ripple effect (0.1 to 10.0).
 * @default 0
 *
 * @param Reflection Offset
 * @type number
 * @desc Offset for the reflection sprite. Can input negative values. Ex: -10
 * @default 0
 *
 * @param Reflection Angle
 * @type number
 * @desc Angle of reflection in degrees. (-180 to 180)
 * @default 5
 *
 * @param Reflection Layer
 * @type number
 * @desc Z-index layer of the reflection in the parallax layer (lower values are drawn underneath).
 * @default -1
 *
 * @param Directional Reflection
 * @type boolean
 * @desc Should the reflection face the direction of the character?
 * @default false
 *
 * @help
 *    Simple Water Reflection
 *==============================================================================
 * This plugin adds character reflections on the parallax level based on
 * region tags.
 *
 *
 *------------------------------------------------------------------------------
 * HOW TO USE
 *------------------------------------------------------------------------------
 * Graphic And Mapping Requirements:
 *
 * - Reflections appear in the regions specified in the plugin parameters.
 *   (Regions are on the left panel of RPG Maker after layers A, B, C, D, E;
 *   it is the R tab, they are not Terrain Tags).
 *
 * - It is best to tag the tiles around the reflection area with the reflection
 *   Region ID to ensure there is no delay with the appearance of the reflection
 *   once the hero arrives on water. See the demo for a showcase.
 *
 * - Parallax level is under the ground level, so default grass (even with the
 *   correct region ID) won't let the character's reflection appear.
 *
 * - The water tileset or autotiles require to be semi-transparent to let the
 *   reflection appear.
 *
 * - To simulate a reflection on non-liquid surface, glass for instance, the
 *   floor tileset used for ground has to be semi-transparent. A glass pattern
 *   or blue color parallax may possibly be used under the ground tiles to avoid
 *   darkening the mid-opacity floor tiles with no parallax under them.
 *
 * - Parallaxes can  be used instead of water tiles/autotiles and the reflections
 *   will appear above the parallax and under the ground.
 *
 *
 *------------------------------------------------------------------------------
 * FEATURES & PARAMETERS
 *------------------------------------------------------------------------------
 *
 * - You can add a wave effect in the plugin parameters to simulate water
 *   undulation.
 *
 * - The plugin parameters allow setting general rules for events' reflection,
 *   determining if they should normally be displayed.
 *
 * - Directional Reflection will have the reflection follow the hero's direction,
 *   while default behavior when Reflection Angle = 0 is fixed to south.
 *
 *
 *------------------------------------------------------------------------------
 * NOTES & COMMENT TAGS
 *------------------------------------------------------------------------------
 *
 * - If you want to control which events may reflect or not individually, use
 *   the following tags:
 *
 *   <reflect_on>
 *   <reflect_off>
 *
 *   Note Field:
 *   - If one of these tags is stored in the NOTE field of an event, this
 *     instruction will override the plugin parameters.
 *   - Example: If your plugin parameter is set to reflect events, but Event 010
 *     has the <reflect_off> tag in its Note field, Event 010 will not display a
 *     reflection.
 *
 *   Comment Field (Active Page Only):
 *   - These tags can also be used in a COMMENT to dynamically update whether an
 *     event should reflect or not.
 *   - When using the tags in a comment rather than in a note field, the tag
 *     will override the plugin parameters only IF the comment is on the active
 *     page of the event.
 *
 *   Comment Overrides Note:
 *   - If contradictory tags are present in both the event's Note and the
 *     event's active page Comment field simultaneously, the Comment will take
 *     precedence, allowing you to set a general reflection rule for this event
 *     (without repeating it on every page, thanks to the Note), and create an
 *     exception on the active page (thanks to the Comment), if needed.
 *
 *   Tag conflict:
 *   - <reflect_on> and <reflect_off> should obviously not been put together in
 *    the same Note field. If you need both effects on the same event, rather
 *    use comments on its relevant pages. Should both Note tags be present in
 *    the same event's note field and the <reflect_off> tag will take precedence.
 *
 *
 *------------------------------------------------------------------------------
 * PLUGIN COMMANDS
 *------------------------------------------------------------------------------
 *
 * Different effects can be invoked in the game with plugin commands:
 *
 * - SetReflectionAngle [angle] - Sets the angle of the reflection.
 *    Example: SetReflectionAngle -30
 *
 * - SetReflectionOffset [offset] - Sets the reflection offset for the reflection
 *                                  sprite.
 *   Example: SetReflectionOffset 40
 *
 * - SetReflectionLayer [layer] - Sets the Z-index layer for the reflection
 *                                in the parallax layer.
 *    Example: SetReflectionLayer 10
 *
 *
 * - SetDirectionalReflection [true/false] - Enable or disable directional
 *                                           reflection.
 *    Example: SetDirectionalReflection true
 *
 *
 * - SetReflectOpacity [opacity] - Sets the opacity of the reflection. (0 ~ 255 )
 *    Example: SetReflectOpacity 128
 *
 * - SetReflect_XScale [scale] - Sets the horizontal scale of the reflection
 *                               based on the character sprite size
 *    Example: SetReflect_XScale 1.15  //(original size +15%)
 *
 * - SetReflect_YScale [scale] - Sets the vertical scale of the reflection
 *                               based on the character sprite size
 *    Example: SetReflect_YScale 0.78  //(Original size -22%)
 *
 * - Effects deactivation
 *   Those commands may come in a handy before entering a non-liquid reflective
 *   surfaces:
 *
 * - SetWaveEffect [true/false] - Enable or disable the wave effect.
 *    Example: SetWaveEffect false
 *
 *
 * - SetRippleEffect [true/false] - Enable or disable the ripple effect.
 *    Example: SetRippleEffect true
 *
 *
 * - SetDistortionEffect [true/false] - Enable or disable the distortion effect.
 *    Example: SetDistortionEffect true
 *
 *
 *------------------------------------------------------------------------------
 * SCRIPT CALL
 *------------------------------------------------------------------------------
 *
 * Script calls to store the value of Directional Reflection and Reflection
 * offset are available.
 *
 * - Storing values
 *
 * - ReflectionOffset (value) :
 *   Storing the value in variable x:
 *    $gameVariables.setValue(x, window.getReflectionOffset());
 *
 *       Example to use Variable 2 as container:
 *       $gameVariables.setValue(2, window.getReflectionOffset());
 *
 * - DirectionalReflection (0 or true) :
 *   Storing the value in variable y:
 *    $gameVariables.setValue(y, window.getDirectionalReflection());
 *
 *
 * - Restoring values from variable:
 *
 * - Reflection Offset:
 *    var value = $gameVariables.value(x);
 *    window.setReflectionOffset(value);
 *
 * - DirectionalReflection:
 *   var value = $gameVariables.value(y);
 *   window.setDirectionalReflection(value);
 *
 *
 *------------------------------------------------------------------------------
 * COMPATIBILITY
 *------------------------------------------------------------------------------
 *
 * - Tested with Default Parallaxes Only:
 *   I haven't encountered compatibility issues, but theoretically, this may work
 *   differently with plugins that modify the way parallaxes are handled by the
 *   game engine.
 *
 * - Galv's Layer Graphics:
 *   - Parallax from Galv's plugin will appear above the reflection from Simple
 *     Water Reflection, preventing it from appearing if Galv's layers aren't
 *     set to mid opacity.
 *   - There is however a separate plugin patch (SWR_LayerZ.js) to allow
 *     the reflections of this plugin to display above Galv's parallax with Galv
 *     's Layer Graphics.
 *
 * -Animation Frames :
 *   This will work perfectly with default 3 frames sprites. If you have a
 *   number of frames different than 3, the directional reflection might have
 *   issues. Unless you are using Galv_CharacterFrames: Galv method has been
 *   included in this plugin, eg spritesheets names ending by %(x), where x is
 *   an integer and the sprite has x animations.
 *   Ex hero%(4).png
 *   If the suffix is missing, the plugin will consider it is a 3 frames
 *   character.
 *
 * - If you're using a plugin that modifies the number of frames, this plugin
 *   should be placed before (above).
 *
 *
 *------------------------------------------------------------------------------
 * KNOWN ISSUES
 *------------------------------------------------------------------------------
 *
 * -If directional reflection is true and characters or event is facing up, and
 *   the ground has the bush tag, the reflection may appear wrong.
 *   If that happens you will have to choose between not using directional
 *   reflection or not having reflective floor tagged as bush.
 *
 * - You might possibly encounter a crash with the error message: "cannot read
 *   property 'pivot' of null", under specific circumstances.
 *
 *   While this is not common, it usually occurs when you've changed an event's
 *   reflection status while simultaneously altering its graphic —whether by
 *   playing an animation on the event or by switching its graphic between pages—
 *   right before the event switches to a new page where the reflection status
 *   changes (i.e., one page displays the reflection and the other does not).
 *
 * - If this issue arises, simply add a wait (6 ~ 90 frames) before switching to
 *   the new event page.
 *   There is a showcase in the demo with the dead tree's reflection.
 *
 *
 *------------------------------------------------------------------------------
 * CHANGE LOG
 *------------------------------------------------------------------------------
 *
 *
 * 0.9
 * -Added a robuster check to ensure that reflections are only created when the
 *  character is on a reflective region ID.
 * -Added a robuster check to ensure that reflections are only refreshed when
 *  the character is on a reflective region ID.
 * -Strenghtened the method to remove reflections for characters that are no
 *  longer in reflective regions.
 *
 * 0.8
 * -Added support for Galv_CharacterFrames logic and spritesheet format, as:
 *   spritesheet%(x).png
 * -Simplified character size handling by removing parameters for character width
 *   and height, and the obsolete <reflect48> Note tag.
 *   Character dimensions are now automatically calculated.
 * -Changed the default wrong value in Reflection Layer from 6 to -1
 *
 * 0.7
 * -Replaced boolean conversion method with JSON.parse for better interpretation.
 *
 * 0.6
 * -Updated variable declarations from var to let and const for better
 *   consistency.
 *
 * 0.5
 * -Initial release
 *
 * 0.4 and earlier
 * -Experimental and unreleased versions.
 *
 *
 *------------------------------------------------------------------------------
 * TERMS
 *------------------------------------------------------------------------------
 *
 * Free to use
 * Please do not repost
 * I have no relation with Galv and his plugins are available on his website
 * https://galvs-scripts.com/2015/10/30/mv-layer-graphics/
 * https://galvs-scripts.com/2015/12/12/mv-character-frames/
 *
 *
 *...............................................................................
 */
//==============================================================================
// Initialization Of Paramters
//==============================================================================

(function() {
    // Retrieve and store parameters from the plugin manager
    const parameters = PluginManager.parameters('808_SWR_SimpleWaterReflect');
   
    // Store plugin parameters globally
    window.simpleWaterReflectParams = {
        reflectOpacity: Number(parameters['Reflect Opacity'] || 128), // Opacity of the reflection
        reflectScale: Number(parameters['Reflect Scale'] || 1), // General scale of the reflection
        reflectHorizontalScale: Number(parameters['Reflect Horizontal Scale'] || 1.05), // Horizontal scale of the reflection
        reflectVerticalScale: Number(parameters['Reflect Vertical Scale'] || 0.85), // Vertical scale of the reflection
        reflectHero: JSON.parse(parameters['Reflect Hero'] || 'false'), // Should the hero reflect?
        reflectFollowers: JSON.parse(parameters['Reflect Followers'] || 'false'), // Should followers reflect?
        reflectEvents: JSON.parse(parameters['Reflect Events'] || 'false'), // Should events reflect?
        waveAmplitude: Number(parameters['Wave Amplitude'] || 2), // Amplitude of the wave effect
        waveFrequency: Number(parameters['Wave Frequency'] || 3), // Frequency of the wave effect
        distortionAmplitude: Number(parameters['Distortion Amplitude'] || 0), // Amplitude of the distortion effect
        distortionFrequency: Number(parameters['Distortion Frequency'] || 0), // Frequency of the distortion effect
        rippleAmplitude: Number(parameters['Ripple Amplitude'] || 0), // Amplitude of the ripple effect
        rippleFrequency: Number(parameters['Ripple Frequency'] || 0), // Frequency of the ripple effect
        reflectionOffset: Number(parameters['Reflection Offset'] || 0), // Offset of the reflection
        reflectionAngle: Number(parameters['Reflection Angle'] || 5), // Angle of the reflection
        reflectionLayer: Number(parameters['Reflection Layer'] || -1), // Z-index layer of the reflection
        directionalReflection: JSON.parse(parameters['Directional Reflection'] || 'false'), // Should reflection follow the character's direction?
        reflectRegionsSet: new Set(parameters['Reflect Regions'].split(',').map(Number)) // Set of region IDs where reflections should appear
    };

    // Shortcuts for global parameters
    let reflectOpacity = window.simpleWaterReflectParams.reflectOpacity;
    let reflectScale = window.simpleWaterReflectParams.reflectScale;
    let reflectHorizontalScale = window.simpleWaterReflectParams.reflectHorizontalScale;
    let reflectVerticalScale = window.simpleWaterReflectParams.reflectVerticalScale;
    let reflectHero = window.simpleWaterReflectParams.reflectHero;
    let reflectFollowers = window.simpleWaterReflectParams.reflectFollowers;
    let reflectEvents = window.simpleWaterReflectParams.reflectEvents;
    let waveAmplitude = window.simpleWaterReflectParams.waveAmplitude;
    let waveFrequency = window.simpleWaterReflectParams.waveFrequency;
    let distortionAmplitude = window.simpleWaterReflectParams.distortionAmplitude;
    let distortionFrequency = window.simpleWaterReflectParams.distortionFrequency;
    let rippleAmplitude = window.simpleWaterReflectParams.rippleAmplitude;
    let rippleFrequency = window.simpleWaterReflectParams.rippleFrequency;
    let reflectionOffset = window.simpleWaterReflectParams.reflectionOffset;
    let reflectionAngle = window.simpleWaterReflectParams.reflectionAngle;
    let reflectionLayer = window.simpleWaterReflectParams.reflectionLayer;
    let directionalReflection = window.simpleWaterReflectParams.directionalReflection;
    const reflectRegionsSet = window.simpleWaterReflectParams.reflectRegionsSet;
   
    // Add functions to get and set the values of directionalReflection and reflectionOffset
    window.getDirectionalReflection = function() {
        return Boolean(directionalReflection);
    };
    window.setDirectionalReflection = function(value) {
        directionalReflection = value;
    };
    window.getReflectionOffset = function() {
        return reflectionOffset;
    };
    window.setReflectionOffset = function(value) {
        reflectionOffset = value;
    };

//==============================================================================
// Reflect Initialization
//==============================================================================

    // Create a new reflection layer within the parallax layer
    const _Spriteset_Map_createParallax = Spriteset_Map.prototype.createParallax;
   
    Spriteset_Map.prototype.createParallax = function() {
        _Spriteset_Map_createParallax.call(this); // Call the original createParallax method
        this._reflectionLayer = new Sprite(); // Create a new sprite for reflections
        this._baseSprite.addChild(this._reflectionLayer); // Add the reflection layer to the base sprite
        this._reflectionLayer.z = reflectionLayer; // Set the Z-index for the reflection layer
    };
   
//==============================================================================
// Plugin Parameters
//==============================================================================

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args); // Call the original plugin command method

        if (command === 'SetReflectionAngle') {
            reflectionAngle = Number(args[0]); // Update reflection angle
            // Force a refresh of the reflections
            refreshEventReflections.call(SceneManager._scene._spriteset);
           
        } else if (command === 'SetReflect_XScale') {
            reflectHorizontalScale = Number(args[0]); // Update horizontal scale factor
            refreshEventReflections.call(SceneManager._scene._spriteset);
           
        } else if (command === 'SetReflect_YScale') {
            reflectVerticalScale = Number(args[0]); // Update vertical scale factor
            refreshEventReflections.call(SceneManager._scene._spriteset);       
           
        } else if (command === 'SetReflectionOffset') {
            reflectionOffset = Number(args[0]); // Update reflection offset
            // Force a refresh of the reflections
            refreshEventReflections.call(SceneManager._scene._spriteset);

            // Update existing reflections with the new offset
            if (SceneManager._scene && SceneManager._scene._spriteset) {
                SceneManager._scene._spriteset._reflectionSprites.forEach(function(sprite) {
                    sprite._yOffset = reflectionOffset; // Adjust the Y offset of the reflection
                    sprite.y = sprite._character.screenY() + (sprite._character.jumpHeight() || 0) + sprite._yOffset;
                });
            }
        } else if (command === 'SetReflectionLayer') {
            reflectionLayer = Number(args[0]); // Update the Z-index layer for reflections

        } else if (command === 'SetDirectionalReflection') {
            const enabled = (args[0] === 'true'); // Toggle directional reflection on or off
            directionalReflection = enabled;   
            refreshEventReflections.call(SceneManager._scene._spriteset);       
                   
        } else if (command === 'SetReflectOpacity') {
            reflectOpacity = Number(args[0]); // Update reflection opacity
            refreshEventReflections.call(SceneManager._scene._spriteset);
           
            // Update existing reflections with the new opacity
            if (SceneManager._scene && SceneManager._scene._spriteset) {
                SceneManager._scene._spriteset._reflectionSprites.forEach(function(sprite) {
                    sprite.opacity = reflectOpacity; // Adjust the opacity of the reflection
                });
            }
        } else if (command === 'SetWaveEffect') {
            const enabled = (args[0] === 'true');
            waveAmplitude = enabled ? Number(parameters['Wave Amplitude'] || 2) : 0;
            waveFrequency = enabled ? Number(parameters['Wave Frequency'] || 3) : 0;

            // Update existing reflections with the new wave properties
            if (SceneManager._scene && SceneManager._scene._spriteset) {
                SceneManager._scene._spriteset._reflectionSprites.forEach(function(sprite) {
                    sprite._waveAmplitude = waveAmplitude; // Adjust the wave amplitude of the reflection
                    sprite._waveFrequency = waveFrequency; // Adjust the wave frequency of the reflection
                });
                // Force a refresh of the reflections
                refreshEventReflections.call(SceneManager._scene._spriteset);
            }
        } else if (command === 'SetRippleEffect') {
            const enabled = (args[0] === 'true');
            rippleAmplitude = enabled ? Number(parameters['Ripple Amplitude'] || 0) : 0;
            rippleFrequency = enabled ? Number(parameters['Ripple Frequency'] || 0) : 0;

            // Update existing reflections with the new ripple properties
            if (SceneManager._scene && SceneManager._scene._spriteset) {
                SceneManager._scene._spriteset._reflectionSprites.forEach(function(sprite) {
                    sprite._rippleAmplitude = rippleAmplitude; // Adjust the ripple amplitude of the reflection
                    sprite._rippleFrequency = rippleFrequency; // Adjust the ripple frequency of the reflection
                });
                // Force a refresh of the reflections
                refreshEventReflections.call(SceneManager._scene._spriteset);
            }
        } else if (command === 'SetDistortionEffect') {
            const enabled = (args[0] === 'true');
            distortionAmplitude = enabled ? Number(parameters['Distortion Amplitude'] || 0) : 0;
            distortionFrequency = enabled ? Number(parameters['Distortion Frequency'] || 0) : 0;

            // Update existing reflections with the new distortion properties
            if (SceneManager._scene && SceneManager._scene._spriteset) {
                SceneManager._scene._spriteset._reflectionSprites.forEach(function(sprite) {
                    sprite._distortionAmplitude = distortionAmplitude; // Adjust the distortion amplitude of the reflection
                    sprite._distortionFrequency = distortionFrequency; // Adjust the distortion frequency of the reflection
                });
                // Force a refresh of the reflections
                refreshEventReflections.call(SceneManager._scene._spriteset);
            }
        }
    };
   

//==============================================================================
// Reflection's Graphics Initialization
//==============================================================================

function createCharacterReflection(character) {
    const sprite = new Sprite_Character(character); // Create a new sprite for the character's reflection
    sprite._isReflectionSprite = true; // Flag so we can skip balloon icons on reflections
    sprite.opacity = reflectOpacity; // Set the opacity of the reflection
    sprite.scale.y = -reflectScale * reflectVerticalScale; // Invert the Y scale for the reflection
    sprite.scale.x = reflectHorizontalScale; // Set the horizontal scale of the reflection

    sprite.anchor.y = 1; // Anchor the sprite at the bottom
    sprite.anchor.x = 0.5; // Anchor the sprite at the horizontal center
    sprite._xOffset = 0; // Initialize X offset
    sprite._yOffset = reflectionOffset; // Set the initial Y offset based on the reflection offset

    sprite.z = reflectionLayer; // Set the Z-index layer of the reflection

    // Initialize wave, distortion, and ripple effects with random offsets for variation
    sprite._waveOffset = Math.random() * Math.PI * 2;
    sprite._waveFrequency = waveFrequency;
    sprite._waveAmplitude = waveAmplitude;
    sprite._distortionFrequency = distortionFrequency;
    sprite._distortionAmplitude = distortionAmplitude;
    sprite._rippleFrequency = rippleFrequency;
    sprite._rippleAmplitude = rippleAmplitude;
    sprite._rippleOffset = Math.random() * Math.PI * 2;
    sprite._originalScaleY = sprite.scale.y; // Store the original Y scale for further adjustments

    // Set the initial position of the reflection sprite based on the character's position
    sprite.x = character.screenX() + sprite._xOffset;
    sprite.y = character.screenY() + (character.jumpHeight() || 0) + sprite._yOffset;

    return sprite;
}

// Prevent reflection sprites from hijacking animations or balloon icons.
// Sprite_Character.update() calls updateAnimation() then updateBalloon() on
// every sprite. Without these guards, the reflection instance will consume the
// pending animation/balloon requests first, play them on the hidden reflection
// layer, and clear the request so the visible sprite never shows them (and
// event 'Wait for Animation/Balloon' will return immediately). Skipping the
// animation/balloon logic for reflections leaves the requests intact for the
// real, visible character sprite.
const _SWR_SWR_updateAnimation = Sprite_Character.prototype.updateAnimation;
Sprite_Character.prototype.updateAnimation = function() {
    if (this._isReflectionSprite) return;
    _SWR_SWR_updateAnimation.call(this);
};

const _SWR_SWR_updateBalloon = Sprite_Character.prototype.updateBalloon;
Sprite_Character.prototype.updateBalloon = function() {
    if (this._isReflectionSprite) return;
    _SWR_SWR_updateBalloon.call(this);
};


//==============================================================================
// Direction Facing Behavior
//==============================================================================

// Function to update the reflection's direction and orientation based on the character's direction
function updateReflectionDirection(sprite) {
    const character = sprite._character; // Reference to the character associated with the reflection

    if (directionalReflection) { // Check if directional reflection is enabled
        const direction = character.direction(); // Get the character's current direction
        let directionAngle = 0; // Initialize the direction angle

        if (sprite.bitmap && sprite.bitmap.isReady()) { // Ensure the sprite's bitmap is ready
            const pattern = character.pattern();
            const characterIndex = character.characterIndex(); // Get the index of the character on the sprite sheet
            const charactersPerRow = 4;
            const rowIndex = Math.floor(characterIndex / charactersPerRow); // Calculate the row index of the character on the sprite sheet
            const columnIndex = characterIndex % charactersPerRow; // Calculate the column index of the character on the sprite sheet

            // Determine the number of frames based on the file name
            const fileName = character.characterName();
            const frameMatch = fileName.match(/%\((\d+)\)/);
            const framesPerCharacter = frameMatch ? parseInt(frameMatch[1]) : 3; // Default to 3 frames if not specified

            // Frame dimensions
            const frameWidth = sprite.bitmap.width / (charactersPerRow * framesPerCharacter);
            const frameHeight = sprite.bitmap.height / 8;

            switch (direction) { // Edit x and y values for each direction to move the reflection default position
                case 4: // Left
                    sprite.scale.x = reflectHorizontalScale - 0.12; // Set horizontal scale
                    sprite.scale.y = reflectVerticalScale; // Set vertical scale
                    directionAngle = -75; // Set angle for left direction
                    sprite._xOffset = -reflectionOffset - 7; // Adjust X offset
                    sprite._yOffset = 1; // Adjust Y offset
                    break;
                case 6: // Right
                    sprite.scale.x = reflectHorizontalScale - 0.12;
                    sprite.scale.y = reflectVerticalScale;
                    directionAngle = 75;
                    sprite._xOffset = reflectionOffset + 7;
                    sprite._yOffset = 1;
                    break;
                case 8: // Up
                    sprite.scale.x = reflectHorizontalScale;
                    directionAngle = 180;
                    sprite._xOffset = 0;
                    sprite._yOffset = -reflectionOffset; // Adjust Y offset for up direction
                    // Set the sprite frame to the front frame when the character is facing up
                    const directionIndex = 0; // Index for the 'down' direction frame in the sprite sheet
                    sprite.setFrame((pattern + columnIndex * framesPerCharacter) * frameWidth, (directionIndex + rowIndex * 4) * frameHeight, frameWidth, frameHeight);
                    sprite.scale.y = -reflectVerticalScale; // Invert the Y scale for the reflection   
                    break;
                case 2: // Down
                    sprite.scale.x = reflectHorizontalScale;
                    sprite.scale.y = reflectVerticalScale;
                    directionAngle = 0;
                    sprite._xOffset = 0;
                    sprite._yOffset = reflectionOffset;
                    break;
            }
            sprite.rotation = (reflectionAngle - directionAngle) * Math.PI / 180; // Apply rotation based on reflection and direction angles
        }
    } else { // If directional reflection is disabled
        if (sprite.bitmap && sprite.bitmap.isReady()) { // Ensure the sprite's bitmap is ready
            sprite.rotation = reflectionAngle * Math.PI / 180; // Apply a fixed reflection angle
        }
        sprite._xOffset = 0; // Reset X offset
        sprite._yOffset = reflectionOffset; // Apply parameter Y offset
    }

    // Update the sprite's position based on the character's current position and offsets
    sprite.x = character.screenX() + sprite._xOffset;
    sprite.y = character.screenY() + (character.jumpHeight() || 0) + sprite._yOffset;
}


//==============================================================================
// Event's Reflection Conditions
//==============================================================================

function shouldReflectEvent(event) {
    let reflectOn = false; // Initialize reflectOn flag
    let reflectOff = false; // Initialize reflectOff flag

    // Check the note field of the event for reflection tags
    const note = event.event().note;
    if (/<reflect_on>/i.test(note)) {
        reflectOn = true; // Enable reflection if <reflect_on> tag is found
    }
    if (/<reflect_off>/i.test(note)) {
        reflectOff = true; // Disable reflection if <reflect_off> tag is found
    }
   
    // If both tags are present, <reflect_off> takes precedence
    if (reflectOn && reflectOff) {
        reflectOn = false;
        console.log("Note tag <reflect_on> & <reflect_off> can't be put together");
    }

    // Get the active page of the event
    const page = event.page();
    if (!page) {
        return reflectEvents; // If no active page
    }

    // Check comments on the active page for reflection tags
    for (let i = 0; i < page.list.length; i++) {
        const command = page.list[i];
        if (command.code === 108 || command.code === 408) { // 108 & 408 = Comment codes
            const comment = command.parameters[0];
            if (/^<reflect_on>$/i.test(comment)) {
                reflectOn = true; // Enable reflection if <reflect_on> tag is found
                reflectOff = false; // Override any previous reflectOff in Note
            }
            if (/^<reflect_off>$/i.test(comment)) {
                reflectOff = true; // Disable reflection if <reflect_off> tag is found
                reflectOn = false; // Override any previous reflectOn
            }
        }
    }

    // Determine reflection status based on comments and notes
    if (reflectOn) {
        return true;
    }
    if (reflectOff) {
        return false;
    }

    return reflectEvents; // Default to plugin parameters settings if no specific tag found
}

//==============================================================================
// Region ID System
//==============================================================================
// Determines if a character is in a region that allows reflections.

function isInReflectRegion(character) {
    return true;
    const x = character.x; // Get the x-coordinate of the character.
    const y = character.y; // Get the y-coordinate of the character.
    const regionId = $gameMap.regionId(x, y); // Get the region ID of the tile the character is on.
    return reflectRegionsSet.has(regionId); // Check if the region ID is in the set of regions that allow reflections.
}

// Store the original createCharacters function in a variable.
const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;

// Override the createCharacters function.
Spriteset_Map.prototype.createCharacters = function() {
    _Spriteset_Map_createCharacters.call(this); // Call the original createCharacters function.
    this._reflectionSprites = []; // Initialize an array to store the reflection sprites.

    // If the hero should have a reflection...
    if (reflectHero && isInReflectRegion($gamePlayer)) {
        const heroSprite = createCharacterReflection($gamePlayer); // Create a reflection sprite for the hero.
        this._reflectionLayer.addChild(heroSprite); // Add the hero's reflection sprite to the reflection layer.
        this._reflectionSprites.push(heroSprite); // Add the hero's reflection sprite to the array of reflection sprites.
    }

    // If the followers should have reflections...
    if (reflectFollowers) {
        $gamePlayer.followers().forEach(function(follower) { // For each follower...
            if (isInReflectRegion(follower)) { // If the follower is in a region that allows reflections...
                const followerSprite = createCharacterReflection(follower); // Create a reflection sprite for the follower.
                this._reflectionLayer.addChild(followerSprite); // Add the follower's reflection sprite to the reflection layer.
                this._reflectionSprites.push(followerSprite); // Add the follower's reflection sprite to the array of reflection sprites.
            }
        }, this);
    }

    // If the events should have reflections...
    if (reflectEvents) {
        $gameMap.events().forEach(function(event) { // For each event...
            if (shouldReflectEvent(event) && isInReflectRegion(event)) { // If the event should have a reflection and is in a region that allows reflections...
                const eventSprite = createCharacterReflection(event); // Create a reflection sprite for the event.
                this._reflectionLayer.addChild(eventSprite); // Add the event's reflection sprite to the reflection layer.
                this._reflectionSprites.push(eventSprite); // Add the event's reflection sprite to the array of reflection sprites.
            }
        }, this);
    }
};

//==============================================================================
// Map Reflection Refresh
//==============================================================================
// Refreshes the reflections for events, hero, and followers.

function refreshEventReflections() {
    $gameMap.events().forEach(function(event) {
        const shouldReflect = shouldReflectEvent(event) && isInReflectRegion(event);
        const existingSprite = this._reflectionSprites.find(function(sprite) {
            return sprite._character === event;
        });

        if (shouldReflect) {
            if (!existingSprite) {
                // Create and add new reflection if not found
                const eventSprite = createCharacterReflection(event);
                this._reflectionLayer.addChild(eventSprite);
                this._reflectionSprites.push(eventSprite);
            }
        } else {
            if (existingSprite) {
                // Remove the reflection if it should no longer be reflected
                const spriteIndex = this._reflectionSprites.indexOf(existingSprite);
                if (spriteIndex > -1) {
                    const sprite = this._reflectionSprites.splice(spriteIndex, 1)[0];
                    if (sprite && sprite.bitmap && sprite.bitmap.isReady()) {
                        this._reflectionLayer.removeChild(sprite);
                        sprite.destroy(); // Clean up the sprite
                    }
                }
            }
        }
    }, this);

    // Hero
    if (reflectHero) {
        let heroSprite = this._reflectionSprites.find(function(sprite) {
            return sprite._character === $gamePlayer;
        });

        if (isInReflectRegion($gamePlayer)) {
            if (!heroSprite) {
                // Create and add new reflection if not found
                heroSprite = createCharacterReflection($gamePlayer);
                this._reflectionLayer.addChild(heroSprite);
                this._reflectionSprites.push(heroSprite);
            }
        } else {
            // Remove the reflection if it should no longer be reflected
            if (heroSprite) {
                const heroIndex = this._reflectionSprites.indexOf(heroSprite);
                if (heroSprite && heroSprite.bitmap && heroSprite.bitmap.isReady()) {
                    this._reflectionSprites.splice(heroIndex, 1);
                    this._reflectionLayer.removeChild(heroSprite);
                    heroSprite.destroy(); // Clean up the sprite
                }
            }
        }
    }

    // Followers
    if (reflectFollowers) {
        $gamePlayer.followers().forEach(function(follower) {
            const followerSprite = this._reflectionSprites.find(function(sprite) {
                return sprite._character === follower;
            });

            if (isInReflectRegion(follower)) {
                if (!followerSprite) {
                    // Create and add new reflection if not found
                    const newFollowerSprite = createCharacterReflection(follower);
                    this._reflectionLayer.addChild(newFollowerSprite);
                    this._reflectionSprites.push(newFollowerSprite);
                }
            } else {
                // Remove the reflection if it should no longer be reflected
                if (followerSprite) {
                    const followerIndex = this._reflectionSprites.indexOf(followerSprite);
                    if (followerSprite && followerSprite.bitmap && followerSprite.bitmap.isReady()) {
                        this._reflectionSprites.splice(followerIndex, 1);
                        this._reflectionLayer.removeChild(followerSprite);
                        followerSprite.destroy(); // Clean up the sprite
                    }
                }
            }
        }, this);
    }
}

// Add a flag to control reflection updates
let shouldUpdateReflections = true;

// Override the Scene_Map.prototype.start method
const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
    shouldUpdateReflections = true; // Enable reflection updates when returning to the map
};

//==============================================================================
// Reflection's optional Effects
//==============================================================================

const _Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    _Spriteset_Map_update.call(this);
    const time = Date.now() * 0.001;

    // Refresh event reflections frequently
    if (shouldUpdateReflections && (this._reflectionRefreshTimer === undefined || this._reflectionRefreshTimer <= 0)) {
        refreshEventReflections.call(this);
        this._reflectionRefreshTimer = 30; // Refresh every x frames (60 = 1 second)
    } else if (shouldUpdateReflections) {
        this._reflectionRefreshTimer--;
    }
   
    if (this._reflectionSprites) {
        // Always ensure the hero's reflection is on top
        if (reflectHero) {
            const heroSprite = this._reflectionSprites.find(function(sprite) {
                return sprite._character === $gamePlayer;
            });
            if (heroSprite) {
                this._reflectionLayer.removeChild(heroSprite);
                this._reflectionLayer.addChild(heroSprite);
            }
        }
    }   

    if (this._reflectionSprites) {
        this._reflectionSprites.forEach(function(sprite) {
            if (sprite._character) {
                updateReflectionDirection(sprite);

                // Ensure opacity is set
                sprite.opacity = reflectOpacity;

                // Apply wave effect
                const waveScaleFactor = 1 + Math.sin(time * sprite._waveFrequency + sprite._waveOffset) * sprite._waveAmplitude * 0.01;
                sprite.scale.y = sprite._originalScaleY * waveScaleFactor;

                // Apply distortion effect
                if (sprite._distortionAmplitude !== 0 && sprite._distortionFrequency !== 0) {
                    const distortion = sprite._distortionAmplitude * Math.sin(sprite._distortionFrequency * time);
                    sprite.scale.y += distortion;
                }

                // Apply ripple effect
                if (sprite._rippleAmplitude !== 0 && sprite._rippleFrequency !== 0) {
                    const rippleFactor = Math.sin(sprite._rippleFrequency * time + sprite._rippleOffset);
                    const rippleScale = 1 + rippleFactor * sprite._rippleAmplitude * 0.01;
                    sprite.scale.y = sprite._originalScaleY * rippleScale;

                    // Calculate the ripple offset to create an expanding effect
                    const rippleOffset = rippleFactor * sprite._rippleAmplitude * 0.1;
                    sprite.y += rippleOffset;
                }
               
                if (directionalReflection && (sprite._character.direction() === 4 || sprite._character.direction() === 6)) {
                    // Apply custom scale after the effects
                    sprite.scale.y *= (reflectVerticalScale + 0.15);
                }

                sprite.x = sprite._character.screenX() + sprite._xOffset;
                sprite.y = sprite._character.screenY() + (sprite._character.jumpHeight() || 0) + sprite._yOffset;
            }
        }, this);
    }
};

})();