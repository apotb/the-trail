// Filters

function QuantizeFilter(levels, brightnessBoost = 1.0) {
    const fragmentSrc = `
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float levels;
        uniform float brightness;

        void main(void) {
            vec4 color = texture2D(uSampler, vTextureCoord);
            color.rgb = floor(color.rgb * levels + 0.5) / levels; // prevents rounding down too harshly
            color.rgb *= brightness;
            gl_FragColor = color;
        }
    `;
    const uniforms = {
        levels: { type: '1f', value: levels || 4.0 },
        brightness: { type: '1f', value: brightnessBoost || 1.0 }
    };
    PIXI.Filter.call(this, null, fragmentSrc, uniforms);
}
QuantizeFilter.prototype = Object.create(PIXI.Filter.prototype);
QuantizeFilter.prototype.constructor = QuantizeFilter;

// Overrides

___Spriteset__Base_prototype_initialize___ = Spriteset_Base.prototype.initialize;
Spriteset_Base.prototype.initialize = function() {
    ___Spriteset__Base_prototype_initialize___.call(this);

    const color = new PIXI.filters.ColorMatrixFilter();
    color.saturate(-0.3, false);
    color.contrast(-0.1, false);

    const quantFilter = new QuantizeFilter(6.0, 1.05);

    this.filters = [color, quantFilter];
};